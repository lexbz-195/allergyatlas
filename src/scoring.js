// ─── AllergyAtlas Scoring Engine ─────────────────────────────────────────────
// Based on ASCIA (2026), NAC, A&AA, NACE and FSANZ guidelines

// Ingredients that are food derivatives — flagged for pre-solid infants per ASCIA
export const FOOD_DERIVATIVES = [
  { match: /avena\s*sativa|oat(meal|s)?|colloidal\s*oat/i,       name: "Oat / Colloidal oatmeal",    penalty: 18 },
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
];

// Fragrances and known skin sensitisers
export const SENSITISERS = [
  { match: /\bparfum\b|\bfragrance\b|\bscent\b/i,                 name: "Fragrance/parfum",            penalty: 35 },
  { match: /\blanolin\b/i,                                         name: "Lanolin (wool derivative)",   penalty: 12 },
  { match: /benzyl\s*alcohol/i,                                    name: "Benzyl alcohol",              penalty: 10 },
  { match: /methylisothiazolinone|MIT\b/i,                         name: "Methylisothiazolinone (MIT)", penalty: 20 },
  { match: /methylchloroisothiazolinone|MCIT\b/i,                  name: "Methylchloroisothiazolinone", penalty: 20 },
  { match: /formaldehyde|dmdm\s*hydantoin|imidazolidinyl\s*urea/i,name: "Formaldehyde releaser",       penalty: 22 },
  { match: /sodium\s*lauryl\s*sulph(ate|ate)|SLS\b/i,             name: "SLS (harsh surfactant)",      penalty: 15 },
  { match: /sodium\s*laureth\s*sulph(ate|ate)|SLES\b/i,           name: "SLES (surfactant)",           penalty: 8  },
  { match: /propylene\s*glycol/i,                                  name: "Propylene glycol",            penalty: 8  },
  { match: /phenoxyethanol/i,                                      name: "Phenoxyethanol (preservative)",penalty: 10},
  { match: /sodium\s*benzoate/i,                                   name: "Sodium benzoate (preservative)",penalty: 10},
  { match: /parabens?|(methyl|ethyl|propyl|butyl)\s*paraben/i,    name: "Parabens",                    penalty: 12 },
  { match: /mineral\s*oil|paraffinum\s*liquidum/i,                 name: "Mineral oil",                 penalty: 6  },
  { match: /artificial\s*colo(u)?r|\bfd&c\b|\bci\s*\d{5}\b/i,    name: "Artificial colourant",        penalty: 8  },
  { match: /triclosan/i,                                           name: "Triclosan",                   penalty: 18 },
  { match: /polyethylene\s*glycol|PEG-\d/i,                       name: "PEG compound",                penalty: 6  },
];

// Ingredients that are beneficial / ASCIA recommended
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

// ── Main scoring function ─────────────────────────────────────────────────────
export function scoreProduct(ingredientText) {
  if (!ingredientText || ingredientText.trim().length < 5) {
    return {
      score: null,
      flags: [],
      badges: [],
      foodDerivatives: [],
      breakdown: [],
      lostPointsReason: null,
    };
  }

  const text = ingredientText;
  let score = 100;
  const flags = [];
  const badges = [];
  const foodDerivatives = [];
  const breakdown = [];
  const deductions = [];
  const additions = [];

  // Check sensitisers
  for (const item of SENSITISERS) {
    if (item.match.test(text)) {
      const actualPenalty = Math.min(item.penalty, score);
      score -= actualPenalty;
      flags.push(item.name);
      breakdown.push({ label: item.name, impact: `-${actualPenalty}`, positive: false });
      deductions.push(`${item.name} (-${actualPenalty})`);
    }
  }

  // Check food derivatives
  for (const item of FOOD_DERIVATIVES) {
    if (item.match.test(text)) {
      const actualPenalty = Math.min(item.penalty, score);
      score -= actualPenalty;
      foodDerivatives.push(item.name);
      breakdown.push({ label: `${item.name} — food derivative`, impact: `-${actualPenalty}`, positive: false });
      deductions.push(`${item.name} (-${actualPenalty})`);
    }
  }

  // Check positives — cap bonus at 15 total so base score ceiling is still 100
  let totalBonus = 0;
  for (const item of POSITIVES) {
    if (item.match.test(text)) {
      const actualBonus = Math.min(item.bonus, Math.max(0, 15 - totalBonus));
      if (actualBonus > 0) {
        totalBonus += actualBonus;
        badges.push(item.name);
        breakdown.push({ label: item.name, impact: `+${actualBonus}`, positive: true });
        additions.push(item.name);
      }
    }
  }

  // Check fragrance-free explicitly as a badge
  if (!/\bparfum\b|\bfragrance\b|\bscent\b/i.test(text)) {
    badges.push("Fragrance-free");
    breakdown.push({ label: "No fragrance detected", impact: "+0 (baseline met)", positive: true });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Build lost-points sentence
  let lostPointsReason = null;
  if (deductions.length > 0) {
    const totalLost = 100 - score + totalBonus;
    lostPointsReason = `Lost ${totalLost} points due to: ${deductions.join("; ")}.`;
  }

  return { score, flags, badges, foodDerivatives, breakdown, lostPointsReason };
}
