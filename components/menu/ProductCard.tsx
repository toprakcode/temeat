import React from "react";
import { Product } from "@/types";
import { ALLERGENS, LangKey } from "@/lib/constants";
import { getProductName, getProductDesc } from "@/lib/utils";
import { UI_STRINGS } from "@/lib/translations";

export function ProductCard({
  p,
  i,
  lang,
  cartQty,
  themeColor,
  C,
  onAdd,
  onRemove,
  onClick,
  hasPrepInfo,
  hasCart,
  isAIChoice
}: {
  p: Product;
  i: number;
  lang: LangKey;
  cartQty: number;
  themeColor: string;
  C: any;
  onAdd: (p: Product) => void;
  onRemove: (p: Product) => void;
  onClick: (p: Product) => void;
  hasPrepInfo?: boolean;
  hasCart?: boolean;
  isAIChoice?: boolean;
}) {
  const t = UI_STRINGS[lang];
  const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;

  return (
    <div style={{ 
      animation: `fadeUp .4s ${i * .03}s both`, 
      background: C.cd, 
      borderRadius: 24, 
      border: `1px solid ${C.bd}`, 
      overflow: "hidden", 
      display: "flex", 
      flexDirection: "column", 
      opacity: p.is_available === false ? 0.7 : 1, 
      filter: p.is_available === false ? "grayscale(0.5)" : "none",
      boxShadow: "0 4px 20px rgba(0,0,0,.03)"
    }}>
      <div onClick={() => onClick(p)} style={{ position: "relative", width: "100%", paddingTop: "65%", cursor: "pointer", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {p.image_url
            ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: `${themeColor}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" style={{ opacity: 0.3 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
              </div>
          }
        </div>
        {p.is_available === false && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 10px", border: "2px solid #fff", borderRadius: 10 }}>TÜKENDİ</span>
          </div>
        )}
        {p.discount_pct > 0 && p.is_available !== false && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 10, zIndex: 11 }}>-%{p.discount_pct}</div>
        )}
        {isAIChoice && p.is_available !== false && (
          <div style={{ 
            position: "absolute", 
            top: 12, 
            right: 12, 
            background: `linear-gradient(135deg, ${themeColor} 0%, #ff8c00 100%)`, 
            color: "#fff", 
            fontSize: 10, 
            fontWeight: 800, 
            padding: "5px 10px", 
            borderRadius: 10, 
            zIndex: 11,
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            AI SEÇİMİ
          </div>
        )}
      </div>
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div onClick={() => onClick(p)} style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.02em", cursor: "pointer", lineHeight: 1.2, color: C.tx }}>
          {getProductName(p, lang)}
        </div>
        <div style={{ fontSize: 13, color: C.mt, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {getProductDesc(p, lang)}
        </div>
        
        {/* Badges Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {p.allergens?.length > 0 && p.allergens.map(a => {
            const allergen = ALLERGENS.find(al => al.key === a);
            return allergen ? (
              <span key={a} style={{ fontSize: 10, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 8, padding: "3px 10px", color: C.mt, fontWeight: 600 }}>
                {allergen.label}
              </span>
            ) : null;
          })}
          {hasPrepInfo && p.prep_time && (
            <span style={{ fontSize: 11, color: C.mt, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {p.prep_time} {t.prep}
            </span>
          )}
        </div>

        {/* SOCIAL PROOF INDICATOR */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: "#10b981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(16, 185, 129, 0.8)", fontWeight: 700 }}>
            {(() => {
              const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const viewers = 2 + (seed % 6);
              return lang === 'tr' ? `Şu an ${viewers} kişi inceliyor` : `${viewers} people viewing right now`;
            })()}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: C.tx }}>₺{discPrice || p.price}</span>
            {discPrice && <span style={{ fontSize: 13, color: C.mt, textDecoration: "line-through" }}>₺{p.price}</span>}
          </div>
          {hasCart && (
            p.is_available === false ? (
              <span style={{ fontSize: 11, fontWeight: 800, color: C.dm, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tükendi</span>
            ) : cartQty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 12, border: `1.5px solid ${themeColor}20` }}>
                <button onClick={() => onRemove(p)} style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", fontSize: 20, color: themeColor }}>−</button>
                <span style={{ fontWeight: 800, fontSize: 15, color: themeColor, minWidth: 20, textAlign: "center" }}>{cartQty}</span>
                <button onClick={() => onAdd(p)} style={{ width: 36, height: 36, border: "none", background: themeColor, cursor: "pointer", fontSize: 20, color: "#fff", borderRadius: "0 12px 12px 0" }}>+</button>
              </div>
            ) : (
              <button onClick={() => onAdd(p)} style={{ height: 40, padding: "0 20px", borderRadius: 12, border: `1px solid ${C.bd}`, background: C.cd, fontSize: 13, fontWeight: 700, color: C.tx, cursor: "pointer" }}>+ {t.add}</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
