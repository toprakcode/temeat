"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Restaurant, Category, Product, Review } from "@/types";
import { DEFAULT_COLOR, LANGS, LangKey, PLANS } from "@/lib/constants";
import { getProductName, getTranslatedName } from "@/lib/utils";
import { ProductCard } from "@/components/menu/ProductCard";
import { CartModal } from "@/components/menu/CartModal";
import { DetailModal } from "@/components/menu/DetailModal";
import { ReviewModal } from "@/components/menu/ReviewModal";
import { UI_STRINGS } from "@/lib/translations";
import Logo from "../components/Logo";
import { supabase } from "@/lib/supabase";

interface MenuClientProps {
  initialRestaurant: Restaurant;
  initialCategories: Category[];
  initialProducts: Product[];
  initialReviews: Review[];
  tableNo: string;
  slug: string;
}

export default function MenuClient({ 
  initialRestaurant, 
  initialCategories, 
  initialProducts, 
  initialReviews,
  tableNo,
  slug
}: MenuClientProps) {
  const [restaurant] = useState<Restaurant>(initialRestaurant);
  const [categories] = useState<Category[]>(initialCategories);
  const [products] = useState<Product[]>(initialProducts);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  const [lang, setLang] = useState<LangKey>("tr");
  const [dark, setDark] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(initialCategories[0]?.id || null);
  const [cart, setCart] = useState<{ id: string; product: Product; qty: number; extras: any[] }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);

  const catNavRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);

  const hasFeature = (feat: string) => {
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (categories.length === 0 || search) return;

    const observer = new IntersectionObserver(
      (entries) => {
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
      },
      { threshold: 0.1, rootMargin: "-100px 0px -70% 0px" }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, search]);

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

  const cartTotal = cart.reduce((s, item) => { 
    const p = item.product;
    const price = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price; 
    const extrasPrice = item.extras.reduce((sum, ex) => sum + ex.price, 0);
    return s + (price + extrasPrice) * item.qty; 
  }, 0);
  const cartCount = cart.reduce((s, item) => s + item.qty, 0);

  const handleCheckout = async (tableNum: string) => {
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      restaurant_id: restaurant.id,
      table_no: tableNum,
      status: "pending",
      total_amount: cartTotal
    }).select().single();
    
    if (orderError) { flash("Sipariş hatası!"); return; }
    
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.qty,
      price: item.product.price,
      extras_selected: item.extras
    }));
    
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
      const headerOffset = 130;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setTimeout(() => { isAutoScrolling.current = false; }, 800);
  };

  const filteredProducts = search
    ? products.filter(p => getProductName(p, lang).toLowerCase().includes(search.toLowerCase()))
    : activeCat ? products.filter(p => p.category_id === activeCat) : products;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.tx }} dir={isRTL ? "rtl" : "ltr"}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        ::-webkit-scrollbar{display:none}
        .cat-bar::-webkit-scrollbar{display:none}
        .product-grid{display:grid;grid-template-columns:1fr;gap:12px;padding:16px}
        @media(min-width:640px){.product-grid{grid-template-columns:1fr 1fr;gap:16px;padding:20px}}
        @media(min-width:1024px){.product-grid{grid-template-columns:1fr 1fr 1fr;gap:20px;padding:24px}}
        .header-inner{max-width:1200px;margin:0 auto;padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
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
            {hasFeature("white_label") && restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
            ) : (
              <Logo size="sm" withTagline={false} isDark={dark} />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{restaurant.name}</div>
              {restaurant.hours && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>● {restaurant.hours.replace("-", " - ")}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
              {LANGS.map(l => (
                <button key={l.key} onClick={() => setLang(l.key)} style={{ padding: "5px 6px", border: "none", cursor: "pointer", fontSize: 9, fontWeight: lang === l.key ? 700 : 400, background: lang === l.key ? C.tx : "transparent", color: lang === l.key ? C.bg : C.mt }}>{l.label}</button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Search */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ position: "relative" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search} style={{ width: "100%", padding: "11px 16px 11px 36px", borderRadius: 12, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 14, outline: "none" }} />
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>🔍</span>
          </div>
        </div>

        {/* Categories */}
        {!search && categories.length > 0 && (
          <div style={{ position: "sticky", top: 60, zIndex: 25, background: C.bg, borderBottom: `1px solid ${C.bd}` }}>
            <div className="cat-bar" ref={catNavRef} style={{ display: "flex", overflowX: "auto" }}>
              {categories.map(cat => (
                <button key={cat.id} id={`nav-${cat.id}`} onClick={() => scrollToCat(cat.id)} style={{ flexShrink: 0, padding: "14px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeCat === cat.id ? 700 : 500, color: activeCat === cat.id ? A : C.mt, background: "transparent", borderBottom: activeCat === cat.id ? `3px solid ${A}` : "3px solid transparent" }}>
                  {getTranslatedName(cat, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div style={{ paddingBottom: 100 }}>
          {search ? (
            <div className="product-grid">
              {filteredProducts.map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <div style={{ padding: "20px 20px 8px", fontSize: 17, fontWeight: 800, color: C.tx }}>{getTranslatedName(cat, lang)}</div>
                <div className="product-grid">
                  {products.filter(p => p.category_id === cat.id).map((p, i) => (
                    <ProductCard key={p.id} p={p} i={i} lang={lang} cartQty={cart.filter(item => item.product.id === p.id).reduce((s, item) => s + item.qty, 0)} themeColor={A} C={C} onAdd={addToCart} onRemove={(prod) => { const item = cart.find(c => c.product.id === prod.id); if (item) removeFromCart(item.id); }} onClick={setDetailProduct} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${C.bd}`, background: C.bg, zIndex: 20, padding: "10px 20px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 8 }}>
          <button onClick={async () => {
            await supabase.from("service_requests").insert({ restaurant_id: restaurant.id, table_no: tableNo || "—", type: "waiter", status: "pending" });
            flash(t.waiter_notified);
          }} style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 11, fontWeight: 600 }}>{t.waiter}</button>
          
          <button onClick={() => setShowPaymentSelect(true)} style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, color: C.tx, fontSize: 11, fontWeight: 600 }}>{t.bill}</button>

          {cartCount > 0 && (
            <button onClick={() => setShowCart(true)} style={{ flex: 1.5, padding: "11px 16px", borderRadius: 11, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700 }}>₺{cartTotal}</button>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailProduct && <DetailModal product={detailProduct} lang={lang} themeColor={A} C={C} onClose={() => setDetailProduct(null)} onAdd={addToCart} hasPrepInfo={hasFeature("prep_info")} hasCart={hasFeature("cart")} />}
      {showCart && <CartModal cartItems={cart} cartTotal={cartTotal} restaurant={restaurant} lang={lang} themeColor={A} C={C} isRTL={isRTL} onClose={() => setShowCart(false)} onAdd={addToCart} onRemove={removeFromCart} onCheckout={handleCheckout} initialTableNo={tableNo} />}
      {showReviewModal && <ReviewModal restaurant={restaurant} lang={lang} onClose={() => setShowReviewModal(false)} onSuccess={() => flash(t.order_success)} />}
      
      {showPaymentSelect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: C.bg, padding: "24px 20px 40px", borderRadius: "24px 24px 0 0" }}>
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>{t.payment_method}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={async () => { await supabase.from("service_requests").insert({ restaurant_id: restaurant.id, table_no: tableNo || "—", type: "payment", payment_method: "cash", status: "pending" }); setShowPaymentSelect(false); flash(t.bill_requested); }} style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, fontWeight: 700 }}>{t.cash}</button>
              <button onClick={async () => { await supabase.from("service_requests").insert({ restaurant_id: restaurant.id, table_no: tableNo || "—", type: "payment", payment_method: "card", status: "pending" }); setShowPaymentSelect(false); flash(t.bill_requested); }} style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${C.bd}`, background: C.cd, fontWeight: 700 }}>{t.card}</button>
            </div>
            <button onClick={() => setShowPaymentSelect(false)} style={{ width: "100%", marginTop: 16, background: "transparent", border: "none", color: C.mt }}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
