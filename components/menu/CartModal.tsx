import React from "react";
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
  onRemove
}: {
  cartItems: { product: Product; qty: number }[];
  cartTotal: number;
  restaurant: Restaurant | null;
  lang: LangKey;
  themeColor: string;
  C: any;
  isRTL: boolean;
  onClose: () => void;
  onAdd: (p: Product) => void;
  onRemove: (p: Product) => void;
}) {
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
          {cartItems.map(({ product: p, qty }) => {
            const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.bd}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `${themeColor}15` }}>
                  {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{getProductName(p, lang)}</div>
                  <div style={{ fontSize: 12, color: C.mt }}>₺{price}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.bd}`, borderRadius: 8 }}>
                  <button onClick={() => onRemove(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>−</button>
                  <span style={{ minWidth: 16, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => onAdd(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>+</button>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: "right" }}>₺{price * qty}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "14px 20px 28px", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.mt }}>Toplam</span>
            <span style={{ fontSize: 24, fontWeight: 800 }}>₺{cartTotal}</span>
          </div>
          <button onClick={() => {
            if (!restaurant) return;
            let msg = `🍽️ *${restaurant.name}*\n\n`;
            cartItems.forEach(({ product: p, qty }) => {
              const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
              msg += `${qty}× ${getProductName(p, lang)}  ₺${price * qty}\n`;
            });
            msg += `\nToplam: ₺${cartTotal}`;
            window.open(`https://wa.me/${restaurant.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
          }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            WhatsApp ile Sipariş Ver
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
