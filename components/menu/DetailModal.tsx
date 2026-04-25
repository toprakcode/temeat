import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import { ALLERGENS, LangKey } from "@/lib/constants";
import { getProductName, getProductDesc } from "@/lib/utils";
import { ModalWrapper } from "./ModalWrapper";
import { supabase } from "@/lib/supabase";

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
  onAdd: (p: Product, extras?: any[]) => void;
}) {
  const [extras, setExtras] = useState<any[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("product_extras").select("*").eq("product_id", product.id).then(({ data }) => {
      if (data) setExtras(data);
    });
  }, [product.id]);

  const toggleExtra = (extra: any) => {
    setSelectedExtras(prev => 
      prev.find(e => e.id === extra.id) 
        ? prev.filter(e => e.id !== extra.id) 
        : [...prev, extra]
    );
  };

  const discountPrice = product.discount_pct > 0 ? Math.round(product.price * (1 - product.discount_pct / 100)) : product.price;
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const totalPrice = discountPrice + extrasTotal;

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

          {extras.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tx, marginBottom: 8 }}>Ekstralar & Seçenekler</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {extras.map(ex => {
                  const isSelected = selectedExtras.some(e => e.id === ex.id);
                  return (
                    <button key={ex.id} onClick={() => toggleExtra(ex)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${isSelected ? themeColor : C.bd}`, background: isSelected ? `${themeColor}10` : C.cd, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${isSelected ? themeColor : C.dm}`, background: isSelected ? themeColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{ex.name_tr}</span>
                      </div>
                      {ex.price > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>+₺{ex.price}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${C.bd}` }}>
            <div>
              {product.discount_pct > 0 || extrasTotal > 0
                ? <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 800 }}>₺{totalPrice}</span>
                    <span style={{ fontSize: 14, color: C.dm, textDecoration: "line-through" }}>₺{product.price}</span>
                  </div>
                : <span style={{ fontSize: 26, fontWeight: 800 }}>₺{totalPrice}</span>
              }
            </div>
            <button onClick={() => { onAdd(product, selectedExtras); onClose(); }}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: themeColor, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${themeColor}30` }}>
              + Sepete Ekle
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
