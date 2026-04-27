"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Order, OrderItem, Product } from "@/types";
import { DEFAULT_COLOR } from "@/lib/constants";

export default function KitchenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    // 1. Fetch Restaurant
    const { data: resData } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
    if (!resData) return;
    setRestaurant(resData);

    // 2. Fetch Products (for names)
    const { data: prodData } = await supabase.from("products").select("*").eq("restaurant_id", resData.id);
    setProducts(prodData || []);

    // 3. Fetch Active Orders
    const { data: orderData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("restaurant_id", resData.id)
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true });
    
    setOrders(orderData || []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!restaurant) return;

    const orderSub = supabase.channel('kitchen-orders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders', 
        filter: `restaurant_id=eq.${restaurant.id}` 
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch the full order with items
          const { data: newOrder } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("id", payload.new.id)
            .single();
          
          if (newOrder) {
            setOrders(prev => [...prev, newOrder]);
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            flash("Yeni Sipariş Geldi!");
          }
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status === 'completed' || payload.new.status === 'cancelled') {
            setOrders(prev => prev.filter(o => o.id !== payload.new.id));
          } else {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(orderSub); };
  }, [restaurant]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) flash("Hata oluştu!");
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "inherit" }}>Mutfak yükleniyor...</div>;

  const A = restaurant?.theme_color || DEFAULT_COLOR;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", padding: "20px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Mutfak Paneli</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{restaurant?.name} · Aktif Siparişler: {orders.length}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            CANLI
          </div>
        </div>
      </div>

      {/* ORDERS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
        {orders.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px 0", color: "rgba(255,255,255,0.2)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 16 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
            <p style={{ fontSize: 18, fontWeight: 500 }}>Henüz bekleyen sipariş yok.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ 
              background: "rgba(255,255,255,0.03)", 
              borderRadius: 20, 
              border: `2px solid ${order.status === 'preparing' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.3s ease-out"
            }}>
              {/* ORDER HEADER */}
              <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>MASA {order.table_no}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>#{order.id.slice(0, 5)} · {new Date(order.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div style={{ 
                  background: order.status === 'ready' ? '#f59e0b' : (order.status === 'preparing' ? '#6366f1' : '#3b82f6'), 
                  color: "#fff", 
                  fontSize: 10, 
                  fontWeight: 800, 
                  padding: "4px 10px", 
                  borderRadius: 6,
                  textTransform: "uppercase",
                  letterSpacing: ".05em"
                }}>
                  {order.status === 'ready' ? 'SERVİS BEKLİYOR' : (order.status === 'preparing' ? 'HAZIRLANIYOR' : 'BEKLEYEN')}
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div style={{ padding: "20px", flex: 1 }}>
                {order.order_items.map((item, idx) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <div key={idx} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ background: `${A}20`, color: A, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, border: `1px solid ${A}30` }}>
                          {item.quantity}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>{product?.name_tr || "Ürün"}</div>
                          {item.extras_selected?.length > 0 && (
                            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {item.extras_selected.map((ex: any, i: number) => (
                                <span key={i} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4, color: "rgba(255,255,255,0.4)" }}>
                                  + {ex.name_tr}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTIONS */}
              <div style={{ padding: "16px 20px", display: "flex", gap: 10 }}>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    style={{ flex: 1, height: 48, borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    Hazırlamaya Başla
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    style={{ flex: 1, height: 48, borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    Hazırlandı Olarak İşaretle
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'completed')}
                    style={{ flex: 1, height: 48, borderRadius: 10, border: "none", background: "#f59e0b", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Tamamla
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 30, right: 30, background: A, color: "#fff", padding: "16px 30px", borderRadius: 12, fontWeight: 700, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", animation: "slideUp 0.3s ease-out", zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
