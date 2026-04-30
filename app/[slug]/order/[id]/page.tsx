"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { DEFAULT_COLOR } from "@/lib/constants";
import { UI_STRINGS } from "@/lib/translations";
import Logo from "@/app/components/Logo";
import Link from "next/link";
import { ReviewModal } from "@/components/menu/ReviewModal";

// --- SUB-COMPONENTS ---

const Confetti = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5 }}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className="confetti" style={{
        position: "absolute",
        width: 10,
        height: 10,
        background: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#D4470A"][i % 5],
        left: `${Math.random() * 100}%`,
        top: -20,
        borderRadius: i % 2 === 0 ? "50%" : "2px",
        animation: `fall ${2 + Math.random() * 3}s linear infinite`,
        animationDelay: `${Math.random() * 2}s`
      }} />
    ))}
    <style jsx>{`
      @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
  </div>
);

const SteamingPlate = ({ color }: { color: string }) => (
  <div style={{ position: "relative" }}>
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 10px ${color}40)` }}>
      <path d="M3 15h18c0 2.2-1.8 4-4 4H7c-2.2 0-4-1.8-4-4Z" />
      <path d="M3 15h18" />
      <path className="steam" d="M7 10c0-2 2-2 2-4" />
      <path className="steam" d="M12 11c0-2 2-2 2-4" />
      <path className="steam" d="M17 10c0-2 2-2 2-4" />
    </svg>
    <style jsx>{`
      .steam { animation: steamMove 2s infinite ease-in-out; opacity: 0; }
      .steam:nth-child(3) { animation-delay: 0s; }
      .steam:nth-child(4) { animation-delay: 0.6s; }
      .steam:nth-child(5) { animation-delay: 1.2s; }
      @keyframes steamMove {
        0% { transform: translateY(5px); opacity: 0; }
        50% { opacity: 0.6; }
        100% { transform: translateY(-10px); opacity: 0; }
      }
    `}</style>
  </div>
);

export default function OrderTrackingPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = React.use(params);
  const [order, setOrder] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);

  const t = UI_STRINGS["tr"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsReviewed(localStorage.getItem(`reviewed_${id}`) === "true");
    }
  }, [id]);

  const messages = useMemo(() => ({
    pending: ["Siparişini mutfağa ilettik!", "Mutfak ekibi hazır bekliyor...", "Sıraya alındın, az kaldı!"],
    preparing: ["Şefimiz siparişini aşkla hazırlıyor...", "Mutfaktan harika kokular geliyor!", "Tabağın yavaş yavaş şekilleniyor..."],
    ready: ["Siparişin tam kıvamında hazır!", "Mutfaktan çıktı, masana geliyor!", "Gözün yolda olsun, geliyoruz!"],
    completed: ["Afiyetler olsun!", "Yine bekleriz!", "Deneyimin nasıldı?"],
  }), []);

  const [dynamicMsg, setDynamicMsg] = useState("");

  useEffect(() => {
    if (!order) return;
    const msgs = messages[order.status as keyof typeof messages] || [];
    if (msgs.length > 0) {
      setDynamicMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, [order?.status, messages]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: orderData } = await supabase.from("orders").select("*, order_items(*, products(*))").eq("id", id).single();
        if (orderData) {
          setOrder(orderData);
          const { data: restData } = await supabase.from("restaurants").select("*").eq("id", orderData.restaurant_id).single();
          setRestaurant(restData);
          
          // Auto show review modal if completed and NOT reviewed
          if (orderData.status === "completed" && localStorage.getItem(`reviewed_${id}`) !== "true") {
            setShowReviewModal(true);
          }
        }
      setLoading(false);
    };

    fetchData();

    const sub = supabase.channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        setOrder((prev: any) => ({ ...prev, ...payload.new }));
        
        if (payload.new.status === "ready") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => {});
        }
        
        if (payload.new.status === "completed") {
          const alreadyReviewed = localStorage.getItem(`reviewed_${id}`) === "true";
          if (!alreadyReviewed) {
            setTimeout(() => setShowReviewModal(true), 1500);
          }
        }
      })
      .subscribe();

    return () => { sub.unsubscribe(); };
  }, [id]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const callWaiter = async () => {
    await supabase.from("service_requests").insert({ restaurant_id: restaurant.id, table_no: order.table_no, type: "waiter", status: "pending" });
    flash("Garson çağrıldı!");
  };

  const requestBill = async () => {
    await supabase.from("service_requests").insert({ restaurant_id: restaurant.id, table_no: order.table_no, type: "payment", status: "pending" });
    flash("Hesap istendi!");
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Siparişin aranıyor...</div>;
  if (!order) return <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>Sipariş bulunamadı.</div>;

  const A = restaurant?.theme_color || DEFAULT_COLOR;
  
  const statusMap: Record<string, { label: string; icon: React.ReactNode; step: number; color: string }> = {
    pending: { 
      label: "Sipariş Alındı", 
      icon: <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 12l2 2 4-4"/></svg>, 
      step: 1, 
      color: "#f59e0b" 
    },
    preparing: { 
      label: "Hazırlanıyor", 
      icon: <SteamingPlate color="#3b82f6" />, 
      step: 2, 
      color: "#3b82f6" 
    },
    ready: { 
      label: "Hazır!", 
      icon: <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ animation: "pulse 1.5s infinite ease-in-out" }}><circle cx="12" cy="12" r="10"/><path d="m16 10-6 6-2-2"/></svg>, 
      step: 3, 
      color: "#10b981" 
    },
    completed: { 
      label: "Afiyet Olsun!", 
      icon: <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, 
      step: 4, 
      color: A 
    },
    cancelled: { 
      label: "İptal Edildi", 
      icon: <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>, 
      step: 0, 
      color: "#ef4444" 
    },
  };

  const currentStatus = statusMap[order.status] || statusMap.pending;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Outfit', system-ui, sans-serif", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {showConfetti && <Confetti />}

      <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Logo size="sm" withTagline={false} />
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>MASA {order.table_no}</div>
          </div>
        </div>

        {/* Status Card */}
        <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: "48px 32px", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          {/* Animated Background Decor */}
          <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: `${currentStatus.color}15`, borderRadius: "50%", filter: "blur(40px)" }} />
          
          <div style={{ marginBottom: 30, display: "flex", justifyContent: "center" }}>{currentStatus.icon}</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: currentStatus.color, letterSpacing: "-0.02em" }}>{currentStatus.label}</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 12, fontWeight: 500, fontStyle: "italic" }}>
            "{dynamicMsg}"
          </p>

          {/* Progress Bar */}
          {order.status !== "cancelled" && (
            <div style={{ marginTop: 48 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, padding: 1 }}>
                <div style={{ height: "100%", width: `${(currentStatus.step / 4) * 100}%`, background: `linear-gradient(90deg, ${A} 0%, ${currentStatus.color} 100%)`, borderRadius: 99, transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)", boxShadow: `0 0 15px ${currentStatus.color}60` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "0 4px" }}>
                {[1, 2, 3, 4].map(s => (
                  <div key={s} style={{ width: 10, height: 10, borderRadius: 99, background: currentStatus.step >= s ? currentStatus.color : "rgba(255,255,255,0.15)", transition: "all 0.5s ease", transform: currentStatus.step === s ? "scale(1.4)" : "scale(1)", boxShadow: currentStatus.step === s ? `0 0 10px ${currentStatus.color}` : "none" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sipariş Özeti</h3>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {order.order_items?.map((item: any, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.05)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: A }}>{item.quantity}</div>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{item.products?.name_tr}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>₺{item.price * item.quantity}</div>
              </div>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Toplam</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: A }}>₺{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {order.status === "completed" ? (
            isReviewed ? (
              <div style={{ gridColumn: "span 2", padding: "18px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", textAlign: "center", fontWeight: 700, fontSize: 15 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: 8, verticalAlign: "middle" }}><polyline points="20 6 9 17 4 12"/></svg>
                Değerlendirmeniz için teşekkürler!
              </div>
            ) : (
              <button onClick={() => setShowReviewModal(true)} style={{ gridColumn: "span 2", padding: "18px", borderRadius: 20, border: "none", background: A, color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "all 0.3s", boxShadow: `0 12px 24px ${A}40` }}>
                Yemeği Puanla & Yorum Yap
              </button>
            )
          ) : (
            <>
              <button onClick={callWaiter} style={{ padding: "18px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Garson Çağır</button>
              <button onClick={requestBill} style={{ padding: "18px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Hesap İste</button>
            </>
          )}
        </div>

        <Link href={`/${slug}`} style={{ display: "block", textAlign: "center", marginTop: 40, fontSize: 14, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 700, letterSpacing: "0.02em" }}>
          ← ANA MENÜYE DÖN
        </Link>
      </div>

      {showReviewModal && <ReviewModal restaurant={restaurant} lang={"tr"} onClose={() => setShowReviewModal(false)} onSuccess={() => { localStorage.setItem(`reviewed_${id}`, "true"); setIsReviewed(true); flash("Geri bildiriminiz alındı! Teşekkürler."); setShowReviewModal(false); }} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", padding: "14px 28px", borderRadius: 16, fontWeight: 800, boxShadow: "0 15px 30px rgba(0,0,0,0.5)", zIndex: 1000, animation: "slideUp 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)" }}>
          {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 30px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
