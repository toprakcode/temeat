"use client";

import { useState, useCallback, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEMO_SLUG = "demo";
const A = "#D4470A";

// Plan limits
const PLAN_LIMITS = {
  free:    { products: 15, label: "Ücretsiz",  labelEn: "Free"    },
  starter: { products: 50, label: "Başlangıç", labelEn: "Starter" },
  pro:     { products: Infinity, label: "Pro", labelEn: "Pro"     },
} as const;

type PlanKey = keyof typeof PLAN_LIMITS;
type LangKey = "tr" | "en" | "ar" | "de" | "ru";

type LangData = {
  l: string; s: string; add: string; cart: string; total: string; send: string;
  waiter: string; wifi: string; copied: string; empty: string; pop: string;
  nw: string; sp: string; vg: string; cal: string; notified: string; chef: string;
  prep: string; por: string; similar: string; interior: string; close: string;
  upgrade: string; serves: string;
};

const LD: Record<LangKey, LangData> = {
  tr: { l:"Tr", s:"Ne arıyorsunuz?", add:"Ekle", cart:"Sepetim", total:"Toplam", send:"Siparişi Gönder", waiter:"Garson Çağır", wifi:"Ağ Şifresi", copied:"Kopyalandı!", empty:"Sepetiniz boş", pop:"Favori", nw:"Yeni", sp:"Acılı", vg:"Bitkisel", cal:"kal", notified:"Garson haberdar edildi", chef:"Şefin Seçimi", prep:"dk", por:"Kişilik", similar:"Bunu da beğenebilirsiniz", interior:"Mekanımız", close:"×", upgrade:"Pro'ya Geç", serves:"Kişilik" },
  en: { l:"En", s:"What are you looking for?", add:"Add", cart:"My Order", total:"Total", send:"Send Order", waiter:"Call Waiter", wifi:"WiFi Password", copied:"Copied!", empty:"Your cart is empty", pop:"Popular", nw:"New", sp:"Spicy", vg:"Plant-based", cal:"cal", notified:"Waiter notified", chef:"Chef's Pick", prep:"min", por:"Serves", similar:"You May Also Like", interior:"Our Space", close:"×", upgrade:"Go Pro", serves:"Serves" },
  ar: { l:"عر", s:"ماذا تبحث؟", add:"أضف", cart:"طلبي", total:"المجموع", send:"أرسل الطلب", waiter:"اطلب النادل", wifi:"كلمة المرور", copied:"تم النسخ!", empty:"سلتك فارغة", pop:"مميز", nw:"جديد", sp:"حار", vg:"نباتي", cal:"سعرة", notified:"تم إبلاغ النادل", chef:"اختيار الشيف", prep:"د", por:"أشخاص", similar:"قد يعجبك أيضًا", interior:"مكاننا", close:"×", upgrade:"Pro", serves:"أشخاص" },
  de: { l:"De", s:"Was suchen Sie?", add:"Hinzufügen", cart:"Bestellung", total:"Gesamt", send:"Bestellen", waiter:"Kellner rufen", wifi:"WLAN-Passwort", copied:"Kopiert!", empty:"Ihr Warenkorb ist leer", pop:"Beliebt", nw:"Neu", sp:"Scharf", vg:"Pflanzlich", cal:"kcal", notified:"Kellner informiert", chef:"Empfehlung des Küchenchefs", prep:"Min", por:"Pers.", similar:"Das könnte Ihnen gefallen", interior:"Unser Raum", close:"×", upgrade:"Pro werden", serves:"Pers." },
  ru: { l:"Ру", s:"Что ищете?", add:"Добавить", cart:"Мой заказ", total:"Итого", send:"Отправить заказ", waiter:"Вызвать официанта", wifi:"Пароль WiFi", copied:"Скопировано!", empty:"Ваша корзина пуста", pop:"Хит", nw:"Новинка", sp:"Острое", vg:"Растительное", cal:"кал", notified:"Официант вызван", chef:"Выбор шефа", prep:"мин", por:"Персон", similar:"Вам также понравится", interior:"Наш интерьер", close:"×", upgrade:"Перейти на Pro", serves:"Персон" },
};

// ─────────────────────────────────────────────
// ICONS (Minimalist SVG)
// ─────────────────────────────────────────────
const Icon = ({ type, size = 20, active = false }: { type: string, size?: number, active?: boolean }) => {
  const color = active ? A : "rgba(255,255,255,0.2)";
  const stroke = 2;
  
  const icons: Record<string, React.ReactNode> = {
    lang: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    qr: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01"/></svg>,
    dark: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    sun: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    wifi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    waiter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    cart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    chef: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
    details: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="20" y1="21" x2="20" y2="14"/><path d="M20 14c0-3.3-2-6-6-6h-4c-4 0-6 2.7-6 6"/><path d="M12 8V3"/><path d="M12 3h5"/><path d="M12 3H7"/></svg>,
    similar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    logo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    stats: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    leaf: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 7a7 7 0 0 1-7 7h-3"/><path d="M11 20v-4"/></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    diamond: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
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

interface CartItem { product: DbProduct; qty: number; }

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
// MOCK DATA (Fallback for empty database)
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
// PLAN CONFIG & FEATURES (Synced with app/page.tsx)
// ─────────────────────────────────────────────
const PLAN_FEATURES_MAP: Record<PlanKey, string[]> = {
  free: ["lang", "qr", "dark", "wifi", "waiter"],
  starter: ["lang", "qr", "dark", "wifi", "waiter", "cart", "chef", "details"],
  pro: ["lang", "qr", "dark", "wifi", "waiter", "cart", "chef", "details", "similar", "logo", "stats"],
};

const ALL_DEMO_FEATURES = [
  { id: "lang",    title: "5 Dil Desteği",   desc: "Tr, En, Ar, De, Ru", icon: "lang" },
  { id: "qr",      title: "QR Kod",          desc: "Temel / Premium QR", icon: "qr" },
  { id: "dark",    title: "Karanlık Mod",    desc: "Göz dostu tasarım",  icon: "dark" },
  { id: "wifi",    title: "WiFi Gösterimi",  desc: "Kolay ağ paylaşımı", icon: "wifi" },
  { id: "waiter",  title: "Garson Çağır",    desc: "Hızlı servis",      icon: "waiter" },
  { id: "cart",    title: "Sepet & Sipariş", desc: "Dijital Sipariş",    icon: "cart" },
  { id: "chef",    title: "Şefin Seçimi",    desc: "Öne Çıkanlar",       icon: "chef" },
  { id: "details", title: "Ürün Detayları",  desc: "Hazırlık & Kalori", icon: "details" },
  { id: "similar", title: "Öneriler",        desc: "Akıllı Tavsiyeler", icon: "similar" },
  { id: "logo",    title: "Beyaz Etiket",    desc: "Logonuz & Markanız", icon: "logo" },
  { id: "stats",   title: "Analitik",        desc: "Ziyaret İstatistikleri", icon: "stats" },
];

function MenuApp({ plan, lang, onLangChange, restaurant, categories, allProducts }: any) {
  const [cart, setCart] = useState<{id: string; product: DbProduct; qty: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [det, setDet] = useState<DbProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  
  const fl = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1500); };
  
  const addToCart = (p: DbProduct) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), product: p, qty: 1 }];
    });
    fl(getProductName(p, lang) + " eklendi");
  };

  const removeFromCart = (p: DbProduct) => {
    setCart(prev => prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const cartTotal = cart.reduce((s, i) => s + getDiscountedPrice(i.product) * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  
  const isPro = plan === "pro";
  const isStarter = plan === "starter";
  const u = LD[lang as LangKey];
  
  const C = {
    bg: "#fff",
    cd: "#fff",
    bd: "#eee",
    tx: "#111",
    mt: "#888",
    dm: "#ccc",
    al: "rgba(212, 71, 10, 0.05)",
    s2: "#555"
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.tx, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes toast{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        .pr:active{transform:scale(0.98)}
      `}</style>
      
      {toast && <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", padding: "8px 16px", borderRadius: 40, fontSize: 12, fontWeight: 600, zIndex: 100, animation: "toast 0.2s both" }}>{toast}</div>}

      <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.bd, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>{isPro ? "Gusto Mediterranean" : "TEMeat Demo"}</div>
        <div style={{ display: "flex", borderRadius: 8, background: "#f5f5f5", padding: 2 }}>
          {(Object.keys(LD) as LangKey[]).map(l => (
            <button key={l} onClick={() => onLangChange(l)} style={{ border: "none", background: lang === l ? "#fff" : "transparent", padding: "4px 8px", fontSize: 10, fontWeight: 700, borderRadius: 6, cursor: "pointer", color: lang === l ? A : "#999" }}>{LD[l as LangKey].l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderBottom: "1px solid " + C.bd, display: "flex", gap: 12, overflowX: "auto" }}>
        {categories.map((c: any) => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ border: "none", background: "none", fontSize: 13, fontWeight: activeCat === c.id ? 800 : 500, color: activeCat === c.id ? A : C.mt, cursor: "pointer", whiteSpace: "nowrap" }}>{c.name}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        {allProducts.filter((p: any) => p.category_id === activeCat).map((it: any) => {
          const qty = cart.find(i => i.product.id === it.id)?.qty || 0;
          return (
            <div key={it.id} style={{ display: "flex", gap: 14, padding: "12px 20px", borderBottom: "1px solid " + C.bd }}>
              <div onClick={() => isStarter || isPro ? setDet(it) : null} style={{ width: 84, height: 84, borderRadius: 12, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                <img src={it.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                {it.is_chef_pick && isStarter && <div style={{ position: "absolute", top: 4, right: 4, background: A, color: "#fff", padding: 4, borderRadius: 99 }}><Icon type="chef" size={10} active /></div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{getProductName(it, lang)}</div>
                <div style={{ fontSize: 11, color: C.mt, lineHeight: 1.4, height: 32, overflow: "hidden" }}>{getProductDesc(it, lang)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ fontWeight: 800, color: A }}>
                    {it.discount_pct ? <span style={{ fontSize: 10, textDecoration: "line-through", color: C.mt, marginRight: 4 }}>₺{it.price}</span> : null}
                    ₺{getDiscountedPrice(it)}
                  </div>
                  {(isPro || isStarter) && (qty > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 10, border: "1.5px solid " + A + "20", width: 100 }}>
                      <button onClick={() => removeFromCart(it)} style={{ flex: 1, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>-</button>
                      <span style={{ fontWeight: 700, fontSize: 14, color: A, minWidth: 18, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => addToCart(it)} style={{ flex: 1, height: 32, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 8px 8px 0" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(it)} className="pr" style={{ width: 100, height: 32, borderRadius: 10, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", color: C.tx }}>+ {u.add}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "sticky", bottom: 0, background: C.bg, padding: "10px 20px 14px", display: "flex", gap: 8, borderTop: "1px solid " + C.bd, zIndex: 20 }}>
        <button onClick={() => fl(u.notified)} className="pr" style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.tx }}>{u.waiter}</button>
        {(isPro || isStarter) && cartCount > 0 && (
          <button onClick={() => setShowCart(true)} className="pr" style={{ flex: 2, padding: "12px 16px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{u.cart} • {cartCount}</span><span style={{ fontWeight: 800 }}>₺{cartTotal}</span>
          </button>
        )}
      </div>

      {!isPro && <div style={{ textAlign: "center", padding: "20px 0 40px", opacity: 0.3, fontSize: 11, fontWeight: 600 }}>Powered by TEMeat</div>}

      {showCart && (
        <div>
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 50, padding: 20, animation: "su .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><span style={{ fontWeight: 700 }}>{u.cart}</span><button onClick={() => setShowCart(false)} style={{ border: "none", background: "none", color: C.mt }}>{u.close}</button></div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {cart.map(({ product: p, qty }) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span>{qty}x {getProductName(p, lang)}</span>
                  <span>₺{getDiscountedPrice(p) * qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid " + C.bd, paddingTop: 16, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><span style={{ color: C.mt }}>{u.total}</span><span style={{ fontSize: 20, fontWeight: 800 }}>₺{cartTotal}</span></div>
              <button style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontWeight: 700 }}>Siparişi Onayla</button>
            </div>
          </div>
        </div>
      )}

      {det && (
        <div>
          <div onClick={() => setDet(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 60, animation: "fi .15s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 70, animation: "su .3s cubic-bezier(.25,1,.5,1)", maxHeight: "85%", overflowY: "auto" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
            <img src={det.image_url || ""} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />
            <button onClick={() => setDet(null)} style={{ position: "absolute", top: 20, right: 16, width: 30, height: 30, borderRadius: 99, background: "rgba(0,0,0,.3)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            <div style={{ padding: "16px 20px 28px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{getProductName(det, lang)}</h2>
              {(isPro || isStarter) && (det.prep_time || det.serves || det.calories) && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11, color: C.mt }}>
                  {det.prep_time ? <span>{det.prep_time} dk</span> : null}
                  {det.serves ? <span>{det.serves} {u.serves}</span> : null}
                  {det.calories ? <span>{det.calories} kcal</span> : null}
                </div>
              )}
              <p style={{ fontSize: 13, color: C.s2, margin: "0 0 18px", lineHeight: 1.65 }}>{getProductDesc(det, lang)}</p>
              {isPro && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid " + C.bd }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: A, textTransform: "uppercase", marginBottom: 12 }}>{u.similar}</div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                    {allProducts.filter((p: any) => p.id !== det.id).slice(0, 3).map((p: any) => (
                      <div key={p.id} onClick={() => setDet(p)} style={{ flexShrink: 0, width: 120 }}>
                        <img src={p.image_url || ""} style={{ width: "100%", height: 80, borderRadius: 10, objectFit: "cover" }} alt="" />
                        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getProductName(p, lang)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 0", marginTop: 20, borderTop: "1px solid " + C.bd }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>₺{getDiscountedPrice(det)}</span>
                {(isPro || isStarter) && (
                  <button onClick={() => { addToCart(det); setDet(null); }} className="pr" style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ {u.add}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoPage() {
  const [plan, setPlan] = useState<PlanKey>("starter");
  const [lang, setLang] = useState<LangKey>("tr");
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<"phone" | "tablet">("phone");

  const restaurant = MOCK_RESTAURANT;
  const categories = MOCK_CATEGORIES;
  const allProducts = MOCK_PRODUCTS;

  const planConfig = {
    free:    { color: "#9ca3af", badge: "Ücretsiz", desc: "Temel Dijital Menü", icon: "leaf" },
    starter: { color: "#3b82f6", badge: "Başlangıç", desc: "Sepet & Sipariş", icon: "rocket" },
    pro:     { color: A,         badge: "Pro",       desc: "Tam Performans", icon: "diamond" },
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      <header style={{ padding: "24px 5%", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(5,5,5,0.8)", backdropFilter: "blur(10px)", zIndex: 100 }}>
        <Logo size="md" />
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Geri Dön</Link>
      </header>

      <main style={{ padding: "60px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 60, animation: "fadeUp .8s both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${A}15`, border: "1px solid " + A + "25", borderRadius: 99, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: A, textTransform: "uppercase" }}>Canlı Deneyim</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16 }}>
            Müşterilerinizin deneyimini <br /><span style={{ color: A }}>canlı test edin.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 600, margin: "0 auto" }}>
            Planlar arasında geçiş yaparak menünüzün nasıl tepki verdiğini ve özelliklerin nasıl çalıştığını anında görün.
          </p>
        </div>

        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 80, alignItems: "start" }}>
          <div className="demo-sidebar" style={{ display: "flex", flexDirection: "column", gap: 32, animation: "fadeUp .8s .2s both" }}>
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 16 }}>Plan Seçin</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(Object.keys(planConfig) as PlanKey[]).map(p => {
                  const cfg = planConfig[p];
                  const active = plan === p;
                  return (
                    <button key={p} onClick={() => setPlan(p)} style={{ width: "100%", textAlign: "left", padding: "18px 20px", borderRadius: 16, background: active ? `${A}08` : "rgba(255,255,255,0.02)", border: "1.5px solid", borderColor: active ? A : "rgba(255,255,255,0.06)", cursor: "pointer", transition: "all .3s ease", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: active ? A : "rgba(255,255,255,0.05)" }}>
                        <Icon type={cfg.icon} size={24} active={active} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>{cfg.badge}</span>
                          {active && <span style={{ fontSize: 9, fontWeight: 900, background: A, color: "#fff", padding: "2px 6px", borderRadius: 4 }}>AKTİF</span>}
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{cfg.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 16 }}>Plana Dahil Özellikler</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ALL_DEMO_FEATURES.map((f, i) => {
                  const isActive = PLAN_FEATURES_MAP[plan].includes(f.id);
                  return (
                    <div key={i} style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 12, opacity: isActive ? 1 : 0.2 }}>
                      <Icon type={f.icon} size={20} active={isActive} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{f.title}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ background: "#fff", padding: 6, borderRadius: 10, flexShrink: 0 }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://temeat.com.tr/demo-${plan}`} alt="QR" style={{ width: 80, height: 80 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Kendi Telefonunda Gör</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>QR kodu taratın ve gerçek kullanıcı deneyimini kendi cihazınızda anında yaşayın.</p>
              </div>
            </section>

            <Link href="/auth" style={{ display: "block", textAlign: "center", padding: "18px", borderRadius: 14, background: A, color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>Hemen Kendi Menünüzü Oluşturun →</Link>
          </div>

          <div className="demo-preview" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "sticky", top: 100, animation: "fadeUp .8s .4s both" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3, display: "flex", gap: 3 }}>
              <button onClick={() => setDevice("phone")} style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: device === "phone" ? "#fff" : "transparent", color: device === "phone" ? "#000" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Telefon</button>
              <button onClick={() => setDevice("tablet")} style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: device === "tablet" ? "#fff" : "transparent", color: device === "tablet" ? "#000" : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Tablet</button>
            </div>

            <div style={{ width: device === "phone" ? 340 : 460, height: device === "phone" ? 680 : 600, borderRadius: 44, background: "#000", border: "8px solid #1a1a1a", position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,0.8)", transition: "all .4s ease" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: "#fff", position: "relative" }}>
                {loading
                  ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#050505", flexDirection: "column", gap: 24 }}>
                      <div style={{ animation: "pulse 2s infinite ease-in-out" }}>
                        <Logo size="md" withTagline={false} />
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em" }}>LÜTFEN BEKLEYİN...</span>
                    </div>
                  : <MenuApp plan={plan} lang={lang} onLangChange={setLang} restaurant={restaurant} categories={categories} allProducts={allProducts} />
                }
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ padding: "40px 5%", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
        © 2026 TEMeat • Geleceğin Restoran Deneyimi.
      </footer>
      
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}
