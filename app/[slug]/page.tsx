"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_COLOR = "#D4470A";

const ALLERGEN_ICONS: Record<string, string> = {
  gluten: "🌾", sut: "🥛", yumurta: "🥚", findik: "🥜",
  balik: "🐟", kabuklu: "🦐", soya: "🫘", susam: "🌱",
};
const ALLERGEN_LABELS: Record<string, string> = {
  gluten: "Gluten", sut: "Süt", yumurta: "Yumurta", findik: "Fındık",
  balik: "Balık", kabuklu: "Kabuklu", soya: "Soya", susam: "Susam",
};

type Restaurant = {
  id: string; name: string; slug: string; address: string | null;
  phone: string | null; hours: string | null; wifi_password: string | null;
  theme_color: string | null; logo_url: string | null;
};

type Category = { id: string; name: string; sort_order: number };

type Product = {
  id: string; category_id: string | null;
  name_tr: string; name_en: string | null; name_ar: string | null; name_de: string | null; name_ru: string | null;
  desc_tr: string | null; desc_en: string | null; desc_ar: string | null; desc_de: string | null; desc_ru: string | null;
  price: number; discount_pct: number; calories: number | null; prep_time: number | null; serves: number;
  image_url: string | null; is_active: boolean; is_chef_pick: boolean; tags: string[];
  allergens: string[];
};

type LangKey = "tr" | "en" | "ar" | "de" | "ru";

const LANGS: { key: LangKey; label: string }[] = [
  { key: "tr", label: "TR" }, { key: "en", label: "EN" },
  { key: "ar", label: "عر" }, { key: "de", label: "DE" }, { key: "ru", label: "RU" },
];

function getProductName(p: Product, lang: LangKey): string {
  return p[`name_${lang}`] || p.name_tr;
}
function getProductDesc(p: Product, lang: LangKey): string {
  return p[`desc_${lang}`] || p.desc_tr || "";
}

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState<LangKey>("tr");
  const [dark, setDark] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const A = restaurant?.theme_color || DEFAULT_COLOR;
  const o = dark ? 1 : 0;
  const isRTL = lang === "ar";
  const C = {
    bg: ["#FAFAFA", "#111111"][o], cd: ["#FFF", "#1E1E1E"][o],
    bd: ["#EBEBEB", "#2E2E2E"][o], tx: ["#111", "#F5F5F5"][o],
    mt: ["#777", "#888"][o], dm: ["#CCC", "#444"][o], al: ["#FFF5F0", "#2A1810"][o],
    s2: ["#555", "#BBBBBB"][o],
  };

  useEffect(() => { loadMenu(); }, [slug]);

  const loadMenu = async () => {
    const { data: rest } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
    if (!rest) { setNotFound(true); setLoading(false); return; }
    setRestaurant(rest);
    document.title = `${rest.name} Menüsü | TEMeat`;
    supabase.from("page_views").insert({ restaurant_id: rest.id, lang: navigator.language?.slice(0, 2) || "tr" });
    const { data: cats } = await supabase.from("categories").select("*").eq("restaurant_id", rest.id).order("sort_order");
    const { data: prods } = await supabase.from("products").select("*").eq("restaurant_id", rest.id).eq("is_active", true).order("sort_order");
    setCategories(cats || []);
    setProducts(prods || []);
    if (cats && cats.length > 0) setActiveCat(cats[0].id);
    setLoading(false);
  };

  const flash = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 1400);
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
    flash(getProductName(p, lang) + " ✓");
  };
  const removeFromCart = (p: Product) => {
    setCart(prev => { const n = { ...prev }; if (n[p.id] > 1) n[p.id]--; else delete n[p.id]; return n; });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === id)!, qty })).filter(x => x.product);
  const cartTotal = cartItems.reduce((s, { product: p, qty }) => { const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price; return s + price * qty; }, 0);
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);
  const filteredProducts = search
    ? products.filter(p => getProductName(p, lang).toLowerCase().includes(search.toLowerCase()))
    : activeCat ? products.filter(p => p.category_id === activeCat) : products;
  const chefPicks = products.filter(p => p.is_chef_pick);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 99, border: `3px solid ${DEFAULT_COLOR}`, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 13, color: "#999" }}>Menü yükleniyor...</div>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "center", padding: 20 }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍽</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Menü bulunamadı</h1>
        <p style={{ fontSize: 14, color: "#999" }}>Bu adrese ait bir restoran yok.</p>
      </div>
    </div>
  );

  const ModalWrapper = ({ children, onClick, zIndex }: { children: React.ReactNode; onClick: () => void; zIndex: number }) => (
    <div style={{ position: "fixed", inset: 0, zIndex, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClick} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", animation: "fadeIn .15s" }} />
      {children}
    </div>
  );

  // Tek ürün kartı — hem telefon hem masaüstü için
  const ProductCard = ({ p, i }: { p: Product; i: number }) => {
    const qty = cart[p.id] || 0;
    const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;
    return (
      <div style={{ animation: `fadeUp .4s ${i * .03}s both`, background: C.cd, borderRadius: 16, border: `1px solid ${C.bd}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Görsel */}
        <div onClick={() => setDetailProduct(p)} style={{ position: "relative", width: "100%", paddingTop: "60%", cursor: "pointer", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            {p.image_url
              ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: `${A}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🍽</div>
            }
          </div>
          {p.discount_pct > 0 && (
            <div style={{ position: "absolute", top: 8, left: 8, background: A, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5 }}>-{p.discount_pct}%</div>
          )}
        </div>
        {/* İçerik */}
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div onClick={() => setDetailProduct(p)} style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-.01em", cursor: "pointer", lineHeight: 1.3 }}>
            {getProductName(p, lang)}
          </div>
          <div style={{ fontSize: 11, color: C.mt, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {getProductDesc(p, lang)}
          </div>
          {p.allergens?.length > 0 && (
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {p.allergens.map(a => (
                <span key={a} style={{ fontSize: 9, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 4, padding: "1px 4px", color: C.mt, display: "flex", alignItems: "center", gap: 2 }}>
                  {ALLERGEN_ICONS[a]} {ALLERGEN_LABELS[a]}
                </span>
              ))}
            </div>
          )}
          {(p.prep_time || p.calories) && (
            <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.mt }}>
              {p.prep_time && <span>⏱ {p.prep_time}dk</span>}
              {p.calories && <span>🔥 {p.calories}kal</span>}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>₺{discPrice || p.price}</span>
              {discPrice && <span style={{ fontSize: 11, color: C.dm, textDecoration: "line-through" }}>₺{p.price}</span>}
            </div>
            {qty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 8, border: `1.5px solid ${A}20` }}>
                <button onClick={() => removeFromCart(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>−</button>
                <span style={{ fontWeight: 700, fontSize: 13, color: A, minWidth: 16, textAlign: "center" }}>{qty}</span>
                <button onClick={() => addToCart(p)} style={{ width: 28, height: 28, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 6px 6px 0" }}>+</button>
              </div>
            ) : (
              <button onClick={() => addToCart(p)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.bd}`, background: "transparent", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>+ Ekle</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.tx }} dir={isRTL ? "rtl" : "ltr"}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        ::-webkit-scrollbar{display:none}
        .cat-bar::-webkit-scrollbar{display:none}
        .product-grid{display:grid;grid-template-columns:1fr;gap:12px;padding:16px}
        @media(min-width:640px){.product-grid{grid-template-columns:1fr 1fr;gap:16px;padding:20px}}
        @media(min-width:1024px){.product-grid{grid-template-columns:1fr 1fr 1fr;gap:20px;padding:24px}}
        .page-container{max-width:1200px;margin:0 auto}
        .header-inner{max-width:1200px;margin:0 auto;padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
        .chef-section{max-width:1200px;margin:0 auto;padding:16px 20px 0}
        .search-section{max-width:1200px;margin:0 auto;padding:14px 20px 10px}
        .cat-section{max-width:1200px;margin:0 auto}
        .bottom-bar-inner{max-width:1200px;margin:0 auto;padding:10px 20px 16px;display:flex;gap:8px}
        .modal-inner{max-width:680px;width:100%;margin:0 auto}
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 100, padding: "7px 18px", fontSize: 12, fontWeight: 600, color: A, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.08)", animation: "toast .2s both" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: dark ? "#1E1E1E" : "#fff", borderBottom: `1px solid ${C.bd}`, position: "sticky", top: 0, zIndex: 30 }}>
        <div className="header-inner">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant!.name}</div>
            {restaurant!.hours && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginTop: 1 }}>● {restaurant!.hours}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
              {LANGS.map(l => (
                <button key={l.key} onClick={() => setLang(l.key)}
                  style={{ padding: "5px 6px", border: "none", cursor: "pointer", fontSize: 9, fontWeight: lang === l.key ? 700 : 400, fontFamily: "inherit", background: lang === l.key ? C.tx : "transparent", color: lang === l.key ? C.bg : C.mt, minWidth: 22, textAlign: "center" }}>
                  {l.label}
                </button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)}
              style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? "◐" : "◑"}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* WiFi */}
        {restaurant!.wifi_password && (
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.bd}` }}>
            <div onClick={() => { navigator.clipboard?.writeText(restaurant!.wifi_password!); flash("WiFi şifresi kopyalandı!"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
              <span style={{ fontSize: 10, color: C.mt, fontWeight: 600 }}>WiFi:</span>
              <code style={{ fontSize: 11, fontWeight: 600, color: C.tx, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 6, padding: "2px 8px" }}>{restaurant!.wifi_password}</code>
            </div>
          </div>
        )}

        {/* Chef's picks */}
        {chefPicks.length > 0 && !search && (
          <div className="chef-section">
            <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>Şefin Seçimi</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 } as React.CSSProperties}>
              {chefPicks.map(p => {
                const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;
                return (
                  <div key={p.id} onClick={() => setDetailProduct(p)} style={{ width: 180, flexShrink: 0, cursor: "pointer" }}>
                    <div style={{ position: "relative", width: 180, height: 120, borderRadius: 14, overflow: "hidden", marginBottom: 6 }}>
                      {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: `${A}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🍽</div>}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6), transparent 50%)" }} />
                      <div style={{ position: "absolute", bottom: 8, left: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{getProductName(p, lang)}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>₺{discPrice || p.price}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Arama */}
        <div className="search-section">
          <div style={{ position: "relative" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ماذا تبحث؟" : "Ne arıyorsunuz?"}
              style={{ width: "100%", padding: isRTL ? "11px 36px 11px 16px" : "11px 16px 11px 36px", borderRadius: 12, border: `1.5px solid ${search ? A + "40" : C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round"
              style={{ position: "absolute", [isRTL ? "right" : "left"]: 13, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
          </div>
        </div>

        {/* Kategoriler */}
        {!search && categories.length > 0 && (
          <div className="cat-section">
            <div className="cat-bar" style={{ display: "flex", borderBottom: `1px solid ${C.bd}`, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" } as React.CSSProperties}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                  style={{ flexShrink: 0, padding: "10px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: activeCat === cat.id ? 700 : 400, color: activeCat === cat.id ? C.tx : C.mt, background: "transparent", borderBottom: activeCat === cat.id ? `2px solid ${C.tx}` : "2px solid transparent", whiteSpace: "nowrap" }}>
                  {cat.name}
                  <span style={{ fontSize: 10, color: C.dm, marginLeft: 4 }}>({products.filter(p => p.category_id === cat.id).length})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ürünler — responsive grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.mt }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍽</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{search ? "Ürün bulunamadı" : "Bu kategoride ürün yok"}</div>
          </div>
        ) : (
          <div className="product-grid" style={{ paddingBottom: cartCount > 0 ? 100 : 40 }}>
            {filteredProducts.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0 80px", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
              <div style={{ width: 8, height: 1.5, background: A, borderRadius: 99 }} />
              <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em" }}><span style={{ color: C.dm }}>TEM</span><span style={{ color: A }}>EAT</span></span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${C.bd}`, background: C.bg, zIndex: 20 }}>
        <div className="bottom-bar-inner">
          <button onClick={() => flash("Garson çağrıldı!")}
            style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>
            {isRTL ? "اطلب النادل" : "Garson Çağır"}
          </button>
          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)}
              style={{ flex: 2, padding: "11px 16px", borderRadius: 11, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 4px 16px ${A}30` }}>
              <span>{isRTL ? "سلة" : "Sepetim"} · {cartCount}</span>
              <span style={{ fontWeight: 800 }}>₺{cartTotal}</span>
            </button>
          )}
        </div>
      </div>

      {/* Ürün Detay Modal */}
      {detailProduct && (
        <ModalWrapper onClick={() => setDetailProduct(null)} zIndex={60}>
          <div className="modal-inner" onClick={e => e.stopPropagation()}
            style={{ position: "relative", background: C.cd, borderRadius: "20px 20px 0 0", maxHeight: "85vh", overflowY: "auto", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
            <div style={{ position: "relative", width: "100%", height: 240 }}>
              {detailProduct.image_url
                ? <img src={detailProduct.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍽</div>
              }
              {detailProduct.discount_pct > 0 && (
                <div style={{ position: "absolute", top: 12, left: 12, background: A, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>-{detailProduct.discount_pct}%</div>
              )}
              <button onClick={() => setDetailProduct(null)} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,.35)", border: "none", cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ padding: "16px 24px 32px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{getProductName(detailProduct, lang)}</h2>
              {(detailProduct.prep_time || detailProduct.calories || detailProduct.serves) && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, color: C.mt }}>
                  {detailProduct.prep_time && <span>⏱ {detailProduct.prep_time} dk</span>}
                  {detailProduct.serves > 1 && <span>👤 {detailProduct.serves} kişilik</span>}
                  {detailProduct.calories && <span>🔥 {detailProduct.calories} kal</span>}
                </div>
              )}
              <p style={{ fontSize: 14, color: C.s2, lineHeight: 1.65, marginBottom: 16 }}>{getProductDesc(detailProduct, lang)}</p>
              {detailProduct.allergens?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.mt, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Alerjenler</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {detailProduct.allergens.map(a => (
                      <span key={a} style={{ fontSize: 12, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 8, padding: "4px 10px", color: C.tx, display: "flex", alignItems: "center", gap: 4 }}>
                        {ALLERGEN_ICONS[a]} {ALLERGEN_LABELS[a]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${C.bd}` }}>
                <div>
                  {detailProduct.discount_pct > 0
                    ? <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 26, fontWeight: 800 }}>₺{Math.round(detailProduct.price * (1 - detailProduct.discount_pct / 100))}</span>
                        <span style={{ fontSize: 14, color: C.dm, textDecoration: "line-through" }}>₺{detailProduct.price}</span>
                      </div>
                    : <span style={{ fontSize: 26, fontWeight: 800 }}>₺{detailProduct.price}</span>
                  }
                </div>
                <button onClick={() => { addToCart(detailProduct); setDetailProduct(null); }}
                  style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${A}30` }}>
                  + Sepete Ekle
                </button>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Sepet Modal */}
      {showCart && (
        <ModalWrapper onClick={() => setShowCart(false)} zIndex={40}>
          <div className="modal-inner" onClick={e => e.stopPropagation()}
            style={{ position: "relative", background: C.cd, borderRadius: "20px 20px 0 0", maxHeight: "70vh", display: "flex", flexDirection: "column", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.bd}` }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Sepetim</span>
              <button onClick={() => setShowCart(false)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 14, color: C.mt }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {cartItems.map(({ product: p, qty }) => {
                const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.bd}` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `${A}15` }}>
                      {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{getProductName(p, lang)}</div>
                      <div style={{ fontSize: 12, color: C.mt }}>₺{price}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.bd}`, borderRadius: 8 }}>
                      <button onClick={() => removeFromCart(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>−</button>
                      <span style={{ minWidth: 16, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{qty}</span>
                      <button onClick={() => addToCart(p)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.mt, fontSize: 14 }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: "right" }}>₺{price * qty}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 20px 28px", borderTop: `1px solid ${C.bd}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: C.mt }}>Toplam</span>
                <span style={{ fontSize: 24, fontWeight: 800 }}>₺{cartTotal}</span>
              </div>
              <button onClick={() => {
                let msg = `🍽️ *${restaurant!.name}*\n\n`;
                cartItems.forEach(({ product: p, qty }) => {
                  const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
                  msg += `${qty}× ${getProductName(p, lang)}  ₺${price * qty}\n`;
                });
                msg += `\nToplam: ₺${cartTotal}`;
                window.open(`https://wa.me/${restaurant!.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
              }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                WhatsApp ile Sipariş Ver
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}