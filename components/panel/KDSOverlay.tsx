"use client";

import React from "react";
import { Product } from "@/types";

interface KDSOverlayProps {
  orders: any[];
  products: Product[];
  restaurant: any;
  currentTime: Date;
  themeColor: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const KDSOverlay: React.FC<KDSOverlayProps> = ({
  orders,
  products,
  restaurant,
  currentTime,
  themeColor: A,
  onClose,
  onUpdateStatus
}) => {
  const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#050505", display: "flex", flexDirection: "column", animation: "fadeIn .3s both", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      {/* HEADER */}
      <div style={{ height: 70, background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em", color: "#fff" }}>
            TEM<span style={{ color: A }}>eat</span> 
            <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 400, marginLeft: 8 }}>KITCHEN MODE</span>
          </div>
          <div style={{ height: 24, width: 1, background: "rgba(255,255,255,.1)" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e" }}>● Canlı Bağlantı Aktif</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{activeOrders.length}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700 }}>AKTİF SİPARİŞ</div>
          </div>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Panale Dön</button>
        </div>
      </div>
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* KDS SUMMARY SIDEBAR */}
        <div style={{ width: 280, background: "#080808", borderRight: "1px solid rgba(255,255,255,.06)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>Hazırlanacak Toplam</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(() => {
                const prepOrders = orders.filter(o => o.status === "pending" || o.status === "preparing");
                const summary: Record<string, { name: string, count: number }> = {};
                prepOrders.forEach(o => {
                  o.order_items?.forEach((item: any) => {
                    const product = products.find(p => p.id === item.product_id);
                    const name = product?.name_tr || "Ürün";
                    if (!summary[name]) summary[name] = { name, count: 0 };
                    summary[name].count += item.quantity;
                  });
                });
                const items = Object.values(summary).sort((a, b) => b.count - a.count);
                if (items.length === 0) return <div style={{ fontSize: 13, color: "rgba(255,255,255,.2)" }}>Hazırlanacak ürün yok</div>;
                return items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.name}</span>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: A, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>{item.count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
          <div style={{ marginTop: "auto", padding: 16, borderRadius: 16, background: `${A}10`, border: `1px solid ${A}20` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: A, marginBottom: 4 }}>BİLGİ</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>Bekleyen siparişler gerçek zamanlı olarak bu listeye eklenir.</div>
          </div>
        </div>

        {/* MAIN ORDERS GRID */}
        <div style={{ flex: 1, padding: 24, overflowX: "auto", display: "flex", gap: 20, alignItems: "flex-start", background: "radial-gradient(circle at 50% 50%, #0a0a0a 0%, #050505 100%)" }}>
          {activeOrders.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", opacity: .15, color: "#fff" }}>
              <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Şu an mutfakta sipariş yok.</div>
            </div>
          ) : (
            activeOrders.map(order => {
              const waitTime = Math.floor((currentTime.getTime() - new Date(order.created_at).getTime()) / 60000);
              const isLate = waitTime > 15;

              return (
                <div key={order.id} style={{ width: 340, flexShrink: 0, background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "100%", boxShadow: "0 10px 40px rgba(0,0,0,.4)" }}>
                  <div style={{ padding: 20, background: order.status === "pending" ? "#f59e0b" : order.status === "preparing" ? "#3b82f6" : "#10b981", color: "#000" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 24, fontWeight: 900 }}>MASA {order.table_no}</span>
                      <span style={{ 
                        fontSize: 12, 
                        fontWeight: 800, 
                        background: isLate ? "#ef4444" : "rgba(0,0,0,.15)", 
                        color: isLate ? "#fff" : "inherit",
                        padding: "4px 10px", 
                        borderRadius: 6,
                        animation: isLate ? "pulse 1s infinite" : "none"
                      }}>
                        {waitTime} dk
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {order.order_items?.map((item: any, idx: number) => {
                        const product = products.find(p => p.id === item.product_id);
                        return (
                          <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,.04)", paddingBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                                <span style={{ color: A, marginRight: 8 }}>{item.quantity}x</span>
                                {product?.name_tr || "Ürün"}
                              </div>
                            </div>
                            {item.extras_selected?.length > 0 && (
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {item.extras_selected.map((ex: any, ei: number) => (
                                  <span key={ei} style={{ fontSize: 11, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)", padding: "2px 8px", borderRadius: 4 }}>+{ex.name_tr || ex.label}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "#0c0c0c", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", gap: 10 }}>
                    {order.status === "pending" ? (
                      <button onClick={() => onUpdateStatus(order.id, "preparing")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>HAZIRLA</button>
                    ) : order.status === "preparing" ? (
                      <button onClick={() => onUpdateStatus(order.id, "ready")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "#10b981", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>HAZIR</button>
                    ) : (
                      <button onClick={() => onUpdateStatus(order.id, "completed")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>TAMAMLA</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
