"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Category, Product, Review } from "@/types";
import { DEFAULT_COLOR, LANGS, LangKey, PLANS } from "@/lib/constants";
import { getProductName, getProductDesc, getTranslatedName } from "@/lib/utils";
import { ProductCard } from "@/components/menu/ProductCard";
import { CartModal } from "@/components/menu/CartModal";
import { DetailModal } from "@/components/menu/DetailModal";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Logo from "../components/Logo";
import { ReviewModal } from "@/components/menu/ReviewModal";
import { UI_STRINGS } from "@/lib/translations";
import Link from "next/link";

export default function MenuPage(props: any) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading...</div>}>
      <MenuContent {...props} />
    </Suspense>
  );
}

function MenuContent({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = React.use(paramsPromise);
  const slug = params.slug;
  const searchParams = useSearchParams();
  const tableNo = searchParams.get("table") || "";
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState<LangKey>("tr");
  const [dark, setDark] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; product: Product; qty: number; extras: any[] }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`last_order_${slug}`);
    if (saved) setLastOrderId(saved);
  }, [slug]);
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);

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

  const loadMenu = async () => {
    try {
      const { data: rest, error: restError } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
      if (restError || !rest) { setNotFound(true); setLoading(false); return; }
      setRestaurant(rest);

      const [catsRes, prodsRes] = await Promise.all([
        supabase.from("categories").select("*").eq("restaurant_id", rest.id).order("sort_order"),
        supabase.from("products").select("*, extras:product_extras(*)").eq("restaurant_id", rest.id).eq("is_active", true).order("sort_order")
      ]);

      // AI-POWERED DYNAMIC SEO
      const topCategories = catsRes.data?.slice(0, 2).map(c => c.name).join(", ");
      document.title = `${rest.name} | En İyi ${topCategories || "Lezzetler"} - Dijital Menü`;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      const descContent = `${rest.name} restoranının dijital menüsünü inceleyin. ${topCategories} ve daha fazlası en taze haliyle sizi bekliyor.`;
      if (metaDesc) metaDesc.setAttribute("content", descContent);
      else {
        const meta = document.createElement('meta');
        meta.name = "description";
        meta.content = descContent;
        document.head.appendChild(meta);
      }
      
      supabase.from("page_views").insert({ restaurant_id: rest.id, lang: navigator.language?.slice(0, 2) || "tr" }).then();

      setCategories(catsRes.data || []);
      setProducts(prodsRes.data || []);
      if (catsRes.data && catsRes.data.length > 0) setActiveCat(catsRes.data[0].id);

      if (rest.show_reviews !== false) {
        const { data: revs } = await supabase.from("reviews").select("*").eq("restaurant_id", rest.id).eq("status", "approved").order("created_at", { ascending: false });
        setReviews(revs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenu(); }, [slug]);

  useEffect(() => {
    // Mobil için güvenlik zamanlayıcısı (5sn)
    const safety = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0 || search) return;
    const observer = new IntersectionObserver((entries) => {
      if (isAutoScrolling.current) return;
      const visibleEntry = entries.find((e) => e.isIntersecting);
      if (visibleEntry) {
        const catId = visibleEntry.target.id.replace("cat-", "");
        setActiveCat(catId);
        const navItem = document.getElementById(`nav-${catId}`);
        if (navItem && catNavRef.current) {
          const container = catNavRef.current;
          const scrollLeft = navItem.offsetLeft - container.offsetWidth / 2 + navItem.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
      }
    }, { threshold: 0.1, rootMargin: "-100px 0px -70% 0px" });
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
      if (existing) return prev.map(item => item === existing ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), product: p, qty: 1, extras }];
    });
    flash(getProductName(p, lang) + " " + t.added_to_cart);
  };
  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, qty: item.qty - 1 } : item).filter(item => item.qty > 0));
  };

  const cartTotal = cart.reduce((s, item) => { 
    const p = item.product;
    const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price; 
    const extrasPrice = item.extras.reduce((sum, ex) => sum + ex.price, 0);
    return s + (price + extrasPrice) * item.qty; 
  }, 0);
  const cartCount = cart.reduce((s, item) => s + item.qty, 0);

  const handleCheckout = async (tableNum: string) => {
    if (!restaurant) return;
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      restaurant_id: restaurant.id,
      table_no: tableNum,
      status: "pending",
      total_amount: cartTotal
    }).select().single();
    if (orderError) { flash("Hata!"); return; }
    
    // Save to localStorage for persistence
    localStorage.setItem(`last_order_${slug}`, order.id);

    const orderItems = cart.map(item => ({ order_id: order.id, product_id: item.product.id, quantity: item.qty, price: item.product.price, extras_selected: item.extras }));
    await supabase.from("order_items").insert(orderItems);
    setCart([]);
    setShowCart(false);
    flash(t.order_success);
    
    // Redirect to tracking page
    setTimeout(() => {
      window.location.href = `/${slug}/order/${order.id}`;
    }, 1500);
  };

  const scrollToCat = (catId: string) => {
    isAutoScrolling.current = true;
    setActiveCat(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const headerOffset = 160;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setTimeout(() => { isAutoScrolling.current = false; }, 800);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ animation: "pulse 2s infinite ease-in-out" }}><Logo size="lg" withTagline={false} /></div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{t.waiting}</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.98)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
      <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Menü bulunamadı</h1></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.tx }} dir={isRTL ? "rtl" : "ltr"}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        ::-webkit-scrollbar{display:none}
        .cat-bar::-webkit-scrollbar{display:none}
        .product-grid{display:grid;grid-template-columns:1fr;gap:20px;padding:20px}
        @media(min-width:640px){.product-grid{grid-template-columns:1fr 1fr;gap:20px;padding:24px}}
        @media(min-width:1024px){.product-grid{grid-template-columns:1fr 1fr 1fr;gap:24px;padding:32px}}
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 400, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 100, padding: "7px 18px", fontSize: 12, fontWeight: 600, color: A, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.08)", animation: "toast .2s both" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: dark ? "#1E1E1E" : "#fff", borderBottom: `1px solid ${C.bd}`, position: "sticky", top: 0, zIndex: 30, boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,.08)" : "none", transition: "all .3s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 16 }}>
            {hasFeature("white_label") && restaurant!.logo_url ? (
              <img src={restaurant!.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 14, objectFit: "cover" }} />
            ) : (
              <Logo size="sm" withTagline={false} isDark={dark} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", color: C.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant!.name}</div>
              </div>
              {restaurant!.hours && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginTop: 4 }}>● {restaurant!.hours.replace("-", " - ")}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
            {/* Premium Language Switcher (Black Pill) */}
            <div style={{ display: "flex", background: "#000", borderRadius: 12, padding: 4 }}>
              {LANGS.map(l => (
                <button key={l.key} onClick={() => setLang(l.key)} 
                  style={{ 
                    padding: "6px 8px", 
                    border: "none", 
                    cursor: "pointer", 
                    fontSize: 10, 
                    fontWeight: lang === l.key ? 800 : 400, 
                    background: lang === l.key ? "#333" : "transparent", 
                    color: "#fff", 
                    borderRadius: 8,
                    minWidth: 28
                  }}>
                  {l.label.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.bd}`, background: C.cd, cursor: "pointer", color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* WiFi Section (Prominent like Demo) */}
        {restaurant!.wifi_password && (
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.bd}`, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                <span style={{ fontSize: 13, color: C.mt, fontWeight: 500 }}>WiFi:</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(restaurant!.wifi_password!);
                    flash("WiFi Şifresi Kopyalandı!");
                  }}
                  style={{ background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: C.tx, cursor: "pointer" }}
                >
                  {restaurant!.wifi_password}
                </button>
             </div>
          </div>
        )}

        {/* Chef's Picks (Premium Feature from Demo) */}
        {products.filter(p => p.is_chef_pick && p.is_active).length > 0 && !search && (
          <div style={{ padding: "20px 20px 10px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: A, marginBottom: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>{t.chef}</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {products.filter(p => p.is_chef_pick && p.is_active).map((p) => (
                <div key={p.id} onClick={() => setDetailProduct(p)} style={{ width: 200, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 200, height: 130, borderRadius: 20, overflow: "hidden", marginBottom: 10, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}>
                    {p.image_url ? (
                      <img src={p.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.5" style={{ opacity: 0.3 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.8), transparent 60%)" }} />
                    <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getProductName(p, lang)}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginTop: 4 }}>₺{p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search */}
        <div style={{ padding: "20px 20px 12px" }}>
          <div style={{ position: "relative" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14, border: `1.5px solid ${search ? A + "40" : C.bd}`, background: C.cd, color: C.tx, fontSize: 15, outline: "none" }} />
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.4, display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
          </div>
        </div>

        {/* Categories */}
        {!search && categories.length > 0 && (
          <div style={{ position: "sticky", top: 84, zIndex: 25, background: dark ? "#1E1E1E" : "#fff", borderBottom: `1px solid ${C.bd}`, marginBottom: 12 }}>
            <div className="cat-bar" ref={catNavRef} style={{ display: "flex", overflowX: "auto" }}>
              {categories.map(cat => (
                <button key={cat.id} id={`nav-${cat.id}`} onClick={() => scrollToCat(cat.id)} style={{ flexShrink: 0, padding: "16px 20px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: activeCat === cat.id ? 800 : 500, color: activeCat === cat.id ? A : C.mt, background: "transparent", borderBottom: activeCat === cat.id ? `3px solid ${A}` : "3px solid transparent" }}>
                  {getTranslatedName(cat, lang)}
                </button>
              ))}
            </div>
          </div>
        )}



        {/* Products */}
        <div style={{ paddingBottom: 180 }}>
          {search ? (
            <div className="product-grid">
              {products.filter(p => getProductName(p, lang).toLowerCase().includes(search.toLowerCase())).map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} isAIChoice={p.discount_pct > 15 || i === 0} />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <div style={{ padding: "20px 20px 8px", fontSize: 17, fontWeight: 800, color: C.tx }}>{getTranslatedName(cat, lang)}</div>
                <div className="product-grid">
                  {products.filter(p => p.category_id === cat.id).map((p, i) => (
                    <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} isAIChoice={p.discount_pct > 15 || i === 0} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews Section */}
        {restaurant?.show_reviews !== false && (
          <div style={{ padding: "0 20px 120px", marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.tx }}>{t.reviews}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <div style={{ color: "#f59e0b", display: "flex" }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: C.mt, fontWeight: 600 }}>({reviews.length})</span>
                </div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ padding: 16, borderRadius: 16, background: C.cd, border: `1px solid ${C.bd}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>{rev.customer_name}</div>
                      <div style={{ color: "#f59e0b", display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= rev.rating ? "#f59e0b" : "none"} stroke={s <= rev.rating ? "#f59e0b" : "#DDD"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        ))}
                      </div>
                    </div>
                    {rev.comment && <div style={{ fontSize: 13, color: C.s2, lineHeight: "1.5" }}>{rev.comment}</div>}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 10, fontWeight: 600 }}>
                      {new Date(rev.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", background: C.cd, borderRadius: 20, border: `1px dashed ${C.bd}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: C.mt }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div style={{ fontSize: 14, color: C.mt, fontWeight: 500 }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar (Premium Action Buttons) */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${C.bd}`, background: C.cd, zIndex: 40, padding: "20px 20px 48px", display: "flex", gap: 16, boxShadow: "0 -4px 20px rgba(0,0,0,.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 16, width: "100%" }}>
          <button onClick={async () => {
            await supabase.from("service_requests").insert({ restaurant_id: restaurant!.id, table_no: tableNo || "—", type: "waiter", status: "pending" });
            flash(t.waiter_notified);
          }} style={{ flex: 1, height: 60, borderRadius: 18, border: `1px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>{t.waiter}</span>
          </button>
          
          <button onClick={() => setShowPaymentSelect(true)} style={{ flex: 1, height: 60, borderRadius: 18, border: `1px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>{t.bill}</span>
          </button>

          {lastOrderId && (
            <Link href={`/${slug}/order/${lastOrderId}`} style={{ flex: 1, height: 60, borderRadius: 18, border: `1.5px solid ${A}60`, background: `${A}20`, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Takip Et
            </Link>
          )}

          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)} style={{ position: "absolute", top: -80, right: 20, padding: "14px 24px", borderRadius: 100, border: "none", background: A, color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 10px 30px ${A}40`, animation: "toast .3s both" }}>
               <span>{cartCount}x</span>
               <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.3)" }} />
               <span>₺{cartTotal}</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailProduct && <DetailModal product={detailProduct} allProducts={products} categories={categories} lang={lang} themeColor={A} C={C} onClose={() => setDetailProduct(null)} onAdd={addToCart} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />}
      {showCart && <CartModal cartItems={cart} cartTotal={cartTotal} restaurant={restaurant!} lang={lang} themeColor={A} C={C} isRTL={isRTL} onClose={() => setShowCart(false)} onAdd={addToCart} onRemove={removeFromCart} onCheckout={handleCheckout} initialTableNo={tableNo} />}
      {showReviewModal && <ReviewModal restaurant={restaurant!} lang={lang} onClose={() => setShowReviewModal(false)} onSuccess={() => flash(t.order_success)} />}
      
      {showPaymentSelect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: C.bg, padding: "24px 20px 40px", borderRadius: "24px 24px 0 0" }}>
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>{t.payment_method}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={async () => { await supabase.from("service_requests").insert({ restaurant_id: restaurant!.id, table_no: tableNo || "—", type: "payment", payment_method: "cash", status: "pending" }); setShowPaymentSelect(false); flash(t.bill_requested); }} style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, fontWeight: 700 }}>{t.cash}</button>
              <button onClick={async () => { await supabase.from("service_requests").insert({ restaurant_id: restaurant!.id, table_no: tableNo || "—", type: "payment", payment_method: "card", status: "pending" }); setShowPaymentSelect(false); flash(t.bill_requested); }} style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, fontWeight: 700 }}>{t.card}</button>
            </div>
            <button onClick={() => setShowPaymentSelect(false)} style={{ width: "100%", marginTop: 16, background: "transparent", border: "none", color: C.mt }}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
