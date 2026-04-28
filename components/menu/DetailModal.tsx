"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { LangKey } from "@/lib/constants";
import { getProductName, getProductDesc, getTranslatedName } from "@/lib/utils";
import { UI_STRINGS } from "@/lib/translations";

interface DetailModalProps {
  product: Product;
  lang: LangKey;
  themeColor: string;
  C: any;
  onClose: () => void;
  onAdd: (p: Product, extras: any[]) => void;
  hasPrepInfo?: boolean;
  hasCart?: boolean;
}

export function DetailModal({ product, lang, themeColor, C, onClose, onAdd, hasPrepInfo, hasCart }: DetailModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const t = UI_STRINGS[lang];

  const toggleExtra = (extra: any) => {
    setSelectedExtras(prev => 
      prev.find(e => e.id === extra.id) 
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const totalPrice = (product.discount_pct 
    ? Math.round(product.price * (1 - product.discount_pct / 100)) 
    : product.price) + selectedExtras.reduce((s, e) => s + e.price, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,.6)", animation: "fadeIn .3s" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 680, background: C.bg, borderRadius: "24px 24px 0 0", overflow: "hidden", animation: "slideUp .4s cubic-bezier(0.16, 1, 0.3, 1)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        
        <div style={{ position: "relative", height: 280, flexShrink: 0 }}>
          {product.image_url ? (
            <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `${themeColor}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🍽️</div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ padding: "24px 24px 100px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: C.tx }}>{getProductName(product, lang)}</h2>
            <div style={{ fontSize: 20, fontWeight: 800, color: themeColor }}>₺{product.discount_pct ? Math.round(product.price * (1 - product.discount_pct / 100)) : product.price}</div>
          </div>

          {hasPrepInfo && (
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              {product.prep_time && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.mt, fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {product.prep_time} {t.prep}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 15, color: C.s2, lineHeight: 1.6, marginBottom: 30 }}>{getProductDesc(product, lang)}</p>

          {product.allergens && product.allergens.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.allergens}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {product.allergens.map((alg: string) => (
                  <span key={alg} style={{ padding: "6px 12px", borderRadius: 8, background: C.bd, fontSize: 12, fontWeight: 600, color: C.mt }}>{alg}</span>
                ))}
              </div>
            </div>
          )}

          {product.extras && product.extras.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.extras}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {product.extras.map((ex: any) => {
                  const isSelected = selectedExtras.find(e => e.id === ex.id);
                  return (
                    <button key={ex.id} onClick={() => toggleExtra(ex)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${isSelected ? themeColor : C.bd}`, background: isSelected ? `${themeColor}08` : "transparent", cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? themeColor : C.mt}`, display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? themeColor : "transparent" }}>
                          {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? themeColor : C.tx }}>{getTranslatedName(ex, lang)}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? themeColor : C.mt }}>+₺{ex.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {hasCart && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 24px 32px", background: C.bg, borderTop: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: C.mt, fontWeight: 600, marginBottom: 2 }}>{t.total}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: themeColor }}>₺{totalPrice}</div>
            </div>
            {product.is_available === false ? (
              <button disabled style={{ flex: 1.5, height: 54, borderRadius: 16, border: "none", background: C.bd, color: C.mt, fontSize: 16, fontWeight: 700, cursor: "not-allowed" }}>
                Tükendi
              </button>
            ) : (
              <button onClick={() => { onAdd(product, selectedExtras); onClose(); }} style={{ flex: 1.5, height: 54, borderRadius: 16, border: "none", background: themeColor, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 20px ${themeColor}30` }}>
                {t.add}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
