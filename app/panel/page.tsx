"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Category, Product } from "@/types";
import { DEFAULT_COLOR, ALLERGENS } from "@/lib/constants";
import { BarChart } from "@/components/panel/BarChart";
import { ProductModal } from "@/components/panel/ProductModal";
import { Sidebar } from "@/components/panel/Sidebar";
import { SettingsForm } from "@/components/panel/SettingsForm";
import QRCode from "react-qr-code";

const A_GLOBAL = DEFAULT_COLOR; 

const weeklyData = [
  { day: "Pzt", views: 0, orders: 0 },
  { day: "Sal", views: 0, orders: 0 },
  { day: "Çar", views: 0, orders: 0 },
  { day: "Per", views: 0, orders: 0 },
  { day: "Cum", views: 0, orders: 0 },
  { day: "Cmt", views: 0, orders: 0 },
  { day: "Paz", views: 0, orders: 0 },
];



export default function PanelPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catFilter, setCatFilter] = useState("Tümü");

  const [obName, setObName] = useState("");
  const [obSlug, setObSlug] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obAddress, setObAddress] = useState("");
  const [obSaving, setObSaving] = useState(false);
  const [obError, setObError] = useState<string | null>(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [thisWeekViews, setThisWeekViews] = useState(0);
  const [lastWeekViews, setLastWeekViews] = useState(0);
  const [totalViewsReal, setTotalViewsReal] = useState(0);
  const [weeklyViews, setWeeklyViews] = useState<{day:string;views:number;orders:number}[]>([]);
  const [dynamicLangData, setDynamicLangData] = useState<{lang: string, pct: number, color: string}[]>([]);

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = "/auth"; }
      else { setUser(session.user); checkRestaurant(session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) window.location.href = "/auth";
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkRestaurant = async (userId: string) => {
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) { setRestaurant(data); loadMenuData(data); }
    else setShowOnboarding(true);
    setLoading(false);
  };

  const loadMenuData = async (restData: any) => {
    const restaurantId = restData.id;
    const themeColor = restData.theme_color || DEFAULT_COLOR;
    const { data: cats } = await supabase.from("categories").select("*").eq("restaurant_id", restaurantId).order("sort_order");
    const { data: prods } = await supabase.from("products").select("*").eq("restaurant_id", restaurantId).order("sort_order");
    setCategories(cats || []);
    setProducts(prods || []);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [{ data: thisWeek }, { data: lastWeek }, { count: total }] = await Promise.all([
      supabase.from("page_views").select("viewed_at, lang").eq("restaurant_id", restaurantId).gte("viewed_at", weekAgo.toISOString()),
      supabase.from("page_views").select("viewed_at").eq("restaurant_id", restaurantId).gte("viewed_at", twoWeeksAgo.toISOString()).lt("viewed_at", weekAgo.toISOString()),
      supabase.from("page_views").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
    ]);
    setThisWeekViews(thisWeek?.length || 0);
    setLastWeekViews(lastWeek?.length || 0);
    setTotalViewsReal(total || 0);
    const days = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
    setWeeklyViews(days.map((day, i) => {
      const dayStart = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      return {
        day,
        views: thisWeek?.filter(v => { const d = new Date(v.viewed_at); return d >= dayStart && d < dayEnd; }).length || 0,
        orders: 0,
      };
    }));

    if (thisWeek && thisWeek.length > 0) {
      const counts: Record<string, number> = {};
      thisWeek.forEach(v => {
        const l = v.lang || "tr";
        counts[l] = (counts[l] || 0) + 1;
      });
      const LABELS: Record<string, { label: string, color: string }> = {
        tr: { label: "Türkçe", color: themeColor },
        en: { label: "English", color: "#3b82f6" },
        ar: { label: "العربية", color: "#10b981" },
        de: { label: "Deutsch", color: "#f59e0b" },
        ru: { label: "Русский", color: "#8b5cf6" },
      };
      const computedLangData = Object.entries(counts)
        .map(([k, count]) => {
          const info = LABELS[k] || { label: k, color: "#888" };
          return { lang: info.label, pct: Math.round((count / thisWeek.length) * 100), color: info.color };
        })
        .sort((a, b) => b.pct - a.pct);
      setDynamicLangData(computedLangData);
    } else {
      setDynamicLangData([]);
    }
  };

  const handleOnboardingSave = async () => {
    if (!obName.trim()) { setObError("Restoran adı zorunlu."); return; }
    if (!obSlug.trim()) { setObError("Menü adresi zorunlu."); return; }
    if (!/^[a-z0-9-]+$/.test(obSlug)) { setObError("Sadece küçük harf, rakam ve - kullanın."); return; }
    setObSaving(true); setObError(null);
    const { data, error } = await supabase.from("restaurants").insert({ user_id: user.id, name: obName.trim(), slug: obSlug.trim(), phone: obPhone.trim(), address: obAddress.trim() }).select().single();
    if (error) { setObError(error.code === "23505" ? "Bu adres alınmış." : "Hata oluştu."); setObSaving(false); return; }
    setRestaurant(data); setShowOnboarding(false); setObSaving(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !restaurant) return;
    setCatSaving(true);
    const { data } = await supabase.from("categories").insert({ restaurant_id: restaurant.id, name: newCatName.trim(), sort_order: categories.length }).select().single();
    if (data) { setCategories(prev => [...prev, data]); setNewCatName(""); setShowAddCat(false); flash("Kategori eklendi!"); }
    setCatSaving(false);
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    setCatSaving(true);
    const { data } = await supabase.from("categories").update({ name: editingCategory.name.trim() }).eq("id", editingCategory.id).select().single();
    if (data) {
      setCategories(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
      setEditingCategory(null);
      flash("Kategori güncellendi!");
    }
    setCatSaving(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?")) return;
    await supabase.from("products").delete().eq("category_id", id);
    await supabase.from("categories").delete().eq("id", id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.filter(p => p.category_id !== id));
    if (catFilter === id) setCatFilter("Tümü");
    flash("Kategori silindi.");
  };

  const handleAddProduct = async (formData: any) => {
    const plan = restaurant?.plan || "free";
    const limits: Record<string, number> = { free: 15, starter: 50, pro: Infinity };
    const limit = limits[plan] || 15;
    if (products.length >= limit) {
      flash(`${plan === "free" ? "Ücretsiz planda" : "Başlangıç planında"} maksimum ${limit} ürün ekleyebilirsiniz.`);
      return;
    }
    const { data, error } = await supabase.from("products").insert({
      restaurant_id: restaurant.id,
      ...formData,
      is_active: true,
      tags: [],
      serves: 1,
      sort_order: products.length,
    }).select().single();
    if (error) throw error;
    setProducts(prev => [...prev, data]);
    setShowAddProduct(false);
    flash("Ürün eklendi! 🎉");
  };

  const handleEditProduct = async (formData: any) => {
    if (!editingProduct) return;
    const { data, error } = await supabase.from("products").update(formData).eq("id", editingProduct.id).select().single();
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    setEditingProduct(null);
    flash("Ürün güncellendi! ✓");
  };

  const toggleProduct = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    flash("Ürün silindi.");
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const filteredProducts = catFilter === "Tümü" ? products : products.filter(p => p.category_id === catFilter);
  const chartData = weeklyViews.length > 0 ? weeklyViews : weeklyData;

  const A = restaurant?.theme_color || DEFAULT_COLOR;
  const tabLabel: Record<string, string> = { dashboard: "Genel Bakış", menu: "Menü Yönetimi", qr: "QR Kodlar", analytics: "Analitik", settings: "Ayarlar" };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: A, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}>
          <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 99 }} />
          <div style={{ width: 11, height: 2, background: "#fff", borderRadius: 99 }} />
          <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 99 }} />
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Yükleniyor...</div>
      </div>
    </div>
  );

  if (showOnboarding) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', system-ui, sans-serif", padding: 20, position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:rgba(255,255,255,.2)}input:focus{outline:none;border-color:${A}!important}`}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at 50% 0%, ${A}12 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ width: 18, height: 2.5, background: A, borderRadius: 99 }} />
              <div style={{ width: 12, height: 2.5, background: A, borderRadius: 99 }} />
              <div style={{ width: 18, height: 2.5, background: A, borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>TEM<span style={{ color: A }}>eat</span></span>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: "32px 28px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Restoranınızı kurun</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", marginBottom: 24 }}>Birkaç bilgi ile dijital menünüz hazır!</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Restoran Adı *</label>
              <input type="text" value={obName} onChange={e => { setObName(e.target.value); setObSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")); }} placeholder="Sultanahmet Ocakbaşı" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Menü Adresi *</label>
              <div style={{ display: "flex", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                <span style={{ padding: "12px 10px 12px 14px", fontSize: 13, color: "rgba(255,255,255,.3)", borderRight: "1px solid rgba(255,255,255,.08)", whiteSpace: "nowrap" }}>temeat.com.tr/</span>
                <input type="text" value={obSlug} onChange={e => setObSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="restoran-adiniz" style={{ flex: 1, padding: "12px 14px", border: "none", background: "transparent", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Telefon</label>
              <input type="tel" value={obPhone} onChange={e => setObPhone(e.target.value)} placeholder="+90 555 000 0000" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Adres</label>
              <input type="text" value={obAddress} onChange={e => setObAddress(e.target.value)} placeholder="Divanyolu Cd. No:12" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            {obError && <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", fontSize: 13, color: "#f87171" }}>{obError}</div>}
            <button onClick={handleOnboardingSave} disabled={obSaving} style={{ width: "100%", padding: "13px 0", borderRadius: 11, border: "none", background: obSaving ? `${A}80` : A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: obSaving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {obSaving ? "Kaydediliyor..." : "Restoranı Kur →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "'Outfit', system-ui, sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastAnim{0%{opacity:0;transform:translateY(8px)}10%{opacity:1;transform:translateY(0)}90%{opacity:1}100%{opacity:0}}
        .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;transition:border-color .2s}
        .card:hover{border-color:rgba(255,255,255,.11)}
        .btn{transition:all .15s;cursor:pointer}.btn:hover{opacity:.85}.btn:active{transform:scale(.97)}
        .row-item:hover{background:rgba(255,255,255,.03)}
        input,select,textarea{font-family:inherit}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.2)}
        input:focus,select:focus,textarea:focus{outline:none;border-color:${A}!important}
        @media(max-width:960px){.sidebar{width:60px!important}.sidebar-label,.sidebar-logo-text,.sidebar-rest,.sidebar-plan{display:none!important}}
        @media(max-width:600px){.main-pad{padding:16px!important}.stats-grid{grid-template-columns:1fr 1fr!important}.chart-grid{grid-template-columns:1fr!important}.actions-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: "#1c1c1c", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "#fff", animation: "toastAnim 2s forwards", boxShadow: "0 8px 32px rgba(0,0,0,.6)" }}>
          {toast}
        </div>
      )}


      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        restaurant={restaurant} 
        productsCount={products.length} 
        themeColor={A} 
      />

      {/* MAIN */}
      <main style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.06)", background: "#080808", position: "sticky", top: 0, zIndex: 30 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700 }}>{tabLabel[activeTab]}</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 1 }}>{user?.email}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleSignOut} className="btn" style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="sidebar-label">Çıkış</span>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: A, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, boxShadow: `0 0 0 2px ${A}40` }}>
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
          </div>
        </header>

        <div className="main-pad" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .35s both" }}>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { label: "Bu Hafta Görüntülenme", value: thisWeekViews.toLocaleString(), sub: lastWeekViews > 0 ? `↑ +${Math.round((thisWeekViews - lastWeekViews) / lastWeekViews * 100)}% geçen haftaya göre` : "Veri toplanıyor...", color: "#22c55e" },
                  { label: "Toplam Görüntülenme", value: totalViewsReal.toLocaleString(), sub: "Tüm zamanlar", color: "rgba(255,255,255,.3)" },
                  { label: "Aktif Ürün", value: `${products.filter(p => p.is_active).length}/${products.length}`, sub: `${products.filter(p => !p.is_active).length} ürün pasif`, color: "rgba(255,255,255,.3)" },
                  { label: "Kategori", value: categories.length.toString(), sub: "Menü kategorisi", color: "rgba(255,255,255,.3)" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "20px" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", fontWeight: 500, marginBottom: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.04em", marginBottom: 8 }}>{s.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: s.color }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Haftalık Görüntülenme</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 20 }}>Son 7 gün · {thisWeekViews.toLocaleString()} toplam</div>
                  <BarChart data={chartData} height={140} color={A} />
                </div>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>En Popüler Ürünler</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 16 }}>Menündeki ürünler</div>
                  {products.slice(0, 5).map((p, i) => (
                    <div key={i} className="row-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none", borderRadius: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? A : "rgba(255,255,255,.2)", minWidth: 14 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name_tr}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>₺{p.price}</span>
                    </div>
                  ))}
                  {products.length === 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textAlign: "center", padding: "20px 0" }}>Henüz ürün yok</div>}
                </div>
              </div>
              <div className="card" style={{ padding: "20px 22px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "rgba(255,255,255,.7)" }}>Hızlı İşlemler</div>
                <div className="actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Ürün Ekle", sub: "Menüye yeni ürün", action: () => { setActiveTab("menu"); setTimeout(() => setShowAddProduct(true), 100); } },
                    { label: "QR İndir", sub: "PNG / SVG / PDF", action: () => setActiveTab("qr") },
                    { label: "Analitik", sub: "Detaylı rapor", action: () => setActiveTab("analytics") },
                    { label: "Ayarlar", sub: "Tema & bilgiler", action: () => setActiveTab("settings") },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action} className="btn" style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.03)", color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{a.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MENU */}
          {activeTab === "menu" && (
            <div style={{ animation: "fadeUp .35s both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
                  <button onClick={() => setCatFilter("Tümü")} className="btn" style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: catFilter === "Tümü" ? 700 : 400, background: catFilter === "Tümü" ? "#fff" : "rgba(255,255,255,.06)", color: catFilter === "Tümü" ? "#111" : "rgba(255,255,255,.5)" }}>Tümü</button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setCatFilter(c.id)} className="btn" style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: catFilter === c.id ? 700 : 400, background: catFilter === c.id ? "#fff" : "rgba(255,255,255,.06)", color: catFilter === c.id ? "#111" : "rgba(255,255,255,.5)" }}>{c.name}</button>
                  ))}
                  <button onClick={() => setShowAddCat(true)} className="btn" style={{ padding: "7px 12px", borderRadius: 8, border: "1px dashed rgba(255,255,255,.2)", background: "transparent", color: "rgba(255,255,255,.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>+ Kategori</button>

                  {catFilter !== "Tümü" && (
                    <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                      <button onClick={() => setEditingCategory(categories.find(c => c.id === catFilter) || null)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}>Düzenle</button>
                      <button onClick={() => handleDeleteCategory(catFilter)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>Sil</button>
                    </div>
                  )}
                </div>
                <button onClick={() => setShowAddProduct(true)} className="btn" style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 16px ${A}40` }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ürün Ekle
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🍽</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Henüz ürün yok</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>İlk ürününüzü ekleyin</div>
                  <button onClick={() => setShowAddProduct(true)} style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Ürün Ekle</button>
                </div>
              ) : (
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 90px 100px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                    {["Ürün", "Kategori", "Fiyat", "Durum", ""].map((h, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.25)", letterSpacing: ".06em" }}>{h}</span>
                    ))}
                  </div>
                  {filteredProducts.map((item, i) => (
                    <div key={item.id} className="row-item" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 90px 100px", padding: "14px 20px", borderBottom: i < filteredProducts.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", alignItems: "center", opacity: item.is_active ? 1 : 0.5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${A}15`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽</div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name_tr}</div>
                          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                            {item.allergens?.slice(0, 3).map(a => (
                              <span key={a} style={{ fontSize: 10 }}>{ALLERGENS.find(al => al.key === a)?.icon}</span>
                            ))}
                            {item.allergens?.length > 3 && <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>+{item.allergens.length - 3}</span>}
                          </div>
                          {item.discount_pct > 0 && <div style={{ fontSize: 10, color: A, fontWeight: 600 }}>-%{item.discount_pct} indirim</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{categories.find(c => c.id === item.category_id)?.name || "—"}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>₺{item.price}</span>
                      <button onClick={() => toggleProduct(item.id, item.is_active)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: item.is_active ? "#22c55e18" : "rgba(255,255,255,.06)" }}>
                        <div style={{ width: 28, height: 16, borderRadius: 99, background: item.is_active ? "#22c55e" : "rgba(255,255,255,.15)", position: "relative" }}>
                          <div style={{ position: "absolute", top: 2, left: item.is_active ? 14 : 2, width: 12, height: 12, borderRadius: 99, background: "#fff", transition: "left .2s" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: item.is_active ? "#22c55e" : "rgba(255,255,255,.3)" }}>{item.is_active ? "Aktif" : "Pasif"}</span>
                      </button>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingProduct(item)} className="btn" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,.5)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                        <button onClick={() => deleteProduct(item.id)} className="btn" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(239,68,68,.2)", background: "transparent", cursor: "pointer", color: "#ef4444", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QR */}
          {activeTab === "qr" && (
            <div style={{ animation: "fadeUp .35s both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: "28px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Restoran QR Kodu</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 24 }}>temeat.com.tr/{restaurant?.slug}</div>
                  <div style={{ width: 180, height: 180, margin: "0 auto 24px", background: "#fff", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                    <QRCode value={`https://temeat.com.tr/${restaurant?.slug}`} size={148} fgColor="#111" />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {["PNG", "SVG", "PDF"].map(f => (
                      <button key={f} onClick={() => flash(`${f} indiriliyor...`)} className="btn" style={{ padding: "9px 16px", borderRadius: 8, border: f === "PDF" ? "none" : "1px solid rgba(255,255,255,.1)", background: f === "PDF" ? A : "transparent", color: f === "PDF" ? "#fff" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Masa Bazlı QR</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 18 }}>Her masa için ayrı QR kod</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button key={i} onClick={() => flash(`Masa ${i + 1} QR hazır`)} className="btn" style={{ padding: "12px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", cursor: "pointer", textAlign: "center", color: "#fff" }}>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>⊞</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Masa {i + 1}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .35s both" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { label: "Toplam Görüntülenme", value: totalViewsReal.toLocaleString(), sub: "Tüm zamanlar" },
                  { label: "Bu Hafta Görüntülenme", value: thisWeekViews.toLocaleString(), sub: "Son 7 gün" },
                  { label: "Aktif Ürün", value: products.filter(p => p.is_active).length.toString(), sub: "Menüde görünür" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "20px" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 10 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.03em", marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Haftalık Trend</div>
                  <BarChart data={chartData} height={160} color={A} />
                </div>
                <div className="card" style={{ padding: "22px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Dil Dağılımı</div>
                  {dynamicLangData.length > 0 ? (
                    dynamicLangData.map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: l.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", flex: 1 }}>{l.lang}</span>
                        <div style={{ width: 120, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 99 }}>
                          <div style={{ width: `${l.pct}%`, height: "100%", background: l.color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: "right" }}>{l.pct}%</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", textAlign: "center", padding: "20px 0" }}>Yeterli veri yok</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .35s both", maxWidth: 640 }}>
              <div className="card" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Hesap Bilgileri</div>
                {[["E-posta", user?.email || "—"], ["Restoran", restaurant?.name || "—"], ["Menü Adresi", `temeat.com.tr/${restaurant?.slug}`], ["Plan", restaurant?.plan === "pro" ? "Pro" : restaurant?.plan === "starter" ? "Başlangıç" : "Ücretsiz"]].map(([label, value], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                {restaurant?.plan !== "pro" && <a href="/fiyat" style={{ display: "inline-block", marginTop: 16, padding: "10px 20px", borderRadius: 9, background: A, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Pro'ya Yükselt →</a>}
              </div>
              
              {restaurant && (
                <SettingsForm 
                  restaurant={restaurant} 
                  themeColor={A} 
                  onUpdate={(updated) => setRestaurant((prev: any) => prev ? { ...prev, ...updated } : null)} 
                />
              )}

              <div className="card" style={{ padding: "22px 24px", border: "1px solid rgba(239,68,68,.2)", background: "rgba(239,68,68,.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Oturum</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16 }}>Hesabınızdan güvenli çıkış yapın.</div>
                <button onClick={handleSignOut} className="btn" style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,.3)", background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Çıkış Yap</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* KATEGORİ EKLEME MODALI */}
      {showAddCat && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={() => setShowAddCat(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)" }} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, background: "#111", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", padding: "28px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#fff" }}>Kategori Ekle</h2>
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              placeholder="Örn: Başlangıç, Izgara, Tatlı..."
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAddCat(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>İptal</button>
              <button onClick={handleAddCategory} disabled={catSaving} style={{ flex: 2, padding: "11px 0", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{catSaving ? "Kaydediliyor..." : "Ekle"}</button>
            </div>
          </div>
        </div>
      )}

      {/* KATEGORİ DÜZENLEME MODALI */}
      {editingCategory && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={() => setEditingCategory(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)" }} />
          <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, background: "#111", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", padding: "28px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#fff" }}>Kategori Düzenle</h2>
            <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} onKeyDown={e => e.key === "Enter" && handleEditCategory()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditingCategory(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>İptal</button>
              <button onClick={handleEditCategory} disabled={catSaving} style={{ flex: 2, padding: "11px 0", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{catSaving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <ProductModal title="Ürün Ekle" categories={categories} initial={{}} onSave={handleAddProduct} onClose={() => setShowAddProduct(false)} themeColor={A} />
      )}

      {editingProduct && (
        <ProductModal title="Ürünü Düzenle" categories={categories} initial={editingProduct} onSave={handleEditProduct} onClose={() => setEditingProduct(null)} themeColor={A} />
      )}
    </div>
  );
}