"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Category, Product } from "@/types";
import { ALLERGENS } from "@/lib/constants";

export function ProductModal({
  title,
  categories,
  initial,
  onSave,
  onClose,
  themeColor = "#D4470A",
  restaurantPlan = "free",
}: {
  title: string;
  categories: Category[];
  initial: Partial<Product> & { category_id?: string | null };
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  themeColor?: string;
  restaurantPlan?: string;
}) {
  const [name, setName] = useState(initial.name_tr || "");
  const [nameEn, setNameEn] = useState(initial.name_en || "");
  const [nameAr, setNameAr] = useState(initial.name_ar || "");
  const [nameDe, setNameDe] = useState(initial.name_de || "");
  const [nameRu, setNameRu] = useState(initial.name_ru || "");
  const [desc, setDesc] = useState(initial.desc_tr || "");
  const [descEn, setDescEn] = useState(initial.desc_en || "");
  const [descAr, setDescAr] = useState(initial.desc_ar || "");
  const [descDe, setDescDe] = useState(initial.desc_de || "");
  const [descRu, setDescRu] = useState(initial.desc_ru || "");
  const [showOtherLangs, setShowOtherLangs] = useState(false);
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [discount, setDiscount] = useState(initial.discount_pct ? String(initial.discount_pct) : "0");
  const [calories, setCalories] = useState(initial.calories ? String(initial.calories) : "");
  const [prepTime, setPrepTime] = useState(initial.prep_time ? String(initial.prep_time) : "");
  const [catId, setCatId] = useState(initial.category_id || "");
  const [chefPick, setChefPick] = useState(initial.is_chef_pick || false);
  const [allergens, setAllergens] = useState<string[]>(initial.allergens || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial.image_url || null);
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extras, setExtras] = useState<any[]>([]);

  // Eğer düzenleme modundaysa ekstraları getir
  useEffect(() => {
    if (initial.id) {
      supabase.from("product_extras").select("*").eq("product_id", initial.id).then(({ data }) => {
        if (data) setExtras(data);
      });
    }
  }, [initial.id]);

  const [aiLoading, setAiLoading] = useState(false);

  const generateWithAI = async () => {
    if (!name.trim()) { setError("Önce ürün adını yazmalısınız."); return; }
    setAiLoading(true);
    
    // AI Description Simulation (Turkish localized)
    const prompts: Record<string, string> = {
      "Adana Kebap": "Zırh kıyması ile hazırlanan, közlenmiş biber ve domates eşliğinde sunulan geleneksel lezzet.",
      "Lahmacun": "İncecik çıtır hamur üzerinde bol malzemeli, taş fırında pişmiş eşsiz bir klasik.",
      "Mercimek Çorbası": "Süzme mercimeğin tereyağlı sos ve taze limon ile buluştuğu sıcacık bir başlangıç.",
      "İskender": "Döner etinin pide parçaları üzerinde, bol tereyağı ve özel domates sosuyla efsanevi buluşması.",
      "Künefe": "Sıcak peynirin tel kadayıf ile dansı, bol antep fıstığı eşliğinde çıtır çıtır servis edilir.",
      "Hamburger": "Özel ev yapımı köfte, karamelize soğan ve cheddar peynirinin muhteşem uyumu.",
      "Pizza": "İnce hamur üzerine bol mozzarella peyniri ve taze malzemelerle hazırlanan İtalyan esintisi.",
    };

    // Generic fallback for unknown names
    const generic = `${name}, taze malzemelerle özenle hazırlanan, işletmemizin en özel lezzetlerinden biridir.`;
    
    await new Promise(r => setTimeout(r, 1200)); // Simulate AI delay
    setDesc(prompts[name] || generic);
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Ürün adı zorunlu."); return; }
    if (!price || isNaN(Number(price))) { setError("Geçerli bir fiyat girin."); return; }
    if (!catId) { setError("Kategori seçin."); return; }
    
    setSaving(true); 
    setError(null);
    
    let finalImageUrl = imagePreview; // Use the current preview state
    
    if (imageFile) {
      setImageUploading(true);
      const ext = imageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile, { upsert: true });
        
      if (uploadError) { 
        setError("Fotoğraf yüklenemedi."); 
        setSaving(false); 
        setImageUploading(false); 
        return; 
      }
      
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      finalImageUrl = urlData.publicUrl;
      setImageUploading(false);
    }
    
    await onSave({
      category_id: catId,
      name_tr: name.trim(),
      name_en: nameEn.trim() || null,
      name_ar: nameAr.trim() || null,
      name_de: nameDe.trim() || null,
      name_ru: nameRu.trim() || null,
      desc_tr: desc.trim() || null,
      desc_en: descEn.trim() || null,
      desc_ar: descAr.trim() || null,
      desc_de: descDe.trim() || null,
      desc_ru: descRu.trim() || null,
      price: Number(price),
      discount_pct: Number(discount) || 0,
      calories: calories ? Number(calories) : null,
      prep_time: prepTime ? Number(prepTime) : null,
      is_chef_pick: chefPick,
      allergens,
      image_url: finalImageUrl,
      extras: extras.filter(e => e.name_tr.trim() !== ""), // boş olanları atla
    });
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", animation: "fadeIn .2s" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", background: "#111", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", padding: "28px", animation: "fadeUp .3s both" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Kategori *</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "#1a1a1a", color: catId ? "#fff" : "rgba(255,255,255,.3)", fontSize: 14, fontFamily: "inherit", outline: "none" }}>
              <option value="">Kategori seçin</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>Fotoğraf</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {imagePreview && (
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={imagePreview} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover" }} />
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 99, background: "#ef4444", color: "#fff", border: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }}>✕</button>
                </div>
              )}
              <label style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,.2)", background: "rgba(255,255,255,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.5)", fontSize: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {imageUploading ? "Yükleniyor..." : imageFile ? imageFile.name : "Fotoğraf seç"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }} />
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Ürün Adı (TR) *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Adana Kebap"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Ürün Adı (EN)</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Adana Kebab"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>Açıklama (TR)</label>
              <button type="button" onClick={generateWithAI} disabled={aiLoading} 
                style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: `linear-gradient(90deg, ${themeColor}, #ff7a45)`, border: "none", borderRadius: 6, padding: "4px 10px", cursor: aiLoading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                {aiLoading ? "Yazılıyor..." : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    AI ile Yaz
                  </>
                )}
              </button>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="El kıyması kuzu, pul biber, lavaş..." rows={2}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none" }} />
          </div>

          <div>
            <button type="button" onClick={() => setShowOtherLangs(!showOtherLangs)} style={{ fontSize: 12, color: themeColor, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 4 }}>
              {showOtherLangs ? "▼" : "▶"} Diğer Dilleri Düzenle (AR, DE, RU)
            </button>
            {showOtherLangs && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px", background: "rgba(255,255,255,.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)", marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 4 }}>Açıklama (EN)</label>
                  <input type="text" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Description in English..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="Ürün Adı (AR)" dir="rtl" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descAr} onChange={e => setDescAr(e.target.value)} placeholder="Açıklama (AR)" dir="rtl" style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameDe} onChange={e => setNameDe(e.target.value)} placeholder="Ürün Adı (DE)" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descDe} onChange={e => setDescDe(e.target.value)} placeholder="Açıklama (DE)" style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameRu} onChange={e => setNameRu(e.target.value)} placeholder="Ürün Adı (RU)" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descRu} onChange={e => setDescRu(e.target.value)} placeholder="Açıklama (RU)" style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Fiyat (₺) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="220"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>İndirim (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" min="0" max="100"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          {(() => {
            const planOrder = ["free", "yenimekan", "starter", "pro"];
            const currentPlanIndex = planOrder.indexOf(restaurantPlan);
            const starterLocked = currentPlanIndex < planOrder.indexOf("starter");

            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>
                      Kalori
                    </label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="450"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <div style={{ opacity: starterLocked ? 0.5 : 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                      Hazırlık (dk) {starterLocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </label>
                    <input type="number" value={prepTime} onChange={e => !starterLocked && setPrepTime(e.target.value)} placeholder={starterLocked ? "Kilitli" : "18"} disabled={starterLocked}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                  </div>
                </div>

                <div style={{ opacity: starterLocked ? 0.5 : 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>
                    Alerjenler
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 400, marginLeft: 6 }}>1 Temmuz yönetmeliği gereği</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ALLERGENS.map(a => {
                      const selected = allergens.includes(a.key);
                      return (
                        <button key={a.key} type="button"
                          onClick={() => setAllergens(prev => selected ? prev.filter(x => x !== a.key) : [...prev, a.key])}
                          style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${selected ? themeColor : "rgba(255,255,255,.1)"}`, background: selected ? `${themeColor}20` : "transparent", color: selected ? "#fff" : "rgba(255,255,255,.4)", fontSize: 11, fontWeight: selected ? 700 : 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="button" onClick={() => !starterLocked && setChefPick(!chefPick)} 
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${chefPick ? themeColor : "rgba(255,255,255,.1)"}`, background: chefPick ? `${themeColor}15` : "rgba(255,255,255,.04)", cursor: starterLocked ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: starterLocked ? 0.5 : 1 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: chefPick ? themeColor : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {chefPick && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      Şefin Seçimi {starterLocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Menüde öne çıkar</div>
                  </div>
                </button>

                {/* EKSTRALAR */}
                <div style={{ marginTop: 8, opacity: starterLocked ? 0.5 : 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    Ekstralar / Seçenekler (Opsiyonel) {starterLocked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {extras.map((ex, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="text" value={ex.name_tr} onChange={e => { const n = [...extras]; n[i].name_tr = e.target.value; setExtras(n); }} placeholder="Örn: Ekstra Peynir" disabled={starterLocked} style={{ flex: 2, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                        <div style={{ position: "relative", flex: 1 }}>
                          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,.4)" }}>₺</span>
                          <input type="number" value={ex.price} onChange={e => { const n = [...extras]; n[i].price = Number(e.target.value); setExtras(n); }} placeholder="0" disabled={starterLocked} style={{ width: "100%", padding: "9px 12px 9px 24px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "#fff", fontSize: 13, outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                        </div>
                        <button type="button" onClick={() => { const n = [...extras]; n[i].is_multiple = !n[i].is_multiple; setExtras(n); }} disabled={starterLocked} style={{ padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${ex.is_multiple ? themeColor : "rgba(255,255,255,.1)"}`, background: ex.is_multiple ? `${themeColor}20` : "transparent", color: ex.is_multiple ? themeColor : "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, cursor: starterLocked ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                          {ex.is_multiple ? "Çoklu" : "Tekli"}
                        </button>
                        <button type="button" onClick={() => setExtras(extras.filter((_, idx) => idx !== i))} disabled={starterLocked} style={{ padding: "8px", borderRadius: 8, border: "none", background: "transparent", color: "#ef4444", cursor: starterLocked ? "not-allowed" : "pointer" }}>✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => !starterLocked && setExtras([...extras, { name_tr: "", price: 0, is_multiple: true }])} disabled={starterLocked} style={{ padding: "10px", borderRadius: 8, border: "1px dashed rgba(255,255,255,.2)", background: "transparent", color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, cursor: starterLocked ? "not-allowed" : "pointer" }}>
                      + Ekstra Seçenek Ekle
                    </button>
                  </div>
                </div>
              </>
            );
          })()}

          {error && <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", fontSize: 13, color: "#f87171" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "13px 0", borderRadius: 11, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>İptal</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "13px 0", borderRadius: 11, border: "none", background: saving ? `${themeColor}80` : themeColor, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${themeColor}40` }}>
              {saving ? "Kaydediliyor..." : title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
