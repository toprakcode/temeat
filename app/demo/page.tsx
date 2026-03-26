"use client";

import { useState, useCallback, useEffect } from "react";
import React from "react";
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
  ar: { l:"عر", s:"ماذا تبحث؟", add:"أضف", cart:"طلبي", total:"المجموع", send:"أرسل الطلب", waiter:"اطلب النادل", wifi:"كلمة المرور", copied:"تم النسخ!", empty:"سلتك فارغة", pop:"مميز", nw:"جديد", sp:"حار", vg:"نباتي", cal:"سعرة", notified:"تم إبلاغ النادل ✓", chef:"اختيار الشيف", prep:"د", por:"أشخاص", similar:"قد يعجبك أيضًا", interior:"مكاننا", close:"×", upgrade:"Pro", serves:"أشخاص" },
  de: { l:"De", s:"Was suchen Sie?", add:"Hinzufügen", cart:"Bestellung", total:"Gesamt", send:"Bestellen", waiter:"Kellner rufen", wifi:"WLAN-Passwort", copied:"Kopiert!", empty:"Ihr Warenkorb ist leer", pop:"Beliebt", nw:"Neu", sp:"Scharf", vg:"Pflanzlich", cal:"kcal", notified:"Kellner informiert ✓", chef:"Empfehlung des Küchenchefs", prep:"Min", por:"Pers.", similar:"Das könnte Ihnen gefallen", interior:"Unser Raum", close:"×", upgrade:"Pro werden", serves:"Pers." },
  ru: { l:"Ру", s:"Что ищете?", add:"Добавить", cart:"Мой заказ", total:"Итого", send:"Отправить заказ", waiter:"Вызвать официанта", wifi:"Пароль WiFi", copied:"Скопировано!", empty:"Ваша корзина пуста", pop:"Хит", nw:"Новинка", sp:"Острое", vg:"Растительное", cal:"кал", notified:"Официант вызван ✓", chef:"Выбор шефа", prep:"мин", por:"Персон", similar:"Вам также понравится", interior:"Наш интерьер", close:"×", upgrade:"Перейти на Pro", serves:"Персон" },
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
// PLAN BANNER (locked features overlay)
// ─────────────────────────────────────────────
const PLAN_FEATURES: Record<PlanKey, { locked: string[]; unlocked: string[] }> = {
  free: {
    unlocked: ["Temel dijital menü", "QR kod", "5 dil desteği"],
    locked: ["Sepet & WhatsApp sipariş", "Şefin Seçimi", "İndirim & kampanya", "Hazırlık süresi & porsiyon", "Karanlık mod", "Analytics", "Logo kaldırma"],
  },
  starter: {
    unlocked: ["Temel dijital menü", "QR kod", "5 dil desteği", "Sepet & WhatsApp sipariş", "İndirim & kampanya", "Hazırlık süresi & porsiyon", "Karanlık mod"],
    locked: ["Şefin Seçimi", "Analytics dashboard", "Logo kaldırma", "Öncelikli destek"],
  },
  pro: {
    unlocked: ["Her şey dahil", "Sınırsız ürün", "Şefin Seçimi", "Analytics", "Logo kaldırma", "Öncelikli destek"],
    locked: [],
  },
};

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
  const [modal, setModal] = useState(false);

  const u = LD[lang];
  const o = dk ? 1 : 0;
  const C = {
    bg: ["#FAFAFA","#0B0B0B"][o], cd: ["#FFF","#161616"][o], bd: ["#EBEBEB","#232323"][o],
    tx: ["#111","#EDEDED"][o], s2: ["#555","#999"][o], mt: ["#999","#555"][o], dm: ["#CCC","#333"][o],
    al: ["#FFF5F0","#1C1210"][o],
  };

  const isPro = plan === "pro";
  const isStarter = plan === "starter";
  const limit = PLAN_LIMITS[plan].products;

  // Apply product limit
  const limitedProducts = allProducts.slice(0, limit === Infinity ? allProducts.length : limit);

  // Chef picks — only show in pro
  const chefProducts = isPro
    ? limitedProducts.filter(p => p.discount_pct && p.discount_pct > 0).slice(0, 4)
    : [];

  // Category products
  const catProducts = categories[cat]
    ? limitedProducts.filter(p => p.category_id === categories[cat].id)
    : [];

  // Search
  const searchResults = q
    ? limitedProducts.filter(p => getProductName(p, lang).toLowerCase().includes(q.toLowerCase()))
    : [];

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

  function tagColor(t: string) {
    return ({ pop: A, new: "#2563eb", spicy: "#dc2626", vg: "#16a34a" } as Record<string, string>)[t] || "#999";
  }

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
          {(isPro || isStarter) && (
            <button onClick={() => setDk(!dk)} style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid " + C.bd, background: "transparent", cursor: "pointer", fontSize: 11, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dk ? "◐" : "◑"}
            </button>
          )}
        </div>
      </div>

      {/* Info bar */}
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
        <div onClick={() => { navigator.clipboard?.writeText(wifiPw); fl(u.copied); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ fontSize: 10, color: C.mt, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>{u.wifi}</span>
          <code style={{ fontSize: 11, fontWeight: 600, color: C.s2, background: C.cd, border: "1px solid " + C.bd, borderRadius: 6, padding: "3px 8px" }}>{wifiPw}</code>
        </div>
      </div>

      {/* Chef's Pick — Pro only */}
      {isPro && chefProducts.length > 0 && !q && (
        <div style={{ padding: "8px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{u.chef}</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {chefProducts.map(it => {
              const dp = getDiscountedPrice(it);
              return (
                <div key={it.id} onClick={() => setDet(it)} style={{ width: 195, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 195, height: 135, borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                    <img src={it.image_url || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 50%)" }} />
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,.15)", backdropFilter: "blur(6px)", borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 700, color: "#fff" }}>★ {u.chef}</div>
                    <div style={{ position: "absolute", bottom: 8, left: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{getProductName(it, lang)}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>₺{dp}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.mt }}>
                    {it.prep_time ? <span>{it.prep_time}{u.prep}</span> : null}
                    {it.serves ? <><span>·</span><span>{it.serves}{u.serves}</span></> : null}
                    {it.calories ? <><span>·</span><span>{it.calories}{u.cal}</span></> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked banner for free */}
      {plan === "free" && !q && (
        <div onClick={() => setModal(true)} style={{ margin: "12px 20px 0", padding: "10px 14px", border: "1px dashed " + C.bd, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", opacity: .5 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{u.chef} & Sepet & Kampanyalar</div>
            <div style={{ fontSize: 10, color: C.mt }}>Başlangıç veya Pro planı gerekli</div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: A }}>Yükselt</span>
        </div>
      )}

      {/* Search */}
      <div style={{ padding: "14px 20px 10px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder={u.s}
            style={{ width: "100%", padding: "12px 16px 12px 38px", borderRadius: 12, border: "1.5px solid " + (q ? A + "40" : C.bd), background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: C.bd, border: "none", borderRadius: 99, width: 18, height: 18, cursor: "pointer", color: C.s2, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
        </div>
      </div>

      {/* Category tabs */}
      {!q && (
        <div style={{ padding: "0 20px 10px", display: "flex", borderBottom: "1px solid " + C.bd, overflowX: "auto" }}>
          {categories.map((c, i) => (
            <button key={c.id} onClick={() => setCat(i)}
              style={{ flexShrink: 0, padding: "10px 12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: cat === i ? 700 : 400, color: cat === i ? C.tx : C.mt, background: "transparent", borderBottom: cat === i ? "2px solid " + C.tx : "2px solid transparent", whiteSpace: "nowrap" }}>
              {c.name}
              <span style={{ fontSize: 9, color: C.dm, marginLeft: 3 }}>
                ({limitedProducts.filter(p => p.category_id === c.id).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Product count indicator */}
      {limit !== Infinity && (
        <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 10, color: C.mt, background: C.cd, border: "1px solid " + C.bd, borderRadius: 99, padding: "3px 10px" }}>
            {Math.min(allProducts.length, limit)}/{allProducts.length} ürün görünüyor
          </span>
        </div>
      )}

      {/* Product list */}
      <div style={{ padding: "4px 0 130px" }}>
        {displayItems.map((it, i) => {
          const qty = cart[it.id] || 0;
          const dp = getDiscountedPrice(it);
          const hasDiscount = it.discount_pct && it.discount_pct > 0;
          return (
            <div key={it.id} className="si" style={{ padding: "0 20px", animationDelay: i * .03 + "s" }}>
              <div style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid " + C.bd, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.25, marginBottom: 4, letterSpacing: "-.02em", cursor: (isPro || isStarter) ? "pointer" : "default" }}
                    onClick={() => { if (isPro || isStarter) setDet(it); }}>
                    {getProductName(it, lang)}
                  </div>
                  <div style={{ fontSize: 12, color: C.mt, lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {getProductDesc(it, lang)}
                  </div>
                  {(isPro || isStarter) && (it.prep_time || it.serves || it.calories) && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 10, color: C.mt }}>
                      {it.prep_time ? <span>{it.prep_time}{u.prep}</span> : null}
                      {it.serves ? <><span>·</span><span>{it.serves}{u.serves}</span></> : null}
                      {it.calories ? <><span>·</span><span>{it.calories}{u.cal}</span></> : null}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>₺{dp}</span>
                    {hasDiscount && <span style={{ fontSize: 12, color: C.dm, textDecoration: "line-through" }}>₺{it.price}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div onClick={() => { if (isPro || isStarter) setDet(it); }}
                    style={{ width: 100, height: 100, borderRadius: 16, overflow: "hidden", cursor: (isPro || isStarter) ? "pointer" : "default", position: "relative" }}>
                    <img src={it.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {hasDiscount && (isPro || isStarter) && (
                      <div style={{ position: "absolute", top: 5, left: 5, background: A, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>-{it.discount_pct}%</div>
                    )}
                  </div>
                  {/* Sepet — starter ve pro'da */}
                  {(isPro || isStarter) && (qty > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 10, border: "1.5px solid " + A + "20", width: 100 }}>
                      <button onClick={() => removeFromCart(it)} style={{ flex: 1, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, color: A, minWidth: 18, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => addToCart(it)} style={{ flex: 1, height: 32, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 8px 8px 0" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(it)} className="pr"
                      style={{ width: 100, height: 32, borderRadius: 10, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>
                      + {u.add}
                    </button>
                  ))}
                  {/* Free plan: sepet yok, kilit göster */}
                  {plan === "free" && (
                    <button onClick={() => setModal(true)} style={{ width: 100, height: 32, borderRadius: 10, border: "1.5px dashed " + C.bd, background: "transparent", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.mt, opacity: .5 }}>
                      🔒 Ekle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.mt, fontSize: 13 }}>
            {q ? "Sonuç bulunamadı" : "Bu kategoride ürün yok"}
          </div>
        )}
      </div>

      {/* Branding */}
      <div style={{ textAlign: "center", padding: 20, borderTop: "1px solid " + C.bd }}>
        {plan === "free" ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.cd, border: "1px solid " + C.bd, borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}><div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} /><div style={{ width: 11, height: 2, background: A, borderRadius: 99 }} /><div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} /></div>
            <div><div style={{ fontSize: 11, fontWeight: 700 }}>Powered by <span style={{ color: C.tx }}>TEM</span><span style={{ color: A }}>eat</span></div><div style={{ fontSize: 9, color: C.mt }}>temeat.com.tr</div></div>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} /><div style={{ width: 8, height: 1.5, background: A, borderRadius: 99 }} /><div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} /></div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em" }}><span style={{ color: C.dm }}>TEM</span><span style={{ color: A }}>EAT</span></span>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "sticky", bottom: 0, background: C.bg, padding: "10px 20px 14px", display: "flex", gap: 8, borderTop: "1px solid " + C.bd, zIndex: 20 }}>
        <button onClick={() => fl(u.notified)} className="pr"
          style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>
          {u.waiter}
        </button>
        {(isPro || isStarter) && cartCount > 0 && (
          <button onClick={() => setShowCart(true)} className="pr"
            style={{ flex: 2, padding: "12px 16px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 16px " + A + "30" }}>
            <span>{u.cart} · {cartCount}</span><span style={{ fontWeight: 800 }}>₺{cartTotal}</span>
          </button>
        )}
        {plan === "free" && (
          <button onClick={() => setModal(true)} className="pr"
            style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: C.tx, color: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ⚡ {u.upgrade}
          </button>
        )}
      </div>

      {/* Cart modal */}
      {showCart && (isPro || isStarter) && (
        <div>
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40, animation: "fi .15s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 50, maxHeight: "70%", display: "flex", flexDirection: "column", animation: "su .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.bd }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{u.cart}</span>
              <button onClick={() => setShowCart(false)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid " + C.bd, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt }}>{u.close}</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {cartList.length === 0
                ? <div style={{ textAlign: "center", padding: 40, color: C.mt, fontSize: 13 }}>{u.empty}</div>
                : cartList.map(({ product: p, qty }) => {
                  const pr = getDiscountedPrice(p);
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid " + C.bd }}>
                      <img src={p.image_url || ""} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{getProductName(p, lang)}</div><div style={{ fontSize: 12, color: C.mt }}>₺{pr}</div></div>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid " + C.bd, borderRadius: 8 }}>
                        <button onClick={() => removeFromCart(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.s2, fontSize: 14 }}>−</button>
                        <span style={{ minWidth: 16, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{qty}</span>
                        <button onClick={() => addToCart(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.s2, fontSize: 14 }}>+</button>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, minWidth: 48, textAlign: "right" }}>₺{pr * qty}</span>
                    </div>
                  );
                })
              }
            </div>
            {cartList.length > 0 && (
              <div style={{ padding: "14px 20px 28px", borderTop: "1px solid " + C.bd }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: C.mt }}>{u.total}</span>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>₺{cartTotal}</span>
                </div>
                <button onClick={() => {
                  const phone = restaurant?.phone?.replace(/\D/g, "") || "905551234567";
                  let m = `🍽️ *${restName}*\n\n`;
                  cartList.forEach(({ product: p, qty }) => {
                    const pr = getDiscountedPrice(p);
                    m += `${qty}× ${getProductName(p, lang)}  ₺${pr * qty}\n`;
                  });
                  m += `\n${u.total}: ₺${cartTotal}`;
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(m)}`, "_blank");
                }} className="pr"
                  style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {u.send}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {det && (isPro || isStarter) && (
        <div>
          <div onClick={() => setDet(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 60, animation: "fi .15s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 70, animation: "su .3s cubic-bezier(.25,1,.5,1)", maxHeight: "85%", overflowY: "auto" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
            <img src={det.image_url || ""} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />
            <button onClick={() => setDet(null)} style={{ position: "absolute", top: 20, right: 16, width: 30, height: 30, borderRadius: 99, background: "rgba(0,0,0,.3)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{u.close}</button>
            <div style={{ padding: "16px 20px 28px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{getProductName(det, lang)}</h2>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11, color: C.mt }}>
                {det.prep_time ? <span>{det.prep_time}{u.prep}</span> : null}
                {det.serves ? <><span>·</span><span>{det.serves}{u.serves}</span></> : null}
                {det.calories ? <><span>·</span><span>{det.calories}{u.cal}</span></> : null}
              </div>
              <p style={{ fontSize: 13, color: C.s2, margin: "0 0 18px", lineHeight: 1.65 }}>{getProductDesc(det, lang)}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 0", borderTop: "1px solid " + C.bd }}>
                <div>
                  {det.discount_pct && det.discount_pct > 0
                    ? <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 24, fontWeight: 800 }}>₺{getDiscountedPrice(det)}</span><span style={{ fontSize: 14, color: C.dm, textDecoration: "line-through" }}>₺{det.price}</span></div>
                    : <span style={{ fontSize: 24, fontWeight: 800 }}>₺{det.price}</span>
                  }
                </div>
                <button onClick={() => { addToCart(det); setDet(null); }} className="pr"
                  style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  + {u.add}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {modal && (
        <div>
          <div onClick={() => setModal(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 80, animation: "fi .15s" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 90, animation: "su .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "20px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: A, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
                  <div style={{ width: 18, height: 2, background: "#fff", borderRadius: 99 }} /><div style={{ width: 12, height: 2, background: "#fff", borderRadius: 99 }} /><div style={{ width: 18, height: 2, background: "#fff", borderRadius: 99 }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>TEMeat <span style={{ color: A }}>Pro</span></h2>
                <p style={{ fontSize: 12, color: C.mt, margin: 0 }}>Restoranınızı dijitalde büyütün</p>
              </div>
              <div style={{ background: C.bg, borderRadius: 12, padding: 14, textAlign: "center", marginBottom: 14, border: "1px solid " + C.bd }}>
                <span style={{ fontSize: 28, fontWeight: 800 }}>₺299</span>
                <span style={{ fontSize: 12, color: C.mt }}>/ay</span>
                <div style={{ fontSize: 10, color: C.mt, marginTop: 4 }}>14 gün ücretsiz · İstediğin zaman iptal</div>
              </div>
              <a href="/fiyat" className="pr" style={{ display: "block", textAlign: "center", width: "100%", padding: 14, borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}>
                Fiyatları İncele
              </a>
              <button onClick={() => setModal(false)} style={{ width: "100%", padding: 10, marginTop: 6, background: "transparent", border: "none", color: C.mt, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                Ücretsiz devam et
              </button>
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

  // Supabase data
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Restaurant
        const { data: rest } = await supabase
          .from("restaurants")
          .select("id, name, wifi_password, phone")
          .eq("slug", DEMO_SLUG)
          .single();

        if (!rest) { setLoading(false); return; }
        setRestaurant(rest);

        // Categories
        const { data: cats } = await supabase
          .from("categories")
          .select("id, name, sort_order")
          .eq("restaurant_id", rest.id)
          .order("sort_order");

        setCategories(cats || []);

        // Products — fetch all, we'll limit in-component
        const { data: prods } = await supabase
          .from("products")
          .select("id, name_tr, name_en, name_ar, name_de, name_ru, desc_tr, desc_en, desc_ar, desc_de, desc_ru, price, image_url, discount_pct, calories, prep_time, serves, category_id")
          .eq("restaurant_id", rest.id)
          .order("category_id");

        setAllProducts(prods || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const planConfig = {
    free:    { color: "#6B7280", badge: "Ücretsiz", desc: "15 ürün · Temel menü" },
    starter: { color: "#2563EB", badge: "Başlangıç", desc: "50 ürün · Sepet dahil" },
    pro:     { color: A,         badge: "Pro",       desc: "Sınırsız · Tüm özellikler" },
  } as const;

  function PhoneMockup() {
    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: -50, background: `radial-gradient(circle, ${A}20 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 340, height: 680, borderRadius: 50, background: "linear-gradient(160deg, #1c2b2b 0%, #111b1b 30%, #0d1515 60%, #111b1b 100%)", boxShadow: "0 0 0 1.5px rgba(255,255,255,.06), 0 0 0 3px #0d1515, 0 40px 80px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.08)", position: "relative", overflow: "visible" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 50, background: "#000", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 110, height: 30, background: "#000", borderRadius: 18, zIndex: 10, boxShadow: "0 0 0 1.5px #1a1a1a" }} />
              <div style={{ height: "100%", overflow: "hidden" }}>
                {loading
                  ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#FAFAFA", flexDirection: "column", gap: 12 }}>
                      <div style={{ width: 32, height: 32, border: `3px solid ${A}`, borderTopColor: "transparent", borderRadius: 99, animation: "spin 1s linear infinite" }} />
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      <span style={{ fontSize: 12, color: "#999" }}>Yükleniyor...</span>
                    </div>
                  : <MenuApp plan={plan} lang={lang} onLangChange={setLang} restaurant={restaurant} categories={categories} allProducts={allProducts} />
                }
              </div>
            </div>
            <div style={{ position: "absolute", right: -3.5, top: 155, width: 3.5, height: 68, background: "linear-gradient(to right, #1c2b2b, #243535)", borderRadius: "0 4px 4px 0" }} />
            <div style={{ position: "absolute", left: -3.5, top: 118, width: 3.5, height: 30, background: "linear-gradient(to left, #1c2b2b, #243535)", borderRadius: "4px 0 0 4px" }} />
            <div style={{ position: "absolute", left: -3.5, top: 164, width: 3.5, height: 52, background: "linear-gradient(to left, #1c2b2b, #243535)", borderRadius: "4px 0 0 4px" }} />
            <div style={{ position: "absolute", left: -3.5, top: 228, width: 3.5, height: 52, background: "linear-gradient(to left, #1c2b2b, #243535)", borderRadius: "4px 0 0 4px" }} />
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 100, height: 4, background: "rgba(255,255,255,.18)", borderRadius: 99 }} />
          </div>
        </div>
      </div>
    );
  }

  function TabletMockup() {
    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: -50, background: `radial-gradient(circle, ${A}15 0%, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 520, height: 700, borderRadius: 24, background: "linear-gradient(160deg, #1c2b2b 0%, #111b1b 30%, #0d1515 60%, #111b1b 100%)", boxShadow: "0 0 0 1.5px rgba(255,255,255,.06), 0 0 0 3px #0d1515, 0 40px 80px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.08)", position: "relative", overflow: "visible" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 24, background: "#000", overflow: "hidden", position: "relative" }}>
              <div style={{ height: 20, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#111", border: "1px solid #1e3a3a" }} />
              </div>
              <div style={{ height: "calc(100% - 20px)", overflow: "hidden" }}>
                {loading
                  ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#FAFAFA", flexDirection: "column", gap: 12 }}>
                      <div style={{ width: 32, height: 32, border: `3px solid ${A}`, borderTopColor: "transparent", borderRadius: 99, animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 12, color: "#999" }}>Yükleniyor...</span>
                    </div>
                  : <MenuApp plan={plan} lang={lang} onLangChange={setLang} restaurant={restaurant} categories={categories} allProducts={allProducts} />
                }
              </div>
            </div>
            <div style={{ position: "absolute", top: -3.5, right: 80, width: 52, height: 3.5, background: "linear-gradient(to top, #1c2b2b, #243535)", borderRadius: "4px 4px 0 0" }} />
            <div style={{ position: "absolute", right: -3.5, top: 80, width: 3.5, height: 44, background: "linear-gradient(to right, #1c2b2b, #243535)", borderRadius: "0 4px 4px 0" }} />
            <div style={{ position: "absolute", right: -3.5, top: 136, width: 3.5, height: 44, background: "linear-gradient(to right, #1c2b2b, #243535)", borderRadius: "0 4px 4px 0" }} />
          </div>
        </div>
      </div>
    );
  }

  const FeatureIcon = ({ type }: { type: string }) => {
    const s = { width: 16, height: 16, flexShrink: 0 as const };
    const icons: Record<string, React.ReactNode> = {
      lang: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      cart: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      star: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      chart: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
      moon: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
      qr: <svg {...s} viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    };
    return <>{icons[type]}</>;
  };

  const features = [
    { icon: "lang",  title: "5 Dil Desteği",   desc: "Tr · En · Ar · De · Ru" },
    { icon: "cart",  title: "Sepet & Sipariş",  desc: "WhatsApp entegrasyonu" },
    { icon: "star",  title: "Şefin Seçimi",     desc: "Öne çıkan ürünler" },
    { icon: "chart", title: "Analytics",        desc: "Gerçek zamanlı veriler" },
    { icon: "moon",  title: "Karanlık Mod",     desc: "Göz dostu tasarım" },
    { icon: "qr",    title: "QR Kod",           desc: "Masa bazlı kodlar" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0a0a0a 0%, #1a0a05 60%, #0a0a0a 100%)", fontFamily: "'Outfit', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:900px){
          .demo-layout{flex-direction:column!important;align-items:center!important;padding:80px 20px 40px!important}
          .demo-left{text-align:center!important;align-items:center!important}
          .features-grid{grid-template-columns:repeat(3,1fr)!important}
        }
        @media(max-width:500px){.features-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 30% 50%, ${A}15 0%, transparent 50%)`, pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0 5%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,10,10,.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
            <div style={{ width: 11, height: 2, background: A, borderRadius: 99 }} />
            <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>TEM<span style={{ color: A }}>eat</span></span>
        </a>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/fiyat" style={{ fontSize: 13, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Fiyatlar</a>
          <a href="/fiyat" style={{ padding: "8px 18px", borderRadius: 8, background: A, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Ücretsiz Başla</a>
        </div>
      </nav>

      {/* Main */}
      <div className="demo-layout" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 64, minHeight: "100vh", padding: "80px 5% 60px" }}>

        {/* Left */}
        <div className="demo-left" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 420, animation: "fadeUp .8s cubic-bezier(.25,1,.5,1) both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${A}15`, border: `1px solid ${A}30`, borderRadius: 99, padding: "6px 14px", width: "fit-content" }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: "#4ade80" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>Canlı Demo — Gerçek Veriler</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-.04em", lineHeight: 1.1 }}>
            Müşterinizin<br />gördüğü <span style={{ color: A }}>tam<br />bu menü</span>
          </h1>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", lineHeight: 1.65 }}>
            Planları karşılaştırın, dil değiştirin, sepete ekleyin — tamamen gerçek verilerle çalışıyor.
          </p>

          {/* Plan Switcher */}
          <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", textTransform: "uppercase" }}>Plan Seç</div>
            {(["free", "starter", "pro"] as PlanKey[]).map(p => {
              const cfg = planConfig[p];
              const active = plan === p;
              return (
                <button key={p} onClick={() => setPlan(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", background: active ? "rgba(255,255,255,.09)" : "transparent", transition: "all .2s", textAlign: "left" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: active ? cfg.color : "rgba(255,255,255,.15)", flexShrink: 0, boxShadow: active ? `0 0 8px ${cfg.color}` : "none", transition: "all .2s" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#fff" : "rgba(255,255,255,.5)", transition: "color .2s" }}>{cfg.badge}</div>
                    <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.25)", marginTop: 1 }}>{cfg.desc}</div>
                  </div>
                  {active && <div style={{ fontSize: 9, fontWeight: 700, color: cfg.color, background: `${cfg.color}20`, borderRadius: 6, padding: "3px 8px" }}>Aktif</div>}
                </button>
              );
            })}
          </div>

          {/* Feature list */}
          <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
              {PLAN_LIMITS[plan].label} Planı
            </div>
            {PLAN_FEATURES[plan].unlocked.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#4ade80", fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>{f}</span>
              </div>
            ))}
            {PLAN_FEATURES[plan].locked.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, opacity: .4 }}>
                <span style={{ fontSize: 12 }}>🔒</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textDecoration: "line-through" }}>{f}</span>
              </div>
            ))}
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <FeatureIcon type={f.icon} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{f.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a href="/fiyat" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 12, background: A, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", width: "fit-content", boxShadow: `0 8px 24px ${A}40`, marginTop: 4 }}>
            Hemen Başla →
          </a>
        </div>

        {/* Right — Mockup */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, animation: "fadeUp 1s .2s cubic-bezier(.25,1,.5,1) both" }}>
          {/* Device toggle */}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 3, gap: 3 }}>
            {[{ id: "phone", label: "Telefon" }, { id: "tablet", label: "Tablet" }].map(m => (
              <button key={m.id} onClick={() => setDevice(m.id as "phone" | "tablet")} style={{ padding: "7px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: device === m.id ? 700 : 500, background: device === m.id ? "rgba(255,255,255,.12)" : "transparent", color: device === m.id ? "#fff" : "rgba(255,255,255,.4)", transition: "all .2s" }}>
                {m.label}
              </button>
            ))}
          </div>

          {device === "phone" ? <PhoneMockup /> : <TabletMockup />}
        </div>
      </div>
    </div>
  );
}