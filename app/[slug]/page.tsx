"use client";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Category, Product } from "@/types";
import { DEFAULT_COLOR, LANGS, LangKey, PLANS } from "@/lib/constants";
import { getProductName, getProductDesc, getTranslatedName } from "@/lib/utils";
import { ProductCard } from "@/components/menu/ProductCard";
import { CartModal } from "@/components/menu/CartModal";
import { DetailModal } from "@/components/menu/DetailModal";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Logo from "../components/Logo";
import { ReviewModal } from "@/components/menu/ReviewModal";
import { SkeletonCard } from "@/components/menu/SkeletonCard";
import { Review } from "@/types";
import { UI_STRINGS } from "@/lib/translations";

export default function MenuPage(props: any) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading...</div>}>
      <MenuContent {...props} />
    </Suspense>
  );
}

function MenuContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const searchParams = useSearchParams();
  const tableNo = searchParams.get("table") || "";
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState<LangKey>("tr");
  const [dark, setDark] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; product: Product; qty: number; extras: any[] }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);

  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const catNavRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);

  const hasFeature = (feat: string) => {
    if (!restaurant) return false;
    const plan = (PLANS as any)[restaurant.plan || "free"];
    return plan?.features.includes(feat);
  };

  const A = restaurant?.theme_color || DEFAULT_COLOR;
  const o = dark ? 1 : 0;
  const isRTL = lang === "ar";
  const C = {
    bg: ["#FAFAFA", "#111111"][o],
    cd: ["#FFF", "#1E1E1E"][o],
    bd: ["#EBEBEB", "#2E2E2E"][o],
    tx: ["#111", "#F5F5F5"][o],
    mt: ["#777", "#888"][o],
    dm: ["#CCC", "#444"][o],
    al: ["#FFF5F0", "#2A1810"][o],
    s2: ["#555", "#BBBBBB"][o],
  };

  const t = UI_STRINGS[lang];

  useEffect(() => { loadMenu(); }, [slug]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0 || search) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrolling.current) return;
        
        const visibleEntry = entries.find((e) => e.isIntersecting);
        if (visibleEntry) {
          const catId = visibleEntry.target.id.replace("cat-", "");
          setActiveCat(catId);
          
          // Center active cat in nav
          const navItem = document.getElementById(`nav-${catId}`);
          if (navItem && catNavRef.current) {
            const container = catNavRef.current;
            const scrollLeft = navItem.offsetLeft - container.offsetWidth / 2 + navItem.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
          }
        }
      },
      { threshold: 0.1, rootMargin: "-100px 0px -70% 0px" }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, categories, search]);

  const flash = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 1400);
  }, []);

  const addToCart = (p: Product, extras: any[] = []) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id && JSON.stringify(item.extras) === JSON.stringify(extras));
      if (existing) {
        return prev.map(item => item === existing ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), product: p, qty: 1, extras }];
    });
    flash(getProductName(p, lang) + " " + t.added_to_cart);
  };
  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, qty: item.qty - 1 } : item).filter(item => item.qty > 0));
  };

  const cartItems = cart;
  const cartTotal = cartItems.reduce((s, item) => { 
    const p = item.product;
    const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price; 
    const extrasPrice = item.extras.reduce((sum, ex) => sum + ex.price, 0);
    return s + (price + extrasPrice) * item.qty; 
  }, 0);
  const cartCount = cartItems.reduce((s, item) => s + item.qty, 0);

  const handleCheckout = async (tableNo: string) => {
    if (!restaurant) return;
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      restaurant_id: restaurant.id,
      table_no: tableNo,
      status: "pending",
      total_amount: cartTotal
    }).select().single();
    
    if (orderError) { 
      console.error("Sipariş hatası (orders):", orderError);
      flash("Sipariş alınamadı: " + orderError.message); 
      return; 
    }
    
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.qty,
      price: item.product.price,
      extras_selected: item.extras
    }));
    
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("Sipariş kalemleri hatası:", itemsError);
      flash("Sipariş kalemleri kaydedilemedi.");
      return;
    }
    
    setCart([]);
    setShowCart(false);
    flash(t.order_success);
  };
  const filteredProducts = search
    ? products.filter(p => getProductName(p, lang).toLowerCase().includes(search.toLowerCase()))
    : activeCat ? products.filter(p => p.category_id === activeCat) : products;
  const chefPicks = products.filter(p => p.is_chef_pick);

  const scrollToCat = (catId: string) => {
    isAutoScrolling.current = true;
    setActiveCat(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const headerOffset = 130;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setTimeout(() => { isAutoScrolling.current = false; }, 800);
  };

  const loadMenu = async () => {
    const { data: rest } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
    if (!rest) { setNotFound(true); setLoading(false); return; }
    setRestaurant(rest);
    document.title = `${rest.name} Menüsü | TEMeat`;
    supabase.from("page_views").insert({ restaurant_id: rest.id, lang: navigator.language?.slice(0, 2) || "tr" });
    const { data: cats } = await supabase.from("categories").select("*").eq("restaurant_id", rest.id).order("sort_order");
    const { data: prods } = await supabase.from("products").select("*, extras:product_extras(*)").eq("restaurant_id", rest.id).eq("is_active", true).order("sort_order");
    setCategories(cats || []);
    setProducts(prods || []);
    if (cats && cats.length > 0) setActiveCat(cats[0].id);

    if (rest.show_reviews !== false) {
      const { data: revs } = await supabase.from("reviews").select("*").eq("restaurant_id", rest.id).eq("status", "approved").order("created_at", { ascending: false });
      setReviews(revs || []);
    }

    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ animation: "pulse 2s infinite ease-in-out" }}>
        <Logo size="lg" withTagline={false} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{t.waiting}</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", textAlign: "center", padding: 20 }}>
      <div>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", color: "#ddd" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>{lang === "tr" ? "Menü bulunamadı" : "Menu not found"}</h1>
        <p style={{ fontSize: 14, color: "#999" }}>{lang === "tr" ? "Bu adrese ait bir restoran yok." : "This restaurant could not be found."}</p>
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
      <div style={{ background: dark ? "#1E1E1E" : "#fff", borderBottom: `1px solid ${C.bd}`, position: "sticky", top: 0, zIndex: 30, boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,.05)" : "none", transition: "all .3s" }}>
        <div className="header-inner">
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
            {hasFeature("white_label") && restaurant!.logo_url && (
              <img src={restaurant!.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant!.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1 }}>
                {restaurant!.hours && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>● {restaurant!.hours.replace("-", " - ")}</div>}
                {restaurant!.show_reviews !== false && reviews.length > 0 && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                    { (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) }
                  </div>
                )}
              </div>
            </div>
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
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* WiFi */}
        {restaurant!.wifi_password && (
          <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.bd}` }}>
            <div onClick={() => { navigator.clipboard?.writeText(restaurant!.wifi_password!); flash(t.wifi_copied); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
              <span style={{ fontSize: 10, color: C.mt, fontWeight: 600 }}>WiFi:</span>
              <code style={{ fontSize: 11, fontWeight: 600, color: C.tx, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 6, padding: "2px 8px" }}>{restaurant!.wifi_password}</code>
            </div>
          </div>
        )}

        {/* Chef's picks */}
        {hasFeature("chef_picks") && chefPicks.length > 0 && !search && (
          <div className="chef-section">
            <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{t.chef}</div>
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
              placeholder={t.search}
              style={{ width: "100%", padding: isRTL ? "11px 36px 11px 16px" : "11px 16px 11px 36px", borderRadius: 12, border: `1.5px solid ${search ? A + "40" : C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round"
              style={{ position: "absolute", [isRTL ? "right" : "left"]: 13, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
          </div>
        </div>

        {/* Kategoriler - Sticky */}
        {!search && categories.length > 0 && (
          <div className="cat-section" style={{ position: "sticky", top: 60, zIndex: 25, background: C.bg, borderBottom: `1px solid ${C.bd}` }}>
            <div className="cat-bar" ref={catNavRef} style={{ display: "flex", overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" } as React.CSSProperties}>
              {categories.map(cat => (
                <button key={cat.id} id={`nav-${cat.id}`} onClick={() => scrollToCat(cat.id)}
                  style={{ flexShrink: 0, padding: "14px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: activeCat === cat.id ? 700 : 500, color: activeCat === cat.id ? A : C.mt, background: "transparent", borderBottom: activeCat === cat.id ? `3px solid ${A}` : "3px solid transparent", transition: "all .2s" }}>
                  {getTranslatedName(cat, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ürün Listesi */}
        <div style={{ paddingBottom: cartCount > 0 ? 120 : 40 }}>
          {search ? (
            <div className="product-grid">
              {filteredProducts.map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />
              ))}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: C.mt }}>Sonuç bulunamadı</div>
              )}
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} id={`cat-${cat.id}`} style={{ paddingBottom: 20 }}>
                <div style={{ padding: "20px 20px 8px", fontSize: 17, fontWeight: 800, letterSpacing: "-.02em", color: C.tx }}>{getTranslatedName(cat, lang)}</div>
                <div className="product-grid" style={{ paddingTop: 0 }}>
                  {products.filter(p => p.category_id === cat.id).map((p, i) => (
                    <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Yorumlar Bölümü */}
        {hasFeature("reviews") && restaurant!.show_reviews !== false && (
          <div style={{ padding: "30px 20px", borderTop: `1px solid ${C.bd}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>{t.reviews}</h3>
                <p style={{ fontSize: 12, color: C.mt }}>{t.review_desc}</p>
              </div>
              <button onClick={() => setShowReviewModal(true)} style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${A}`, background: "transparent", color: A, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {t.write_review}
              </button>
            </div>

            {reviews.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", background: C.cd, borderRadius: 16, border: `1px dashed ${C.bd}` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✍️</div>
                <div style={{ fontSize: 13, color: C.mt }}>{t.no_reviews}</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.slice(0, 5).map(rev => (
                  <div key={rev.id} style={{ padding: 16, borderRadius: 16, background: C.cd, border: `1px solid ${C.bd}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{rev.customer_name}</div>
                      <div style={{ color: "#f59e0b", fontSize: 12 }}>{"⭐".repeat(rev.rating)}</div>
                    </div>
                    {rev.comment && <div style={{ fontSize: 13, color: C.s2, lineHeight: "1.5" }}>{rev.comment}</div>}
                    {rev.owner_reply && (
                      <div style={{ marginTop: 10, padding: "10px 12px", background: `${A}08`, borderLeft: `2px solid ${A}`, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 4 }}>{t.business_reply}:</div>
                        <div style={{ fontSize: 12, color: C.s2 }}>{rev.owner_reply}</div>
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: C.dm, marginTop: 8 }}>{new Date(rev.created_at).toLocaleDateString("tr-TR")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!hasFeature("white_label") && (
          <div style={{ textAlign: "center", padding: "20px 0 80px", borderTop: `1px solid ${C.bd}` }}>
            <Logo size="sm" light={!dark} />
          </div>
        )}
        {hasFeature("white_label") && <div style={{ height: 80 }} />}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${C.bd}`, background: C.bg, zIndex: 20 }}>
        <div className="bottom-bar-inner">
          <button onClick={async () => {
            const { error } = await supabase.from("service_requests").insert({
              restaurant_id: restaurant!.id,
              table_no: tableNo || "—",
              type: "waiter",
              status: "pending"
            });
            if (!error) {
              flash(t.waiter_notified);
            } else {
              flash("Error!");
            }
          }}
            style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {t.waiter}
          </button>

          <button onClick={() => setShowPaymentSelect(true)}
            style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            {t.bill}
          </button>

          {hasFeature("cart") && restaurant?.accept_orders !== false && cartCount > 0 && (
            <button onClick={() => setShowCart(true)}
              style={{ flex: 1.5, padding: "11px 16px", borderRadius: 11, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 4px 16px ${A}30` }}>
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
          hasPrepInfo={hasFeature("prep_info")}
          hasCart={hasFeature("cart")}
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
          onCheckout={handleCheckout}
          initialTableNo={tableNo}
        />
      )}

      {/* Yorum Yap Modal */}
      {showReviewModal && restaurant && (
        <ReviewModal
          restaurant={restaurant}
          lang={lang}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            flash(t.waiter_notified);
            loadMenu();
          }}
        />
      )}
      {/* Ödeme Yöntemi Seçimi */}
      {showPaymentSelect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,.6)", animation: "fadeIn .3s" }}>
          <div onClick={() => setShowPaymentSelect(false)} style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "relative", width: "100%", maxWidth: 500, background: C.bg, borderTop: `1px solid ${C.bd}`, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", animation: "slideUp .4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ width: 40, height: 4, background: C.dm, borderRadius: 99, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>{t.payment_method}</h3>
            <p style={{ fontSize: 13, color: C.mt, marginBottom: 24, textAlign: "center" }}>{t.payment_desc}</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { id: "cash", label: t.cash, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> },
                { id: "card", label: t.card, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={async () => {
                    const payload: any = {
                      restaurant_id: restaurant!.id,
                      table_no: tableNo || "—",
                      type: "payment",
                      status: "pending"
                    };
                    if (m.id) payload.payment_method = m.id;

                    const { error } = await supabase.from("service_requests").insert(payload);
                    
                    setShowPaymentSelect(false);
                    if (!error) {
                      flash(t.bill_requested);
                    } else {
                      flash("Error!");
                    }
                  }}
                  style={{ width: "100%", padding: "16px", borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: "inherit" }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: A }}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowPaymentSelect(false)} style={{ width: "100%", marginTop: 16, padding: "14px", border: "none", background: "transparent", color: C.mt, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
