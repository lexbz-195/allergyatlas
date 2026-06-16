// ─── AllergyAtlas API Layer ───────────────────────────────────────────────────
// Uses Open Beauty Facts (skincare/baby products) + Open Food Facts (food/wipes)
// Both are free, open APIs — no key required.

const BEAUTY_API  = "https://world.openbeautyfacts.org";
const FOOD_API    = "https://world.openfoodfacts.org";

// Search both APIs and merge results
export async function searchProducts(query) {
  const trimmed = encodeURIComponent(query.trim());

  const [beautyResults, foodResults] = await Promise.allSettled([
    searchBeauty(trimmed),
    searchFood(trimmed),
  ]);

  const beauty = beautyResults.status === "fulfilled" ? beautyResults.value : [];
  const food   = foodResults.status   === "fulfilled" ? foodResults.value   : [];

  // Merge, deduplicate by barcode, beauty products first
  const seen = new Set();
  const merged = [];
  for (const p of [...beauty, ...food]) {
    if (p.barcode && !seen.has(p.barcode)) {
      seen.add(p.barcode);
      merged.push(p);
    }
  }

  return merged.slice(0, 20);
}

async function searchBeauty(query) {
  const url = `${BEAUTY_API}/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,brands,categories,ingredients_text,image_url,quantity`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products || [])
    .filter(p => p.product_name)
    .map(p => normalise(p, "beauty"));
}

async function searchFood(query) {
  // Only pull food results that look like baby/skincare products
  const url = `${FOOD_API}/cgi/search.pl?search_terms=${query}+baby&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,categories,ingredients_text,image_url,quantity`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products || [])
    .filter(p => p.product_name && isBabyProduct(p))
    .map(p => normalise(p, "food"));
}

// Fetch a single product by barcode
export async function fetchByBarcode(barcode) {
  const [beauty, food] = await Promise.allSettled([
    fetch(`${BEAUTY_API}/api/v0/product/${barcode}.json`).then(r => r.json()),
    fetch(`${FOOD_API}/api/v0/product/${barcode}.json`).then(r => r.json()),
  ]);

  const beautyProduct = beauty.status === "fulfilled" && beauty.value?.status === 1
    ? normalise(beauty.value.product, "beauty")
    : null;
  const foodProduct = food.status === "fulfilled" && food.value?.status === 1
    ? normalise(food.value.product, "food")
    : null;

  return beautyProduct || foodProduct || null;
}

function isBabyProduct(p) {
  const text = `${p.product_name} ${p.categories || ""}`.toLowerCase();
  return /baby|infant|nappy|diaper|newborn|bub|neonatal|toddler|wipe/.test(text);
}

function normalise(p, source) {
  return {
    barcode:      p.code || p._id || null,
    name:         cleanName(p.product_name || "Unknown product"),
    brand:        p.brands ? p.brands.split(",")[0].trim() : "Unknown brand",
    category:     inferCategory(p.categories || p.product_name || ""),
    ingredients:  p.ingredients_text || "",
    image:        p.image_url || p.image_front_url || null,
    quantity:     p.quantity || "",
    source,
  };
}

function cleanName(name) {
  // Trim excessively long names
  return name.length > 80 ? name.slice(0, 77) + "…" : name;
}

function inferCategory(cats) {
  const c = cats.toLowerCase();
  if (/moisturis|lotion|cream|balm|ointment|emollient/.test(c)) return "Skincare";
  if (/wash|shampoo|bath|soap|cleanser/.test(c))                 return "Bath & Wash";
  if (/wipe|tissue/.test(c))                                     return "Wipes";
  if (/nappy|diaper|rash/.test(c))                               return "Nappy Care";
  if (/sunscreen|sunscr|spf/.test(c))                            return "Sun Protection";
  if (/clothing|garment|fabric|textile/.test(c))                 return "Clothing";
  if (/food|feed|formula|milk/.test(c))                          return "Baby Food";
  return "Baby Product";
}
