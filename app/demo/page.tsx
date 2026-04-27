"use client";

import { useState, useCallback, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { createBrowserClient } from "@supabase/ssr";
import { UI_STRINGS } from "@/lib/translations";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEMO_SLUG = "demo";
const A = "#D4470A";

// Plan limits
const PLAN_LIMITS = {
  free: { products: 5, label: "Ücretsiz", labelEn: "Free" },
  yenimekan: { products: 10, label: "Yeni Mekan", labelEn: "New Venue" },
  starter: { products: 25, label: "Başlangıç", labelEn: "Starter" },
  pro: { products: Infinity, label: "Pro", labelEn: "Pro" },
} as const;

type PlanKey = keyof typeof PLAN_LIMITS;
type LangKey = "tr" | "en" | "ar" | "de" | "ru";

// ─────────────────────────────────────────────
// ICONS (Minimalist SVG)
// ─────────────────────────────────────────────
const Icon = ({ type, size = 20, active = false }: { type: string, size?: number, active?: boolean }) => {
  const color = active ? A : "rgba(255,255,255,0.2)";
  const stroke = 2;

  const icons: Record<string, React.ReactNode> = {
    lang: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    qr: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01" /></svg>,
    dark: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    wifi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
    waiter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    cart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
    chef: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" /></svg>,
    details: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="20" y1="21" x2="20" y2="14" /><path d="M20 14c0-3.3-2-6-6-6h-4c-4 0-6 2.7-6 6" /><path d="M12 8V3" /><path d="M12 3h5" /><path d="M12 3H7" /></svg>,
    similar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    logo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  };
  return icons[type] || null;
};

interface DbProduct {
  id: string;
  name_tr: string;
  name_en: string | null;
  name_ar: string | null;
  name_de: string | null;
  name_ru: string | null;
  desc_tr: string | null;
  desc_en: string | null;
  desc_ar: string | null;
  desc_de: string | null;
  desc_ru: string | null;
  price: number;
  image_url: string | null;
  discount_pct: number | null;
  calories: number | null;
  prep_time: number | null;
  serves: number | null;
  category_id: string;
}

interface DbCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface DbRestaurant {
  id: string;
  name: string;
  wifi_password: string | null;
  phone: string | null;
}

function getProductName(p: DbProduct, lang: LangKey): string {
  if (lang === "en" && p.name_en) return p.name_en;
  if (lang === "ar" && p.name_ar) return p.name_ar;
  if (lang === "de" && p.name_de) return p.name_de;
  if (lang === "ru" && p.name_ru) return p.name_ru;
  return p.name_tr;
}

function getProductDesc(p: DbProduct, lang: LangKey): string {
  if (lang === "en" && p.desc_en) return p.desc_en;
  if (lang === "ar" && p.desc_ar) return p.desc_ar;
  if (lang === "de" && p.desc_de) return p.desc_de;
  if (lang === "ru" && p.desc_ru) return p.desc_ru;
  return p.desc_tr || "";
}

function getDiscountedPrice(p: DbProduct): number {
  if (p.discount_pct && p.discount_pct > 0) {
    return Math.round(p.price * (1 - p.discount_pct / 100));
  }
  return p.price;
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const MOCK_RESTAURANT: DbRestaurant = {
  id: "mock-1",
  name: "Gusto Mediterranean",
  wifi_password: "gusto-free-wifi",
  phone: "5551234567"
};

const MOCK_CATEGORIES: DbCategory[] = [
  { id: "c1", name: "Ana Yemekler", sort_order: 1 },
  { id: "c2", name: "Başlangıçlar", sort_order: 2 },
  { id: "c3", name: "İçecekler", sort_order: 3 },
  { id: "c4", name: "Tatlılar", sort_order: 4 },
];

const MOCK_PRODUCTS: DbProduct[] = [
  { id: "p1", category_id: "c1", name_tr: "Izgara Antrikot", name_en: "Grilled Entrecote", desc_tr: "Karamelize soğan ve bebek patates ile", desc_en: "With caramelized onions and baby potatoes", price: 540, discount_pct: 10, image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600", calories: 650, prep_time: 25, serves: 1, name_ar: null, name_de: null, name_ru: null, desc_ar: null, desc_de: null, desc_ru: null },
  { id: "p2", category_id: "c1", name_tr: "Deniz Mahsüllü Linguine", name_en: "Seafood Linguine", desc_tr: "Taze karides ve kalamar ile", desc_en: "With fresh shrimp and calamari", price: 420, discount_pct: 0, image_url: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=600", calories: 520, prep_time: 18, serves: 1, name_ar: null, name_de: null, name_ru: null, desc_ar: null, desc_de: null, desc_ru: null },
  { id: "p3", category_id: "c2", name_tr: "Trüflü Burrata", name_en: "Truffle Burrata", desc_tr: "Roka ve balzamik sirke ile", desc_en: "With arugula and balsamic vinegar", price: 310, discount_pct: 0, image_url: "https://images.unsplash.com/photo-1600335895229-6e75511ee94e?w=600", calories: 340, prep_time: 10, serves: 2, name_ar: null, name_de: null, name_ru: null, desc_ar: null, desc_de: null, desc_ru: null },
  { id: "p4", category_id: "c3", name_tr: "Egzotik Passion", name_en: "Exotic Passion", desc_tr: "Çarkıfelek meyvesi ve nane", desc_en: "Passion fruit and mint", price: 185, discount_pct: 5, image_url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600", calories: 120, prep_time: 5, serves: 1, name_ar: null, name_de: null, name_ru: null, desc_ar: null, desc_de: null, desc_ru: null },
  { id: "p5", category_id: "c4", name_tr: "San Sebastian Cheesecake", name_en: "San Sebastian", desc_tr: "Belçika çikolatası sosu ile", desc_en: "With Belgian chocolate sauce", price: 210, discount_pct: 0, image_url: "https://images.unsplash.com/photo-1543508282-5c1f427f023f?w=600", calories: 480, prep_time: 5, serves: 1, name_ar: null, name_de: null, name_ru: null, desc_ar: null, desc_de: null, desc_ru: null },
];

// ─────────────────────────────────────────────
// PLAN CONFIG & FEATURES
// ─────────────────────────────────────────────
const PLAN_FEATURES_MAP: Record<PlanKey, string[]> = {
  free: ["lang", "qr", "dark", "wifi", "waiter", "allergens"],
  yenimekan: ["lang", "qr", "dark", "wifi", "waiter", "allergens", "stats", "photos"],
  starter: ["lang", "qr", "dark", "wifi", "waiter", "allergens", "stats", "photos", "chef", "cart", "details", "tables_10"],
  pro: ["lang", "qr", "dark", "wifi", "waiter", "allergens", "stats", "photos", "chef", "cart", "details", "tables_unlimited", "kitchen", "reviews", "recommendations", "logo"],
};

const ALL_DEMO_FEATURES = [
  { id: "lang", title: "5 Dil Desteği", desc: "Tr, En, Ar, De, Ru", icon: "lang" },
  { id: "qr", title: "QR Kod", desc: "Özelleştirilebilir Tasarım", icon: "qr" },
  { id: "dark", title: "Karanlık Mod", desc: "Göz dostu tasarım", icon: "dark" },
  { id: "wifi", title: "WiFi Gösterimi", desc: "Kolay ağ paylaşımı", icon: "wifi" },
  { id: "stats", title: "Analitik", desc: "Mekan İstatistikleri", icon: "similar" },
  { id: "cart", title: "Sepet & Sipariş", desc: "Masa Bazlı Sipariş", icon: "cart" },
  { id: "chef", title: "Şefin Seçimi", desc: "Öne Çıkanlar", icon: "chef" },
  { id: "details", title: "Ürün Detayları", desc: "Hazırlık & Kalori", icon: "details" },
  { id: "reviews", title: "Yorumlar", desc: "Müşteri Değerlendirme", icon: "similar" },
  { id: "logo", title: "Beyaz Etiket", desc: "Logonuz & Markanız", icon: "logo" },
];

function MenuApp({ plan, lang, onLangChange, restaurant, categories, allProducts }: any) {
  const [cart, setCart] = useState<{ id: string; product: DbProduct; qty: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [det, setDet] = useState<DbProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const fl = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1500); };
  const hasFeature = (fid: string) => PLAN_FEATURES_MAP[plan as PlanKey].includes(fid);

  const addToCart = (p: DbProduct) => {
    if (!hasFeature("cart")) { fl(lang === "tr" ? "Sepet özelliği bu planda kapalıdır." : "Cart feature is disabled in this plan."); return; }
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), product: p, qty: 1 }];
    });
    fl(getProductName(p, lang) + " " + t.added_to_cart);
  };

  const removeFromCart = (p: DbProduct) => {
    setCart(prev => prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const cartTotal = cart.reduce((s, i) => s + getDiscountedPrice(i.product) * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const t = UI_STRINGS[lang as LangKey];
  const o = dark ? 1 : 0;
  const C = {
    bg: ["#FAFAFA", "#111111"][o], cd: ["#FFF", "#1E1E1E"][o],
    bd: ["#EBEBEB", "#2E2E2E"][o], tx: ["#111", "#F5F5F5"][o],
    mt: ["#777", "#888"][o], dm: ["#CCC", "#444"][o], al: ["#FFF5F0", "#2A1810"][o],
    s2: ["#555", "#BBBBBB"][o],
  };

  const chefPicks = allProducts.filter((p: any) => p.is_chef_pick);
  const filtered = search
    ? allProducts.filter((p: any) => getProductName(p, lang).toLowerCase().includes(search.toLowerCase()))
    : allProducts.filter((p: any) => p.category_id === activeCat);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.tx, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes toast{0%{opacity:0;transform:translate(-50%,10px)}100%{opacity:1;transform:translate(-50%,0)}}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {toast && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 100, padding: "7px 18px", fontSize: 11, fontWeight: 600, color: A, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.08)", animation: "toast .2s both" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.cd, borderBottom: `1px solid ${C.bd}`, position: "sticky", top: 0, zIndex: 30, boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,.05)" : "none", transition: "all .3s" }}>
        <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.02em" }}>{hasFeature("logo") ? "Gusto Mediterranean" : "TEMeat Demo"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1 }}>
              <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>● 09:00 - 23:00</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {hasFeature("lang") && (
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
                {(Object.keys(UI_STRINGS) as LangKey[]).map(l => (
                  <button key={l} onClick={() => onLangChange(l)}
                    style={{ padding: "5px 6px", border: "none", cursor: "pointer", fontSize: 9, fontWeight: lang === l ? 700 : 400, background: lang === l ? C.tx : "transparent", color: lang === l ? C.bg : C.mt, minWidth: 22 }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            {hasFeature("dark") && (
              <button onClick={() => setDark(!dark)}
                style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {dark ? "◐" : "◑"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }} onScroll={(e: any) => setScrolled(e.target.scrollTop > 20)}>
        {/* WiFi */}
        {hasFeature("wifi") && (
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.bd}` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Icon type="wifi" size={12} active={false} />
              <span style={{ fontSize: 10, color: C.mt, fontWeight: 600 }}>WiFi:</span>
              <code style={{ fontSize: 11, fontWeight: 600, color: C.tx, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 6, padding: "2px 8px" }}>gusto-free-wifi</code>
            </div>
          </div>
        )}

        {/* Chef's Picks */}
        {chefPicks.length > 0 && !search && (
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{t.chef}</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {chefPicks.map((p: any) => (
                <div key={p.id} onClick={() => setDet(p)} style={{ width: 180, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 180, height: 120, borderRadius: 14, overflow: "hidden", marginBottom: 6 }}>
                    <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6), transparent 50%)" }} />
                    <div style={{ position: "absolute", bottom: 8, left: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{getProductName(p, lang)}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>₺{getDiscountedPrice(p)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ position: "relative" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              style={{ width: "100%", padding: "11px 16px 11px 36px", borderRadius: 12, border: `1.5px solid ${search ? A + "40" : C.bd}`, background: C.cd, color: C.tx, fontSize: 14, outline: "none" }} />
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            </div>
          </div>
        </div>

        {/* Categories (Sticky) */}
        {!search && (
          <div style={{ position: "sticky", top: 0, zIndex: 25, background: C.bg, borderBottom: `1px solid ${C.bd}` }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {categories.map((c: any) => (
                <button key={c.id} onClick={() => setActiveCat(c.id)}
                  style={{ flexShrink: 0, padding: "14px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeCat === c.id ? 700 : 500, color: activeCat === c.id ? A : C.mt, background: "transparent", borderBottom: activeCat === c.id ? `3px solid ${A}` : "3px solid transparent", transition: "all .2s" }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product List */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, padding: "16px 20px 100px" }}>
          {filtered.map((it: any) => {
            const qty = cart.find(i => i.product.id === it.id)?.qty || 0;
            return (
              <div key={it.id} style={{ display: "flex", gap: 14, padding: 12, background: C.cd, borderRadius: 16, border: `1px solid ${C.bd}` }}>
                <div onClick={() => hasFeature("details") ? setDet(it) : null} style={{ width: 90, height: 90, borderRadius: 12, overflow: "hidden", flexShrink: 0, position: "relative", cursor: hasFeature("details") ? "pointer" : "default" }}>
                  <img src={it.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  {it.discount_pct > 0 && <div style={{ position: "absolute", top: 6, left: 6, background: A, color: "#fff", fontSize: 9, fontWeight: 900, padding: "3px 7px", borderRadius: 6 }}>-%{it.discount_pct}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.tx, marginBottom: 2 }}>{getProductName(it, lang)}</div>
                    <div style={{ fontSize: 11, color: C.mt, lineHeight: 1.4, height: 30, overflow: "hidden" }}>{getProductDesc(it, lang)}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <div style={{ fontWeight: 800, color: A, fontSize: 15 }}>
                      {it.discount_pct ? <span style={{ fontSize: 11, textDecoration: "line-through", color: C.mt, marginRight: 6, fontWeight: 400 }}>₺{it.price}</span> : null}
                      ₺{getDiscountedPrice(it)}
                    </div>
                    {qty > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 10, border: `1px solid ${A}20` }}>
                        <button onClick={() => removeFromCart(it)} style={{ width: 30, height: 30, border: "none", background: "none", color: A, fontSize: 18 }}>-</button>
                        <span style={{ minWidth: 20, textAlign: "center", fontSize: 13, fontWeight: 700, color: A }}>{qty}</span>
                        <button onClick={() => addToCart(it)} style={{ width: 30, height: 30, border: "none", background: A, color: "#fff", borderRadius: "0 8px 8px 0", fontSize: 16 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(it)} style={{ height: 32, padding: "0 14px", borderRadius: 10, border: `1px solid ${C.bd}`, background: C.cd, fontSize: 11, fontWeight: 700, color: C.tx, cursor: "pointer" }}>+ {t.add}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ background: C.cd, borderTop: `1px solid ${C.bd}`, padding: "10px 20px 24px", position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 40 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {hasFeature("waiter") && (
            <button onClick={() => fl(t.waiter_notified)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon type="waiter" size={14} active={false} /> {t.waiter}
            </button>
          )}
          <button onClick={() => setShowPayment(true)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon type="cart" size={14} active={false} /> {t.total}
          </button>
          {hasFeature("cart") && cartCount > 0 && (
            <button onClick={() => setShowCart(true)} style={{ flex: 1.5, padding: "0 16px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: `0 4px 16px ${A}30` }}>
              <span>{cartCount}x</span>
              <span>₺{cartTotal}</span>
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <>
          <div onClick={() => setShowPayment(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 110, animation: "fi .2s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "24px 24px 0 0", zIndex: 120, padding: 24, animation: "su .3s ease-out" }}>
            <div style={{ width: 40, height: 4, background: C.dm, borderRadius: 99, margin: "-10px auto 20px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>{t.payment_method}</h3>
            <p style={{ fontSize: 13, color: C.mt, textAlign: "center", marginBottom: 24 }}>{t.payment_desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => { setShowPayment(false); fl(t.bill_requested); }} style={{ width: "100%", padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 15, fontWeight: 700 }}>{t.cash}</button>
              <button onClick={() => { setShowPayment(false); fl(t.bill_requested); }} style={{ width: "100%", padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 15, fontWeight: 700 }}>{t.card}</button>
            </div>
          </div>
        </>
      )}

      {/* Cart Drawer */}
      {showCart && hasFeature("cart") && (
        <>
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 110, animation: "fi .2s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "24px 24px 0 0", zIndex: 120, padding: 24, animation: "su .3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{t.cart}</span>
              <button onClick={() => setShowCart(false)} style={{ border: "none", background: "none", color: C.mt, fontSize: 14, fontWeight: 600 }}>{t.close}</button>
            </div>
            <div style={{ maxHeight: 250, overflowY: "auto", marginBottom: 24 }}>
              {cart.map(({ product: p, qty }) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{qty}x {getProductName(p, lang)}</span>
                  <span style={{ fontWeight: 700 }}>₺{getDiscountedPrice(p) * qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ color: C.mt, fontWeight: 500 }}>{t.total}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: A }}>₺{cartTotal}</span>
              </div>
              <button onClick={() => { setShowCart(false); setCart([]); fl(t.order_success); }}
                style={{ width: "100%", padding: 18, borderRadius: 16, border: "none", background: "#22c55e", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                {t.send}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {det && hasFeature("details") && (
        <>
          <div onClick={() => setDet(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 130, animation: "fi .2s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "24px 24px 0 0", zIndex: 140, animation: "su .3s cubic-bezier(.25,1,.5,1)", maxHeight: "90%", overflowY: "auto" }}>
            <div style={{ width: 32, height: 4, borderRadius: 99, background: C.dm, margin: "12px auto" }} />
            <div style={{ position: "relative" }}>
              <img src={det.image_url || ""} alt="" style={{ width: "100%", height: 260, objectFit: "cover" }} />
              <button onClick={() => setDet(null)} style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: 99, background: "rgba(0,0,0,.4)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px 24px 40px" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{getProductName(det, lang)}</h2>
              <div style={{ display: "flex", gap: 14, marginBottom: 16, fontSize: 12, color: C.mt, fontWeight: 600 }}>
                {det.prep_time && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon type="chef" size={14} active={false} /> {det.prep_time} {t.prep}</span>}
                {det.serves && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>👥 {det.serves} {t.serves}</span>}
              </div>
              <p style={{ fontSize: 14, color: C.s2, lineHeight: 1.7, marginBottom: 24 }}>{getProductDesc(det, lang)}</p>

              {hasFeature("similar") && (
                <div style={{ marginTop: 30, paddingTop: 24, borderTop: `1px solid ${C.bd}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: A, textTransform: "uppercase", marginBottom: 14 }}>{t.similar}</div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
                    {allProducts.filter((p: any) => p.id !== det.id).slice(0, 3).map((p: any) => (
                      <div key={p.id} onClick={() => setDet(p)} style={{ flexShrink: 0, width: 140 }}>
                        <img src={p.image_url || ""} style={{ width: "100%", height: 100, borderRadius: 14, objectFit: "cover", border: `1px solid ${C.bd}` }} alt="" />
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getProductName(p, lang)}</div>
                        <div style={{ fontSize: 11, color: A, fontWeight: 800, marginTop: 2 }}>₺{getDiscountedPrice(p)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.bd}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.mt, fontWeight: 600, marginBottom: 2 }}>{t.total}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: A }}>₺{getDiscountedPrice(det)}</div>
                </div>
                <button onClick={() => { addToCart(det); setDet(null); }}
                  style={{ flex: 1.5, height: 56, borderRadius: 18, border: "none", background: A, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                  + {t.add}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DemoPage() {
  const [activePlan, setActivePlan] = useState<PlanKey>("free");
  const [activeLang, setActiveLang] = useState<LangKey>("tr");
  const [isMobile, setIsMobile] = useState(true);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo size="md" />
          <Link href="/fiyat" style={{ fontSize: 14, fontWeight: 600, color: A, textDecoration: "none" }}>Fiyatlandırmaya Dön</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "1fr 450px", gap: 40 }}>
        {/* Left: Controls & Features */}
        <div>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: "-.03em" }}>Dijital Menünüzü Deneyimleyin</h1>
            <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.6 }}>Seçtiğiniz plana göre özelliklerin nasıl değiştiğini canlı olarak test edin.</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 16 }}>Paket Seçimi</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {(Object.keys(PLAN_LIMITS) as PlanKey[]).map(p => (
                  <button key={p} onClick={() => setActivePlan(p)}
                    style={{ padding: "16px", borderRadius: 16, border: activePlan === p ? `2px solid ${A}` : "2px solid #f1f5f9", background: activePlan === p ? `${A}08` : "#fff", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: activePlan === p ? A : "#0f172a", marginBottom: 2 }}>{PLAN_LIMITS[p].label}</div>
                    <div style={{ fontSize: 11, color: activePlan === p ? A : "#64748b" }}>{PLAN_LIMITS[p].products === Infinity ? "Sınırsız" : `${PLAN_LIMITS[p].products} Ürün`}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 16 }}>Aktif Özellikler</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {ALL_DEMO_FEATURES.map(f => {
                  const active = PLAN_FEATURES_MAP[activePlan].includes(f.id);
                  return (
                    <div key={f.id} style={{ display: "flex", gap: 12, opacity: active ? 1 : 0.4, transition: "opacity .3s" }}>
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: active ? `${A}12` : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: active ? A : "#94a3b8" }}>
                        <Icon type={f.icon} size={18} active={active} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: active ? "#0f172a" : "#94a3b8" }}>{f.title}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mockup Preview */}
        <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div style={{ position: "relative", width: 320, height: 650, margin: "0 auto", background: "#000", borderRadius: 44, padding: 12, boxShadow: "0 50px 100px -20px rgba(0,0,0,0.25)" }}>
            {/* Phone Bezel Details */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 30, background: "#000", borderRadius: "0 0 16px 16px", zIndex: 100 }}></div>

            <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 32, overflow: "hidden", position: "relative" }}>
              <MenuApp
                plan={activePlan}
                lang={activeLang}
                onLangChange={setActiveLang}
                restaurant={MOCK_RESTAURANT}
                categories={MOCK_CATEGORIES}
                allProducts={MOCK_PRODUCTS}
              />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
            <span style={{ color: activePlan === "pro" ? A : "inherit" }}>{PLAN_LIMITS[activePlan].label} Paket</span> Önizlemesi
          </div>
        </div>
      </main>
    </div>
  );
}
