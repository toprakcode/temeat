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
  tr: { l:"Tr", s:"Ne arıyorsunuz?", add:"Ekle", cart:"Sepetim", total:"Toplam", send:"Siparişi Gönder", waiter:"Garson Çağır", wifi:"Ağ Şifresi", copied:"Kopyalandı!", empty:"Sepetiniz boş", pop:"Favori", nw:"Yeni", sp:"Acılı", vg:"Bitkisel", cal:"kal", notified:"Garson haberdar edildi ✓", chef:"Şefin Seçimi", prep:"dk", por:"Kişilik", similar:"Bunu da beğenebilirsiniz", interior:"Mekanımız", close:"×", upgrade:"Pro'ya Geç", serves:"Kişilik" },
  en: { l:"En", s:"What are you looking for?", add:"Add", cart:"My Order", total:"Total", send:"Send Order", waiter:"Call Waiter", wifi:"WiFi Password", copied:"Copied!", empty:"Your cart is empty", pop:"Popular", nw:"New", sp:"Spicy", vg:"Plant-based", cal:"cal", notified:"Waiter notified ✓", chef:"Chef's Pick", prep:"min", por:"Serves", similar:"You May Also Like", interior:"Our Space", close:"×", upgrade:"Go Pro", serves:"Serves" },
  ar: { l:"عر", s:"ماذا تبحث؟", add:"أضف", cart:"طلبي", total:"المجموع", send:"أرسl الطلب", waiter:"اطلب النادل", wifi:"كلمة المرور", copied:"تم النسخ!", empty:"سلتك فارغة", pop:"مميز", nw:"جديد", sp:"حار", vg:"نباتي", cal:"سعرة", notified:"تم إبلاغ النادل ✓", chef:"اختيار الشيف", prep:"د", por:"أشخاص", similar:"قد يعجبك أيضًا", interior:"مكاننا", close:"×", upgrade:"Pro", serves:"أشخاص" },
  de: { l:"De", s:"Was suchen Sie?", add:"Hinzufügen", cart:"Bestellung", total:"Gesamt", send:"Bestellen", waiter:"Kellner rufen", wifi:"WLAN-Passwort", copied:"Kopiert!", empty:"Ihr Warenkorb ist leer", pop:"Beliebt", nw:"Neu", sp:"Scharf", vg:"Pflanzlich", cal:"kcal", notified:"Kellner informiert ✓", chef:"Empfehlung des Küchenchefs", prep:"Min", por:"Pers.", similar:"Das könnte Ihnen gefallen", interior:"Unser Raum", close:"×", upgrade:"Pro werden", serves:"Pers." },
  ru: { l:"Ру", s:"Что ищеte?", add:"Добавить", cart:"Мой заказ", total:"Итого", send:"Отправить заказ", waiter:"Вызвать официанта", wifi:"Пароль WiFi", copied:"Скопировано!", empty:"Ваша корзина пуста", pop:"Хит", nw:"Новинка", sp:"Острое", vg:"Растительное", cal:"кал", notified:"Официант вызван ✓", chef:"Выбор шефа", prep:"мин", por:"Персон", similar:"Вам также понравится", interior:"Наш интерьер", close:"×", upgrade:"Перейти на Pro", serves:"Персон" },
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
    wifi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    waiter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    cart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    chef: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
    details: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="20" y1="21" x2="20" y2="14"/><path d="M20 14c0-3.3-2-6-6-6h-4c-4 0-6 2.7-6 6"/><path d="M12 8V3"/><path d="M12 3h5"/><path d="M12 3H7"/></svg>,
    similar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    logo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    stats: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    // Plan Icons
    leaf: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 7a7 7 0 0 1-7 7h-3"/><path d="M11 20v-4"/></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    diamond: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>,
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
// PLAN CONFIG & FEATURES (Synced with app/page.tsx)
// ─────────────────────────────────────────────
const PLAN_FEATURES_MAP: Record<PlanKey, string[]> = {
  free: ["5 Dil Desteği", "Temel QR Kod", "Karanlık Mod", "WiFi Gösterimi", "Garson Çağır"],
  starter: ["5 Dil Desteği", "Özelleştirilebilir QR", "Karanlık Mod", "WiFi Gösterimi", "Garson Çağır", "Sepet & Sipariş", "Şefin Seçimi", "Hazırlık & Porsiyon"],
  pro: ["5 Dil Desteği", "Premium QR", "Karanlık Mod", "WiFi Gösterimi", "Garson Çağır", "Sepet & Sipariş", "Şefin Seçimi", "Hazırlık & Porsiyon", "Benzer Ürünler", "Logo Kaldırma", "Analitik"],
};

const ALL_DEMO_FEATURES = [
  { id: "lang",    title: "5 Dil Desteği",   desc: "Tr, En, Ar, De, Ru", icon: "lang" },
  { id: "qr",      title: "QR Kod",          desc: "Temel / Premium QR", icon: "qr" },
  { id: "dark",    title: "Karanlık Mod",    desc: "Göz dostu tasarım",  icon: "dark" },
  { id: "wifi",    title: "WiFi Gösterimi",  desc: "Kolay ağ paylaşımı", icon: "wifi" },
  { id: "waiter",  title: "Garson Çağır",    desc: "Hızlı servis",      icon: "waiter" },
  { id: "cart",    title: "Sepet & Sipariş", desc: "WhatsApp siparişi", icon: "cart" },
  { id: "chef",    title: "Şefin Seçimi",    desc: "Öne çıkan lezzetler", icon: "chef" },
  { id: "details", title: "Hazırlık & Porsiyon", desc: "Detaylı bilgiler", icon: "details" },
  { id: "similar", title: "Benzer Ürünler",  desc: "Yapay zeka önerisi", icon: "similar" },
  { id: "logo",    title: "Logo Kaldırma",   desc: "White-label deneyim", icon: "logo" },
  { id: "stats",   title: "Analitik",        desc: "Müşteri verileri",   icon: "stats" },
];

// ─────────────────────────────────────────────
// MENU APP (the actual menu experience)
// ─────────────────────────────────────────────
function MenuApp({
  plan,
  lang,
  onLangChange,
  restaurant,
  categories,
  allProducts,
}: {
  plan: PlanKey;
  lang: LangKey;
  onLangChange: (l: LangKey) => void;
  restaurant: DbRestaurant | null;
  categories: DbCategory[];
  allProducts: DbProduct[];
}) {
  const [dk, setDk] = useState(false);
  const [cat, setCat] = useState(0);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [det, setDet] = useState<DbProduct | null>(null);

  const u = LD[lang];
  const o = dk ? 1 : 0;
  const C = {
    bg: ["#FAFAFA","#0B0B0B"][o], cd: ["#FFF","#161616"][o], bd: ["#EBEBEB","#232323"][o],
    tx: ["#111","#EDEDED"][o], s2: ["#555","#999"][o], mt: ["#999","#555"][o], dm: ["#CCC","#333"][o],
    al: ["#FFF5F0","#1C1210"][o],
  };

  const isPro = plan === "pro";
  const isStarter = plan === "starter";
  const isFree = plan === "free";
  const limit = PLAN_LIMITS[plan].products;

  const limitedProducts = allProducts.slice(0, limit === Infinity ? allProducts.length : limit);
  const chefProducts = (isPro || isStarter) ? limitedProducts.filter(p => p.discount_pct && p.discount_pct > 0).slice(0, 4) : [];
  const catProducts = categories[cat] ? limitedProducts.filter(p => p.category_id === categories[cat].id) : [];
  const searchResults = q ? limitedProducts.filter(p => getProductName(p, lang).toLowerCase().includes(q.toLowerCase())) : [];
  const displayItems = q ? searchResults : catProducts;

  const fl = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1600);
  }, []);

  const addToCart = (p: DbProduct) => {
    setCart(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
    fl(getProductName(p, lang) + " ✓");
  };

  const removeFromCart = (p: DbProduct) => {
    setCart(prev => {
      const n = { ...prev };
      if (n[p.id] > 1) n[p.id]--;
      else delete n[p.id];
      return n;
    });
  };

  const cartList: CartItem[] = Object.entries(cart)
    .map(([id, qty]) => ({ product: allProducts.find(p => p.id === id)!, qty: qty as number }))
    .filter(x => !!x.product);

  const cartTotal = cartList.reduce((s, c) => s + getDiscountedPrice(c.product) * c.qty, 0);
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  const wifiPw = restaurant?.wifi_password || "—";
  const restName = restaurant?.name || "Demo Restoran";

  return (
    <div style={{ width: "100%", height: "100%", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", transition: "background .4s", position: "relative", color: C.tx, overflowY: "auto", overflowX: "hidden", paddingTop: 44 }}>
      <style>{`*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes ti{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}.si{animation:si .4s cubic-bezier(.25,1,.5,1) both}.pr:active{transform:scale(.977);transition:transform .06s}::-webkit-scrollbar{display:none}`}</style>

      {toast && (
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, animation: "ti .2s", background: C.cd, border: "1px solid " + C.bd, borderRadius: 100, padding: "7px 18px", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12, fontWeight: 600, color: A, whiteSpace: "nowrap" }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.bd, gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-.03em", flexShrink: 0, maxWidth: 110, lineHeight: 1.2 }}>{restName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid " + C.bd }}>
            {(Object.entries(LD) as [LangKey, LangData][]).map(([k, v]) => (
              <button key={k} onClick={() => onLangChange(k as LangKey)} style={{ padding: "4px 6px", border: "none", cursor: "pointer", fontSize: 8, fontWeight: lang === k ? 700 : 400, fontFamily: "inherit", background: lang === k ? C.tx : "transparent", color: lang === k ? C.bg : C.mt, minWidth: 22, textAlign: "center" }}>{v.l}</button>
            ))}
          </div>
          <button onClick={() => setDk(!dk)} style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid " + C.bd, background: "transparent", cursor: "pointer", fontSize: 11, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {dk ? "◐" : "◑"}
          </button>
        </div>
      </div>

      <div style={{ padding: "14px 20px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: 99, background: A }} />)}
            <div style={{ width: 5, height: 5, borderRadius: 99, background: C.dm }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600 }}>4.8</span>
          <span style={{ color: C.dm }}>·</span>
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>● Açık</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: C.mt, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>{u.wifi}</span>
          <code style={{ fontSize: 11, fontWeight: 600, color: C.s2, background: C.cd, border: "1px solid " + C.bd, borderRadius: 6, padding: "3px 8px" }}>{wifiPw}</code>
        </div>
      </div>

      {(isPro || isStarter) && chefProducts.length > 0 && !q && (
        <div style={{ padding: "8px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{u.chef}</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {chefProducts.map(it => {
              const dp = getDiscountedPrice(it);
              return (
                <div key={it.id} onClick={() => setDet(it)} style={{ width: 195, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 195, height: 135, borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                    <img src={it.image_url || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 8, left: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{getProductName(it, lang)}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>₺{dp}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isFree && !q && (
        <div style={{ margin: "12px 20px 0", padding: "10px 14px", border: "1px dashed " + C.bd, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, opacity: .5 }}>
          <span style={{ color: C.mt }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{u.chef} & Sepet & Kampanyalar</div>
            <div style={{ fontSize: 10, color: C.mt }}>Üst paket özellikleri kilitli</div>
          </div>
        </div>
      )}

      <div style={{ padding: "14px 20px 10px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder={u.s}
            style={{ width: "100%", padding: "12px 16px 12px 38px", borderRadius: 12, border: "1.5px solid " + (q ? A + "40" : C.bd), background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </div>
      </div>

      {!q && (
        <div style={{ padding: "0 20px 10px", display: "flex", borderBottom: "1px solid " + C.bd, overflowX: "auto" }}>
          {categories.map((c, i) => (
            <button key={c.id} onClick={() => setCat(i)}
              style={{ flexShrink: 0, padding: "10px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: cat === i ? 700 : 400, color: cat === i ? C.tx : C.mt, background: "transparent", borderBottom: cat === i ? "2px solid " + C.tx : "2px solid transparent", whiteSpace: "nowrap" }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "4px 0 130px" }}>
        {displayItems.map((it, i) => {
          const qty = cart[it.id] || 0;
          const dp = getDiscountedPrice(it);
          return (
            <div key={it.id} className="si" style={{ padding: "0 20px", animationDelay: i * .03 + "s" }}>
              <div style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid " + C.bd, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div onClick={() => setDet(it)} style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.25, marginBottom: 4, letterSpacing: "-.02em", cursor: "pointer" }}>{getProductName(it, lang)}</div>
                  <div style={{ fontSize: 12, color: C.mt, lineHeight: 1.4, marginBottom: 8 }}>{getProductDesc(it, lang)}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>₺{dp}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div onClick={() => setDet(it)} style={{ width: 100, height: 100, borderRadius: 16, overflow: "hidden", position: "relative", cursor: "pointer" }}>
                    <img src={it.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  {(isPro || isStarter) && (qty > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 10, border: "1.5px solid " + A + "20", width: 100 }}>
                      <button onClick={() => removeFromCart(it)} style={{ flex: 1, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, color: A, minWidth: 18, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => addToCart(it)} style={{ flex: 1, height: 32, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 8px 8px 0" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(it)} className="pr"
                      style={{ width: 100, height: 32, borderRadius: 10, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", color: C.tx }}>
                      + {u.add}
                    </button>
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
            <span>{u.cart} · {cartCount}</span><span style={{ fontWeight: 800 }}>₺{cartTotal}</span>
          </button>
        )}
      </div>

      {/* Branding - Pro hiding it */}
      {!isPro && (
        <div style={{ textAlign: "center", padding: "20px 0 40px", opacity: 0.3, fontSize: 11, fontWeight: 600 }}>
          Powered by TEMeat
        </div>
      )}

      {showCart && (
        <div>
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 50, padding: 20, animation: "su .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><span style={{ fontWeight: 700 }}>{u.cart}</span><button onClick={() => setShowCart(false)} style={{ border: "none", background: "none", color: C.mt }}>{u.close}</button></div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {cartList.map(({ product: p, qty }) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span>{qty}x {getProductName(p, lang)}</span>
                  <span>₺{getDiscountedPrice(p) * qty}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid " + C.bd, paddingTop: 16, marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><span style={{ color: C.mt }}>{u.total}</span><span style={{ fontSize: 20, fontWeight: 800 }}>₺{cartTotal}</span></div>
              <button style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontWeight: 700 }}>WhatsApp Sipariş</button>
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
            <button onClick={() => setDet(null)} style={{ position: "absolute", top: 20, right: 16, width: 30, height: 30, borderRadius: 99, background: "rgba(0,0,0,.3)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <div style={{ padding: "16px 20px 28px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{getProductName(det, lang)}</h2>
              {(isPro || isStarter) && (det.prep_time || det.serves || det.calories) && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11, color: C.mt }}>
                  {det.prep_time ? <span>{det.prep_time} dk</span> : null}
                  {det.serves ? <span>{det.serves} Kişilik</span> : null}
                  {det.calories ? <span>{det.calories} kcal</span> : null}
                </div>
              )}
              <p style={{ fontSize: 13, color: C.s2, margin: "0 0 18px", lineHeight: 1.65 }}>{getProductDesc(det, lang)}</p>
              
              {isPro && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid " + C.bd }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: A, textTransform: "uppercase", marginBottom: 12 }}>Benzer Lezzetler</div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                    {allProducts.filter(p => p.id !== det.id).slice(0, 3).map(p => (
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
                  <button onClick={() => { addToCart(det); setDet(null); }} className="pr"
                    style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    + Ekle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DEMO PAGE
// ─────────────────────────────────────────────
export default function DemoPage() {
  const [device, setDevice] = useState<"phone" | "tablet">("phone");
  const [plan, setPlan] = useState<PlanKey>("pro");
  const [lang, setLang] = useState<LangKey>("tr");
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const targetSlug = `demo-${plan}`;
      try {
        // Try plan-specific slug first
        let { data: rest } = await supabase.from("restaurants").select("id, name, wifi_password, phone").eq("slug", targetSlug).single();
        
        // Fallback to generic 'demo' if not found
        if (!rest) {
          const { data: fallbackRest } = await supabase.from("restaurants").select("id, name, wifi_password, phone").eq("slug", DEMO_SLUG).single();
          rest = fallbackRest;
        }

        if (!rest) { setLoading(false); return; }
        setRestaurant(rest);
        
        const { data: cats } = await supabase.from("categories").select("id, name, sort_order").eq("restaurant_id", rest.id).order("sort_order");
        setCategories(cats || []);
        
        const { data: prods } = await supabase.from("products").select("id, name_tr, name_en, name_ar, name_de, name_ru, desc_tr, desc_en, desc_ar, desc_de, desc_ru, price, image_url, discount_pct, calories, prep_time, serves, category_id").eq("restaurant_id", rest.id).order("category_id");
        setAllProducts(prods || []);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [plan]);

  const planConfig = {
    free:    { color: "#9ca3af", badge: "Ücretsiz", desc: "Temel Dijital Menü", icon: "leaf" },
    starter: { color: "#3b82f6", badge: "Başlangıç", desc: "Sepet & Sipariş", icon: "rocket" },
    pro:     { color: A,         badge: "Pro",       desc: "Tam Performans", icon: "diamond" },
  } as const;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "'Outfit', system-ui, sans-serif", color: "#fff", position: "relative", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{from{box-shadow:0 0 0 transparent}to{box-shadow:0 0 20px ${A}40}}
        .btn-primary{transition:all .2s;cursor:pointer}
        .btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 12px 32px ${A}40}
        .device-btn-active{background:#fff!important;color:#000!important}
        .feature-card{transition:all .4s cubic-bezier(0.2, 0.8, 0.2, 1);border:1px solid rgba(255,255,255,0.04)}
        .feature-active{background:${A}08!important;border-color:${A}40!important;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:translateY(-2px)}
        @media(max-width:1100px){
          .demo-grid{grid-template-columns:1fr!important;gap:48px!important}
          .demo-sidebar{order:2}
          .demo-preview{order:1}
        }
      `}</style>

      <div style={{ position: "absolute", top: -200, right: -200, width: 800, height: 800, background: `radial-gradient(circle, ${A}15 0%, transparent 70%)`, filter: "blur(80px)", borderRadius: 999, pointerEvents: "none" }} />
      
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 5%", background: "rgba(5,5,5,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size="sm" withTagline={false} />
          <Link href="/" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 600 }}>Geri Dön</Link>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "120px 5% 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 60, animation: "fadeUp .8s both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${A}15`, border: `1px solid ${A}25`, borderRadius: 99, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: A, textTransform: "uppercase" }}>Canlı Deneyim</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: 16 }}>
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
                {(["free", "starter", "pro"] as PlanKey[]).map(p => {
                  const cfg = planConfig[p];
                  const active = plan === p;
                  return (
                    <button key={p} onClick={() => setPlan(p)} style={{ 
                      width: "100%", textAlign: "left", padding: "18px 20px", borderRadius: 16, 
                      background: active ? `${A}08` : "rgba(255,255,255,0.02)", 
                      border: "1.5px solid", borderColor: active ? A : "rgba(255,255,255,0.06)",
                      cursor: "pointer", transition: "all .3s ease", display: "flex", alignItems: "center", gap: 16
                    }}>
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
                  const isActive = PLAN_FEATURES_MAP[plan].includes(f.title);
                  return (
                    <div key={i} className={`feature-card ${isActive ? "feature-active" : ""}`} style={{ 
                      padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)",
                      display: "flex", alignItems: "center", gap: 12, opacity: isActive ? 1 : 0.2
                    }}>
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
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                  QR kodu taratın ve gerçek kullanıcı deneyimini kendi cihazınızda anında yaşayın.
                </p>
              </div>
            </section>

            <Link href="/auth" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "18px", borderRadius: 14, background: A, color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
              Hemen Kendi Menünü Oluştur →
            </Link>
          </div>

          <div className="demo-preview" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "sticky", top: 100, animation: "fadeUp .8s .4s both" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 3, display: "flex", gap: 3 }}>
              <button onClick={() => setDevice("phone")} className={device === "phone" ? "device-btn-active" : ""} style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Telefon</button>
              <button onClick={() => setDevice("tablet")} className={device === "tablet" ? "device-btn-active" : ""} style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Tablet</button>
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
        © 2026 TEMeat — Geleceğin Restoran Deneyimi.
      </footer>
    </div>
  );
}