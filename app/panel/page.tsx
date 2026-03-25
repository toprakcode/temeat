"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const A = "#D4470A";
const A2 = "#FF6B35";

const weeklyData = [
  { day: "Pzt", views: 280, orders: 42 },
  { day: "Sal", views: 310, orders: 51 },
  { day: "Çar", views: 290, orders: 38 },
  { day: "Per", views: 420, orders: 67 },
  { day: "Cum", views: 510, orders: 89 },
  { day: "Cmt", views: 680, orders: 124 },
  { day: "Paz", views: 490, orders: 93 },
];

const menuItems = [
  { id: 1, name: "Adana Kebap", cat: "Izgara", price: 220, views: 567, active: true, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=80&h=80&fit=crop" },
  { id: 2, name: "İskender", cat: "Izgara", price: 250, views: 445, active: true, img: "https://images.unsplash.com/photo-1644789379364-23c3e07f0e9d?w=80&h=80&fit=crop" },
  { id: 3, name: "Künefe", cat: "Tatlı", price: 130, views: 398, active: true, img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=80&h=80&fit=crop" },
  { id: 4, name: "Türk Çayı", cat: "İçecek", price: 25, views: 612, active: true, img: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=80&h=80&fit=crop" },
  { id: 5, name: "Mercimek Çorbası", cat: "Başlangıç", price: 85, views: 234, active: true, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=80&h=80&fit=crop" },
  { id: 6, name: "Türk Kahvesi", cat: "İçecek", price: 50, views: 201, active: false, img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=80&h=80&fit=crop" },
  { id: 7, name: "Kuzu Pirzola", cat: "Izgara", price: 320, views: 312, active: true, img: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=80&h=80&fit=crop" },
  { id: 8, name: "Baklava", cat: "Tatlı", price: 110, views: 289, active: true, img: "https://images.unsplash.com/photo-1519676867240-f03562e64571?w=80&h=80&fit=crop" },
];

const langData = [
  { lang: "Türkçe", pct: 45, color: A },
  { lang: "English", pct: 28, color: "#3b82f6" },
  { lang: "العربية", pct: 15, color: "#10b981" },
  { lang: "Deutsch", pct: 8, color: "#f59e0b" },
  { lang: "Русский", pct: 4, color: "#8b5cf6" },
];

function BarChart({ data, height = 140 }: { data: typeof weeklyData; height?: number }) {
  const maxViews = Math.max(...data.map(d => d.views));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}>
            {i === 5 && (
              <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>{d.views}</div>
            )}
            <div style={{
              width: "100%",
              height: `${(d.views / maxViews) * 100}%`,
              minHeight: 4,
              background: i === 5 ? `linear-gradient(to top, ${A}, ${A2})` : "rgba(255,255,255,.07)",
              borderRadius: "4px 4px 0 0",
            }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: i === 5 ? 700 : 400, color: i === 5 ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function PanelPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [items, setItems] = useState(menuItems);
  const [toast, setToast] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("Tümü");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Oturum kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/auth";
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        window.location.href = "/auth";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  const toggleItem = (id: number) => { setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i)); };

  const cats = ["Tümü", "Başlangıç", "Izgara", "Tatlı", "İçecek"];
  const filtered = catFilter === "Tümü" ? items : items.filter(i => i.cat === catFilter);
  const totalViews = weeklyData.reduce((s, d) => s + d.views, 0);
  const totalOrders = weeklyData.reduce((s, d) => s + d.orders, 0);

  const navItems = [
    { id: "dashboard", label: "Panel", icon: "◫" },
    { id: "menu", label: "Menü", icon: "☰" },
    { id: "qr", label: "QR Kod", icon: "⊞" },
    { id: "analytics", label: "Analitik", icon: "◔" },
    { id: "settings", label: "Ayarlar", icon: "⚙" },
  ];

  const tabLabel: Record<string, string> = {
    dashboard: "Genel Bakış",
    menu: "Menü Yönetimi",
    qr: "QR Kodlar",
    analytics: "Analitik",
    settings: "Ayarlar",
  };

  // Yükleniyor ekranı
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: A, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
            <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 99 }} />
            <div style={{ width: 11, height: 2, background: "#fff", borderRadius: 99 }} />
            <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "'Outfit', system-ui, sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastAnim{0%{opacity:0;transform:translateY(8px)}10%{opacity:1;transform:translateY(0)}90%{opacity:1}100%{opacity:0}}
        .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;transition:border-color .2s}
        .card:hover{border-color:rgba(255,255,255,.11)}
        .btn{transition:all .15s;cursor:pointer}
        .btn:hover{opacity:.85}
        .btn:active{transform:scale(.97)}
        .row-item:hover{background:rgba(255,255,255,.03)}
        @media(max-width:960px){
          .sidebar{width:60px!important}
          .sidebar-label{display:none!important}
          .sidebar-logo-text{display:none!important}
          .sidebar-rest{display:none!important}
          .sidebar-plan{display:none!important}
        }
        @media(max-width:600px){
          .main-pad{padding:16px!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .chart-grid{grid-template-columns:1fr!important}
          .actions-grid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: "#1c1c1c", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "#fff", animation: "toastAnim 2s forwards", boxShadow: "0 8px 32px rgba(0,0,0,.6)" }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="sidebar" style={{ width: 240, background: "#0c0c0c", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40, transition: "width .2s" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: A, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2.5, flexShrink: 0 }}>
              <div style={{ width: 14, height: 2, background: "#fff", borderRadius: 99 }} />
              <div style={{ width: 9, height: 2, background: "#fff", borderRadius: 99 }} />
              <div style={{ width: 14, height: 2, background: "#fff", borderRadius: 99 }} />
            </div>
            <div className="sidebar-logo-text">
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>TEM<span style={{ color: A }}>eat</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Restoran Paneli</div>
            </div>
          </a>
        </div>

        <div className="sidebar-rest" style={{ padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", background: "rgba(255,255,255,.04)", borderRadius: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${A}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🍽</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#fff" }}>
                {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Restoran"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: 99, background: "#22c55e" }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,.35)" }}>Ücretsiz Plan · Aktif</span>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          <div className="sidebar-label" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.2)", letterSpacing: ".1em", padding: "4px 6px 8px" }}>NAVIGASYON</div>
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="btn"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", borderRadius: 9, background: active ? `${A}18` : "transparent", color: active ? "#fff" : "rgba(255,255,255,.4)", textAlign: "left", transition: "all .15s", position: "relative" }}>
                {active && <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 2.5, background: A, borderRadius: 99 }} />}
                <span style={{ fontSize: 15, flexShrink: 0, color: active ? A : "rgba(255,255,255,.25)" }}>{item.icon}</span>
                <span className="sidebar-label" style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                {item.id === "menu" && (
                  <span className="sidebar-label" style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,.07)", borderRadius: 6, padding: "2px 7px", color: "rgba(255,255,255,.4)" }}>{items.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div className="sidebar-plan" style={{ padding: "11px 12px", background: `${A}0f`, border: `1px solid ${A}22`, borderRadius: 11, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Ücretsiz Plan</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
              <a href="/fiyat" style={{ color: A, textDecoration: "none", fontWeight: 600 }}>Pro'ya geç →</a>
            </div>
          </div>
          <a href="/demo" target="_blank" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}>
            <span style={{ fontSize: 12 }}>👁</span>
            <span className="sidebar-label">Menüyü Önizle</span>
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left .2s" }}>
        {/* Topbar */}
        <header style={{ padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.06)", background: "#080808", position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(10px)" }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700 }}>{tabLabel[activeTab]}</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 1 }}>
              {user?.email}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => flash("Bildirimler yakında!")} className="btn" style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔔</button>
            {/* Çıkış butonu */}
            <button onClick={handleSignOut} className="btn" style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="sidebar-label">Çıkış</span>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: A, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 0 0 2px ${A}40` }}>
              {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="main-pad" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .35s both" }}>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { label: "Bu Hafta Görüntülenme", value: totalViews.toLocaleString(), sub: "↑ +8% geçen haftaya göre", color: "#22c55e" },
                  { label: "Bu Hafta Sipariş", value: totalOrders.toLocaleString(), sub: "↑ +22% geçen haftaya göre", color: "#22c55e" },
                  { label: "Aktif Ürün", value: `${items.filter(i => i.active).length}/${items.length}`, sub: `${items.filter(i => !i.active).length} ürün pasif`, color: "rgba(255,255,255,.3)" },
                  { label: "QR Tarama", value: "1,847", sub: "↑ +15% geçen haftaya göre", color: "#22c55e" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "20px" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", fontWeight: 500, marginBottom: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.04em", marginBottom: 8 }}>{s.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: s.color }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Haftalık Görüntülenme</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Son 7 gün · {totalViews.toLocaleString()} toplam</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "rgba(255,255,255,.05)", borderRadius: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: A }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Görüntülenme</span>
                    </div>
                  </div>
                  <BarChart data={weeklyData} height={140} />
                </div>

                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>En Popüler</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 16 }}>Bu haftanın liderleri</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[...menuItems].sort((a, b) => b.views - a.views).slice(0, 5).map((item, i) => (
                      <div key={i} className="row-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none", borderRadius: 8, cursor: "pointer" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? A : "rgba(255,255,255,.2)", minWidth: 14, textAlign: "center" }}>{i + 1}</span>
                        <img src={item.img} alt="" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{item.cat}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)" }}>{item.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: "20px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "rgba(255,255,255,.7)" }}>Hızlı İşlemler</div>
                <div className="actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Ürün Ekle", sub: "Menüye yeni ürün", tab: "menu" },
                    { label: "QR İndir", sub: "PNG / SVG / PDF", tab: "qr" },
                    { label: "Analitik", sub: "Detaylı rapor", tab: "analytics" },
                    { label: "Ayarlar", sub: "Tema & bilgiler", tab: "settings" },
                  ].map((a, i) => (
                    <button key={i} onClick={() => setActiveTab(a.tab)} className="btn" style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.03)", color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{a.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MENU */}
          {activeTab === "menu" && (
            <div style={{ animation: "fadeUp .35s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {cats.map(c => (
                    <button key={c} onClick={() => setCatFilter(c)} className="btn" style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: catFilter === c ? 700 : 400, background: catFilter === c ? "#fff" : "rgba(255,255,255,.06)", color: catFilter === c ? "#111" : "rgba(255,255,255,.5)" }}>{c}</button>
                  ))}
                </div>
                <button onClick={() => flash("Ürün ekleme formu yakında!")} className="btn" style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 16px ${A}40` }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ürün Ekle
                </button>
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 100px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                  {["Ürün", "Kategori", "Fiyat", "Görüntü", "Durum", ""].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.25)", letterSpacing: ".06em" }}>{h}</span>
                  ))}
                </div>
                {filtered.map((item, i) => (
                  <div key={item.id} className="row-item" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 100px 80px", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", alignItems: "center", opacity: item.active ? 1 : 0.5, transition: "opacity .2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={item.img} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 1 }}>ID: {item.id}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>{item.cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>₺{item.price}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{item.views}</span>
                    <div>
                      <button onClick={() => toggleItem(item.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: item.active ? "#22c55e18" : "rgba(255,255,255,.06)", transition: "all .2s" }}>
                        <div style={{ width: 28, height: 16, borderRadius: 99, background: item.active ? "#22c55e" : "rgba(255,255,255,.15)", position: "relative", transition: "background .2s" }}>
                          <div style={{ position: "absolute", top: 2, left: item.active ? 14 : 2, width: 12, height: 12, borderRadius: 99, background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: item.active ? "#22c55e" : "rgba(255,255,255,.3)" }}>{item.active ? "Aktif" : "Pasif"}</span>
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => flash(`${item.name} düzenleniyor...`)} className="btn" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR */}
          {activeTab === "qr" && (
            <div style={{ animation: "fadeUp .35s both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: "28px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Restoran QR Kodu</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 24 }}>temeat.com.tr/sultanahmet</div>
                  <div style={{ width: 180, height: 180, margin: "0 auto 24px", background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                    <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} style={{ borderRadius: 2, background: Math.random() > 0.45 ? "#111" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {["PNG", "SVG", "PDF"].map(f => (
                      <button key={f} onClick={() => flash(`${f} indiriliyor...`)} className="btn" style={{ padding: "9px 16px", borderRadius: 8, border: f === "PDF" ? "none" : "1px solid rgba(255,255,255,.1)", background: f === "PDF" ? A : "transparent", color: f === "PDF" ? "#fff" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Masa Bazlı QR</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 18 }}>Her masa için ayrı QR kod</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button key={i} onClick={() => flash(`Masa ${i + 1} QR hazır`)} className="btn" style={{ padding: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", cursor: "pointer", textAlign: "center", color: "#fff" }}>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>⊞</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Masa {i + 1}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .35s both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { label: "Toplam Görüntülenme", value: "14,521", sub: "↑ +23% bu ay" },
                  { label: "QR Tarama", value: "11,847", sub: "↑ +15% bu ay" },
                  { label: "Ortalama Sipariş", value: "₺187", sub: "↑ +8% bu ay" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "20px" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 10 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.03em", marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Haftalık Trend</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Son 7 gün</div>
                  <BarChart data={weeklyData} height={160} />
                </div>

                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Dil Dağılımı</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Hangi dilde açılıyor</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {langData.map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: l.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", flex: 1 }}>{l.lang}</span>
                        <div style={{ width: 120, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99 }}>
                          <div style={{ width: `${l.pct}%`, height: "100%", background: l.color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 32, textAlign: "right" }}>{l.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .35s both", maxWidth: 640 }}>
              <div className="card" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Hesap Bilgileri</div>
                {[
                  ["E-posta", user?.email || "—"],
                  ["Kayıt Tarihi", user?.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "—"],
                  ["Plan", "Ücretsiz"],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <a href="/fiyat" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 9, background: A, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 16px ${A}40` }}>
                  Pro'ya Yükselt →
                </a>
              </div>

              <div className="card" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Menü Rengi</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 16 }}>Müşteri menüsündeki vurgu rengi</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[A, "#111", "#16a34a", "#2563eb", "#8b5cf6", "#f59e0b"].map((c, i) => (
                    <div key={i} onClick={() => flash("Renk güncellendi!")} style={{ width: 38, height: 38, borderRadius: 10, background: c, cursor: "pointer", border: i === 0 ? "3px solid #fff" : "3px solid transparent", transition: "border-color .15s" }} />
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: "22px 24px", border: "1px solid rgba(239,68,68,.2)", background: "rgba(239,68,68,.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Oturum</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16 }}>Hesabınızdan güvenli çıkış yapın.</div>
                <button onClick={handleSignOut} className="btn" style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,.3)", background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}