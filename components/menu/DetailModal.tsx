"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { LangKey } from "@/lib/constants";
import { getProductName, getProductDesc, getTranslatedName } from "@/lib/utils";
import { UI_STRINGS } from "@/lib/translations";

interface DetailModalProps {
  product: Product;
  allProducts: Product[];
  categories: any[];
  lang: LangKey;
  themeColor: string;
  C: any;
  onClose: () => void;
  onAdd: (p: Product, extras: any[]) => void;
  hasPrepInfo?: boolean;
  hasCart?: boolean;
}

export function DetailModal({ product, allProducts, categories, lang, themeColor, C, onClose, onAdd, hasPrepInfo, hasCart }: DetailModalProps) {
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

  // Advanced AI Suggestions Logic
  const getSuggestions = () => {
    const currentCat = categories.find(c => c.id === product.category_id)?.name.toLowerCase() || "";
    
    // Keywords for smarter matching
    const isDrink = (name: string) => ["içecek", "meşrubat", "drink", "su", "kahve", "çay", "beverage", "soft"].some(k => name.includes(k));
    const isDessert = (name: string) => ["tatlı", "dessert", "pasta", "dondurma"].some(k => name.includes(k));
    const isSide = (name: string) => ["yan", "meze", "salata", "ekstra", "side", "appetizer"].some(k => name.includes(k));

    // Try to find complementary items first
    let recommended = allProducts.filter(p => {
      if (p.id === product.id || !p.is_active) return false;
      const pCat = categories.find(c => c.id === p.category_id)?.name.toLowerCase() || "";
      
      if (isDessert(currentCat)) return isDrink(pCat);
      if (isDrink(currentCat)) return isSide(pCat) || isDessert(pCat);
      return isDrink(pCat) || isSide(pCat) || isDessert(pCat);
    });

    // Fallback: If no complementary items, take any 3 products from different categories
    if (recommended.length === 0) {
      recommended = allProducts.filter(p => p.id !== product.id && p.is_active);
    }

    return recommended.sort(() => 0.5 - Math.random()).slice(0, 4);
  };

  const suggestions = getSuggestions();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,.6)", animation: "fadeIn .3s" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 680, background: C.bg, borderRadius: "24px 24px 0 0", overflow: "hidden", animation: "slideUp .4s cubic-bezier(0.16, 1, 0.3, 1)", maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        
        <div style={{ position: "relative", height: 280, flexShrink: 0 }}>
          {product.image_url ? (
            <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `${themeColor}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" style={{ opacity: 0.5 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ padding: "24px 24px 120px", overflowY: "auto", flex: 1 }}>
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

          {/* AI SUGGESTIONS SECTION */}
          {suggestions.length > 0 && (
            <div style={{ marginBottom: 30, padding: "20px", borderRadius: 20, background: `linear-gradient(135deg, ${themeColor}08 0%, transparent 100%)`, border: `1px solid ${themeColor}15`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: themeColor, filter: "blur(60px)", opacity: 0.1, pointerEvents: "none" }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: `0 4px 12px ${themeColor}40` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: C.tx, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Yemek Önerileri</h3>
              </div>

              <div style={{ display: "flex", gap: 12, overflowX: "auto", margin: "0 -4px", padding: "4px" }}>
                {suggestions.map(p => (
                  <div key={p.id} style={{ flexShrink: 0, width: 130, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 16, overflow: "hidden", transition: "transform .2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ height: 80, background: `${themeColor}05` }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="1.5" style={{ opacity: 0.3 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "10px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.tx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{getProductName(p, lang)}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: themeColor }}>₺{p.price}</span>
                        <button onClick={() => onAdd(p, [])} style={{ width: 22, height: 22, borderRadius: 6, background: themeColor, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
