import React from "react";
import { Product } from "@/types";
import { ALLERGENS, LangKey } from "@/lib/constants";
import { getProductName, getProductDesc } from "@/lib/utils";

export function ProductCard({
  p,
  i,
  lang,
  cartQty,
  themeColor,
  C,
  onAdd,
  onRemove,
  onClick
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
}) {
  const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;

  return (
    <div style={{ animation: `fadeUp .4s ${i * .03}s both`, background: C.cd, borderRadius: 16, border: `1px solid ${C.bd}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div onClick={() => onClick(p)} style={{ position: "relative", width: "100%", paddingTop: "60%", cursor: "pointer", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0 }}>
          {p.image_url
            ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: `${themeColor}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🍽</div>
          }
        </div>
        {p.discount_pct > 0 && (
          <div style={{ position: "absolute", top: 8, left: 8, background: themeColor, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5 }}>-{p.discount_pct}%</div>
        )}
      </div>
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div onClick={() => onClick(p)} style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-.01em", cursor: "pointer", lineHeight: 1.3 }}>
          {getProductName(p, lang)}
        </div>
        <div style={{ fontSize: 11, color: C.mt, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {getProductDesc(p, lang)}
        </div>
        {p.allergens?.length > 0 && (
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {p.allergens.map(a => {
              const allergen = ALLERGENS.find(al => al.key === a);
              return allergen ? (
                <span key={a} style={{ fontSize: 9, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 4, padding: "1px 4px", color: C.mt, display: "flex", alignItems: "center", gap: 2 }}>
                  {allergen.icon} {allergen.label}
                </span>
              ) : null;
            })}
          </div>
        )}
        {(p.prep_time || p.calories) && (
          <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.mt }}>
            {p.prep_time && <span>⏱ {p.prep_time}dk</span>}
            {p.calories && <span>🔥 {p.calories}kal</span>}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>₺{discPrice || p.price}</span>
            {discPrice && <span style={{ fontSize: 11, color: C.dm, textDecoration: "line-through" }}>₺{p.price}</span>}
          </div>
          {cartQty > 0 ? (
            <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 8, border: `1.5px solid ${themeColor}20` }}>
              <button onClick={() => onRemove(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: themeColor }}>−</button>
              <span style={{ fontWeight: 700, fontSize: 13, color: themeColor, minWidth: 16, textAlign: "center" }}>{cartQty}</span>
              <button onClick={() => onAdd(p)} style={{ width: 28, height: 28, border: "none", background: themeColor, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 6px 6px 0" }}>+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(p)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.bd}`, background: "transparent", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>+ Ekle</button>
          )}
        </div>
      </div>
    </div>
  );
}
