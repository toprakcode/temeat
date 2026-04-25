import React, { useState } from "react";
import { Product, Restaurant } from "@/types";
import { LangKey } from "@/lib/constants";
import { getProductName } from "@/lib/utils";
import { ModalWrapper } from "./ModalWrapper";

export function CartModal({
  cartItems,
  cartTotal,
  restaurant,
  lang,
  themeColor,
  C,
  isRTL,
  onClose,
  onAdd,
  onRemove,
  onCheckout
}: {
  cartItems: { id: string; product: Product; qty: number; extras: any[] }[];
  cartTotal: number;
  restaurant: Restaurant | null;
  lang: LangKey;
  themeColor: string;
  C: any;
  isRTL: boolean;
  onClose: () => void;
  onAdd: (p: Product, extras?: any[]) => void;
  onRemove: (id: string) => void;
  onCheckout: (tableNo: string) => Promise<void>;
}) {
  const [tableNo, setTableNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!tableNo.trim()) return;
    setIsSubmitting(true);
    await onCheckout(tableNo.trim());
    setIsSubmitting(false);
  };
  return (
    <ModalWrapper onClick={onClose} zIndex={40}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}
        style={{ position: "relative", background: C.cd, borderRadius: "20px 20px 0 0", maxHeight: "70vh", display: "flex", flexDirection: "column", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
        <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
        <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.bd}` }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Sepetim</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 14, color: C.mt }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {cartItems.map(({ id, product: p, qty, extras }) => {
            const basePrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
            const extrasPrice = extras.reduce((s, e) => s + e.price, 0);
            const price = basePrice + extrasPrice;
            
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.bd}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `${themeColor}15` }}>
                  {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{getProductName(p, lang)}</div>
                  {extras.length > 0 && (
                    <div style={{ fontSize: 11, color: C.mt, marginTop: 2 }}>
                      {extras.map(e => e.name_tr).join(", ")}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: C.mt, marginTop: 2 }}>₺{price}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.bd}`, borderRadius: 8 }}>
                  <button onClick={() => onRemove(id)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>−</button>
                  <span style={{ minWidth: 16, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => onAdd(p, extras)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>+</button>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: "right" }}>₺{price * qty}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "14px 20px 28px", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.mt }}>Toplam Tutar</span>
            <span style={{ fontSize: 24, fontWeight: 800 }}>₺{cartTotal}</span>
          </div>
          
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input 
              type="text" 
              value={tableNo} 
              onChange={e => setTableNo(e.target.value)} 
              placeholder="Masa No (Örn: 12)" 
              style={{ width: "100px", padding: "14px", borderRadius: 12, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontWeight: 600, outline: "none", textAlign: "center" }} 
            />
            <button onClick={handleCheckout} disabled={!tableNo.trim() || isSubmitting} 
              style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: themeColor, color: "#fff", fontSize: 14, fontWeight: 700, cursor: (!tableNo.trim() || isSubmitting) ? "not-allowed" : "pointer", opacity: (!tableNo.trim() || isSubmitting) ? 0.6 : 1, fontFamily: "inherit" }}>
              {isSubmitting ? "Gönderiliyor..." : "Siparişi Gönder"}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
