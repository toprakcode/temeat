import React from "react";
import { Product } from "@/types";
import { ALLERGENS, LangKey } from "@/lib/constants";
import { getProductName, getProductDesc } from "@/lib/utils";
import { ModalWrapper } from "./ModalWrapper";

export function DetailModal({
  product,
  lang,
  themeColor,
  C,
  onClose,
  onAdd
}: {
  product: Product;
  lang: LangKey;
  themeColor: string;
  C: any;
  onClose: () => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <ModalWrapper onClick={onClose} zIndex={60}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: C.cd, borderRadius: "20px 20px 0 0", maxHeight: "85vh", overflowY: "auto", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
        <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
        <div style={{ position: "relative", width: "100%", height: 240 }}>
          {product.image_url
            ? <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: `${themeColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍽</div>
          }
          {product.discount_pct > 0 && (
            <div style={{ position: "absolute", top: 12, left: 12, background: themeColor, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>-{product.discount_pct}%</div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,.35)", border: "none", cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "16px 24px 32px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{getProductName(product, lang)}</h2>
          {(product.prep_time || product.calories || product.serves) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, color: C.mt }}>
              {product.prep_time && <span>⏱ {product.prep_time} dk</span>}
              {product.serves > 1 && <span>👤 {product.serves} kişilik</span>}
              {product.calories && <span>🔥 {product.calories} kal</span>}
            </div>
          )}
          <p style={{ fontSize: 14, color: C.s2, lineHeight: 1.65, marginBottom: 16 }}>{getProductDesc(product, lang)}</p>
          {product.allergens?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.mt, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Alerjenler</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {product.allergens.map(a => {
                  const allergen = ALLERGENS.find(al => al.key === a);
                  return allergen ? (
                    <span key={a} style={{ fontSize: 12, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 8, padding: "4px 10px", color: C.tx, display: "flex", alignItems: "center", gap: 4 }}>
                      {allergen.icon} {allergen.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${C.bd}` }}>
            <div>
              {product.discount_pct > 0
                ? <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 800 }}>₺{Math.round(product.price * (1 - product.discount_pct / 100))}</span>
                    <span style={{ fontSize: 14, color: C.dm, textDecoration: "line-through" }}>₺{product.price}</span>
                  </div>
                : <span style={{ fontSize: 26, fontWeight: 800 }}>₺{product.price}</span>
              }
            </div>
            <button onClick={() => { onAdd(product); onClose(); }}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: themeColor, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${themeColor}30` }}>
              + Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
