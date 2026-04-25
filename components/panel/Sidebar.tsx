import React from "react";
import { Restaurant, Product } from "@/types";
import Logo from "@/app/components/Logo";

export const navItems = [
  { id: "dashboard", label: "Panel", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { id: "orders", label: "Siparişler", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { id: "reviews", label: "Yorumlar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: "menu", label: "Menü", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg> },
  { id: "qr", label: "QR Kod", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM14 21h3v-3h-3zM21 14h-3v3h3zM21 21h-3v-3h3z"/></svg> },
  { id: "analytics", label: "Analitik", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
  { id: "settings", label: "Ayarlar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export function Sidebar({
  activeTab,
  setActiveTab,
  restaurant,
  productsCount,
  pendingReviewsCount = 0,
  themeColor = "#D4470A"
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  restaurant: Restaurant | null;
  productsCount: number;
  pendingReviewsCount?: number;
  themeColor?: string;
}) {
  return (
    <aside className="sidebar" style={{ width: 240, background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <Logo size="sm" withTagline={false} />
      </div>
      <div className="sidebar-rest" style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "rgba(255,255,255,.04)", borderRadius: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${themeColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: themeColor, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#fff" }}>{restaurant?.name || "Restoran"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <div style={{ width: 5, height: 5, borderRadius: 99, background: "#22c55e" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>{restaurant?.plan === "pro" ? "Pro" : restaurant?.plan === "starter" ? "Başlangıç" : "Ücretsiz"} · Aktif</span>
            </div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: 1 }}>
        <div className="sidebar-label" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.2)", letterSpacing: ".1em", padding: "4px 6px 8px" }}>NAVIGASYON</div>
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="btn"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", borderRadius: 9, background: active ? `${themeColor}18` : "transparent", color: active ? "#fff" : "rgba(255,255,255,.4)", textAlign: "left", transition: "all .15s", position: "relative" }}>
              {active && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 2.5, background: themeColor, borderRadius: 99 }} />}
              <span style={{ fontSize: 15, flexShrink: 0, color: active ? themeColor : "rgba(255,255,255,.25)" }}>{item.icon}</span>
              <span className="sidebar-label" style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {item.id === "menu" && <span className="sidebar-label" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,.07)", borderRadius: 6, padding: "2px 7px", color: "rgba(255,255,255,.4)" }}>{productsCount}</span>}
              {item.id === "reviews" && (pendingReviewsCount || 0) > 0 && <span className="sidebar-label" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, background: "#f59e0b", borderRadius: 6, padding: "2px 7px", color: "#fff", boxShadow: "0 2px 8px rgba(245,158,11,0.4)" }}>{pendingReviewsCount}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div className="sidebar-plan" style={{ padding: "11px 12px", background: `${themeColor}0f`, border: `1px solid ${themeColor}22`, borderRadius: 11, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{restaurant?.plan === "pro" ? "Pro Plan" : restaurant?.plan === "starter" ? "Başlangıç Plan" : "Ücretsiz Plan"}</div>
          {restaurant?.plan !== "pro" && <div style={{ fontSize: 10, marginTop: 2 }}><a href="/fiyat" style={{ display: "flex", alignItems: "center", gap: 4, color: themeColor, textDecoration: "none", fontWeight: 600 }}>Pro'ya geç <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a></div>}
        </div>
        <a href={restaurant ? `/${restaurant.slug}` : "/demo"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span className="sidebar-label">Menüyü Gör</span>
        </a>
      </div>
    </aside>
  );
}
