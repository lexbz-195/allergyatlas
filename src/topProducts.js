// ─── Highest-Scoring Products ─────────────────────────────────────────────────
// These are search queries known to return real products in the Open Beauty Facts
// API. The TopProductsPage fetches each one live and scores it with the real
// scoring engine, so every product shown is genuinely searchable, and its
// detractors / food-derivative warnings are accurate (not hand-written).

export const TOP_PRODUCT_QUERIES = [
  "WaterWipes",
  "QV Baby Moisturising Cream",
  "Cetaphil Baby",
  "Mustela Stelatopia",
  "Bunjie",
  "Aveeno Baby",
  "Gaia Natural Baby",
  "Weleda Baby",
];
