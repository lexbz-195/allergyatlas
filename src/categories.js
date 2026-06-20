// ─── Find: Categories ─────────────────────────────────────────────────────────
// Each category maps to a Category value in the Notion product catalogue.
// The Find pages pull all products in that category, score them, and rank them.
// Colours are drawn from the Allergy Atlas brand palette:
//   #FAA275 peach · #FFE2FE pale pink · #A93F55 deep rose · #EDFF86 lime · #CDE7B0 sage

export const CATEGORIES = [
  { id:"wipes",      name:"Wipes",                     title:"Baby Wipes",                blurb:"Gentle, fragrance-free wipes for the most sensitive skin",        icon:"wipes",     accent:"#A93F55", tint:"#FFE2FE" },
  { id:"shampoo",    name:"Shampoo & Hair",            title:"Shampoo & Hair",            blurb:"Tear-free, soap-free washes for delicate scalps",                 icon:"shampoo",   accent:"#C8607C", tint:"#FFEAF7" },
  { id:"bodycream",  name:"Body Cream & Moisturiser",  title:"Body Cream & Moisturiser",  blurb:"Barrier-supporting emollients for eczema-prone skin",             icon:"cream",     accent:"#6FA368", tint:"#E6F2D9" },
  { id:"bathwash",   name:"Bath & Wash",               title:"Bath & Wash",               blurb:"Soap-free cleansers that won't strip the skin barrier",           icon:"bath",      accent:"#E08A4F", tint:"#FFE7D4" },
  { id:"nappy",      name:"Nappy Care",                title:"Nappy Care",                blurb:"Zinc-based barrier creams for nappy area protection",             icon:"nappy",     accent:"#C8607C", tint:"#FFE2FE" },
  { id:"sunscreen",  name:"Sun Protection",            title:"Sun Protection",            blurb:"Mineral sunscreens formulated for baby skin",                     icon:"sun",       accent:"#C99A1E", tint:"#F7F8D6" },
];

// Resolve a product's category (which may be the full Notion category name,
// e.g. "Shampoo & Hair", or a category id) to its icon key, accent and tint.
// Falls back to a sensible default if nothing matches.
export function categoryMeta(categoryValue) {
  if (!categoryValue) return { icon:"cream", accent:"#A93F55", tint:"#FFE2FE" };
  const v = String(categoryValue).trim().toLowerCase();
  const match = CATEGORIES.find(c =>
    c.name.toLowerCase() === v ||
    c.id.toLowerCase() === v ||
    c.title.toLowerCase() === v
  );
  if (match) return { icon:match.icon, accent:match.accent, tint:match.tint };
  // Loose keyword fallback for slight naming differences
  if (v.includes("wipe"))                         return { icon:"wipes",   accent:"#A93F55", tint:"#FFE2FE" };
  if (v.includes("shampoo") || v.includes("hair"))return { icon:"shampoo", accent:"#C8607C", tint:"#FFEAF7" };
  if (v.includes("nappy"))                        return { icon:"nappy",   accent:"#C8607C", tint:"#FFE2FE" };
  if (v.includes("sun"))                          return { icon:"sun",     accent:"#C99A1E", tint:"#F7F8D6" };
  if (v.includes("bath") || v.includes("wash"))   return { icon:"bath",    accent:"#E08A4F", tint:"#FFE7D4" };
  if (v.includes("cream")||v.includes("moistur")||v.includes("lotion")) return { icon:"cream", accent:"#6FA368", tint:"#E6F2D9" };
  return { icon:"cream", accent:"#A93F55", tint:"#FFE2FE" };
}
