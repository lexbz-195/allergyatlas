// ─── AllergyAtlas Scoring Engine ─────────────────────────────────────────────
// Based on ASCIA (2026), NAC, A&AA, NACE and FSANZ guidelines

// Food derivatives — flagged for pre-solid infants per ASCIA
export const FOOD_DERIVATIVES = [
  { match: /avena\s*sativa|\boat(meal|s)?\b|colloidal\s*oat/i,    name: "Oat / Colloidal oatmeal",    penalty: 18 },
  { match: /arachis\s*oil|peanut\s*oil/i,                         name: "Peanut oil",                  penalty: 25 },
  { match: /prunus\s*(amygdalus|dulcis)|almond\s*oil/i,           name: "Almond oil",                  penalty: 15 },
  { match: /triticum\s*vulgare|wheat\s*(germ|protein|bran)/i,     name: "Wheat derivative",            penalty: 18 },
  { match: /milk\s*protein|lacto(se|ferrin)|whey|casein/i,        name: "Milk protein",                penalty: 20 },
  { match: /helianthus\s*annuus|sunflower\s*(oil|seed)/i,         name: "Sunflower seed oil",          penalty: 8  },
  { match: /cocos\s*nucifera|coconut\s*(oil|extract)/i,           name: "Coconut oil/extract",         penalty: 6  },
  { match: /sesamum\s*indicum|sesame\s*(oil|seed)/i,              name: "Sesame oil",                  penalty: 20 },
  { match: /soja|soybean|soy\s*(protein|oil)/i,                   name: "Soy derivative",              penalty: 15 },
  { match: /macadamia\s*(oil|ternifolia)/i,                       name: "Macadamia nut oil",           penalty: 15 },
  { match: /shea\s*butter|butyrospermum\s*parkii/i,               name: "Shea butter",                 penalty: 6  },
  { match: /citrus\s*(aurantium|limon|sinensis)|lemon\s*extract/i,name: "Citrus extract",              penalty: 8  },
  { match: /persea\s*gratissima|avocado\s*oil/i,                  name: "Avocado oil",                 penalty: 6  },
  { match: /theobroma\s*cacao|cocoa\s*(seed\s*)?butter/i,         name: "Cocoa seed butter",           penalty: 6  },
  { match: /rosa\s*canina|rosehip\s*(seed\s*)?(oil|extract)/i,    name: "Rosehip seed extract",        penalty: 5  },
];

// Sensitisers — each carries a plain-English reason and a cited source
export const SENSITISERS = [
  {
    match: /\bparfum\b|\bfragrance\b|\bscent\b/i,
    name: "Fragrance/parfum", penalty: 35,
    reason: "Fragrance is one of the most common causes of allergic contact dermatitis in children. ASCIA recommends fragrance-free products for all infants with eczema or sensitive skin.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
  {
    match: /\blanolin\b/i,
    name: "Lanolin (wool derivative)", penalty: 12,
    reason: "Lanolin is derived from sheep's wool and can cross-react in babies with wool sensitivity. ASCIA lists wool and lanolin among common irritants for eczema-prone skin.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
  {
    match: /benzyl\s*alcohol/i,
    name: "Benzyl alcohol", penalty: 10,
    reason: "Benzyl alcohol is a preservative and solvent that can irritate broken or very sensitive infant skin and is a recognised contact allergen.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /methylisothiazolinone|(?<!chloro)\bMIT\b/i,
    name: "Methylisothiazolinone (MIT)", penalty: 20,
    reason: "MIT is a preservative and a leading cause of allergic contact dermatitis. The Australasian College of Dermatologists has highlighted rising rates of MIT contact allergy.",
    source: "Australasian College of Dermatologists — MIT contact allergy",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /methylchloroisothiazolinone|MCIT\b/i,
    name: "Methylchloroisothiazolinone (MCI)", penalty: 20,
    reason: "MCI is a preservative frequently paired with MIT and is a known potent contact sensitiser, particularly on sensitive infant skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /formaldehyde|dmdm\s*hydantoin|imidazolidinyl\s*urea/i,
    name: "Formaldehyde releaser", penalty: 22,
    reason: "Formaldehyde-releasing preservatives are recognised skin sensitisers and contact allergens, best avoided on sensitive infant skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /sodium\s*lauryl\s*sulph?ate|\bSLS\b/i,
    name: "Sodium lauryl sulfate (SLS)", penalty: 15,
    reason: "SLS is a harsh surfactant that strips natural oils and can damage the skin barrier, worsening eczema. ASCIA recommends soap-free, gentle cleansers for eczema-prone skin.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
  {
    match: /sodium\s*laureth\s*sulph?ate|\bSLES\b/i,
    name: "Sodium laureth sulfate (SLES)", penalty: 8,
    reason: "SLES is a milder surfactant than SLS but can still irritate compromised skin barriers in eczema-prone infants.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
  {
    match: /propylene\s*glycol/i,
    name: "Propylene glycol", penalty: 8,
    reason: "Propylene glycol is a humectant and penetration enhancer that can act as an irritant and occasional contact allergen on sensitive skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /phenoxyethanol/i,
    name: "Phenoxyethanol (preservative)", penalty: 10,
    reason: "Phenoxyethanol is a widely used preservative that can irritate highly sensitive or eczema-prone infant skin and occasionally triggers contact reactions.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /sodium\s*benzoate/i,
    name: "Sodium benzoate (preservative)", penalty: 10,
    reason: "Sodium benzoate is a preservative that can cause irritation and, in some infants, contact sensitivity on delicate skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /parabens?|(methyl|ethyl|propyl|butyl)\s*paraben/i,
    name: "Parabens", penalty: 12,
    reason: "Parabens are preservatives that can act as contact allergens, especially when applied to damaged or inflamed eczematous skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /mineral\s*oil|paraffinum\s*liquidum/i,
    name: "Mineral oil", penalty: 6,
    reason: "Mineral oil is an occlusive that is generally low-risk but is not the preferred emollient base under ASCIA guidance, which favours simple ceramide- or glycerin-based moisturisers.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
  {
    match: /artificial\s*colo(u)?r|\bfd&c\b|\bci\s*\d{5}\b/i,
    name: "Artificial colourant", penalty: 8,
    reason: "Artificial colourants and dyes serve no skincare function and can act as irritants or sensitisers on infant skin.",
    source: "Allergy & Anaphylaxis Australia — reading labels",
    sourceUrl: "https://allergyfacts.org.au/category/food-labels/",
  },
  {
    match: /triclosan/i,
    name: "Triclosan", penalty: 18,
    reason: "Triclosan is an antibacterial agent associated with skin irritation and contact allergy, and is not recommended for routine use on infant skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /polyethylene\s*glycol|PEG-\d/i,
    name: "PEG compound", penalty: 6,
    reason: "PEG compounds can enhance skin penetration of other ingredients and may irritate compromised skin barriers in eczema-prone infants.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /\blimonene\b/i,
    name: "Limonene (fragrance allergen)", penalty: 6,
    reason: "Limonene is one of the EU-declarable fragrance allergens. As it oxidises it can become a contact sensitiser, particularly on sensitive infant skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /\blinalool\b/i,
    name: "Linalool (fragrance allergen)", penalty: 6,
    reason: "Linalool is an EU-declarable fragrance allergen found in many essential oils. Its oxidation products are a recognised cause of allergic contact dermatitis.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /\bgeraniol\b/i,
    name: "Geraniol (fragrance allergen)", penalty: 6,
    reason: "Geraniol is an EU-declarable fragrance allergen and a known contact sensitiser, best avoided on delicate infant skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /benzyl\s*benzoate/i,
    name: "Benzyl benzoate (fragrance allergen)", penalty: 6,
    reason: "Benzyl benzoate is an EU-declarable fragrance allergen that can act as a skin irritant and contact sensitiser.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /benzyl\s*salicylate/i,
    name: "Benzyl salicylate (fragrance allergen)", penalty: 6,
    reason: "Benzyl salicylate is an EU-declarable fragrance allergen and recognised contact sensitiser.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /citronellol|\beugenol\b|\bcoumarin\b|\bfarnesol\b|hexyl\s*cinnamal|amyl\s*cinnamal|cinnamyl\s*alcohol|cinnamal\b/i,
    name: "Fragrance allergen (declarable)", penalty: 6,
    reason: "This is one of the EU-declarable fragrance allergens, recognised contact sensitisers that are best avoided on eczema-prone or very young skin.",
    source: "Australasian College of Dermatologists — contact allergens",
    sourceUrl: "https://www.dermcoll.edu.au",
  },
  {
    match: /lavandula|lavender\s*oil|\bessential\s*oil\b/i,
    name: "Lavender / essential oil", penalty: 8,
    reason: "Essential oils such as lavender are natural fragrance sources containing multiple allergenic compounds (linalool, geraniol). ASCIA advises fragrance-free products, including natural fragrances, for sensitive infant skin.",
    source: "ASCIA — Eczema (Atopic Dermatitis) guidance",
    sourceUrl: "https://www.allergy.org.au/patients/skin-allergy/eczema",
  },
];

// Beneficial / ASCIA-favoured ingredients
export const POSITIVES = [
  { match: /glycer(in|ol)/i,                                       name: "Glycerin (humectant)",        bonus: 8  },
  { match: /ceramide/i,                                            name: "Ceramide (barrier repair)",   bonus: 12 },
  { match: /hyaluronic\s*acid|sodium\s*hyaluronate/i,             name: "Hyaluronic acid",             bonus: 10 },
  { match: /niacinamide/i,                                         name: "Niacinamide",                 bonus: 8  },
  { match: /zinc\s*oxide/i,                                        name: "Zinc oxide (barrier)",        bonus: 10 },
  { match: /panthenol|pro-vitamin\s*B5/i,                         name: "Panthenol (pro-vitamin B5)",  bonus: 8  },
  { match: /allantoin/i,                                           name: "Allantoin (soothing)",        bonus: 6  },
  { match: /bisabolol/i,                                           name: "Bisabolol (calming)",         bonus: 6  },
  { match: /petrolatum|white\s*soft\s*paraffin/i,                 name: "Petrolatum (barrier)",        bonus: 8  },
  { match: /aqua|purified\s*water/i,                               name: "Water base",                  bonus: 5  },
  { match: /tocopherol|vitamin\s*e/i,                              name: "Vitamin E (antioxidant)",     bonus: 5  },
];

// ── Helper: does this product have scoreable ingredient data? ────────────────
export function hasScoreableData(ingredientText) {
  return !!ingredientText && ingredientText.trim().length >= 5;
}

// ── Main scoring function ────────────────────────────────────────────────────
export function scoreProduct(ingredientText) {
  if (!hasScoreableData(ingredientText)) {
    return { score: null, flags: [], badges: [], foodDerivatives: [], breakdown: [], detractors: [], lostPointsReason: null };
  }

  const text = ingredientText;
  let score = 100;
  const flags = [];
  const badges = [];
  const foodDerivatives = [];
  const breakdown = [];
  const detractors = [];   // detailed, cited reasons for non-food deductions
  const deductions = [];

  // Sensitisers (non-food) — capture reason + source
  for (const item of SENSITISERS) {
    if (item.match.test(text)) {
      const actualPenalty = Math.min(item.penalty, score);
      score -= actualPenalty;
      flags.push(item.name);
      breakdown.push({ label: item.name, impact: `-${actualPenalty}`, positive: false });
      deductions.push(`${item.name} (-${actualPenalty})`);
      detractors.push({
        name: item.name,
        penalty: actualPenalty,
        reason: item.reason,
        source: item.source,
        sourceUrl: item.sourceUrl,
      });
    }
  }

  // Food derivatives
  for (const item of FOOD_DERIVATIVES) {
    if (item.match.test(text)) {
      const actualPenalty = Math.min(item.penalty, score);
      score -= actualPenalty;
      foodDerivatives.push(item.name);
      breakdown.push({ label: `${item.name} — food derivative`, impact: `-${actualPenalty}`, positive: false });
      deductions.push(`${item.name} (-${actualPenalty})`);
    }
  }

  // Positives — cap total bonus at 15
  let totalBonus = 0;
  for (const item of POSITIVES) {
    if (item.match.test(text)) {
      const actualBonus = Math.min(item.bonus, Math.max(0, 15 - totalBonus));
      if (actualBonus > 0) {
        totalBonus += actualBonus;
        badges.push(item.name);
        breakdown.push({ label: item.name, impact: `+${actualBonus}`, positive: true });
      }
    }
  }

  // Fragrance-free badge
  if (!/\bparfum\b|\bfragrance\b|\bscent\b/i.test(text)) {
    badges.push("Fragrance-free");
    breakdown.push({ label: "No fragrance detected", impact: "+0 (baseline met)", positive: true });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let lostPointsReason = null;
  if (deductions.length > 0) {
    const totalLost = 100 - score + totalBonus;
    lostPointsReason = `Lost ${totalLost} points due to: ${deductions.join("; ")}.`;
  }

  return { score, flags, badges, foodDerivatives, breakdown, detractors, lostPointsReason };
}
