import { useState, useEffect, useRef, useCallback } from "react";
import { searchProducts, fetchByCategory, fetchAllProducts } from "./api";
import { scoreProduct } from "./scoring";
import { GUIDELINES } from "./guidelines";
import { CATEGORIES, categoryMeta } from "./categories";

// ─── Palette ──────────────────────────────────────────────────────────────────
// Brand colours: #FAA275 (peach), #FFE2FE (pale pink), #A93F55 (deep rose),
// #EDFF86 (lime), #CDE7B0 (sage). For accessibility, #A93F55 (deep rose) is the
// primary text/UI colour since it's the only one with sufficient contrast on
// light backgrounds. Peach is the warm CTA accent (with dark text). Pale pink is
// the page tint. Sage backs "safe" states, lime is a sparing highlight.
const C = {
  bgPage:"#FFF4FD",     // very soft tint of #FFE2FE pale pink
  bgCard:"#FFFDFE",
  primary:"#A93F55",    // deep rose — headings, buttons, body (AA contrast on light)
  primaryDk:"#8E3145",  // darker rose for hover/gradient depth
  accent:"#FAA275",     // peach — warm CTA accent (use with dark text)
  accentLt:"#FFE2FE",   // pale pink — tints, chips, hover backgrounds
  accentLt2:"#FFEFF9",  // even softer pink for large fills
  border:"#F3D9E6",     // soft rose-pink border
  textDark:"#3A1622",   // near-black warm
  textMid:"#7A4453",    // mid rose-brown (AA on white)
  textLight:"#B07F8E",  // muted rose (AA-large only)
  safe:"#3D8F6A",       // accessible green for text/score
  safeBg:"#E6F2D9",     // soft sage tint (from #CDE7B0)
  caution:"#9A6A1F",    // accessible amber for text
  cautionBg:"#FBF3DD",  // pale lime-cream tint (nods to #EDFF86)
  danger:"#A82848",     // accessible red for text/score
  dangerBg:"#FBE4EC",   // pale rose tint
};

const FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function getScoreInfo(score) {
  if (score >= 75) return { color:C.safe,   bg:C.safeBg,   label:"Allergy Friendly" };
  if (score >= 45) return { color:C.caution, bg:C.cautionBg,label:"Some Concerns" };
  return               { color:C.danger,  bg:C.dangerBg, label:"Not Recommended" };
}

// Display a clean hostname for a source link (e.g. "gaiaskinnaturals.com")
function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return "manufacturer site"; }
}

function LogoMark({ size=38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="#A93F55"/>
      <path d="M20 6C14 6 10 10 10 15.5C10 22 15 27.5 20 32C25 27.5 30 22 30 15.5C30 10 26 6 20 6Z" fill="white" opacity="0.15"/>
      <line x1="20" y1="28" x2="20" y2="16" stroke="#4CAF72" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 22C17 20 14 21 14 24C17 24 20 22 20 22Z" fill="#4CAF72"/>
      <path d="M20 19C23 17 26 18 26 21C23 21 20 19 20 19Z" fill="#6FCF97"/>
      <circle cx="20" cy="15.5" r="1.5" fill="#4CAF72"/>
    </svg>
  );
}

// Custom category icons (brand-coloured SVGs, sized to sit where the emoji was).
// `color` is the category accent; a soft fill is derived for depth.
function CategoryIcon({ icon, color = "#A93F55", size = 40 }) {
  const stroke = color;
  const soft = color + "33"; // ~20% alpha fill
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none",
    xmlns: "http://www.w3.org/2000/svg" };
  const sw = 2.4;
  switch (icon) {
    case "wipes": // packet of wipes with a sheet pulled out
      return (
        <svg {...common}>
          <rect x="11" y="17" width="26" height="22" rx="4" fill={soft} stroke={stroke} strokeWidth={sw}/>
          <rect x="19" y="20" width="10" height="3.5" rx="1.75" fill={stroke}/>
          <path d="M20 17c0-3 1.5-6 4-6s4 3 4 6" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <path d="M20 12.5h8l-1.2-2.2a2 2 0 0 0-1.7-1h-2.2a2 2 0 0 0-1.7 1Z" fill={stroke}/>
          <line x1="16" y1="30" x2="22" y2="30" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        </svg>
      );
    case "shampoo": // bottle
      return (
        <svg {...common}>
          <rect x="17" y="18" width="14" height="22" rx="4" fill={soft} stroke={stroke} strokeWidth={sw}/>
          <path d="M21 18v-3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <rect x="21" y="8" width="6" height="4" rx="1.5" fill={stroke}/>
          <line x1="17" y1="27" x2="31" y2="27" stroke={stroke} strokeWidth={sw}/>
        </svg>
      );
    case "cream": // jar of cream
      return (
        <svg {...common}>
          <rect x="13" y="20" width="22" height="18" rx="5" fill={soft} stroke={stroke} strokeWidth={sw}/>
          <rect x="16" y="12" width="16" height="8" rx="3" fill={stroke}/>
          <ellipse cx="24" cy="27" rx="6" ry="2.5" stroke={stroke} strokeWidth={sw} fill="none"/>
        </svg>
      );
    case "bath": // bathtub
      return (
        <svg {...common}>
          <path d="M9 26h30v4a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7v-4Z" fill={soft} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
          <path d="M13 26v-9a4 4 0 0 1 4-4 4 4 0 0 1 4 4" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <circle cx="17" cy="17" r="1.6" fill={stroke}/>
          <line x1="14" y1="37" x2="13" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <line x1="34" y1="37" x2="35" y2="40" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        </svg>
      );
    case "nappy": // baby bottle
      return (
        <svg {...common}>
          <path d="M17 19h14v16a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V19Z" fill={soft} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
          <rect x="19" y="13" width="10" height="6" rx="2" fill={stroke}/>
          <path d="M22 9.5l2 2 2-2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="17" y1="27" x2="24" y2="27" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <line x1="17" y1="32" x2="22" y2="32" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        </svg>
      );
    case "sun": // sun
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="8" fill={soft} stroke={stroke} strokeWidth={sw}/>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 24 + Math.cos(a) * 13, y1 = 24 + Math.sin(a) * 13;
            const x2 = 24 + Math.cos(a) * 17, y2 = 24 + Math.sin(a) * 17;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>;
          })}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" fill={soft} stroke={stroke} strokeWidth={sw}/>
        </svg>
      );
  }
}

// Warning banner shown on the Sun Protection category page and on all
// sun-protection product detail cards.
function SunscreenWarning({ compact = false }) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:compact?"10px 14px":"13px 16px",borderRadius:12,background:"#FFF4E0",border:"1.5px solid #E8B84B",margin:compact?"0 0 0":"0 0 22px"}}>
      <span style={{fontSize:16,lineHeight:1.3,flexShrink:0}}>⚠️</span>
      <span style={{fontSize:compact?12:13,fontWeight:600,color:"#7A5210",lineHeight:1.45}}>
        Sunscreen use is not recommended for infants under the age of 6 months.
      </span>
    </div>
  );
}

// True for the Sun Protection category (matched by id or name).
function isSunCategory(cat) {
  if (!cat) return false;
  const v = `${cat.id||""} ${cat.name||""} ${cat.category||""}`.toLowerCase();
  return v.includes("sun");
}

function NavBar({ onHome, onCheck, onFind, active, crumb, onGuidelines }) {
  const pill = (label, key, onClick) => {
    const isActive = active === key;
    return (
      <button onClick={onClick}
        style={{
          padding:"7px 16px", borderRadius:99, fontSize:13, fontWeight:700,
          border:"none", cursor:"pointer", fontFamily:"inherit",
          background: isActive ? `linear-gradient(135deg,${C.primary},${C.primaryDk})` : C.accentLt,
          color: isActive ? "#fff" : C.primary,
          boxShadow: isActive ? `0 2px 8px ${C.primary}33` : "none",
          transition:"all .15s",
        }}
        onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=C.border; }}
        onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background=C.accentLt; }}
      >{label}</button>
    );
  };
  return (
    <nav style={{padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderBottom:`1px solid ${C.border}`,background:C.bgCard,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        <div onClick={onHome} role="button" tabIndex={0}
          onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onHome();}}
          style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",flexShrink:0}} title="Back to home">
          <LogoMark size={34}/>
          <span style={{fontSize:16,fontWeight:800,color:C.primary,letterSpacing:-.3}}>Allergy<span style={{color:C.accent}}>Atlas</span></span>
        </div>
        {crumb && <span style={{fontSize:13,color:C.textLight,whiteSpace:"nowrap"}}>/ {crumb}</span>}
      </div>
      <div style={{display:"flex",gap:7,flexShrink:0,alignItems:"center"}}>
        {pill("🔍 Check", "check", onCheck)}
        {pill("🧭 Find", "find", onFind)}
        {onGuidelines && (
          <button onClick={onGuidelines}
            style={{padding:"7px 14px",borderRadius:99,fontSize:12,fontWeight:700,background:"transparent",color:C.textMid,border:`1.5px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.accentLt;e.currentTarget.style.color=C.primary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}
            title="Australian Guidelines"
          >🇦🇺 Guidelines</button>
        )}
      </div>
    </nav>
  );
}

function ScoreBar({ score, animate }) {
  const [width, setWidth] = useState(0);
  const { color } = getScoreInfo(score);
  useEffect(() => {
    if (!animate) return;
    setWidth(0);
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score, animate]);
  const grad = score >= 75 ? "linear-gradient(90deg,#8ECFB0,#3D8F6A)"
    : score >= 45 ? "linear-gradient(90deg,#F0C87A,#A96E28)"
    : "linear-gradient(90deg,#F0A0B8,#A82848)";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
        <span style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase"}}>Score</span>
        <span style={{fontSize:32,fontWeight:800,color,lineHeight:1}}>
          {score}<span style={{fontSize:14,fontWeight:500,color:C.textLight}}>/100</span>
        </span>
      </div>
      <div style={{height:10,borderRadius:99,background:C.border,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${width}%`,background:grad,borderRadius:99,transition:"width 0.9s cubic-bezier(0.16,1,0.3,1)"}}/>
      </div>
    </div>
  );
}

function Pill({ text, type }) {
  const s={safe:{bg:C.safeBg,color:C.safe,pre:"✓"},flag:{bg:C.dangerBg,color:C.danger,pre:"⚠"},food:{bg:"#FFF3CD",color:"#856404",pre:"🌾"}}[type]||{bg:C.accentLt,color:C.accent,pre:"•"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:s.bg,color:s.color,border:`1px solid ${s.color}22`}}>{s.pre} {text}</span>;
}

function BreakdownRow({ item }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:13,color:C.textMid}}>{item.label}</span>
      <span style={{fontSize:13,fontWeight:700,color:item.positive?C.safe:C.danger,minWidth:36,textAlign:"right"}}>{item.impact}</span>
    </div>
  );
}

function ProductCard({ product, onClose, onCheckAnother }) {
  const scored = scoreProduct(product.ingredients);
  const hasScore = scored.score !== null;
  const { color, bg, label } = hasScore ? getScoreInfo(scored.score) : {color:C.textLight,bg:C.accentLt,label:"No data"};
  return (
    <div style={{background:C.bgCard,borderRadius:22,border:`1.5px solid ${C.border}`,boxShadow:"0 8px 40px rgba(169,63,85,0.09)",overflow:"hidden",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{display:"flex",gap:14,alignItems:"center",minWidth:0}}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{width:52,height:52,borderRadius:14,objectFit:"cover",flexShrink:0,background:C.accentLt}} onError={e=>e.target.style.display="none"}/>
            : (()=>{ const m=categoryMeta(product.category); return <div style={{width:52,height:52,borderRadius:14,background:m.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CategoryIcon icon={m.icon} color={m.accent} size={32}/></div>; })()}
          <div style={{minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:2}}>{product.brand} · {product.category}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.textDark,lineHeight:1.3}}>{product.name}</div>
            {product.quantity && <div style={{fontSize:11,color:C.textLight,marginTop:2}}>{product.quantity}</div>}
          </div>
        </div>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:99,border:"none",background:C.accentLt,cursor:"pointer",fontSize:16,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
      </div>

      {isSunCategory({category: product.category}) && (
        <div style={{padding:"14px 24px 0"}}><SunscreenWarning compact/></div>
      )}

      {hasScore ? (
        <>
          <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`}}>
            <ScoreBar score={scored.score} animate={true}/>
            <div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:99,background:bg,border:`1.5px solid ${color}33`}}>
              <div style={{width:7,height:7,borderRadius:99,background:color}}/><span style={{fontSize:12,fontWeight:700,color}}>{label}</span>
            </div>
            {scored.foodDerivatives.length > 0 && (
              <div style={{marginTop:12,padding:"10px 14px",borderRadius:12,background:"#FFF8E1",border:"1.5px solid #F0C040"}}>
                <span style={{fontSize:12,fontWeight:700,color:"#856404"}}>🌾 Contains food derivatives</span>
                <p style={{margin:"4px 0 0",fontSize:12,color:"#6D5208",lineHeight:1.5}}>{scored.foodDerivatives.join(", ")} — ASCIA guidelines advise caution with food-derived ingredients on infants not yet introduced to solids.</p>
              </div>
            )}
          </div>
          {scored.breakdown.length > 0 && (
            <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:10}}>Why this score</div>
              {scored.breakdown.map((item,i) => <BreakdownRow key={i} item={item}/>)}
              {scored.lostPointsReason && <p style={{margin:"10px 0 0",fontSize:12,color:C.textMid,lineHeight:1.6,fontStyle:"italic"}}>{scored.lostPointsReason}</p>}
            </div>
          )}
          {(scored.badges.length > 0 || scored.flags.length > 0) && (
            <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {scored.badges.map((b,i) => <Pill key={i} text={b} type="safe"/>)}
                {scored.flags.map((f,i) => <Pill key={i} text={f} type="flag"/>)}
              </div>
            </div>
          )}
          {scored.detractors.length > 0 && (
            <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:10}}>Why these ingredients were flagged</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {scored.detractors.map((d,i) => (
                  <div key={i} style={{padding:"12px 14px",borderRadius:12,background:C.dangerBg,border:`1px solid ${C.danger}22`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.danger}}>⚠ {d.name}</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.danger,flexShrink:0}}>-{d.penalty}</span>
                    </div>
                    <p style={{margin:"0 0 6px",fontSize:12,color:C.textMid,lineHeight:1.55}}>{d.reason}</p>
                    <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none"}}>
                      📖 Source: {d.source} ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{padding:"14px 24px"}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:6}}>Ingredients</div>
            <p style={{margin:0,fontSize:12,color:C.textLight,lineHeight:1.7,maxHeight:100,overflow:"auto"}}>{product.ingredients}</p>
            {product.productUrl && (
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.textLight}}>Ingredient source: </span>
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none"}}>
                  {hostnameOf(product.productUrl)} ↗
                </a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{padding:"20px 24px"}}>
          <div style={{padding:"16px",borderRadius:12,background:C.accentLt,border:`1.5px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:6}}>📋</div>
            <div style={{fontSize:13,fontWeight:600,color:C.textMid,marginBottom:4}}>No ingredient list found</div>
            <div style={{fontSize:12,color:C.textLight,lineHeight:1.5}}>This product doesn't have an ingredient list recorded yet, so it can't be scored.</div>
          </div>
        </div>
      )}

      <div style={{padding:"14px 24px 20px",borderTop:`1px solid ${C.border}`}}>
        <button onClick={onCheckAnother || onClose}
          style={{width:"100%",padding:"13px 20px",borderRadius:99,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,boxShadow:`0 4px 14px ${C.primary}2E`,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform .12s, box-shadow .12s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 6px 18px ${C.primary}40`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 14px ${C.primary}2E`;}}
        >🔍 Check another product</button>
      </div>
    </div>
  );
}

function SearchRow({ product, onClick }) {
  const scored = scoreProduct(product.ingredients);
  const hasScore = scored.score !== null;
  const { color, bg } = hasScore ? getScoreInfo(scored.score) : {color:C.textLight,bg:C.accentLt};
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:12,padding:"9px 14px",borderRadius:10,cursor:"pointer",background:hov?C.accentLt:"transparent",transition:"background .12s",margin:"0 6px"}}>
      {product.image
        ? <img src={product.image} alt={product.name} style={{width:36,height:36,borderRadius:10,objectFit:"cover",flexShrink:0,background:C.accentLt}} onError={e=>e.target.style.display="none"}/>
        : (()=>{ const m=categoryMeta(product.category); return <div style={{width:36,height:36,borderRadius:10,background:m.tint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CategoryIcon icon={m.icon} color={m.accent} size={22}/></div>; })()}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:C.textDark,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{product.name}</div>
        <div style={{fontSize:11,color:C.textLight}}>{product.brand} · {product.category}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        {hasScore ? <><div style={{fontSize:14,fontWeight:800,color}}>{scored.score}</div><div style={{fontSize:10,color:C.textLight}}>/100</div></>
          : <div style={{fontSize:11,color:C.textLight}}>No data</div>}
      </div>
    </div>
  );
}

function GuidelinesPage({ onHome, onCheck, onFind }) {
  return (
    <div style={{minHeight:"100vh",background:C.bgPage,fontFamily:FONT}}>
      <NavBar onHome={onHome} onCheck={onCheck} onFind={onFind} active={null} crumb="Australian Guidelines"/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 60px"}}>
        <h1 style={{fontSize:28,fontWeight:800,color:C.textDark,letterSpacing:-0.8,margin:"0 0 6px"}}>Australian Allergy Guidelines</h1>
        <p style={{fontSize:15,color:C.textMid,margin:"0 0 20px",lineHeight:1.6}}>AllergyAtlas scores are based on the following Australian clinical guidelines and research bodies.</p>
        <div style={{marginBottom:28,padding:"20px 24px",borderRadius:18,background:"#FFF8E1",border:"2px solid #F0C040"}}>
          <div style={{fontSize:14,fontWeight:800,color:"#856404",marginBottom:8}}>🌾 Food Derivatives in Baby Products</div>
          <p style={{margin:0,fontSize:13,color:"#6D5208",lineHeight:1.65}}>ASCIA guidelines specifically warn that food-derived ingredients in skincare (such as oat, peanut oil, almond oil, milk protein and wheat) can cause sensitisation through the skin in infants who have not yet been introduced to those foods orally. AllergyAtlas automatically flags any product containing food derivatives and reduces its score accordingly.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {GUIDELINES.map((g,i) => (
            <div key={i} style={{background:C.bgCard,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",background:g.bg,borderBottom:`1.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontSize:13,fontWeight:800,color:g.color}}>{g.org}</span><span style={{fontSize:12,color:C.textMid,marginLeft:8}}>{g.full}</span></div>
                <a href={g.url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:600,color:g.color,textDecoration:"none",padding:"4px 12px",borderRadius:99,border:`1.5px solid ${g.color}33`,background:"white"}}>Visit ↗</a>
              </div>
              <div style={{padding:"14px 20px"}}>
                {g.rules.map((r,j) => (
                  <div key={j} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:j<g.rules.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{color:g.color,fontWeight:700,fontSize:14,flexShrink:0}}>→</span>
                    <span style={{fontSize:13,color:C.textMid,lineHeight:1.55}}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{marginTop:24,fontSize:11,color:C.textLight,textAlign:"center",lineHeight:1.6}}>
          AllergyAtlas is a prototype. Always consult your GP, paediatrician or allergist before making medical decisions.<br/>
          Sources: ASCIA (2026), NAC, A&AA, NACE, FSANZ, Prevent Allergies
        </p>
      </div>
    </div>
  );
}

function TopProductsPage({ onHome, onCheck, onFind, onGuidelines, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const products = await fetchAllProducts();
        const ranked = products
          .map(product => ({ product, scored: scoreProduct(product.ingredients) }))
          .filter(x => x.scored.score !== null && x.scored.score >= 75)
          .sort((a, b) => b.scored.score - a.scored.score);
        if (!cancelled) { setItems(ranked); setLoading(false); }
      } catch {
        if (!cancelled) { setItems([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{minHeight:"100vh",background:C.bgPage,fontFamily:FONT}}>
      <NavBar onHome={onHome} onCheck={onCheck} onFind={onFind} active={null} crumb="Highest Scoring Products" onGuidelines={onGuidelines}/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 60px"}}>
        <h1 style={{fontSize:28,fontWeight:800,color:C.textDark,letterSpacing:-0.8,margin:"0 0 6px"}}>Highest Scoring Products</h1>
        <p style={{fontSize:15,color:C.textMid,margin:"0 0 28px",lineHeight:1.6}}>These products score highest against the AllergyAtlas criteria, drawn from Australian allergy guidelines. Every product here is searchable in the app — each entry shows what earned its score, any detractors, and the sources behind it.</p>

        {loading && (
          <div style={{textAlign:"center",padding:"40px 0",color:C.textLight}}>
            <div style={{fontSize:24,marginBottom:8,animation:"spin 0.8s linear infinite",display:"inline-block"}}>⟳</div>
            <div style={{fontSize:13}}>Scoring live products…</div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{padding:"24px",borderRadius:18,background:C.bgCard,border:`1.5px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:13,color:C.textMid}}>Couldn't load top products right now. Please try again shortly.</div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {items.map(({ product, scored }, i) => {
            const { color, bg, label } = getScoreInfo(scored.score);
            return (
              <div key={i} style={{background:C.bgCard,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
                {/* Header */}
                <div onClick={()=>onSelect(product)} style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} title="View full product details">
                  <div style={{position:"relative",flexShrink:0}}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{width:48,height:48,borderRadius:14,objectFit:"cover",background:bg}} onError={e=>e.target.style.display="none"}/>
                      : (()=>{ const m=categoryMeta(product.category); return <div style={{width:48,height:48,borderRadius:14,background:m.tint,display:"flex",alignItems:"center",justifyContent:"center"}}><CategoryIcon icon={m.icon} color={m.accent} size={30}/></div>; })()}
                    <div style={{position:"absolute",top:-8,left:-8,width:22,height:22,borderRadius:99,background:C.primary,color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:2}}>{product.brand} · {product.category}</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.textDark,lineHeight:1.3}}>{product.name}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:24,fontWeight:800,color,lineHeight:1}}>{scored.score}</div>
                    <div style={{fontSize:10,fontWeight:600,color}}>{label}</div>
                  </div>
                </div>

                {/* Food derivative warning */}
                {scored.foodDerivatives.length > 0 && (
                  <div style={{margin:"14px 20px 0",padding:"10px 14px",borderRadius:12,background:"#FFF8E1",border:"1.5px solid #F0C040"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#856404"}}>🌾 Contains food derivatives</span>
                    <p style={{margin:"4px 0 0",fontSize:12,color:"#6D5208",lineHeight:1.5}}>{scored.foodDerivatives.join(", ")} — ASCIA guidelines advise caution with food-derived ingredients on infants not yet introduced to solids.</p>
                  </div>
                )}

                {/* Why it scored highly */}
                {scored.badges.length > 0 && (
                  <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Why it scored highly</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {scored.badges.map((b, j) => (
                        <span key={j} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:C.safeBg,color:C.safe,border:`1px solid ${C.safe}22`}}>✓ {b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detractors with reasons + sources */}
                {scored.detractors.length > 0 && (
                  <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:10}}>Detractors</div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {scored.detractors.map((d, j) => (
                        <div key={j} style={{padding:"12px 14px",borderRadius:12,background:C.dangerBg,border:`1px solid ${C.danger}22`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4}}>
                            <span style={{fontSize:13,fontWeight:700,color:C.danger}}>⚠ {d.name}</span>
                            <span style={{fontSize:12,fontWeight:700,color:C.danger,flexShrink:0}}>-{d.penalty}</span>
                          </div>
                          <p style={{margin:"0 0 6px",fontSize:12,color:C.textMid,lineHeight:1.55}}>{d.reason}</p>
                          <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none"}}>📖 Source: {d.source} ↗</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guideline sources for the positive score */}
                <div style={{padding:"12px 20px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Scoring sources</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    <a href="https://www.allergy.org.au/patients/skin-allergy/eczema" target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none",padding:"4px 12px",borderRadius:99,background:C.accentLt,border:`1px solid ${C.accent}22`}}>📖 ASCIA — Eczema guidance ↗</a>
                    <a href="https://www.dermcoll.edu.au" target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none",padding:"4px 12px",borderRadius:99,background:C.accentLt,border:`1px solid ${C.accent}22`}}>📖 Australasian College of Dermatologists ↗</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{marginTop:24,fontSize:11,color:C.textLight,textAlign:"center",lineHeight:1.6}}>
          Scores reflect the AllergyAtlas criteria based on Australian allergy guidelines. Always consult your GP, paediatrician or allergist before making medical decisions.
        </p>
      </div>
    </div>
  );
}

// Reusable ranked product card (used by Find category pages)
function RankedProductCard({ product, scored, rank, onSelect }) {
  const { color, bg, label } = getScoreInfo(scored.score);
  return (
    <div style={{background:C.bgCard,borderRadius:18,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
      <div onClick={()=>onSelect(product)} style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} title="View full product details">
        <div style={{position:"relative",flexShrink:0}}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{width:48,height:48,borderRadius:14,objectFit:"cover",background:bg}} onError={e=>e.target.style.display="none"}/>
            : (()=>{ const m=categoryMeta(product.category); return <div style={{width:48,height:48,borderRadius:14,background:m.tint,display:"flex",alignItems:"center",justifyContent:"center"}}><CategoryIcon icon={m.icon} color={m.accent} size={30}/></div>; })()}
          {rank != null && <div style={{position:"absolute",top:-8,left:-8,width:22,height:22,borderRadius:99,background:C.primary,color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{rank}</div>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:2}}>{product.brand} · {product.category}</div>
          <div style={{fontSize:15,fontWeight:700,color:C.textDark,lineHeight:1.3}}>{product.name}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:24,fontWeight:800,color,lineHeight:1}}>{scored.score}</div>
          <div style={{fontSize:10,fontWeight:600,color}}>{label}</div>
        </div>
      </div>
      {scored.foodDerivatives.length > 0 && (
        <div style={{margin:"14px 20px 0",padding:"10px 14px",borderRadius:12,background:"#FFF8E1",border:"1.5px solid #F0C040"}}>
          <span style={{fontSize:12,fontWeight:700,color:"#856404"}}>🌾 Contains food derivatives</span>
          <p style={{margin:"4px 0 0",fontSize:12,color:"#6D5208",lineHeight:1.5}}>{scored.foodDerivatives.join(", ")} — ASCIA guidelines advise caution with food-derived ingredients on infants not yet introduced to solids.</p>
        </div>
      )}
      {scored.badges.length > 0 && (
        <div style={{padding:"14px 20px",borderBottom: scored.detractors.length>0 ? `1px solid ${C.border}`:"none"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:8}}>Why it scored highly</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {scored.badges.map((b, j) => (
              <span key={j} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:C.safeBg,color:C.safe,border:`1px solid ${C.safe}22`}}>✓ {b}</span>
            ))}
          </div>
        </div>
      )}
      {scored.detractors.length > 0 && (
        <div style={{padding:"14px 20px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:10}}>Detractors</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {scored.detractors.map((d, j) => (
              <div key={j} style={{padding:"12px 14px",borderRadius:12,background:C.dangerBg,border:`1px solid ${C.danger}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.danger}}>⚠ {d.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:C.danger,flexShrink:0}}>-{d.penalty}</span>
                </div>
                <p style={{margin:"0 0 6px",fontSize:12,color:C.textMid,lineHeight:1.55}}>{d.reason}</p>
                <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,fontWeight:600,color:C.primary,textDecoration:"none"}}>📖 Source: {d.source} ↗</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Find — category landing (Krumbled-style editorial panels)
function FindHome({ onHome, onCheck, onFind, onGuidelines, onOpenCategory }) {
  return (
    <div style={{minHeight:"100vh",background:C.bgPage,fontFamily:FONT}}>
      <NavBar onHome={onHome} onCheck={onCheck} onFind={onFind} active="find" crumb="Find" onGuidelines={onGuidelines}/>
      <div style={{maxWidth:760,margin:"0 auto",padding:"36px 20px 60px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{textAlign:"center",marginBottom:24,animation:"fadeIn 0.5s ease"}}>
          <h1 style={{fontSize:"clamp(20px,4vw,38px)",fontWeight:800,color:C.textDark,letterSpacing:-1,lineHeight:1.2,margin:0}}>
            Find baby products<br/>
            <span style={{background:`linear-gradient(110deg,${C.primary},${C.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              by category
            </span>
          </h1>
        </div>

        <div style={{display:"flex",gap:6,padding:5,borderRadius:99,background:"#fff",border:`1.5px solid ${C.border}`,marginBottom:28,boxShadow:"0 2px 10px rgba(169,63,85,0.06)"}}>
          <button onClick={onCheck}
            style={{padding:"9px 28px",borderRadius:99,fontSize:14,fontWeight:700,background:"transparent",color:C.textMid,border:"none",cursor:"pointer",fontFamily:"inherit",transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color=C.primary}
            onMouseLeave={e=>e.currentTarget.style.color=C.textMid}
          >🔍 Check</button>
          <div style={{padding:"9px 28px",borderRadius:99,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,color:"#fff",boxShadow:`0 2px 8px ${C.primary}33`}}>🧭 Find</div>
        </div>

        <div style={{width:"100%",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={()=>onOpenCategory(cat)} role="button" tabIndex={0}
              onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onOpenCategory(cat);}}
              style={{overflow:"hidden",borderRadius:16,border:`1.5px solid ${C.border}`,background:cat.tint,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"20px 14px",transition:"transform .15s, box-shadow .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(169,63,85,0.10)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
            >
              <div style={{marginBottom:8,lineHeight:1}}><CategoryIcon icon={cat.icon} color={cat.accent} size={40}/></div>
              <h2 style={{fontSize:15,fontWeight:800,color:C.textDark,letterSpacing:-0.3,margin:"0 0 8px"}}>{cat.title}</h2>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:99,background:cat.accent,color:"#fff",fontSize:12,fontWeight:700}}>Explore →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Find — category detail with ranked products (live-scored)
function CategoryDetailPage({ category, onBack, onHome, onCheck, onFind, onGuidelines, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const products = await fetchByCategory(category.name);
        const scored = products
          .map(product => ({ product, scored: scoreProduct(product.ingredients) }))
          .filter(x => x.scored.score !== null)
          .sort((a, b) => b.scored.score - a.scored.score)
          .slice(0, 12);
        if (!cancelled) { setItems(scored); setLoading(false); }
      } catch {
        if (!cancelled) { setItems([]); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  return (
    <div style={{minHeight:"100vh",background:C.bgPage,fontFamily:FONT}}>
      <NavBar onHome={onHome} onCheck={onCheck} onFind={onFind} active="find" crumb={`Find / ${category.title}`} onGuidelines={onGuidelines}/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"24px 24px 60px"}}>
        <button onClick={onBack} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:99,border:`1.5px solid ${C.border}`,background:"white",cursor:"pointer",fontSize:13,fontWeight:600,color:C.textMid,fontFamily:"inherit",marginBottom:20}}>← All categories</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:8}}>
          <div style={{flexShrink:0}}><CategoryIcon icon={category.icon} color={category.accent} size={40}/></div>
          <div>
            <h1 style={{fontSize:26,fontWeight:800,color:C.textDark,letterSpacing:-0.6,margin:0}}>{category.title}</h1>
            <p style={{fontSize:14,color:C.textMid,margin:"2px 0 0"}}>{category.blurb}</p>
          </div>
        </div>
        <p style={{fontSize:13,color:C.textLight,margin:"12px 0 24px"}}>Highest-scoring {category.title.toLowerCase()} in our database, ranked by allergy-friendly score.</p>

        {isSunCategory(category) && <SunscreenWarning/>}

        {loading && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"6px 0 22px",color:category.accent}}>
              <span style={{width:18,height:18,borderRadius:"50%",border:`2.5px solid ${category.accent}33`,borderTopColor:category.accent,display:"inline-block",animation:"spin 0.7s linear infinite"}}/>
              <span style={{fontSize:13,fontWeight:600,color:C.textMid}}>Finding the best {category.title.toLowerCase()}…</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[0,1,2].map(i => (
                <div key={i} style={{background:C.bgCard,borderRadius:18,border:`1.5px solid ${C.border}`,padding:"18px 20px",display:"flex",alignItems:"center",gap:14,opacity:1 - i*0.22}}>
                  <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(90deg,${C.border}55,${category.tint},${C.border}55)`,backgroundSize:"200% 100%",animation:"shimmer 1.3s ease-in-out infinite",flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{height:9,width:"40%",borderRadius:6,marginBottom:9,background:`linear-gradient(90deg,${C.border}55,${category.tint},${C.border}55)`,backgroundSize:"200% 100%",animation:"shimmer 1.3s ease-in-out infinite"}}/>
                    <div style={{height:13,width:"72%",borderRadius:6,background:`linear-gradient(90deg,${C.border}55,${category.tint},${C.border}55)`,backgroundSize:"200% 100%",animation:"shimmer 1.3s ease-in-out infinite"}}/>
                  </div>
                  <div style={{width:34,height:30,borderRadius:8,background:`linear-gradient(90deg,${C.border}55,${category.tint},${C.border}55)`,backgroundSize:"200% 100%",animation:"shimmer 1.3s ease-in-out infinite",flexShrink:0}}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{padding:"24px",borderRadius:18,background:C.bgCard,border:`1.5px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>🔎</div>
            <div style={{fontWeight:700,color:C.textDark,marginBottom:3}}>No scoreable products found</div>
            <div style={{fontSize:13,color:C.textMid}}>We couldn't find products with ingredient data in this category right now. Try the Check tab to score a specific product.</div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {items.map(({ product, scored }, i) => (
            <RankedProductCard key={product.id || i} product={product} scored={scored} rank={i+1} onSelect={onSelect}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [query,setQuery]               = useState("");
  const [results,setResults]           = useState([]);
  const [selected,setSelected]         = useState(null);
  const [focused,setFocused]           = useState(false);
  const [showDrop,setShowDrop]         = useState(false);
  const [loading,setLoading]           = useState(false);
  const [showGuidelines,setShowGuidelines] = useState(false);
  const [showTop,setShowTop] = useState(false);
  const [findCategory,setFindCategory] = useState(null);  // selected category object, or null
  const [showFind,setShowFind] = useState(false);          // Find category landing
  const [error,setError]               = useState(null);
  const inputRef  = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setShowDrop(false); return; }
    setLoading(true); setError(null);
    try {
      const products = await searchProducts(q);
      setResults(products);
      setShowDrop(products.length > 0);
    } catch {
      setError("Search failed. Check your connection and try again.");
      setResults([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (selected) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 420);
    return () => clearTimeout(debounceRef.current);
  }, [query, selected, doSearch]);

  const handleSelect = p => { setSelected(p); setQuery(p.name); setShowDrop(false); };
  const handleClose  = () => { setSelected(null); setQuery(""); setResults([]); setTimeout(()=>inputRef.current?.focus(),80); };
  const goHome = () => { setShowGuidelines(false); setShowTop(false); setShowFind(false); setFindCategory(null); setSelected(null); setQuery(""); setResults([]); setShowDrop(false); };
  const goCheck = () => { goHome(); };
  const goFind = () => { setShowGuidelines(false); setShowTop(false); setFindCategory(null); setSelected(null); setQuery(""); setResults([]); setShowDrop(false); setShowFind(true); };
  const goGuidelines = () => { setShowTop(false); setShowFind(false); setFindCategory(null); setSelected(null); setShowDrop(false); setShowGuidelines(true); };

  if (showGuidelines) return <GuidelinesPage onHome={goHome} onCheck={goCheck} onFind={goFind}/>;
  if (showTop) return <TopProductsPage onHome={goHome} onCheck={goCheck} onFind={goFind} onGuidelines={goGuidelines} onSelect={(p)=>{ setShowTop(false); handleSelect(p); }}/>;
  if (findCategory) return <CategoryDetailPage category={findCategory} onBack={()=>setFindCategory(null)} onHome={goHome} onCheck={goCheck} onFind={goFind} onGuidelines={goGuidelines} onSelect={(p)=>{ setShowFind(false); setFindCategory(null); handleSelect(p); }}/>;
  if (showFind) return <FindHome onHome={goHome} onCheck={goCheck} onFind={goFind} onGuidelines={goGuidelines} onOpenCategory={(cat)=>setFindCategory(cat)}/>;

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse 90% 50% at 50% 0%,#FFE2FE 0%,${C.bgPage} 52%,#FFF0FB 100%)`,fontFamily:FONT,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px}
        input::placeholder{color:${C.textLight}}
      `}</style>

      <NavBar onHome={goHome} onCheck={goCheck} onFind={goFind} active="check" onGuidelines={()=>setShowGuidelines(true)}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:selected?"flex-start":"center",padding:selected?"24px 20px":"0 20px 80px",maxWidth:660,margin:"0 auto",width:"100%",transition:"all .4s cubic-bezier(0.16,1,0.3,1)"}}>

        {!selected && (
          <div style={{textAlign:"center",marginBottom:24,animation:"fadeIn 0.5s ease"}}>
            <h1 style={{fontSize:"clamp(20px,4vw,38px)",fontWeight:800,color:C.textDark,letterSpacing:-1,lineHeight:1.2,margin:0}}>
              Check a baby product<br/>
              <span style={{background:`linear-gradient(110deg,${C.primary},${C.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                against allergy guidelines
              </span>
            </h1>
          </div>
        )}

        {!selected && (
          <div style={{display:"flex",gap:6,padding:5,borderRadius:99,background:"#fff",border:`1.5px solid ${C.border}`,marginBottom:28,boxShadow:"0 2px 10px rgba(169,63,85,0.06)"}}>
            <div style={{padding:"9px 28px",borderRadius:99,fontSize:14,fontWeight:700,background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,color:"#fff",boxShadow:`0 2px 8px ${C.primary}33`}}>🔍 Check</div>
            <button onClick={goFind}
              style={{padding:"9px 28px",borderRadius:99,fontSize:14,fontWeight:700,background:"transparent",color:C.textMid,border:"none",cursor:"pointer",fontFamily:"inherit",transition:"color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.color=C.primary}
              onMouseLeave={e=>e.currentTarget.style.color=C.textMid}
            >🧭 Find</button>
          </div>
        )}

        <div style={{width:"100%",position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",background:"#fff",borderRadius:16,border:`1.5px solid ${focused?C.accent:C.border}`,boxShadow:focused?`0 0 0 4px ${C.accentLt},0 8px 28px rgba(169,63,85,0.10)`:"0 4px 20px rgba(169,63,85,0.08)",transition:"box-shadow .2s,border-color .2s"}}>
            <span style={{paddingLeft:18,fontSize:17,color:loading?"#ccc":C.accent}}>
              {loading ? <span style={{display:"inline-block",animation:"spin 0.8s linear infinite"}}>⟳</span> : "🔍"}
            </span>
            <input ref={inputRef} value={query}
              onChange={e=>{setQuery(e.target.value);setSelected(null);}}
              onFocus={()=>{setFocused(true);if(results.length>0&&!selected)setShowDrop(true);}}
              onBlur={()=>{setFocused(false);setTimeout(()=>setShowDrop(false),150);}}
              onKeyDown={e=>{if(e.key==="Escape")handleClose();}}
              placeholder="Search any baby product or brand…"
              style={{flex:1,border:"none",outline:"none",fontSize:15,fontWeight:500,color:C.textDark,padding:"17px 12px",background:"transparent",fontFamily:"inherit"}}
            />
            {query && <button onClick={handleClose} style={{marginRight:8,width:24,height:24,borderRadius:99,border:"none",background:C.accentLt,cursor:"pointer",fontSize:13,color:C.accent,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
          </div>

          {showDrop && results.length > 0 && !selected && (
            <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:C.bgCard,borderRadius:16,border:`1.5px solid ${C.border}`,boxShadow:"0 12px 40px rgba(169,63,85,0.12)",zIndex:100,overflow:"hidden",animation:"slideUp .2s cubic-bezier(0.16,1,0.3,1)",paddingBottom:6,maxHeight:380,overflowY:"auto"}}>
              <div style={{padding:"9px 20px 3px",fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",position:"sticky",top:0,background:C.bgCard}}>
                {results.length} result{results.length!==1?"s":""} — tap to score
              </div>
              {results.map((p,i) => <SearchRow key={i} product={p} onClick={()=>handleSelect(p)}/>)}
            </div>
          )}
        </div>

        {!selected && !query && (
          <div style={{marginTop:18,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase"}}>Popular brands</span>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center"}}>
              {["QV","Cetaphil","Bunjie","Gaia"].map(s => (
                <button key={s} onClick={()=>{setQuery(s);inputRef.current?.focus();}}
                  style={{padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,background:"#fff",color:C.primary,border:`1.5px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.accentLt;e.currentTarget.style.borderColor=C.accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=C.border;}}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {error && !selected && (
          <div style={{marginTop:14,padding:"16px 20px",borderRadius:14,background:C.dangerBg,border:`1.5px solid ${C.danger}33`,width:"100%",fontSize:13,color:C.danger}}>⚠️ {error}</div>
        )}

        {!loading && query.length > 2 && results.length===0 && !selected && !error && (
          <div style={{marginTop:14,padding:"24px",borderRadius:18,background:C.bgCard,border:`1.5px solid ${C.border}`,textAlign:"center",width:"100%"}}>
            <div style={{fontSize:28,marginBottom:6}}>🔎</div>
            <div style={{fontWeight:700,color:C.textDark,marginBottom:3}}>No products found</div>
            <div style={{fontSize:13,color:C.textMid}}>Try a different name or brand. New products are added to our catalogue regularly.</div>
          </div>
        )}

        {selected && <div style={{width:"100%",marginTop:18}}><ProductCard product={selected} onClose={handleClose} onCheckAnother={goHome}/></div>}
      </div>

      {!selected && (
        <div style={{textAlign:"center",padding:"10px 20px 22px",fontSize:11,color:C.textLight,lineHeight:1.6}}>
          Based on ASCIA · NAC · A&AA · NACE · FSANZ guidelines<br/>
          Prototype v0.2 · Not a substitute for medical advice
        </div>
      )}
    </div>
  );
}
