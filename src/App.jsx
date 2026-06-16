import { useState, useEffect, useRef, useCallback } from "react";
import { searchProducts } from "./api";
import { scoreProduct } from "./scoring";
import { GUIDELINES } from "./guidelines";

const C = {
  bgPage:"#FDF4F7",bgCard:"#FFFBFC",primary:"#7B3348",accent:"#C06B82",accentLt:"#FAEAEE",
  border:"#EDD5DC",safe:"#3D8F6A",safeBg:"#EAF5EF",caution:"#A96E28",cautionBg:"#FEF5E6",
  danger:"#A82848",dangerBg:"#FDEDF3",textDark:"#2E1520",textMid:"#7A4A5A",textLight:"#B898A4",
};

function getScoreInfo(score) {
  if (score >= 75) return { color:C.safe,   bg:C.safeBg,   label:"Allergy Friendly" };
  if (score >= 45) return { color:C.caution, bg:C.cautionBg,label:"Some Concerns" };
  return               { color:C.danger,  bg:C.dangerBg, label:"Not Recommended" };
}

function LogoMark({ size=38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="#7B3348"/>
      <path d="M20 6C14 6 10 10 10 15.5C10 22 15 27.5 20 32C25 27.5 30 22 30 15.5C30 10 26 6 20 6Z" fill="white" opacity="0.15"/>
      <line x1="20" y1="28" x2="20" y2="16" stroke="#4CAF72" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 22C17 20 14 21 14 24C17 24 20 22 20 22Z" fill="#4CAF72"/>
      <path d="M20 19C23 17 26 18 26 21C23 21 20 19 20 19Z" fill="#6FCF97"/>
      <circle cx="20" cy="15.5" r="1.5" fill="#4CAF72"/>
    </svg>
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
        <span style={{fontSize:32,fontWeight:900,color,lineHeight:1}}>
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

function ProductCard({ product, onClose }) {
  const scored = scoreProduct(product.ingredients);
  const hasScore = scored.score !== null;
  const { color, bg, label } = hasScore ? getScoreInfo(scored.score) : {color:C.textLight,bg:C.accentLt,label:"No data"};
  return (
    <div style={{background:C.bgCard,borderRadius:22,border:`1.5px solid ${C.border}`,boxShadow:"0 8px 40px rgba(123,51,72,0.09)",overflow:"hidden",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{display:"flex",gap:14,alignItems:"center",minWidth:0}}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{width:52,height:52,borderRadius:14,objectFit:"cover",flexShrink:0,background:C.accentLt}} onError={e=>e.target.style.display="none"}/>
            : <div style={{width:52,height:52,borderRadius:14,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🧴</div>}
          <div style={{minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",marginBottom:2}}>{product.brand} · {product.category}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.textDark,lineHeight:1.3}}>{product.name}</div>
            {product.quantity && <div style={{fontSize:11,color:C.textLight,marginTop:2}}>{product.quantity}</div>}
          </div>
        </div>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:99,border:"none",background:C.accentLt,cursor:"pointer",fontSize:16,color:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
      </div>

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
          </div>
        </>
      ) : (
        <div style={{padding:"20px 24px"}}>
          <div style={{padding:"16px",borderRadius:12,background:C.accentLt,border:`1.5px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:6}}>📋</div>
            <div style={{fontSize:13,fontWeight:600,color:C.textMid,marginBottom:4}}>No ingredient list found</div>
            <div style={{fontSize:12,color:C.textLight,lineHeight:1.5}}>This product doesn't have ingredients in the Open Beauty Facts database yet. You can <a href="https://world.openbeautyfacts.org" target="_blank" rel="noopener noreferrer" style={{color:C.primary}}>contribute ingredient data</a> to help other parents.</div>
          </div>
        </div>
      )}
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
        : <div style={{width:36,height:36,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🧴</div>}
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

function GuidelinesPage({ onBack, onHome }) {
  return (
    <div style={{minHeight:"100vh",background:C.bgPage,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <nav style={{padding:"16px 32px",display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${C.border}`,background:C.bgCard}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:99,border:`1.5px solid ${C.border}`,background:"white",cursor:"pointer",fontSize:13,fontWeight:600,color:C.textMid,fontFamily:"inherit"}}>← Back</button>
        <div onClick={onHome} role="button" tabIndex={0}
          onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onHome();}}
          style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
          title="Back to search">
          <LogoMark size={32}/>
          <span style={{fontSize:16,fontWeight:800,color:C.primary}}>Allergy<span style={{color:C.accent}}>Atlas</span></span>
        </div>
        <span style={{fontSize:14,color:C.textLight,marginLeft:4}}>/ Australian Guidelines</span>
      </nav>
      <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 60px"}}>
        <h1 style={{fontSize:28,fontWeight:900,color:C.textDark,letterSpacing:-0.8,margin:"0 0 6px"}}>Australian Allergy Guidelines</h1>
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

export default function App() {
  const [query,setQuery]               = useState("");
  const [results,setResults]           = useState([]);
  const [selected,setSelected]         = useState(null);
  const [focused,setFocused]           = useState(false);
  const [showDrop,setShowDrop]         = useState(false);
  const [loading,setLoading]           = useState(false);
  const [showGuidelines,setShowGuidelines] = useState(false);
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
  const goHome = () => { setShowGuidelines(false); setSelected(null); setQuery(""); setResults([]); setShowDrop(false); };

  if (showGuidelines) return <GuidelinesPage onBack={()=>setShowGuidelines(false)} onHome={goHome}/>;

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse 90% 50% at 50% 0%,#FDE8EF 0%,${C.bgPage} 52%,#F2EBF5 100%)`,fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px}
        input::placeholder{color:${C.textLight}}
      `}</style>

      <nav style={{padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div onClick={goHome} role="button" tabIndex={0}
          onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")goHome();}}
          style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
          title="Back to search">
          <LogoMark size={38}/>
          <span style={{fontSize:17,fontWeight:800,color:C.primary,letterSpacing:-.5}}>Allergy<span style={{color:C.accent}}>Atlas</span></span>
        </div>
        <button onClick={()=>setShowGuidelines(true)}
          style={{padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:700,background:C.accentLt,color:C.primary,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=C.border}
          onMouseLeave={e=>e.currentTarget.style.background=C.accentLt}
        >🇦🇺 Australian Guidelines ↗</button>
      </nav>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:selected?"flex-start":"center",padding:selected?"24px 20px":"0 20px 80px",maxWidth:660,margin:"0 auto",width:"100%",transition:"all .4s cubic-bezier(0.16,1,0.3,1)"}}>
        {!selected && (
          <div style={{textAlign:"center",marginBottom:32,animation:"fadeIn 0.5s ease"}}>
            <h1 style={{fontSize:"clamp(20px,4vw,38px)",fontWeight:900,color:C.textDark,letterSpacing:-1,lineHeight:1.2,margin:0}}>
              Find allergy friendly products<br/>
              <span style={{background:`linear-gradient(110deg,${C.primary},${C.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                for your bub's sensitive skin
              </span>
            </h1>
          </div>
        )}

        <div style={{width:"100%",position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",background:"#fff",borderRadius:16,border:`1.5px solid ${focused?C.accent:C.border}`,boxShadow:focused?`0 0 0 4px ${C.accentLt},0 8px 28px rgba(123,51,72,0.10)`:"0 4px 20px rgba(123,51,72,0.08)",transition:"box-shadow .2s,border-color .2s"}}>
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
            <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:C.bgCard,borderRadius:16,border:`1.5px solid ${C.border}`,boxShadow:"0 12px 40px rgba(123,51,72,0.12)",zIndex:100,overflow:"hidden",animation:"slideUp .2s cubic-bezier(0.16,1,0.3,1)",paddingBottom:6,maxHeight:380,overflowY:"auto"}}>
              <div style={{padding:"9px 20px 3px",fontSize:11,fontWeight:700,color:C.textLight,letterSpacing:.8,textTransform:"uppercase",position:"sticky",top:0,background:C.bgCard}}>
                {results.length} result{results.length!==1?"s":""} — tap to score
              </div>
              {results.map((p,i) => <SearchRow key={i} product={p} onClick={()=>handleSelect(p)}/>)}
            </div>
          )}
        </div>

        {!selected && !query && (
          <div style={{marginTop:18,display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center"}}>
            {["WaterWipes","QV Baby","Aveeno Baby","Cetaphil Baby","Sudocrem"].map(s => (
              <button key={s} onClick={()=>{setQuery(s);inputRef.current?.focus();}}
                style={{padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:600,background:"#fff",color:C.primary,border:`1.5px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.accentLt;e.currentTarget.style.borderColor=C.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor=C.border;}}
              >{s}</button>
            ))}
          </div>
        )}

        {error && !selected && (
          <div style={{marginTop:14,padding:"16px 20px",borderRadius:14,background:C.dangerBg,border:`1.5px solid ${C.danger}33`,width:"100%",fontSize:13,color:C.danger}}>⚠️ {error}</div>
        )}

        {!loading && query.length > 2 && results.length===0 && !selected && !error && (
          <div style={{marginTop:14,padding:"24px",borderRadius:18,background:C.bgCard,border:`1.5px solid ${C.border}`,textAlign:"center",width:"100%"}}>
            <div style={{fontSize:28,marginBottom:6}}>🔎</div>
            <div style={{fontWeight:700,color:C.textDark,marginBottom:3}}>No products found</div>
            <div style={{fontSize:13,color:C.textMid}}>Try a different name or brand — the Open Beauty Facts database has 200,000+ products.</div>
          </div>
        )}

        {selected && <div style={{width:"100%",marginTop:18}}><ProductCard product={selected} onClose={handleClose}/></div>}
      </div>

      {!selected && (
        <div style={{textAlign:"center",padding:"10px 20px 22px",fontSize:11,color:C.textLight,lineHeight:1.6}}>
          Powered by Open Beauty Facts · ASCIA · NAC · A&AA · NACE · FSANZ guidelines<br/>
          Prototype v0.2 · Not a substitute for medical advice
        </div>
      )}
    </div>
  );
}
