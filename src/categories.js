// ─── Find: Categories ─────────────────────────────────────────────────────────
// Each category maps to a Category value in the Notion product catalogue.
// The Find pages pull all products in that category, score them, and rank them.

export const CATEGORIES = [
  { id:"wipes",      name:"Wipes",                     title:"Baby Wipes",                blurb:"Gentle, fragrance-free wipes for the most sensitive skin",        emoji:"💧", accent:"#5AA9C9", tint:"#EAF4F8" },
  { id:"shampoo",    name:"Shampoo & Hair",            title:"Shampoo & Hair",            blurb:"Tear-free, soap-free washes for delicate scalps",                 emoji:"🧴", accent:"#C99CC4", tint:"#F6ECF5" },
  { id:"bodycream",  name:"Body Cream & Moisturiser",  title:"Body Cream & Moisturiser",  blurb:"Barrier-supporting emollients for eczema-prone skin",             emoji:"🤲", accent:"#7BB89A", tint:"#EBF6F0" },
  { id:"bathwash",   name:"Bath & Wash",               title:"Bath & Wash",               blurb:"Soap-free cleansers that won't strip the skin barrier",           emoji:"🛁", accent:"#E2A06A", tint:"#FBF0E6" },
  { id:"nappy",      name:"Nappy Care",                title:"Nappy Care",                blurb:"Zinc-based barrier creams for nappy area protection",             emoji:"🍼", accent:"#D98BA0", tint:"#FAECF0" },
  { id:"sunscreen",  name:"Sun Protection",            title:"Sun Protection",            blurb:"Mineral sunscreens formulated for baby skin",                     emoji:"☀️", accent:"#E8C15A", tint:"#FCF6E4" },
  { id:"clothing",   name:"Clothing",                  title:"Clothing",                  blurb:"Natural-fibre basics free from irritating dyes",                  emoji:"👕", accent:"#9B8FC9", tint:"#F0EDF8" },
];
