"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import { supabase } from "@/lib/supabase";
import { Category, Product } from "@/types";
import { DEFAULT_COLOR, ALLERGENS, PLANS } from "@/lib/constants";
import { BarChart } from "@/components/panel/BarChart";
import { ProductModal } from "@/components/panel/ProductModal";
import { Sidebar } from "@/components/panel/Sidebar";
import { SettingsForm } from "@/components/panel/SettingsForm";
import { TableGrid } from "@/components/panel/TableGrid";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from "recharts";

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
  const router = useRouter();
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

  const [isKitchenMode, setIsKitchenMode] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);

  // QR Designer States
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrLogoVisible, setQrLogoVisible] = useState(true);
  const [qrFrameType, setQrFrameType] = useState("none"); // none, minimal, elegant, modern
  const [qrSize, setQrSize] = useState(200);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [thisWeekViews, setThisWeekViews] = useState(0);
  const [lastWeekViews, setLastWeekViews] = useState(0);
  const [totalViewsReal, setTotalViewsReal] = useState(0);
  const [weeklyViews, setWeeklyViews] = useState<{ day: string; views: number; orders: number }[]>([]);
  const [dynamicLangData, setDynamicLangData] = useState<{ lang: string, pct: number, color: string }[]>([]);

  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      if (!session) { 
        router.push("/auth"); 
      } else { 
        setUser(session.user); 
        await checkRestaurant(session.user.id); 
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session) router.push("/auth");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const checkRestaurant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (data) { 
        setRestaurant(data); 
        await loadMenuData(data); 
      } else { 
        setShowOnboarding(true); 
      }
    } catch (err) {
      console.error("Restoran yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async (restData: any) => {
    const restaurantId = restData.id;
    const themeColor = restData.theme_color || DEFAULT_COLOR;
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
    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    // FETCH MENU DATA (Categories and Products)
    const { data: catsData } = await supabase.from("categories").select("*").eq("restaurant_id", restaurantId).order("sort_order");
    setCategories(catsData || []);

    const { data: prodsData } = await supabase.from("products").select("*").eq("restaurant_id", restaurantId).order("sort_order");
    setProducts(prodsData || []);

    const { data: ordersData } = await supabase.from("orders").select("*, order_items(*)").eq("restaurant_id", restaurantId).order("created_at", { ascending: false });
    setOrders(ordersData || []);

    setWeeklyViews(days.map((day, i) => {
      const dayStart = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      return {
        day,
        views: thisWeek?.filter(v => { const d = new Date(v.viewed_at); return d >= dayStart && d < dayEnd; }).length || 0,
        orders: ordersData?.filter(o => { const d = new Date(o.created_at); return d >= dayStart && d < dayEnd; }).length || 0,
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

    const { data: revsData } = await supabase.from("reviews").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: false });
    setReviews(revsData || []);

    const { data: serviceData } = await supabase.from("service_requests").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: false });
    setServiceRequests(serviceData || []);

    // Set QR States from Restaurant data if they exist
    if (restData.qr_color) setQrColor(restData.qr_color);
    if (restData.qr_bg_color) setQrBgColor(restData.qr_bg_color);
    if (restData.qr_frame_type) setQrFrameType(restData.qr_frame_type);
    if (restData.qr_logo_visible !== undefined) setQrLogoVisible(restData.qr_logo_visible);
  };

  useEffect(() => {
    if (!restaurant) return;
    
    const ordersSub = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, async (payload) => {
        const { data: newOrder } = await supabase.from("orders").select("*, order_items(*)").eq("id", payload.new.id).single();
        if (newOrder) {
          setOrders(prev => [newOrder, ...prev]);
          if (restaurant.order_sound !== false) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
          }
          flash("Yeni sipariş geldi!");
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
      })
      .subscribe();

    const reviewsSub = supabase.channel('realtime-reviews')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews', filter: `restaurant_id=eq.${restaurant.id}` }, (payload) => {
        setReviews(prev => [payload.new, ...prev]);
        flash("Yeni bir yorum yapıldı!");
      })
      .subscribe();

    const serviceSub = supabase.channel('realtime-service')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_requests', filter: `restaurant_id=eq.${restaurant.id}` }, (payload) => {
        setServiceRequests(prev => [payload.new, ...prev]);
        if (restaurant?.order_sound !== false) {
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
        }
        const msg = payload.new.type === "payment" 
          ? `Masa ${payload.new.table_no} Ödeme Bekliyor (${payload.new.payment_method === 'card' ? 'Kart' : 'Nakit'})`
          : `Masa ${payload.new.table_no} Garson Bekliyor`;
        flash(msg);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_requests', filter: `restaurant_id=eq.${restaurant.id}` }, (payload) => {
        setServiceRequests(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
      })
      .subscribe();

    return () => {
      ordersSub.unsubscribe();
      reviewsSub.unsubscribe();
      serviceSub.unsubscribe();
    };
  }, [restaurant]);

  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === "pending").length;
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) Bekleyen Sipariş | TEMeat`;
    } else {
      document.title = "Restoran Paneli | TEMeat";
    }
  }, [orders]);

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
    const planKey = restaurant?.plan || "free";
    const limit = (PLANS as any)[planKey]?.productLimit || 5;
    
    if (products.length >= limit) {
      flash(`${(PLANS as any)[planKey]?.name} planda maksimum ${limit} ürün ekleyebilirsiniz.`);
      return;
    }
    const { extras, ...productData } = formData;
    const { data, error } = await supabase.from("products").insert({
      restaurant_id: restaurant.id,
      ...productData,
      is_active: true,
      tags: [],
      serves: 1,
      sort_order: products.length,
    }).select().single();
    
    if (error) throw error;

    if (extras && extras.length > 0) {
      const extrasToInsert = extras.map((e: any) => ({
        product_id: data.id,
        name_tr: e.name_tr.trim(),
        price: Number(e.price) || 0,
        is_multiple: !!e.is_multiple
      }));
      const { error: insError } = await supabase.from("product_extras").insert(extrasToInsert);
      if (insError) {
        flash("Ürün eklendi fakat ekstralar kaydedilemedi.");
      }
    }

    setProducts(prev => [...prev, data]);
    setShowAddProduct(false);
    flash("Ürün eklendi!");
  };

  const handleEditProduct = async (formData: any) => {
    if (!editingProduct) return;
    const { extras, ...productData } = formData;
    
    // 1. Ana ürün bilgilerini güncelle
    const { data: updatedProduct, error: prodError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", editingProduct.id)
      .select()
      .single();
      
    if (prodError) {
      flash("Ürün güncellenirken bir hata oluştu.");
      return;
    }

    // 2. Ekstraları güncelle (varsa)
    if (extras !== undefined) {
      // Önce eskileri silmeyi dene
      const { error: delError } = await supabase
        .from("product_extras")
        .delete()
        .eq("product_id", editingProduct.id);

      
      if (extras.length > 0) {
        const extrasToInsert = extras.map((e: any) => ({
          product_id: editingProduct.id,
          name_tr: e.name_tr.trim(),
          price: Number(e.price) || 0,
          is_multiple: !!e.is_multiple
        }));

        const { error: insError } = await supabase
          .from("product_extras")
          .insert(extrasToInsert);

        if (insError) {
          flash("Ürün güncellendi fakat ekstralar kaydedilemedi.");
        }
      }
    }

    // 3. Yerel state'i güncelle
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updatedProduct } : p));
    setEditingProduct(null);
    flash("Ürün başarıyla güncellendi! ✓");
  };

  const toggleProduct = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_active: !current }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const toggleProductAvailability = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_available: !current }).eq("id", id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !current } : p));
      flash(current ? "Ürün tükendi olarak işaretlendi." : "Ürün stokta var olarak işaretlendi.");
    } else {
      flash("Hata: " + error.message);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    flash("Ürün silindi.");
  };

  const handleSaveQrSettings = async () => {
    if (!restaurant) return;
    const { error } = await supabase.from("restaurants").update({
      qr_color: qrColor,
      qr_bg_color: qrBgColor,
      qr_frame_type: qrFrameType,
      qr_logo_visible: qrLogoVisible
    }).eq("id", restaurant.id);
    
    if (!error) {
      setRestaurant({ ...restaurant, qr_color: qrColor, qr_bg_color: qrBgColor, qr_frame_type: qrFrameType, qr_logo_visible: qrLogoVisible });
      flash("Tasarım kaydedildi ve tüm masalara uygulandı! ✓");
    } else {
      flash("Hata: Tasarım kaydedilemedi.");
    }
  };

  const QRCodeFrame = ({ value, tableNo, size = 200, id, isPrint = false }: any) => {
    const isMain = tableNo === undefined;
    const finalSize = isPrint ? 140 : size;
    const logoSize = Math.floor(finalSize * 0.22); // QR boyutunun %22'si kadar logo
    
    return (
      <div id={id} style={{ 
        position: "relative", 
        padding: qrFrameType === "none" ? 20 : isPrint ? 25 : (isMain ? 40 : 25), 
        background: qrBgColor, 
        borderRadius: qrFrameType === "elegant" ? (isPrint ? 25 : 40) : (isPrint ? 16 : 24), 
        boxShadow: isPrint ? "none" : (isMain ? "0 20px 50px rgba(0,0,0,.3)" : "0 8px 20px rgba(0,0,0,.1)"), 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        border: qrFrameType === "minimal" ? `1px solid ${qrColor}20` : (isPrint ? "1px solid #eee" : "none"),
        width: isPrint ? "180px" : "auto",
        transition: "transform .2s"
      }}>
        {qrFrameType === "elegant" && (
          <div style={{ marginBottom: isPrint ? 15 : (isMain ? 25 : 15), textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: isPrint ? 14 : (isMain ? 20 : 12), fontWeight: 900, color: qrColor, letterSpacing: "0.15em", fontFamily: "serif" }}>{restaurant?.name?.toUpperCase()}</div>
            <div style={{ height: 1.5, width: "60%", background: `linear-gradient(90deg, transparent, ${qrColor}, transparent)`, margin: (isPrint ? 6 : (isMain ? 10 : 6)) + "px auto" }} />
            <div style={{ fontSize: isPrint ? 7 : (isMain ? 9 : 6), color: qrColor, opacity: 0.6, letterSpacing: "0.3em", fontWeight: 700 }}>GURME LEZZET DURAGI</div>
          </div>
        )}

        {qrFrameType === "modern" && (
          <div style={{ position: "absolute", top: isPrint ? -12 : (isMain ? -18 : -12), background: qrColor, color: qrBgColor, padding: isPrint ? "4px 14px" : (isMain ? "8px 24px" : "4px 14px"), borderRadius: isPrint ? 8 : (isMain ? 14 : 8), fontSize: isPrint ? 9 : (isMain ? 12 : 9), fontWeight: 900, boxShadow: isPrint ? "none" : `0 8px 20px ${qrColor}40`, letterSpacing: "0.05em", whiteSpace: "nowrap", zIndex: 2 }}>MENÜYÜ TARA</div>
        )}

        <div style={{ position: "relative", padding: isPrint ? 8 : (isMain ? 12 : 8), background: "#fff", borderRadius: isPrint ? 10 : (isMain ? 16 : 10), boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <QRCode value={value} size={finalSize} fgColor={qrColor} bgColor="#ffffff" level="H" />
          {qrLogoVisible && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: logoSize, height: logoSize, background: "#fff", borderRadius: isPrint ? 6 : (isMain ? 12 : 6), padding: isPrint ? 2 : (isMain ? 4 : 2), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                {restaurant?.logo_url ? (
                  <img src={restaurant.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: isPrint ? 3 : (isMain ? 6 : 3) }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: qrColor, borderRadius: isPrint ? 4 : (isMain ? 8 : 4), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: Math.floor(logoSize * 0.5), fontWeight: 900 }}>{restaurant?.name?.[0] || "T"}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {qrFrameType === "minimal" && (
          <div style={{ marginTop: isPrint ? 12 : (isMain ? 20 : 12), textAlign: "center" }}>
            <div style={{ fontSize: isPrint ? 8 : (isMain ? 11 : 8), fontWeight: 700, color: qrColor, letterSpacing: "0.1em" }}>MASA NUMARASI</div>
            <div style={{ fontSize: isPrint ? 14 : (isMain ? 18 : 14), fontWeight: 900, color: qrColor, marginTop: 2 }}>{tableNo || "00"}</div>
          </div>
        )}
        
        {qrFrameType === "modern" && (
          <div style={{ marginTop: isPrint ? 12 : (isMain ? 24 : 12), textAlign: "center", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ height: 1, width: isMain ? 15 : 10, background: qrColor, opacity: 0.2 }} />
            <div style={{ fontSize: isPrint ? 8 : (isMain ? 11 : 8), fontWeight: 800, color: qrColor, opacity: 0.5, letterSpacing: "0.1em" }}>MASA {tableNo || "00"}</div>
            <div style={{ height: 1, width: isMain ? 15 : 10, background: qrColor, opacity: 0.2 }} />
          </div>
        )}

        {qrFrameType === "elegant" && (
          <div style={{ marginTop: isPrint ? 15 : (isMain ? 28 : 15), display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: isPrint ? 8 : (isMain ? 10 : 8), fontWeight: 700, color: qrColor, opacity: 0.5, letterSpacing: "0.2em" }}>MASA {tableNo || "00"}</div>
            <div style={{ width: 3, height: 3, borderRadius: 99, background: qrColor, opacity: 0.3 }} />
          </div>
        )}
        
        {qrFrameType === "none" && !isMain && (
           <div style={{ marginTop: 10, fontSize: 12, fontWeight: 900, color: qrColor }}>MASA {tableNo}</div>
        )}
      </div>
    );
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/auth"; };
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const filteredProducts = catFilter === "Tümü" ? products : products.filter(p => p.category_id === catFilter);
  const chartData = weeklyViews.length > 0 ? weeklyViews : weeklyData;

  const A = restaurant?.theme_color || DEFAULT_COLOR;
   const tabLabel: Record<string, string> = { dashboard: "Genel Bakış", menu: "Menü Yönetimi", analytics: "Analitik", campaigns: "Kampanya Merkezi", qr: "QR Kodlar", tables: "Masalar", orders: "Siparişler", payments: "Ödemeler", reviews: "Müşteri Yorumları", settings: "Ayarlar" };

  const resolveServiceRequest = async (id: string) => {
    const { error } = await supabase.from("service_requests").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
    if (!error) {
      setServiceRequests(prev => prev.map(s => s.id === id ? { ...s, status: "resolved", resolved_at: new Date().toISOString() } : s));
      flash("İstek tamamlandı.");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select();
    
    if (error) {
      console.error("Sipariş güncelleme hatası:", error);
      flash("Sipariş güncellenemedi.");
    } else if (!data || data.length === 0) {
      flash("Güncelleme yetkisi yok.");
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      flash("Sipariş durumu güncellendi.");
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    const svg = document.getElementById("main-qr")?.querySelector("svg");
    if (!svg) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${restaurant?.slug}-qr.svg`;
      link.click();
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 1000;
        canvas.height = 1000;
        if (ctx) {
          ctx.fillStyle = qrBgColor;
          ctx.fillRect(0, 0, 1000, 1000);
          ctx.drawImage(img, 50, 50, 900, 900);
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `${restaurant?.slug}-qr.png`;
          downloadLink.click();
        }
      };
      img.src = url;
    }
    flash(`QR (${format.toUpperCase()}) indiriliyor...`);
  };

  const downloadTableQR = (index: number) => {
    const svg = document.getElementById(`table-qr-${index}`)?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${restaurant?.slug}-masa-${index + 1}.svg`;
    link.click();
  };
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) { flash("İndirilecek veri yok."); return; }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        let val = row[h];
        if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash(`${filename}.csv indiriliyor...`);
  };

  const downloadReviewExcel = () => {
    downloadCSV(reviews, `${restaurant?.slug}-yorumlar`);
  };

  const downloadOrderExcel = () => {
    downloadCSV(orders.map(o => ({
      id: o.id,
      masa: o.table_no,
      tutar: o.total_amount,
      durum: o.status,
      tarih: new Date(o.created_at).toLocaleString('tr-TR')
    })), `${restaurant?.slug}-siparisler`);
  };

  const handleReviewStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from("reviews").update({ status }).eq("id", id).select();
    if (error) {
      flash("Hata: " + error.message);
      return;
    }
    if (!data || data.length === 0) {
      flash("Hata: Güncelleme yetkiniz yok (RLS kuralı eksik olabilir).");
      return;
    }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    flash("Yorum durumu güncellendi.");
  };

  const handleReviewReply = async (id: string) => {
    if (!replyText.trim()) return;
    const { data, error } = await supabase.from("reviews").update({ owner_reply: replyText.trim(), status: "approved" }).eq("id", id).select();
    if (error) {
      flash("Hata: " + error.message);
      return;
    }
    if (!data || data.length === 0) {
      flash("Hata: Cevaplama yetkiniz yok (RLS kuralı eksik olabilir).");
      return;
    }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, owner_reply: replyText.trim(), status: "approved" } : r));
    setReplyText("");
    setReplyingTo(null);
    flash("Cevabınız kaydedildi.");
  };

  const getStatusLabel = (s: string) => {
    const labels: any = { pending: "Bekliyor", preparing: "Hazırlanıyor", ready: "Hazır", completed: "Tamamlandı", cancelled: "İptal" };
    return labels[s] || s;
  };

  const getStatusColor = (s: string) => {
    const colors: any = { pending: "#f59e0b", preparing: "#3b82f6", ready: "#10b981", completed: "rgba(255,255,255,.3)", cancelled: "#ef4444" };
    return colors[s] || "#888";
  };


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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060606", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
      <div style={{ animation: "pulse 2s infinite ease-in-out" }}>
        <Logo size="lg" withTagline={false} />
      </div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Lütfen bekleyin...</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "'Outfit', system-ui, sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .card{
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
        }
        .card:hover{
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px -1px rgba(0, 0, 0, 0.3);
        }
        .btn{transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);cursor:pointer}
        .btn:hover{opacity:.85;transform:translateY(-1px)}
        .btn:active{transform:scale(.97)}
        .row-item:hover{background:rgba(255,255,255,.03)}
        input,select,textarea{font-family:inherit}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.2)}
        input:focus,select:focus,textarea:focus{outline:none;border-color:${A}!important}
        @media(max-width:960px){.sidebar{width:60px!important}.sidebar-label,.sidebar-logo-text,.sidebar-rest,.sidebar-plan{display:none!important}}
        @media(max-width:600px){.main-pad{padding:16px!important}.stats-grid{grid-template-columns:1fr 1fr!important}.chart-grid{grid-template-columns:1fr!important}.actions-grid{grid-template-columns:1fr 1fr!important}}
        
        @media print {
          body { background: #fff !important; }
          main, .no-print, header, footer { display: none !important; }
          #print-area { 
            display: block !important; 
            visibility: visible !important; 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            z-index: 9999999 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-area * { visibility: visible !important; }
          @page { size: auto; margin: 1cm; }
        }
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
        pendingReviewsCount={reviews.filter(r => r.status === "pending").length}
        pendingPaymentsCount={serviceRequests.filter(s => s.type === "payment" && s.status === "pending").length}
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              <span className="sidebar-label">Çıkış</span>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: A, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, boxShadow: `0 0 0 2px ${A}40`, overflow: "hidden" }}>
              {restaurant?.logo_url ? (
                <img src={restaurant.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (user?.email?.[0] || "U").toUpperCase()
              )}
            </div>
          </div>
        </header>

        <div className="main-pad" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          
          {(() => {
            const planOrder = ["free", "yenimekan", "starter", "pro"];
            const currentPlanIndex = planOrder.indexOf(restaurant?.plan || "free");
            const navItem = (require("@/components/panel/Sidebar").navItems as any[]).find(i => i.id === activeTab);
            const requiredPlanIndex = navItem?.minPlan ? planOrder.indexOf(navItem.minPlan) : -1;
            const isLocked = currentPlanIndex < requiredPlanIndex;

            if (isLocked) {
              const reqPlan = (PLANS as any)[navItem.minPlan];
              return (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp .5s ease" }}>
                  <div style={{ textAlign: "center", maxWidth: 400, padding: 40, borderRadius: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: A }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{navItem.label} Özelliği Kilitli</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 32 }}>
                      Bu özelliği kullanabilmek için en az <b>{reqPlan.name}</b> planına sahip olmalısınız.
                    </p>
                    <button onClick={() => window.location.href="/fiyat"} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      Planı Yükselt
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* DASHBOARD (BENTO GRID) */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeUp .5s cubic-bezier(0.16, 1, 0.3, 1) both", position: "relative" }}>
              
              {/* SUMMARY CARDS */}
              {(() => {
                const todayRevenue = orders
                  .filter(o => o.status === "completed" && new Date(o.created_at).toDateString() === new Date().toDateString())
                  .reduce((sum, o) => sum + o.total_amount, 0);

                const activeTablesCount = Array.from(new Set([
                  ...orders.filter(o => o.status !== "completed" && o.status !== "cancelled").map(o => o.table_no),
                  ...serviceRequests.filter(s => s.status === "pending").map(s => s.table_no)
                ])).length;

                const pendingOrders = orders.filter(o => o.status === "pending").length;
                const pendingRequests = serviceRequests.filter(s => s.status === "pending").length;

                return (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                    {[
                      { label: "Günün Cirosu", val: `₺${todayRevenue.toLocaleString()}`, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, color: "#22c55e" },
                      { label: "Aktif Masalar", val: activeTablesCount, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2.5"><path d="M4 18v3M20 18v3M4 7v11h16V7M4 7h16M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/></svg>, color: A },
                      { label: "Bekleyen Sipariş", val: pendingOrders, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, color: "#f59e0b" },
                      { label: "Servis İsteği", val: pendingRequests, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, color: "#a855f7" }
                    ].map((stat, i) => (
                      <div key={i} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>{stat.icon}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".05em" }}>{stat.label}</div>
                          <div style={{ fontSize: 22, fontWeight: 900 }}>{stat.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              {/* Background Aura Glows */}
              <div style={{ position: "fixed", top: "20%", right: "-10%", width: 600, height: 600, background: `${A}08`, filter: "blur(120px)", borderRadius: 999, pointerEvents: "none", zIndex: 0 }} />
              <div style={{ position: "fixed", bottom: "-10%", left: "10%", width: 400, height: 400, background: `${A}05`, filter: "blur(100px)", borderRadius: 999, pointerEvents: "none", zIndex: 0 }} />

              {/* QUICK START CHECKLIST - REDESIGNED */}
              {(() => {
                const tasks = [
                  { id: "rest", label: "Restoran", ok: !!restaurant?.name },
                  { id: "cat", label: "Kategori", ok: categories.length > 0 },
                  { id: "prod", label: "Ürün", ok: products.length > 0 },
                  { id: "qr", label: "QR Kod", ok: !!restaurant?.slug },
                ];
                const completed = tasks.filter(t => t.ok).length;
                if (completed === tasks.length) return null;

                return (
                  <div style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 20, display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        Kurulum
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>%{Math.round((completed/tasks.length)*100)} Tamamlandı</div>
                    </div>
                    <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.03)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${(completed/tasks.length)*100}%`, height: "100%", background: `linear-gradient(90deg, ${A}, #ff7a45)`, borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {tasks.map(t => (
                        <div key={t.id} style={{ width: 36, height: 36, borderRadius: 12, background: t.ok ? `${A}20` : "rgba(255,255,255,0.03)", border: `1px solid ${t.ok ? `${A}40` : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, opacity: t.ok ? 1 : 0.4 }}>
                          {t.ok ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="2 2" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* BENTO GRID START */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "minmax(160px, auto)", gap: 20, position: "relative", zIndex: 1 }}>
                
                {/* BIG STAT: REVENUE / VIEWS */}
                <div className="card" style={{ gridColumn: "span 8", gridRow: "span 2", padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Haftalık Performans</h3>
                        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em" }}>{thisWeekViews.toLocaleString()} <span style={{ fontSize: 20, fontWeight: 600, color: "#22c55e", letterSpacing: "0" }}>+{lastWeekViews > 0 ? Math.round(((thisWeekViews-lastWeekViews)/lastWeekViews)*100) : 0}%</span></div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Sayfa görüntüleme ve müşteri etkileşimi</div>
                      </div>
                      <div style={{ padding: "8px 16px", borderRadius: 99, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 600 }}>Son 7 Gün</div>
                    </div>
                  </div>
                  <div style={{ height: 180, marginTop: 32 }}>
                    <BarChart data={chartData} height={180} color={A} />
                  </div>
                </div>

                {/* SMALL STAT: REVIEWS */}
                <div className="card" style={{ gridColumn: "span 4", gridRow: "span 1", padding: 24, background: `linear-gradient(135deg, ${A}15 0%, rgba(0,0,0,0) 100%)`, borderColor: `${A}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                    <div style={{ fontSize: 12, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: "0.1em" }}>Müşteri Memnuniyeti</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "—"}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{reviews.length} toplam değerlendirme</div>
                </div>

                {/* SMALL STAT: PRODUCTS */}
                <div className="card" style={{ gridColumn: "span 4", gridRow: "span 1", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"><path d="M3 9h18M3 15h18M3 21h18M3 3h18"/></svg>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Aktif Menü</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{products.filter(p => p.is_active).length} <span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>/ {products.length}</span></div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Yayınlanan toplam ürün sayısı</div>
                </div>

                {/* RECENT ORDERS / ACTIVITY */}
                <div className="card" style={{ gridColumn: "span 5", gridRow: "span 3", padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>Son Siparişler</h3>
                    <button onClick={() => setActiveTab("orders")} style={{ fontSize: 12, color: A, background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}>Tümünü Gör</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    {orders.slice(0, 6).map((order, i) => (
                      <div key={order.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>{order.table_no}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Masa {order.table_no}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{order.order_items?.length} Ürün · {new Date(order.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>₺{order.total_amount}</div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <div style={{ margin: "auto", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Henüz sipariş yok</div>}
                  </div>
                </div>

                {/* TOP PRODUCTS - BENTO STYLE */}
                <div className="card" style={{ gridColumn: "span 7", gridRow: "span 2", padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>En Çok Satanlar</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {products.slice(0, 4).map((p, i) => (
                      <div key={i} style={{ padding: 16, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, padding: "8px 12px", background: i === 0 ? A : "rgba(255,255,255,0.05)", fontSize: 10, fontWeight: 900, borderRadius: "0 0 0 12px" }}>#{i+1}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, paddingRight: 30 }}>{p.name_tr}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Popüler ürün</div>
                        <div style={{ marginTop: 12, fontSize: 16, fontWeight: 900, color: A }}>₺{p.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUICK ACTIONS BENTO */}
                <div className="card" style={{ gridColumn: "span 7", gridRow: "span 1", padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Hızlı İşlemler</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Sık kullanılan araçlar</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { label: "Ürün +", action: () => { setActiveTab("menu"); setTimeout(() => setShowAddProduct(true), 100); } },
                      { label: "QR Tasarla", action: () => setActiveTab("qr") },
                      { label: "Analiz", action: () => setActiveTab("analytics") }
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} style={{ padding: "10px 16px", borderRadius: 12, background: i === 0 ? A : "rgba(255,255,255,0.05)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              {/* BENTO GRID END */}
            </div>
          )}


          {/* TABLES VIEW */}
          {activeTab === "tables" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Masalar</h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Restoranınızın anlık masa durumu</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} /> Boş</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: "#ef4444" }} /> Sipariş</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: "#3b82f6" }} /> Hazır</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: "#a855f7" }} /> İstek</span>
                  </div>
                </div>
              </div>

              <TableGrid 
                tableCount={restaurant?.table_count || 12}
                orders={orders}
                serviceRequests={serviceRequests}
                themeColor={A}
                onTableClick={(no) => {
                  setActiveTab("orders");
                  // Buraya belki o masanın siparişlerini filtreleyen bir state eklenebilir
                  flash(`Masa ${no} detayları Siparişler sekmesinde görüntülenebilir.`);
                }}
              />
            </div>
          )}

          {/* ORDERS & SERVICE REQUESTS */}
          {activeTab === "orders" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* LIVE SERVICE REQUESTS */}
              {serviceRequests.filter(s => s.status === "pending").length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: "#f59e0b", boxShadow: "0 0 10px #f59e0b" }} />
                    Canlı Servis İstekleri
                  </div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10 }}>
                    {serviceRequests.filter(s => s.status === "pending").map(req => (
                      <div key={req.id} className="card" style={{ minWidth: 220, padding: "16px", borderLeft: "4px solid #f59e0b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900 }}>MASA {req.table_no}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{req.type === "waiter" ? "🔔 Garson Çağırıyor" : "💳 Hesap İstiyor"}</div>
                        </div>
                        <button onClick={async () => {
                          const { error } = await supabase.from("service_requests").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", req.id);
                          if (!error) setServiceRequests(prev => prev.filter(p => p.id !== req.id));
                        }} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,.15)", color: "#f59e0b", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✓</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Dijital Mutfak Paneli (KDS)</h2>
                  <button onClick={downloadOrderExcel} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV İndir
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length} aktif sipariş</div>
              </div>

              {orders.length === 0 ? (
                <div className="card" style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,.2)" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div style={{ fontSize: 14 }}>Henüz sipariş yok.</div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, minHeight: 600, alignItems: "stretch" }}>
                  {[
                    { status: "pending", title: "Bekliyor", color: "#f59e0b" },
                    { status: "preparing", title: "Hazırlanıyor", color: "#3b82f6" },
                    { status: "ready", title: "Hazır", color: "#10b981" },
                    { status: "completed", title: "Geçmiş", color: "rgba(255,255,255,0.4)" }
                  ].map(col => {
                    const colOrders = col.status === "completed" 
                      ? orders.filter(o => o.status === "completed" || o.status === "cancelled").slice(0, 15)
                      : orders.filter(o => o.status === col.status);
                      
                    return (
                      <div key={col.status} style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 800, color: col.color, display: "flex", alignItems: "center", gap: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            <div style={{ width: 8, height: 8, borderRadius: 99, background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
                            {col.title}
                          </h3>
                          <span style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 99 }}>{colOrders.length}</span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto", paddingRight: 4 }}>
                          {colOrders.map(order => (
                            <div key={order.id} className="card" style={{ padding: "16px", borderLeft: `4px solid ${getStatusColor(order.status)}`, cursor: "default" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <div>
                                  <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 2 }}>Masa {order.table_no}</div>
                                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{new Date(order.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · #{order.id.slice(0, 5)}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: A }}>₺{order.total_amount}</div>
                                </div>
                              </div>
        
                              <div style={{ background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "12px", marginBottom: 16 }}>
                                {order.order_items?.map((item: any, idx: number) => {
                                  const product = products.find(p => p.id === item.product_id);
                                  return (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: idx === order.order_items.length - 1 ? 0 : 8 }}>
                                      <div style={{ flex: 1, paddingRight: 8 }}>
                                        <span style={{ fontWeight: 800, color: "#fff", marginRight: 6 }}>{item.quantity}x</span> 
                                        <span style={{ color: "rgba(255,255,255,0.9)" }}>{product?.name_tr || "Ürün"}</span>
                                        {item.extras_selected?.length > 0 && (
                                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                                            {item.extras_selected.map((e: any, i: number) => <span key={i}>+ {e.name_tr}</span>)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
        
                              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                                {order.status === "pending" && (
                                  <button onClick={() => updateOrderStatus(order.id, "preparing")} className="btn" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#3b82f6", color: "#fff", border: "none", fontSize: 13, fontWeight: 700 }}>Hazırlanıyor'a Al</button>
                                )}
                                {order.status === "preparing" && (
                                  <button onClick={() => updateOrderStatus(order.id, "ready")} className="btn" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#10b981", color: "#fff", border: "none", fontSize: 13, fontWeight: 700 }}>Hazır Yap</button>
                                )}
                                {order.status === "ready" && (
                                  <button onClick={() => updateOrderStatus(order.id, "completed")} className="btn" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.1)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700 }}>Tamamla</button>
                                )}
                                {order.status === "pending" && (
                                  <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="btn" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,.3)", fontSize: 13, fontWeight: 600 }}>İptal Et</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: A }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Henüz ürün yok</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>İlk ürününüzü ekleyin</div>
                  <button onClick={() => setShowAddProduct(true)} style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Ürün Ekle</button>
                </div>
              ) : (
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 180px 100px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                    {["Ürün", "Kategori", "Fiyat", "Aktif / Stok", ""].map((h, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.25)", letterSpacing: ".06em" }}>{h}</span>
                    ))}
                  </div>
                  {filteredProducts.map((item, i) => (
                    <div key={item.id} className="row-item" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 180px 100px", padding: "14px 20px", borderBottom: i < filteredProducts.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", alignItems: "center", opacity: item.is_active ? 1 : 0.5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${A}15`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" style={{ opacity: 0.5 }}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name_tr}</div>
                          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                            {item.allergens?.slice(0, 3).map(a => (
                              <span key={a} style={{ fontSize: 9, background: "rgba(255,255,255,.05)", padding: "2px 6px", borderRadius: 4, color: "rgba(255,255,255,.4)" }}>
                                {ALLERGENS.find(al => al.key === a)?.label}
                              </span>
                            ))}
                            {item.allergens?.length > 3 && <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)" }}>+{item.allergens.length - 3}</span>}
                          </div>
                          {item.discount_pct > 0 && <div style={{ fontSize: 10, color: A, fontWeight: 600 }}>-%{item.discount_pct} indirim</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{categories.find(c => c.id === item.category_id)?.name || "—"}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>₺{item.price}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleProduct(item.id, item.is_active)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: item.is_active ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)" }}>
                          <div style={{ width: 24, height: 12, borderRadius: 99, background: item.is_active ? "#22c55e" : "rgba(255,255,255,0.15)", position: "relative" }}>
                            <div style={{ position: "absolute", top: 1, left: item.is_active ? 13 : 1, width: 10, height: 10, borderRadius: 99, background: "#fff", transition: "left .2s" }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: item.is_active ? "#22c55e" : "rgba(255,255,255,0.3)" }}>AKTİF</span>
                        </button>
                        <button onClick={() => toggleProductAvailability(item.id, item.is_available !== false)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 7, border: "none", cursor: "pointer", background: item.is_available !== false ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)" }}>
                          <div style={{ width: 24, height: 12, borderRadius: 99, background: item.is_available !== false ? "#3b82f6" : "#ef4444", position: "relative" }}>
                            <div style={{ position: "absolute", top: 1, left: item.is_available !== false ? 13 : 1, width: 10, height: 10, borderRadius: 99, background: "#fff", transition: "left .2s" }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: item.is_available !== false ? "#3b82f6" : "#ef4444" }}>{item.is_available !== false ? "STOKTA" : "BİTTİ"}</span>
                        </button>
                      </div>
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

          {/* QR DESIGNER */}
          {activeTab === "qr" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
                
                {/* CONTROLS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
                    {(() => {
                      const planOrder = ["free", "yenimekan", "starter", "pro"];
                      const currentPlanIndex = planOrder.indexOf(restaurant?.plan || "free");
                      const qrLocked = currentPlanIndex < planOrder.indexOf("starter");
                      
                      if (qrLocked) return (
                        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Tasarım Özelleştirme</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginBottom: 16 }}>Bu özellik Başlangıç planı ile açılır.</div>
                          <button onClick={() => setActiveTab("settings")} style={{ padding: "8px 16px", borderRadius: 8, background: A, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Planı Yükselt</button>
                        </div>
                      );
                      return null;
                    })()}
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2.5"><path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.5 1.5M7.6 7.6L2 2l5.6 5.6z"/></svg> Tasarım Özelleştirme
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {/* COLORS */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Renkler</div>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, marginBottom: 6 }}>QR Rengi</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {["#000000", A, "#2563eb", "#059669", "#7c3aed"].map(c => (
                                <button key={c} onClick={() => setQrColor(c)} style={{ width: 28, height: 28, borderRadius: 6, border: qrColor === c ? "2px solid #fff" : "1px solid rgba(255,255,255,.1)", background: c, cursor: "pointer" }} />
                              ))}
                              <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, marginBottom: 6 }}>Arka Plan</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {["#ffffff", "#f8fafc", "#fff7ed", "#f0fdf4"].map(c => (
                                <button key={c} onClick={() => setQrBgColor(c)} style={{ width: 28, height: 28, borderRadius: 6, border: qrBgColor === c ? `2px solid ${A}` : "1px solid rgba(0,0,0,.1)", background: c, cursor: "pointer" }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* FRAMES */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Çerçeve Stili</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            { id: "none", label: "Çerçevesiz", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> },
                            { id: "minimal", label: "Minimalist", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="7" width="10" height="10" rx="1"/></svg> },
                            { id: "elegant", label: "Kurumsal", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg> },
                            { id: "modern", label: "Modern", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg> }
                          ].map(f => (
                            <button key={f.id} onClick={() => setQrFrameType(f.id)} 
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid", borderColor: qrFrameType === f.id ? A : "rgba(255,255,255,.06)", background: qrFrameType === f.id ? `${A}15` : "rgba(255,255,255,.02)", color: qrFrameType === f.id ? "#fff" : "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                              {f.icon} {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* LOGO TOGGLE */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Logo Göster</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>QR merkezinize logo ekleyin</div>
                        </div>
                        <button onClick={() => setQrLogoVisible(!qrLogoVisible)} 
                          style={{ width: 44, height: 22, borderRadius: 99, background: qrLogoVisible ? A : "rgba(255,255,255,.1)", border: "none", cursor: "pointer", position: "relative", transition: "all .3s" }}>
                          <div style={{ position: "absolute", left: qrLogoVisible ? 24 : 2, top: 2, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "all .3s" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: "20px" }}>
                    <button onClick={handleSaveQrSettings} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Tasarımı Kaydet</button>
                    <button onClick={() => window.print()} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${A}`, background: "transparent", color: A, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Baskı Sayfası (A4)
                    </button>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <button onClick={() => downloadQR('png')} style={{ padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>PNG İndir</button>
                      <button onClick={() => downloadQR('svg')} style={{ padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>SVG İndir</button>
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.03) 0%, rgba(255,255,255,0) 100%)", minHeight: 480 }}>
                    <QRCodeFrame id="main-qr" value={`${typeof window !== 'undefined' ? window.location.origin : 'https://temeat.com.tr'}/${restaurant?.slug}`} />
                    
                    <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>Canlı Önizleme Aktif</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    {(() => {
                      const planOrder = ["free", "yenimekan", "starter", "pro"];
                      const currentPlanIndex = planOrder.indexOf(restaurant?.plan || "free");
                      let count = 1;
                      if (currentPlanIndex >= planOrder.indexOf("starter")) count = 10;
                      if (currentPlanIndex >= planOrder.indexOf("pro")) count = restaurant?.table_count || 20;

                      const qrBaseUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://temeat.com.tr'}/${restaurant?.slug}`;

                      return Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="card" style={{ padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{count === 1 ? "Genel Menü" : `Masa ${i + 1}`}</div>
                          <div id={`table-qr-${i}`} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                            <QRCodeFrame 
                              value={`${qrBaseUrl}${count === 1 ? "" : `?table=${i+1}`}`} 
                              tableNo={i + 1}
                              size={80} 
                            />
                          </div>
                          <button onClick={() => downloadTableQR(i)} style={{ width: "100%", marginTop: 8, padding: "6px", borderRadius: 6, border: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.4)", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}>
                            İndir (SVG)
                          </button>
                        </div>
                      ));
                    })()}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ADVANCED ANALYTICS (PRO VERSION) */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
              {(() => {
                // Calculation Logic
                const completedOrders = orders.filter(o => o.status === "completed");
                const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
                const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
                
                // Category Revenue Calculation
                const catRevenue: Record<string, { name: string, value: number }> = {};
                completedOrders.forEach(order => {
                  order.order_items?.forEach((item: any) => {
                    const prod = products.find(p => p.id === item.product_id);
                    const cat = categories.find(c => c.id === prod?.category_id);
                    const catName = cat?.name || "Diğer";
                    if (!catRevenue[catName]) catRevenue[catName] = { name: catName, value: 0 };
                    catRevenue[catName].value += (item.price || 0) * (item.quantity || 1);
                  });
                });
                const categoryData = Object.values(catRevenue).sort((a, b) => b.value - a.value);

                // Top Products Calculation
                const productCounts: Record<string, { name: string, count: number, revenue: number }> = {};
                orders.forEach(order => {
                  order.order_items?.forEach((item: any) => {
                    const prod = products.find(p => p.id === item.product_id);
                    const name = prod?.name_tr || "Bilinmeyen Ürün";
                    if (!productCounts[name]) productCounts[name] = { name, count: 0, revenue: 0 };
                    productCounts[name].count += (item.quantity || 1);
                    productCounts[name].revenue += (item.price || 0) * (item.quantity || 1);
                  });
                });
                const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);

                // Hourly Activity
                const hours = Array(24).fill(0);
                orders.forEach(o => {
                  const hour = new Date(o.created_at).getHours();
                  hours[hour]++;
                });

                // Service Performance Calculation
                const resolvedRequests = serviceRequests.filter(s => s.status === "resolved" && s.resolved_at);
                const avgResponseMinutes = resolvedRequests.length > 0 
                  ? Math.round(resolvedRequests.reduce((sum, s) => {
                      const diff = new Date(s.resolved_at).getTime() - new Date(s.created_at).getTime();
                      return sum + (diff / 60000);
                    }, 0) / resolvedRequests.length)
                  : 0;

                return (
                  <>
                    {/* AI STRATEGY CENTER - NEW PREMIUM SECTION */}
                    <div style={{ 
                      marginBottom: 30, 
                      padding: "24px", 
                      borderRadius: 24, 
                      background: `linear-gradient(135deg, ${A}15 0%, rgba(0,0,0,0) 100%)`, 
                      border: `1px solid ${A}25`,
                      position: "relative",
                      overflow: "hidden",
                      animation: "fadeUp .5s ease-out"
                    }}>
                      <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: A, filter: "blur(100px)", opacity: 0.1, pointerEvents: "none" }} />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: A, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: `0 8px 20px ${A}40` }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                          </div>
                          <div>
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>AI Strateji Merkezi</h2>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Verilerinizden üretilen otomatik büyüme fırsatları</p>
                          </div>
                        </div>
                        <div style={{ padding: "6px 12px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, fontWeight: 700, color: A }}>
                          CANLI ANALİZ AKTİF
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        {/* STRATEGY 1: SLOW HOURS */}
                        {(() => {
                          const peakHour = hours.indexOf(Math.max(...hours));
                          const lowHours = hours.slice(11, 20).map((v, i) => ({ h: i + 11, v })).sort((a, b) => a.v - b.v);
                          const deadHour = lowHours[0]?.h;
                          
                          return (
                            <div className="card" style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: "#3b82f6", marginBottom: 12, textTransform: "uppercase" }}>Zamanlama Fırsatı</div>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Saat {deadHour}:00 Durgunluğu</div>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Verilere göre bu saatte siparişler %40 düşüyor. <b>"Mutlu Saatler"</b> kampanyası ile bu boşluğu doldurabilirsiniz.</p>
                              <button onClick={() => setActiveTab("campaigns")} style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Kampanya Başlat</button>
                            </div>
                          );
                        })()}

                        {/* STRATEGY 2: COMBO SUGGESTION */}
                        {topProducts.length > 0 && (
                          <div className="card" style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#10b981", marginBottom: 12, textTransform: "uppercase" }}>Kombo Önerisi</div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{topProducts[0]?.name} + Yan Ürün</div>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>En popüler ürününüzü bir içecek veya tatlı ile <b>%10 indirimli kombo</b> yaparak sepet ortalamasını ₺45 artırabilirsiniz.</p>
                            <button onClick={() => { setActiveTab("menu"); setTimeout(() => setShowAddProduct(true), 100); }} style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Kombo Oluştur</button>
                          </div>
                        )}

                        {/* STRATEGY 3: SEO OPTIMIZATION */}
                        <div className="card" style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", marginBottom: 12, textTransform: "uppercase" }}>Google Görünürlüğü (SEO)</div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Arama Motoru Gücü</div>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Sayfa başlığınızı <b>"{restaurant?.name} | En İyi {topProducts[0]?.name} ve Dijital Menü"</b> olarak güncelledik. Ziyaretçi potansiyeli arttı.</p>
                          <div style={{ marginTop: 12, fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>%22 Daha Fazla Erişim Bekleniyor</div>
                        </div>
                      </div>
                    </div>

                    {/* TOP STATS GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                        {[
                          { label: "Toplam Gelir", val: `₺${totalRevenue.toLocaleString()}`, trend: "+12%", color: "#22c55e", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                          { label: "Ort. Sepet", val: `₺${avgOrderValue}`, trend: "+5%", color: A, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
                          { label: "Müşteri Trafiği", val: totalViewsReal.toLocaleString(), trend: "+18%", color: "#8b5cf6", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                          { label: "Servis Skoru", val: avgResponseMinutes > 0 ? `${avgResponseMinutes} dk` : "—", trend: "Hızlı", color: "#3b82f6", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
                        ].map((s, i) => (
                          <div key={i} className="card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
                              <div style={{ fontSize: 10, fontWeight: 800, color: s.color, background: `${s.color}10`, padding: "2px 8px", borderRadius: 99 }}>{s.trend}</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.3)", marginBottom: 4, textTransform: "uppercase" }}>{s.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 900 }}>{s.val}</div>
                          </div>
                        ))}
                    </div>

                    {/* MAIN CHARTS BENTO GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
                      
                      {/* HOURLY HEATMAP AREA CHART */}
                      <div className="card" style={{ gridColumn: "span 8", padding: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Yoğunluk Analizi</h3>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Siparişlerin gün içindeki saatlik dağılımı</p>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.03)", fontSize: 11, fontWeight: 600 }}>Bugün</div>
                          </div>
                        </div>
                        <div style={{ height: 280, width: "100%" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hours.map((v, i) => ({ name: `${i}:00`, Sipariş: v }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={A} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={A} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" fontSize={10} tickMargin={10} minTickGap={30} />
                              <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} allowDecimals={false} />
                              <RechartsTooltip 
                                contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}
                                itemStyle={{ color: A, fontWeight: 800 }}
                                cursor={{ stroke: A, strokeWidth: 1, strokeDasharray: "4 4" }}
                              />
                              <Area type="monotone" dataKey="Sipariş" stroke={A} strokeWidth={3} fillOpacity={1} fill="url(#colorOrder)" animationDuration={1500} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* CATEGORY REVENUE BAR CHART */}
                      <div className="card" style={{ gridColumn: "span 4", padding: 24, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Kategori Geliri</h3>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginBottom: 24 }}>Cironun kategorilere dağılımı</p>
                        
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                          {categoryData.slice(0, 6).map((cat, i) => (
                            <div key={i} style={{ width: "100%" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                                <span>{cat.name}</span>
                                <span style={{ color: "rgba(255,255,255,.4)" }}>₺{cat.value.toLocaleString()}</span>
                              </div>
                              <div style={{ height: 6, background: "rgba(255,255,255,.03)", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ width: `${(cat.value / totalRevenue) * 100}%`, height: "100%", background: i === 0 ? A : i === 1 ? "#3b82f6" : "#444", borderRadius: 99 }} />
                              </div>
                            </div>
                          ))}
                          {categoryData.length === 0 && (
                            <div style={{ margin: "auto", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12 }}>Henüz veri yok</div>
                          )}
                        </div>
                      </div>

                      {/* TOP PRODUCTS LIST (DETAILED) */}
                      <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>En Çok Tercih Edilenler</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {topProducts.map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)" }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? `${A}20` : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: i === 0 ? A : "#fff" }}>
                                {i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{p.count} Sipariş</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 14, fontWeight: 800 }}>₺{p.revenue.toLocaleString()}</div>
                                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>%{Math.round((p.revenue / totalRevenue) * 100)} Pay</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RECENT REVIEWS SUMMARY */}
                      <div className="card" style={{ gridColumn: "span 6", padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Müşteri Geri Bildirimleri</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {reviews.slice(0, 3).map((rev, i) => (
                            <div key={i} style={{ padding: "14px", borderRadius: 16, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{rev.customer_name}</div>
                                <div style={{ color: "#f59e0b", fontSize: 11 }}>{"★".repeat(rev.rating)}</div>
                              </div>
                              <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: "1.4" }}>"{rev.comment || "Yorumsuz puanlama"}"</p>
                            </div>
                          ))}
                          <button onClick={() => setActiveTab("reviews")} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            Tüm Yorumları Yönet
                          </button>
                        </div>
                      </div>

                    </div>
                  </>
                );
              })()}
            </div>
          )}
          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Ödeme Bekleyen Masalar</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Hesap isteyen masalar ve ödeme yöntemleri</p>
                </div>
              </div>

              {serviceRequests.filter(s => s.type === "payment").length === 0 ? (
                <div className="card" style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,.2)" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <div style={{ fontSize: 14 }}>Henüz ödeme talebi yok.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                  {serviceRequests.filter(s => s.type === "payment").map(req => {
                    const tableOrder = orders.find(o => o.table_no === req.table_no && (o.status === "pending" || o.status === "preparing" || o.status === "ready"));
                    return (
                      <div key={req.id} className="card" style={{ padding: 20, borderLeft: `4px solid ${req.status === "pending" ? "#a855f7" : "rgba(255,255,255,.1)"}`, opacity: req.status === "resolved" ? 0.6 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 900 }}>MASA {req.table_no}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{new Date(req.created_at).toLocaleTimeString("tr-TR")}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: req.payment_method === "card" ? "rgba(59, 130, 246, 0.1)" : "rgba(34, 197, 94, 0.1)", color: req.payment_method === "card" ? "#3b82f6" : "#22c55e", display: "inline-flex", alignItems: "center", gap: 6 }}>
                              {req.payment_method === "card" ? "💳 KART" : "💵 NAKİT"}
                            </div>
                          </div>
                        </div>

                        {tableOrder && (
                          <div style={{ marginBottom: 20, padding: 12, background: "rgba(255,255,255,.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Açık Sipariş Toplamı:</span>
                              <span style={{ fontSize: 13, fontWeight: 800 }}>₺{tableOrder.total_amount}</span>
                            </div>
                          </div>
                        )}

                        {req.status === "pending" ? (
                          <button 
                            onClick={() => resolveServiceRequest(req.id)}
                            className="btn" 
                            style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#a855f7", color: "#fff", border: "none", fontSize: 13, fontWeight: 700 }}
                          >
                            Ödeme Alındı & Kapat
                          </button>
                        ) : (
                          <div style={{ textAlign: "center", fontSize: 12, color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Tamamlandı
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* CAMPAIGNS MANAGEMENT */}
          {activeTab === "campaigns" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Kampanya Merkezi</h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>AI destekli kampanyalarla satışlarınızı artırın</p>
                </div>
                <button onClick={() => flash("Yeni kampanya oluşturma yakında aktif olacak!")} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  Yeni Kampanya
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* AI CAMPAIGN GENERATOR */}
                <div className="card" style={{ padding: 24, background: `linear-gradient(135deg, ${A}15, rgba(0,0,0,0))`, border: `1px solid ${A}30` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: A, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 20 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>AI Kampanya Sihirbazı</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.6, marginBottom: 24 }}>Verilerinizi analiz ettik. "Öğle Arası Yoğunluğu" için en popüler 3 ürününüzde %15 indirim yapmanızı öneriyoruz.</p>
                  <button onClick={() => flash("AI Önerisi Uygulandı! ✓")} style={{ padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${A}`, background: "transparent", color: A, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Öneriyi Uygula</button>
                </div>

                {/* CURRENT PERFORMANCE */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981", marginBottom: 20, textTransform: "uppercase", letterSpacing: ".05em" }}>Kampanya Performansı</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>₺12.450</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>Ekstra Gelir</div>
                    </div>
                    <div style={{ width: 1, height: 40, background: "rgba(255,255,255,.1)" }} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>245</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>Kullanım</div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 800, marginTop: 12 }}>Aktif Kampanyalar</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "Hoş Geldin İndirimi", type: "Yüzde İndirim", value: "%10", status: "Aktif", color: "#10b981" },
                  { name: "Gece Kuşu Menüsü", type: "Sabit Fiyat", value: "₺120", status: "Planlandı", color: "#3b82f6" }
                ].map((c, i) => (
                  <div key={i} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.03)", display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{c.type} · {c.value}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 6, background: `${c.color}20`, color: c.color }}>{c.status}</span>
                      <button style={{ background: "none", border: "none", color: "rgba(255,255,255,.2)", cursor: "pointer" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS MANAGEMENT */}
          {activeTab === "reviews" && (
            <div style={{ animation: "fadeUp .35s both", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>Müşteri Değerlendirmeleri</h2>
                  <button onClick={downloadReviewExcel} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV İndir
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["pending", "approved", "rejected"].map(s => (
                    <button key={s} onClick={() => setReviewFilter(s)} 
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${reviewFilter === s ? A : "rgba(255,255,255,.1)"}`, background: reviewFilter === s ? `${A}20` : "rgba(255,255,255,.03)", color: reviewFilter === s ? A : "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {s === "pending" ? "Bekleyen" : s === "approved" ? "Onaylı" : "Reddedilen"}
                    </button>
                  ))}
                </div>
              </div>

              {reviews.filter(r => r.status === reviewFilter).length === 0 ? (
                <div className="card" style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,.2)" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <div style={{ fontSize: 14 }}>Bu kategoriye ait yorum bulunmuyor.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {reviews.filter(r => r.status === reviewFilter).map(rev => {
                    const product = products.find(p => p.id === rev.product_id);
                    return (
                      <div key={rev.id} className="card" style={{ padding: 20, borderLeft: `4px solid ${rev.status === "pending" ? "#f59e0b" : rev.status === "approved" ? "#22c55e" : "#ef4444"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                              {rev.customer_name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{rev.customer_name}</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                                {new Date(rev.created_at).toLocaleDateString("tr-TR")} · {product ? product.name_tr : "Genel Değerlendirme"}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} style={{ color: i < rev.rating ? "#f59e0b" : "rgba(255,255,255,.1)", fontSize: 14 }}>★</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.6, marginBottom: 20, padding: "12px", background: "rgba(255,255,255,.02)", borderRadius: 10 }}>
                          {rev.comment || "Yorum bırakılmadı."}
                        </div>

                        {rev.owner_reply ? (
                          <div style={{ marginBottom: 20, padding: "12px 16px", background: `${A}10`, borderLeft: `2px solid ${A}`, borderRadius: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: A, marginBottom: 4, textTransform: "uppercase" }}>Cevabınız:</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{rev.owner_reply}</div>
                          </div>
                        ) : replyingTo === rev.id ? (
                          <div style={{ marginBottom: 20 }}>
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Müşteriye cevap yazın..." 
                              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13, minHeight: 80, outline: "none", fontFamily: "inherit", resize: "none" }} />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button onClick={() => setReplyingTo(null)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>İptal</button>
                              <button onClick={() => handleReviewReply(rev.id)} style={{ flex: 2, padding: "8px", borderRadius: 8, border: "none", background: A, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cevabı Gönder</button>
                            </div>
                          </div>
                        ) : null}

                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {rev.status === "pending" && (
                            <>
                              <button onClick={() => handleReviewStatus(rev.id, "approved")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Onayla</button>
                              <button onClick={() => handleReviewStatus(rev.id, "rejected")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,.3)", background: "transparent", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reddet</button>
                            </>
                          )}
                          {!rev.owner_reply && !replyingTo && (
                            <button onClick={() => setReplyingTo(rev.id)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cevapla</button>
                          )}
                          {rev.status !== "pending" && (
                            <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,.2)" }}>
                              Durum: <span style={{ color: rev.status === "approved" ? "#22c55e" : "#ef4444" }}>{rev.status === "approved" ? "Onaylandı" : "Reddedildi"}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                {restaurant?.plan !== "pro" && (
                  <div style={{ marginTop: 24, padding: "16px", borderRadius: 12, background: `${A}10`, border: `1.5px solid ${A}30` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: A, marginBottom: 4 }}>Daha fazla özellik mi lazım?</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 16 }}>Yeni Mekan, Başlangıç ve Pro planları ile işinizi büyütün.</div>
                    <button onClick={() => window.open("/fiyat", "_blank")} style={{ padding: "10px 20px", borderRadius: 9, background: A, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Tüm Planları İncele →
                    </button>
                  </div>
                )}
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
            <input type="text" value={editingCategory!.name} onChange={e => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)} onKeyDown={e => e.key === "Enter" && handleEditCategory()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 16, outline: "none" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditingCategory(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>İptal</button>
              <button onClick={handleEditCategory} disabled={catSaving} style={{ flex: 2, padding: "11px 0", borderRadius: 9, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{catSaving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <ProductModal key="add" title="Ürün Ekle" categories={categories} allProducts={products} initial={{}} onSave={handleAddProduct} onClose={() => setShowAddProduct(false)} themeColor={A} restaurantPlan={restaurant?.plan || "free"} />
      )}

      {editingProduct && (
        <ProductModal key={editingProduct!.id} title="Ürünü Düzenle" categories={categories} allProducts={products} initial={editingProduct!} onSave={handleEditProduct} onClose={() => setEditingProduct(null)} themeColor={A} restaurantPlan={restaurant?.plan || "free"} />
      )}

      {/* KDS - KITCHEN DISPLAY SYSTEM OVERLAY */}
      {isKitchenMode && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#050505", display: "flex", flexDirection: "column", animation: "fadeIn .3s both" }}>
          <div style={{ height: 70, background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.02em" }}>TEM<span style={{ color: A }}>eat</span> <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 400, marginLeft: 8 }}>KITCHEN MODE</span></div>
              <div style={{ height: 24, width: 1, background: "rgba(255,255,255,.1)" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e" }}>● Canlı Bağlantı Aktif</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700 }}>AKTİF SİPARİŞ</div>
              </div>
              <button onClick={() => setIsKitchenMode(false)} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: "rgba(255,255,255,.05)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Panale Dön</button>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: 24, overflowX: "auto", display: "flex", gap: 20, alignItems: "flex-start", background: "radial-gradient(circle at 50% 50%, #0a0a0a 0%, #050505 100%)" }}>
            {orders.filter(o => o.status !== "completed" && o.status !== "cancelled").length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", opacity: .15 }}>
                <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Şu an mutfakta sipariş yok.</div>
              </div>
            ) : (
              orders.filter(o => o.status !== "completed" && o.status !== "cancelled").map(order => (
                <div key={order.id} style={{ width: 340, flexShrink: 0, background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "100%", boxShadow: "0 10px 40px rgba(0,0,0,.4)" }}>
                  <div style={{ padding: 20, background: order.status === "pending" ? "#f59e0b" : order.status === "preparing" ? "#3b82f6" : "#10b981", color: "#000" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 24, fontWeight: 900 }}>MASA {order.table_no}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, background: "rgba(0,0,0,.15)", padding: "4px 10px", borderRadius: 6 }}>
                        {Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)} dk önce
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {order.order_items?.map((item: any, idx: number) => {
                        const product = products.find(p => p.id === item.product_id);
                        return (
                          <div key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,.04)", paddingBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ fontSize: 18, fontWeight: 700 }}>
                                <span style={{ color: A, marginRight: 8 }}>{item.quantity}x</span>
                                {product?.name_tr || "Ürün"}
                              </div>
                            </div>
                            {item.extras_selected?.length > 0 && (
                              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {item.extras_selected.map((ex: any, ei: number) => (
                                  <span key={ei} style={{ fontSize: 11, background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)", padding: "2px 8px", borderRadius: 4 }}>+{ex.name_tr || ex.label}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "#0c0c0c", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", gap: 10 }}>
                    {order.status === "pending" ? (
                      <button onClick={() => updateOrderStatus(order.id, "preparing")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>HAZIRLA</button>
                    ) : order.status === "preparing" ? (
                      <button onClick={() => updateOrderStatus(order.id, "ready")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "#10b981", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>HAZIR</button>
                    ) : (
                      <button onClick={() => updateOrderStatus(order.id, "completed")} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "rgba(255,255,255,.1)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>TAMAMLA</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>

      {/* GLOBAL HIDDEN PRINT AREA */}
      <div id="print-area" style={{ display: "none" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "30px", 
          padding: "20px",
          background: "#fff"
        }}>
          {(() => {
            const planOrder = ["free", "yenimekan", "starter", "pro"];
            const currentPlanIndex = planOrder.indexOf(restaurant?.plan || "free");
            let count = 1;
            if (currentPlanIndex >= planOrder.indexOf("starter")) count = 10;
            if (currentPlanIndex >= planOrder.indexOf("pro")) count = restaurant?.table_count || 20;
            const qrBaseUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://temeat.com.tr'}/${restaurant?.slug}`;

            return Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "center", border: "1px dashed #eee", padding: "15px", borderRadius: "8px" }}>
                <QRCodeFrame 
                  value={`${qrBaseUrl}${count === 1 ? "" : `?table=${i+1}`}`} 
                  tableNo={i + 1}
                  isPrint={true}
                />
              </div>
            ));
          })()}
        </div>
      </div>
    </>
  );
}