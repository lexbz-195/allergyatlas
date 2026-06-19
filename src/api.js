// ─── AllergyAtlas Data Layer ──────────────────────────────────────────────────
// Products now come from your own curated Notion catalogue via the /api/products
// serverless endpoint. If that endpoint is unavailable (e.g. running locally
// without env vars, or Notion is down), we fall back to a bundled snapshot.
// All searching and category filtering happens locally over this dataset.

import { FALLBACK_PRODUCTS } from "./productsFallback";

let _cache = null;       // in-memory cache of all products for this session
let _loading = null;     // de-dupes concurrent loads

async function loadAllProducts() {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          _cache = data.products;
          return _cache;
        }
      }
      // Endpoint reachable but empty / misconfigured → fallback
      _cache = FALLBACK_PRODUCTS;
      return _cache;
    } catch {
      // Network error or running locally without the function → fallback
      _cache = FALLBACK_PRODUCTS;
      return _cache;
    } finally {
      _loading = null;
    }
  })();

  return _loading;
}

// Search by name, brand, or category (case-insensitive substring match)
export async function searchProducts(query) {
  const all = await loadAllProducts();
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const matches = all.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  return matches.slice(0, 25);
}

// Best single match for a query (used where a single product is wanted)
export async function fetchTopMatch(query) {
  const results = await searchProducts(query);
  return results.length > 0 ? results[0] : null;
}

// All products in a given category (by category name)
export async function fetchByCategory(categoryName) {
  const all = await loadAllProducts();
  return all.filter(p => p.category === categoryName);
}

// All products (used by the Top Products page)
export async function fetchAllProducts() {
  return loadAllProducts();
}
