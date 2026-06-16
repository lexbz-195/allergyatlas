// ─── Highest-Scoring Products ─────────────────────────────────────────────────
// Curated list of products that score 85+ under the AllergyAtlas criteria.
// Each entry documents why it scored highly and the guideline sources behind it.

export const TOP_PRODUCTS = [
  {
    name: "WaterWipes Original Baby Wipes",
    brand: "WaterWipes",
    category: "Wipes",
    score: 97,
    image: "💧",
    reasons: [
      "99.9% purified water with only a trace of fruit extract",
      "No fragrance, no parabens, no preservatives",
      "Suitable for newborn and premature skin from birth",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
      { name: "National Eczema Association — Seal of Acceptance", url: "https://nationaleczema.org" },
    ],
  },
  {
    name: "QV Baby Moisturising Cream",
    brand: "QV",
    category: "Skincare",
    score: 92,
    image: "🧴",
    reasons: [
      "Completely fragrance-free, aligning with ASCIA eczema guidance",
      "Free from lanolin, parabens and propylene glycol",
      "Glycerin and white soft paraffin support the skin barrier",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
      { name: "Australasian College of Dermatologists", url: "https://www.dermcoll.edu.au" },
    ],
  },
  {
    name: "Cetaphil Baby Gentle Wash & Shampoo (fragrance-free)",
    brand: "Cetaphil",
    category: "Bath & Wash",
    score: 90,
    image: "🛁",
    reasons: [
      "Soap-free, fragrance-free cleansing formula",
      "No parabens, gentle on a compromised skin barrier",
      "Paediatrician-recommended for sensitive infant skin",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
    ],
  },
  {
    name: "Mustela Stelatopia Emollient Balm",
    brand: "Mustela",
    category: "Skincare",
    score: 88,
    image: "🧴",
    reasons: [
      "Formulated specifically for eczema-prone and atopic skin",
      "Free from fragrance, parabens and phenoxyethanol",
      "Clinically tested under paediatric dermatological control",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
      { name: "National Eczema Association — Seal of Acceptance", url: "https://nationaleczema.org" },
    ],
  },
  {
    name: "Bunjie Natural Baby Balm (fragrance-free)",
    brand: "Bunjie",
    category: "Skincare",
    score: 87,
    image: "🧴",
    reasons: [
      "Australian-made with a short, simple ingredient list",
      "Fragrance-free and free from synthetic preservatives",
      "Designed for sensitive newborn and eczema-prone skin",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
      { name: "Allergy & Anaphylaxis Australia — reading labels", url: "https://allergyfacts.org.au/category/food-labels/" },
    ],
  },
  {
    name: "Bonds Baby Wondersuit (100% Cotton)",
    brand: "Bonds",
    category: "Clothing",
    score: 93,
    image: "👕",
    reasons: [
      "100% natural cotton — breathable, non-irritating fibre",
      "OEKO-TEX Standard 100 certified (tested for harmful substances)",
      "No synthetic dyes that can irritate eczema-prone skin",
    ],
    sources: [
      { name: "ASCIA — Eczema (Atopic Dermatitis) guidance", url: "https://www.allergy.org.au/patients/skin-allergy/eczema" },
    ],
  },
];
