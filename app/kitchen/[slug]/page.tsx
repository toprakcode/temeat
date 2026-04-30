"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Order, Product, ServiceRequest } from "@/types";
import { DEFAULT_COLOR } from "@/lib/constants";
import Link from "next/link";

// --- SUB-COMPONENTS ---

const Timer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 60000);
      setElapsed(diff);
    };
    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  const color = elapsed > 15 ? "#ef4444" : elapsed > 8 ? "#f59e0b" : "rgba(255,255,255,0.4)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, color, fontSize: 12, fontWeight: 700 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {elapsed} dk önce
    </div>
  );
};

export default function KitchenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/auth"; return; }

    const { data: resData } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
    if (!resData) { setLoading(false); return; }

    if (resData.user_id !== session.user.id) { window.location.href = "/panel"; return; }
    setRestaurant(resData);

    // If not PRO, we stop here (UI will show locked screen)
    if (resData.plan !== 'pro') { setLoading(false); return; }

    const { data: prodData } = await supabase.from("products").select("*").eq("restaurant_id", resData.id);
    setProducts(prodData || []);

    const { data: orderData } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("restaurant_id", resData.id)
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true });
    
    const { data: reqData } = await supabase
      .from("service_requests")
      .select("*")
      .eq("restaurant_id", resData.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    setOrders(orderData || []);
    setRequests(reqData || []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!restaurant || restaurant.plan !== 'pro') return;

    const channel = supabase.channel('kitchen-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, async (p) => {
        if (p.eventType === 'INSERT') {
          const { data: n } = await supabase.from("orders").select("*, order_items(*)").eq("id", p.new.id).single();
          if (n) {
            setOrders(prev => [...prev, n]);
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            flash("Yeni Sipariş!");
          }
        } else if (p.eventType === 'UPDATE') {
          if (['completed', 'cancelled'].includes(p.new.status)) {
            setOrders(prev => prev.filter(o => o.id !== p.new.id));
          } else {
            setOrders(prev => prev.map(o => o.id === p.new.id ? { ...o, status: p.new.status } : o));
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `restaurant_id=eq.${restaurant.id}` }, (p) => {
        if (p.eventType === 'INSERT') {
          setRequests(prev => [...prev, p.new as ServiceRequest]);
          new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(() => {});
          flash(p.new.type === 'waiter' ? "Garson Çağrısı!" : "Hesap İstendi!");
        } else if (p.eventType === 'UPDATE' && p.new.status === 'resolved') {
          setRequests(prev => prev.filter(r => r.id !== p.new.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurant]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) flash("Hata!");
  };

  const resolveRequest = async (id: string) => {
    const { error } = await supabase.from("service_requests").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
    if (error) flash("Hata!");
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Mutfak yükleniyor...</div>;

  const A = restaurant?.theme_color || DEFAULT_COLOR;

  // --- LOCKED SCREEN ---
  if (restaurant && restaurant.plan !== 'pro') {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 500, textAlign: "center", animation: "fadeIn 0.6s ease-out" }}>
          <div style={{ width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" }}>Mutfak Paneli Kilitli</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 32 }}>Bu özellik sadece <b>Pro</b> plan kullanıcıları içindir. Profesyonel mutfak yönetimi, garson çağrıları ve gerçek zamanlı takip için paketini yükseltmelisin.</p>
          <Link href="/panel" style={{ background: A, color: "#fff", padding: "16px 32px", borderRadius: 16, fontWeight: 700, textDecoration: "none", display: "inline-block", boxShadow: `0 10px 30px ${A}40` }}>Paketleri İncele</Link>
        </div>
        <style jsx global>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, system-ui, sans-serif", padding: "20px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 12 }}>
            Mutfak Paneli
            <span style={{ fontSize: 10, background: A, padding: "2px 8px", borderRadius: 6, verticalAlign: "middle" }}>PRO</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>{restaurant?.name} · {orders.length} Aktif Sipariş · {requests.length} Çağrı</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{currentTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#22c55e", boxShadow: "0 0 10px #22c55e", animation: "blink 2s infinite" }} />
            SİSTEM CANLI
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 30, flexDirection: "row", flexWrap: "wrap" }}>
        {/* ORDERS (Left/Main) */}
        <div style={{ flex: "2 1 600px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.1em" }}>Aktif Siparişler</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {orders.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "2px dashed rgba(255,255,255,0.05)" }}>
                <p style={{ color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>Henüz bekleyen sipariş yok.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 24, border: `1px solid ${order.status === 'preparing' ? A : 'rgba(255,255,255,0.08)'}`, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.3s" }}>
                  <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>MASA {order.table_no}</div>
                      <Timer startTime={order.created_at} />
                    </div>
                    <div style={{ background: order.status === 'ready' ? '#f59e0b' : (order.status === 'preparing' ? '#3b82f6' : 'rgba(255,255,255,0.1)'), color: "#fff", fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>
                      {order.status === 'ready' ? 'SERVİSTE' : (order.status === 'preparing' ? 'HAZIRLANIYOR' : 'YENİ')}
                    </div>
                  </div>

                  <div style={{ padding: "20px", flex: 1 }}>
                    {order.order_items.map((item, idx) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={idx} style={{ marginBottom: 14, display: "flex", gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${A}20`, color: A, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{item.quantity}</div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{product?.name_tr || "Ürün"}</div>
                            {item.extras_selected?.map((ex: any, i: number) => (
                              <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginRight: 8 }}>+ {ex.name_tr}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ padding: "16px 20px", display: "flex", gap: 10, background: "rgba(255,255,255,0.01)" }}>
                    {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'preparing')} style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: A, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Hazırla</button>}
                    {order.status === 'preparing' && <button onClick={() => updateStatus(order.id, 'ready')} style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Tamamlandı</button>}
                    {order.status === 'ready' && <button onClick={() => updateStatus(order.id, 'completed')} style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "#22c55e", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Teslim Edildi</button>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SERVICE REQUESTS (Right/Sidebar) */}
        <div style={{ flex: "1 1 300px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.1em" }}>Garson & Hesap Çağrıları</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", borderRadius: 20 }}>Çağrı yok.</div>
            ) : (
              requests.map(req => (
                <div key={req.id} style={{ padding: 20, borderRadius: 20, background: req.type === 'payment' ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${req.type === 'payment' ? '#22c55e40' : 'rgba(255,255,255,0.1)'}`, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideIn 0.3s ease-out" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>MASA {req.table_no}</div>
                    <div style={{ fontSize: 12, color: req.type === 'payment' ? "#22c55e" : A, fontWeight: 700 }}>{req.type === 'payment' ? `HESAP (${req.payment_method === 'card' ? 'KART' : 'NAKİT'})` : 'GARSON ÇAĞRISI'}</div>
                  </div>
                  <button onClick={() => resolveRequest(req.id)} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 30, right: 30, background: A, color: "#fff", padding: "16px 30px", borderRadius: 16, fontWeight: 800, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 1000, animation: "slideUp 0.3s ease-out" }}>
          {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
