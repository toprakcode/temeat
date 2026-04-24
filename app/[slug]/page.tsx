"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Category, Product } from "@/types";
import { DEFAULT_COLOR, LANGS, LangKey } from "@/lib/constants";
import { getProductName, getProductDesc } from "@/lib/utils";
import { ProductCard } from "@/components/menu/ProductCard";
import { CartModal } from "@/components/menu/CartModal";
import { DetailModal } from "@/components/menu/DetailModal";

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
            {filteredProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                i={i}
                lang={lang}
                cartQty={cart[p.id] || 0}
                themeColor={A}
                C={C}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onClick={setDetailProduct}
              />
            ))}
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
        <DetailModal
          product={detailProduct}
          lang={lang}
          themeColor={A}
          C={C}
          onClose={() => setDetailProduct(null)}
          onAdd={addToCart}
        />
      )}

      {/* Sepet Modal */}
      {showCart && (
        <CartModal
          cartItems={cartItems}
          cartTotal={cartTotal}
          restaurant={restaurant}
          lang={lang}
          themeColor={A}
          C={C}
          isRTL={isRTL}
          onClose={() => setShowCart(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}