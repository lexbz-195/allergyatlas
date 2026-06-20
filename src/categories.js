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
