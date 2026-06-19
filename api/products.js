// ─── Vercel Serverless Function: /api/products ────────────────────────────────
// Fetches published products from the Notion product catalogue.
// The Notion secret is read from an environment variable (never exposed to the
// browser). Results are cached at the edge for 10 minutes to keep things fast.

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID  = process.env.NOTION_PRODUCTS_DB_ID;
const NOTION_VERSION = "2022-06-28";

export default async function handler(req, res) {
  // Allow the app (any origin) to call this endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");

  if (!NOTION_TOKEN || !DATABASE_ID) {
    return res.status(500).json({
      error: "Server not configured. Set NOTION_TOKEN and NOTION_PRODUCTS_DB_ID environment variables in Vercel.",
      products: [],
    });
  }

  try {
    const products = [];
    let cursor = undefined;
    let hasMore = true;

    // Notion paginates results 100 at a time
    while (hasMore) {
      const body = {
        page_size: 100,
        filter: { property: "Published", checkbox: { equals: true } },
      };
      if (cursor) body.start_cursor = cursor;

      const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(502).json({ error: `Notion API error: ${response.status}`, detail: text, products: [] });
      }

      const data = await response.json();
      for (const page of data.results) {
        products.push(normalisePage(page));
      }
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    return res.status(200).json({ products, count: products.length, source: "notion" });
  } catch (err) {
    return res.status(500).json({ error: err.message, products: [] });
  }
}

function plain(prop) {
  if (!prop) return "";
  if (prop.type === "title")     return (prop.title || []).map(t => t.plain_text).join("");
  if (prop.type === "rich_text") return (prop.rich_text || []).map(t => t.plain_text).join("");
  if (prop.type === "url")       return prop.url || "";
  if (prop.type === "select")    return prop.select ? prop.select.name : "";
  if (prop.type === "checkbox")  return prop.checkbox;
  return "";
}

function normalisePage(page) {
  const p = page.properties;
  return {
    id:          page.id,
    name:        plain(p["Product Name"]) || "Unknown product",
    brand:       plain(p["Brand"]) || "Unknown brand",
    category:    plain(p["Category"]) || "Baby Product",
    ingredients: plain(p["Ingredients"]) || "",
    image:       plain(p["Image URL"]) || null,
    productUrl:  plain(p["Product URL"]) || null,
    notes:       plain(p["Notes"]) || "",
  };
}
