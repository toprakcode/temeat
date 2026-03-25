"use client";

import { useState } from "react";

const ACC = "#D4470A";

type MenuItem = { id: number; cat: string; name: string; price: number; active: boolean; img: string; views: number; };
type WeekDay = { day: string; val: number; };

const menuItems: MenuItem[] = [
  { id: 1, cat: "Başlangıç", name: "Mercimek Çorbası", price: 85, active: true, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop&q=70", views: 234 },
  { id: 2, cat: "Başlangıç", name: "Humus", price: 75, active: true, img: "https://images.unsplash.com/photo-1637949385162-e416fb15b2fb?w=200&h=200&fit=crop&q=70", views: 187 },
  { id: 3, cat: "Başlangıç", name: "Sigara Böreği", price: 95, active: true, img: "https://images.unsplash.com/photo-1519864600857-ac42bde05e87?w=200&h=200&fit=crop&q=70", views: 312 },
  { id: 4, cat: "Izgara", name: "Adana Kebap", price: 220, active: true, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop&q=70", views: 567 },
  { id: 5, cat: "Izgara", name: "İskender", price: 250, active: true, img: "https://images.unsplash.com/photo-1644789379364-23c3e07f0e9d?w=200&h=200&fit=crop&q=70", views: 445 },
  { id: 6, cat: "Tatlı", name: "Künefe", price: 130, active: true, img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=200&h=200&fit=crop&q=70", views: 398 },
  { id: 7, cat: "İçecek", name: "Türk Çayı", price: 25, active: true, img: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=200&h=200&fit=crop&q=70", views: 612 },
  { id: 8, cat: "İçecek", name: "Türk Kahvesi", price: 50, active: false, img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop&q=70", views: 201 },
];

const weeklyData: WeekDay[] = [
  { day: "Pzt", val: 280 }, { day: "Sal", val: 310 }, { day: "Çar", val: 290 },
  { day: "Per", val: 420 }, { day: "Cum", val: 510 }, { day: "Cmt", val: 680 }, { day: "Paz", val: 490 },
];

const topItems = [
  { name: "Türk Çayı", views: 612, pct: 100 },
  { name: "Adana Kebap", views: 567, pct: 93 },
  { name: "İskender", views: 445, pct: 73 },
  { name: "Künefe", views: 398, pct: 65 },
  { name: "Sigara Böreği", views: 312, pct: 51 },
];

const tabs = [
  { id: "dash", icon: "◫", label: "Panel" },
  { id: "menu", icon: "☰", label: "Menü" },
  { id: "qr", icon: "⊞", label: "QR Kod" },
  { id: "stats", icon: "◔", label: "Analitik" },
  { id: "set", icon: "⚙", label: "Ayarlar" },
];

function WeekChart({ data, height }: { data: WeekDay[]; height: number }) {
  const max = Math.max(...data.map(function(d) { return d.val; }));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: height }}>
      {data.map(function(d: WeekDay, i: number) {
        const barH = (d.val / max) * height * 0.8;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", background: i === 5 ? ACC : "#F0D0C0", borderRadius: 4, height: barH, minHeight: 4 }} />
            <span style={{ fontSize: 8, color: "#999" }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PanelPage() {
  const [tab, setTab] = useState("dash");
  const [filter, setFilter] = useState("Tümü");
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [toast, setToast] = useState<string|null>(null);

  const flash = function(msg: string) {
    setToast(msg);
    setTimeout(function() { setToast(null); }, 1500);
  };

  const toggleItem = function(id: number) {
    setItems(function(prev) {
      return prev.map(function(item) {
        if (item.id === id) return { ...item, active: !item.active };
        return item;
      });
    });
  };

  const categories = ["Tümü", "Başlangıç", "Izgara", "Tatlı", "İçecek"];
  const filtered = filter === "Tümü" ? items : items.filter(function(i) { return i.cat === filter; });

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#F5F5F5", fontFamily: "'Inter',system-ui,sans-serif", paddingBottom: 70 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..900&display=swap" rel="stylesheet" />

      {toast && (
        <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "#FFF", border: "1px solid #EEE", borderRadius: 100, padding: "7px 18px", boxShadow: "0 4px 20px rgba(0,0,0,.06)", fontSize: 12, fontWeight: 600, color: ACC, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <div style={{ padding: "14px 20px", background: "#FFF", borderBottom: "1px solid #EEE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: ACC, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>☰</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>Sultanahmet Ocakbaşı</div>
            <div style={{ fontSize: 9, color: "#999" }}>Pro Plan</div>
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>👤</div>
      </div>

      {tab === "dash" && (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 4 }}>Hoş geldiniz 👋</div>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>Bugünkü özetiniz</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Bugün", value: "342", change: "+12%", icon: "👁" },
              { label: "Bu Hafta", value: "2.184", change: "+8%", icon: "📊" },
              { label: "Toplam", value: "14.5K", change: "+23%", icon: "📱" },
              { label: "Aktif Ürün", value: "7/8", change: "1 pasif", icon: "🍽" },
            ].map(function(s, i) {
              return (
                <div key={i} style={{ background: "#FFF", borderRadius: 14, padding: 14, border: "1px solid #EEE" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "#999", fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: i < 3 ? "#16a34a" : "#999", marginTop: 2 }}>{s.change}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, padding: 16, border: "1px solid #EEE", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Haftalık Görüntülenme</div>
            <WeekChart data={weeklyData} height={60} />
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, padding: 16, border: "1px solid #EEE", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>En Popüler</div>
            {topItems.map(function(t, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 4 ? "1px solid #F8F8F8" : "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#CCC", minWidth: 16 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 3 }}>{t.name}</div>
                    <div style={{ height: 4, background: "#F0F0F0", borderRadius: 99 }}>
                      <div style={{ width: t.pct + "%", height: "100%", background: i === 0 ? ACC : "#F0D0C0", borderRadius: 99 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#999" }}>{t.views}</span>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 10 }}>Hızlı İşlemler</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { icon: "➕", label: "Ürün Ekle" },
              { icon: "📱", label: "QR İndir" },
              { icon: "📊", label: "Analitik" },
              { icon: "👁", label: "Önizle" },
            ].map(function(a, i) {
              return (
                <button key={i} onClick={function() { flash(a.label + " açılıyor..."); }} style={{ background: "#FFF", border: "1px solid #EEE", borderRadius: 12, padding: "14px 12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>Menü Yönetimi</div>
              <div style={{ fontSize: 11, color: "#999" }}>{items.length} ürün</div>
            </div>
            <button onClick={function() { flash("Ürün ekleme açılacak"); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: ACC, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Ürün Ekle</button>
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto" }}>
            {categories.map(function(c) {
              return (
                <button key={c} onClick={function() { setFilter(c); }} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: filter === c ? 700 : 400, background: filter === c ? "#111" : "#FFF", color: filter === c ? "#FFF" : "#666", whiteSpace: "nowrap" }}>{c}</button>
              );
            })}
          </div>

          {filtered.map(function(item) {
            return (
              <div key={item.id} style={{ display: "flex", gap: 12, padding: 12, background: "#FFF", borderRadius: 14, border: "1px solid #EEE", marginBottom: 8, alignItems: "center", opacity: item.active ? 1 : 0.5 }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#111", marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: "#999" }}>{item.cat} · {item.views} görüntülenme</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>₺{item.price}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={function() { toggleItem(item.id); }} style={{ width: 36, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: item.active ? "#16a34a" : "#DDD", position: "relative" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 99, background: "#FFF", position: "absolute", top: 3, left: item.active ? 15 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }} />
                    </button>
                    <button onClick={function() { flash("Düzenleme açılacak"); }} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #EEE", background: "#FFF", cursor: "pointer", fontSize: 10, color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "qr" && (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 4 }}>QR Kodunuz</div>
          <div style={{ fontSize: 12, color: "#999", marginBottom: 24 }}>İndirin ve masalara koyun</div>

          <div style={{ background: "#FFF", borderRadius: 20, border: "1px solid #EEE", padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ width: 160, height: 160, margin: "0 auto 16px", background: "#111", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: ACC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>☰</span>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 2 }}>Sultanahmet Ocakbaşı</div>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 16 }}>temeat.com.tr/sultanahmet</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={function() { flash("PNG indiriliyor..."); }} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #EEE", background: "#FFF", color: "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>PNG</button>
              <button onClick={function() { flash("SVG indiriliyor..."); }} style={{ padding: "10px 18px", borderRadius: 10, border: "1.5px solid #EEE", background: "#FFF", color: "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>SVG</button>
              <button onClick={function() { flash("PDF indiriliyor..."); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#111", color: "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>PDF</button>
            </div>
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, border: "1px solid #EEE", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Masa Bazlı QR</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(n) {
                return (
                  <div key={n} onClick={function() { flash("Masa " + n + " QR hazır"); }} style={{ background: "#F8F8F8", borderRadius: 8, padding: "10px 0", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>⊞</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>Masa {n}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 20 }}>Analitik</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Görüntülenme", value: "2.184", change: "+8%" },
              { label: "QR Tarama", value: "1.847", change: "+15%" },
              { label: "Sipariş", value: "234", change: "+22%" },
            ].map(function(m, i) {
              return (
                <div key={i} style={{ background: "#FFF", borderRadius: 12, padding: 12, border: "1px solid #EEE", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#999", fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>{m.value}</div>
                  <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 600 }}>{m.change}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, padding: 16, border: "1px solid #EEE", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Haftalık Trend</div>
            <WeekChart data={weeklyData} height={80} />
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, padding: 16, border: "1px solid #EEE" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Dil Dağılımı</div>
            {[
              { lang: "Türkçe", pct: 45, color: ACC },
              { lang: "English", pct: 28, color: "#2563eb" },
              { lang: "العربية", pct: 15, color: "#16a34a" },
              { lang: "Deutsch", pct: 8, color: "#f59e0b" },
              { lang: "Русский", pct: 4, color: "#8b5cf6" },
            ].map(function(l, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: l.color }} />
                  <span style={{ fontSize: 12, color: "#555", flex: 1 }}>{l.lang}</span>
                  <div style={{ width: 100, height: 4, background: "#F0F0F0", borderRadius: 99 }}>
                    <div style={{ width: l.pct + "%", height: "100%", background: l.color, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#111", minWidth: 30, textAlign: "right" }}>{l.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "set" && (
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 20 }}>Ayarlar</div>

          <div style={{ background: "#FFF", borderRadius: 14, border: "1px solid #EEE", padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Restoran Bilgileri</div>
            {[
              ["Restoran Adı", "Sultanahmet Ocakbaşı"],
              ["Adres", "Divanyolu Cd. No:12"],
              ["Telefon", "+90 212 555 0123"],
              ["Saatler", "09:00 – 23:00"],
              ["WiFi", "sultanahmet2024"],
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid #F8F8F8" : "none" }}>
                  <span style={{ fontSize: 12, color: "#999" }}>{row[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{row[1]}</span>
                </div>
              );
            })}
            <button onClick={function() { flash("Düzenleme açılacak"); }} style={{ width: "100%", padding: 10, marginTop: 12, borderRadius: 8, border: "1.5px solid #EEE", background: "#FFF", color: "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Düzenle</button>
          </div>

          <div style={{ background: "#FFF", borderRadius: 14, border: "1px solid #EEE", padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 12 }}>Menü Teması</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[ACC, "#111", "#16a34a", "#2563eb", "#8b5cf6"].map(function(c, i) {
                return <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: c, cursor: "pointer", border: i === 0 ? "3px solid #111" : "3px solid transparent" }} />;
              })}
            </div>
          </div>

          <div style={{ background: ACC, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>Pro Plan — ₺199/ay</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Sonraki ödeme: 15 Nisan 2026</div>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: "#FFF", borderTop: "1px solid #EEE", display: "flex", justifyContent: "space-around", padding: "8px 0 12px", zIndex: 10 }}>
        {tabs.map(function(t) {
          return (
            <button key={t.id} onClick={function() { setTab(t.id); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", fontFamily: "inherit", color: tab === t.id ? ACC : "#BBB" }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}