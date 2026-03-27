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
  const C = {
    bg: ["#FAFAFA", "#0B0B0B"][o], cd: ["#FFF", "#161616"][o],
    bd: ["#EBEBEB", "#232323"][o], tx: ["#111", "#EDEDED"][o],
    mt: ["#999", "#555"][o], dm: ["#CCC", "#333"][o], al: ["#FFF5F0", "#1C1210"][o],
    s2: ["#555", "#999"][o],
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
  const filteredProducts = search ? products.filter(p => getProductName(p, lang).toLowerCase().includes(search.toLowerCase())) : activeCat ? products.filter(p => p.category_id === activeCat) : products;
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
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.tx, position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 100, padding: "7px 18px", fontSize: 12, fontWeight: 600, color: A, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.08)", animation: "toast .2s both" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "14px 20px", background: dark ? "#111" : "#fff", borderBottom: `1px solid ${C.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 30 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em" }}>{restaurant!.name}</div>
          {restaurant!.hours && <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginTop: 1 }}>● {restaurant!.hours}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.bd}` }}>
            {LANGS.map(l => (
              <button key={l.key} onClick={() => setLang(l.key)}
                style={{ padding: "5px 7px", border: "none", cursor: "pointer", fontSize: 9, fontWeight: lang === l.key ? 700 : 400, fontFamily: "inherit", background: lang === l.key ? C.tx : "transparent", color: lang === l.key ? C.bg : C.mt, minWidth: 24, textAlign: "center" }}>
                {l.label}
              </button>
            ))}
          </div>
          <button onClick={() => setDark(!dark)}
            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {dark ? "◐" : "◑"}
          </button>
        </div>
      </div>

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
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>Şefin Seçimi</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {chefPicks.map(p => {
              const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;
              return (
                <div key={p.id} onClick={() => setDetailProduct(p)} style={{ width: 160, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 160, height: 110, borderRadius: 12, overflow: "hidden", marginBottom: 6 }}>
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
      <div style={{ padding: "14px 20px 10px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ne arıyorsunuz?"
            style={{ width: "100%", padding: "11px 16px 11px 36px", borderRadius: 12, border: `1.5px solid ${search ? A + "40" : C.bd}`, background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </div>
      </div>

      {/* Kategoriler */}
      {!search && categories.length > 0 && (
        <div style={{ padding: "0 20px 10px", display: "flex", gap: 0, borderBottom: `1px solid ${C.bd}`, overflowX: "auto" }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              style={{ flex: "0 0 auto", padding: "10px 14px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: activeCat === cat.id ? 700 : 400, color: activeCat === cat.id ? C.tx : C.mt, background: "transparent", borderBottom: activeCat === cat.id ? `2px solid ${C.tx}` : "2px solid transparent" }}>
              {cat.name}
              <span style={{ fontSize: 9, color: C.dm, marginLeft: 3 }}>({products.filter(p => p.category_id === cat.id).length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Ürünler */}
      <div style={{ paddingBottom: cartCount > 0 ? 130 : 80 }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.mt }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍽</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{search ? "Ürün bulunamadı" : "Bu kategoride ürün yok"}</div>
          </div>
        ) : (
          filteredProducts.map((p, i) => {
            const qty = cart[p.id] || 0;
            const discPrice = p.discount_pct ? Math.round(p.price * (1 - p.discount_pct / 100)) : null;
            return (
              <div key={p.id} style={{ padding: "0 20px", animation: `fadeUp .4s ${i * .03}s both` }}>
                <div style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: `1px solid ${C.bd}` }}>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div onClick={() => setDetailProduct(p)} style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, letterSpacing: "-.02em", cursor: "pointer" }}>
                      {getProductName(p, lang)}
                    </div>
                    <div style={{ fontSize: 12, color: C.mt, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {getProductDesc(p, lang)}
                    </div>
                    {/* Alerjenler */}
                    {p.allergens?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                        {p.allergens.map(a => (
                          <span key={a} title={ALLERGEN_LABELS[a]} style={{ fontSize: 10, background: C.cd, border: `1px solid ${C.bd}`, borderRadius: 5, padding: "1px 5px", color: C.mt, display: "flex", alignItems: "center", gap: 2 }}>
                            {ALLERGEN_ICONS[a]} {ALLERGEN_LABELS[a]}
                          </span>
                        ))}
                      </div>
                    )}
                    {(p.prep_time || p.calories) && (
                      <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.mt, marginBottom: 8 }}>
                        {p.prep_time && <span>{p.prep_time} dk</span>}
                        {p.calories && <span>{p.calories} kal</span>}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 700 }}>₺{discPrice || p.price}</span>
                      {discPrice && <span style={{ fontSize: 12, color: C.dm, textDecoration: "line-through" }}>₺{p.price}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div onClick={() => setDetailProduct(p)} style={{ width: 90, height: 90, borderRadius: 14, overflow: "hidden", position: "relative", cursor: "pointer" }}>
                      {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🍽</div>}
                      {p.discount_pct > 0 && <div style={{ position: "absolute", top: 4, left: 4, background: A, color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>-{p.discount_pct}%</div>}
                    </div>
                    {qty > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 9, border: `1.5px solid ${A}20`, width: 90 }}>
                        <button onClick={() => removeFromCart(p)} style={{ flex: 1, height: 30, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 13, color: A, minWidth: 16, textAlign: "center" }}>{qty}</span>
                        <button onClick={() => addToCart(p)} style={{ flex: 1, height: 30, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 7px 7px 0" }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} style={{ width: 90, height: 30, borderRadius: 9, border: `1.5px solid ${C.bd}`, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>+ Ekle</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 0 24px", borderTop: `1px solid ${C.bd}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 8, height: 1.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em" }}><span style={{ color: C.dm }}>TEM</span><span style={{ color: A }}>EAT</span></span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", borderTop: `1px solid ${C.bd}`, background: C.bg, padding: "10px 20px 16px", display: "flex", gap: 8, zIndex: 20 }}>
        <button onClick={() => flash("Garson çağrıldı!")}
          style={{ flex: 1, padding: 11, borderRadius: 11, border: `1.5px solid ${C.bd}`, background: C.cd, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>
          Garson Çağır
        </button>
        {cartCount > 0 && (
          <button onClick={() => setShowCart(true)}
            style={{ flex: 2, padding: "11px 16px", borderRadius: 11, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 4px 16px ${A}30` }}>
            <span>Sepetim · {cartCount}</span>
            <span style={{ fontWeight: 800 }}>₺{cartTotal}</span>
          </button>
        )}
      </div>

      {/* Ürün Detay Modal */}
      {detailProduct && (
        <div>
          <div onClick={() => setDetailProduct(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 60, animation: "fadeIn .15s" }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 70, maxHeight: "85vh", overflowY: "auto", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
            {/* Ürün görseli */}
            <div style={{ position: "relative", width: "100%", height: 220 }}>
              {detailProduct.image_url
                ? <img src={detailProduct.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍽</div>
              }
              {detailProduct.discount_pct > 0 && (
                <div style={{ position: "absolute", top: 12, left: 12, background: A, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>
                  -{detailProduct.discount_pct}%
                </div>
              )}
              <button onClick={() => setDetailProduct(null)} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 99, background: "rgba(0,0,0,.35)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ padding: "16px 20px 32px" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-.03em" }}>{getProductName(detailProduct, lang)}</h2>
              {/* Meta bilgiler */}
              {(detailProduct.prep_time || detailProduct.calories || detailProduct.serves) && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, color: C.mt }}>
                  {detailProduct.prep_time && <span>⏱ {detailProduct.prep_time} dk</span>}
                  {detailProduct.serves > 1 && <span>👤 {detailProduct.serves} kişilik</span>}
                  {detailProduct.calories && <span>🔥 {detailProduct.calories} kal</span>}
                </div>
              )}
              {/* Açıklama */}
              <p style={{ fontSize: 14, color: C.s2, lineHeight: 1.65, marginBottom: 16 }}>{getProductDesc(detailProduct, lang)}</p>
              {/* Alerjenler */}
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
              {/* Fiyat + Ekle */}
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
        </div>
      )}

      {/* Sepet Modal */}
      {showCart && (
        <div>
          <div onClick={() => setShowCart(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 40, animation: "fadeIn .15s" }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 50, maxHeight: "70vh", display: "flex", flexDirection: "column", animation: "slideUp .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.bd}` }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Sepetim</span>
              <button onClick={() => setShowCart(false)} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.bd}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt }}>×</button>
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
        </div>
      )}
    </div>
  );
}