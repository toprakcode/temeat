import React from "react";
import { Restaurant, Product } from "@/types";

export const navItems = [
  { id: "dashboard", label: "Panel", icon: "◫" },
  { id: "menu", label: "Menü", icon: "☰" },
  { id: "qr", label: "QR Kod", icon: "⊞" },
  { id: "analytics", label: "Analitik", icon: "◔" },
  { id: "settings", label: "Ayarlar", icon: "⚙" },
];

export function Sidebar({
  activeTab,
  setActiveTab,
  restaurant,
  productsCount,
  themeColor = "#D4470A"
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  restaurant: Restaurant | null;
  productsCount: number;
  themeColor?: string;
}) {
  return (
    <aside className="sidebar" style={{ width: 240, background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2.5, flexShrink: 0 }}>
            <div style={{ width: 14, height: 2, background: "#fff", borderRadius: 99 }} />
            <div style={{ width: 9, height: 2, background: "#fff", borderRadius: 99 }} />
            <div style={{ width: 14, height: 2, background: "#fff", borderRadius: 99 }} />
          </div>
          <div className="sidebar-logo-text">
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>TEM<span style={{ color: themeColor }}>eat</span></div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Restoran Paneli</div>
          </div>
        </a>
      </div>
      <div className="sidebar-rest" style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "rgba(255,255,255,.04)", borderRadius: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${themeColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🍽</div>
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
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div className="sidebar-plan" style={{ padding: "11px 12px", background: `${themeColor}0f`, border: `1px solid ${themeColor}22`, borderRadius: 11, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{restaurant?.plan === "pro" ? "Pro Plan" : restaurant?.plan === "starter" ? "Başlangıç Plan" : "Ücretsiz Plan"}</div>
          {restaurant?.plan !== "pro" && <div style={{ fontSize: 10, marginTop: 2 }}><a href="/fiyat" style={{ color: themeColor, textDecoration: "none", fontWeight: 600 }}>Pro'ya geç →</a></div>}
        </div>
        <a href={restaurant ? `/${restaurant.slug}` : "/demo"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
          <span>👁</span><span className="sidebar-label">Menüyü Gör</span>
        </a>
      </div>
    </aside>
  );
}
