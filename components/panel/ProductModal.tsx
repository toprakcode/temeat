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
    
    // Advanced AI Description Engine (Simulated)
    const generate = (n: string, isEn: boolean) => {
      const lower = n.toLowerCase();
      if (isEn) {
        if (lower.includes("kebab") || lower.includes("meat")) return `Traditional flavors meet master craftsmanship. Prepared with premium ingredients and served with a touch of elegance.`;
        if (lower.includes("soup")) return `A warm start to your meal. Smooth texture and rich aroma prepared with traditional recipes.`;
        if (lower.includes("dessert") || lower.includes("cake")) return `A sweet finale to your dining experience. Perfectly balanced sweetness with premium ingredients.`;
        if (lower.includes("pizza") || lower.includes("burger")) return `Modern classics reimagined. Freshly prepared with our secret house recipe and the finest toppings.`;
        return `${n} is a signature dish of our kitchen, prepared with fresh ingredients and passion for great food.`;
      } else {
        if (lower.includes("kebap") || lower.includes("et")) return `Usta ellerin geleneksel tarifiyle hazırlanan, zırh kıyması ve özel baharatların muhteşem uyumu. Her lokmada gerçek bir lezzet şöleni.`;
        if (lower.includes("çorba")) return `Günün her saati iç ısıtan, süzme kıvamı ve tereyağlı özel sosuyla hazırlanan geleneksel bir başlangıç.`;
        if (lower.includes("tatlı") || lower.includes("pasta")) return `Yemeğin en tatlı finali. Özenle seçilmiş malzemelerle hazırlanan, hafif ve damakta iz bırakan eşsiz bir lezzet.`;
        if (lower.includes("pizza") || lower.includes("burger")) return `Modern mutfağın vazgeçilmezi. El yapımı özel hamuru/köftesi ve taze malzemelerin buluştuğu doyurucu bir gurme deneyimi.`;
        return `${n}, taze malzemelerle özenle hazırlanan, işletmemizin en özel lezzetlerinden biridir. Afiyet olsun!`;
      }
    };
    
    await new Promise(r => setTimeout(r, 1500)); 
    setDesc(generate(name, false));
    if (nameEn) setDescEn(generate(nameEn, true));
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
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(4px)", animation: "fadeIn .3s" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", background: "#0D0D0D", borderRadius: 24, border: "1px solid rgba(255,255,255,.08)", padding: "32px", animation: "fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>{title}</h2>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>Ürün detaylarını profesyonelce yönetin</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Kategori Seçimi</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: catId ? "#fff" : "rgba(255,255,255,.2)", fontSize: 14, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
              <option value="">Kategori seçin...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Ürün Fotoğrafı</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {imagePreview && (
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={imagePreview} alt="" style={{ width: 84, height: 84, borderRadius: 16, objectFit: "cover", border: "2px solid rgba(255,255,255,.1)" }} />
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}
                    style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 12, background: "#ef4444", color: "#fff", border: "3px solid #0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
              <label style={{ flex: 1, padding: "16px", borderRadius: 16, border: "2px dashed rgba(255,255,255,.1)", background: "rgba(255,255,255,.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "rgba(255,255,255,.3)", transition: "all .2s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{imageUploading ? "Yükleniyor..." : imageFile ? imageFile.name : "Dosya Yükle"}</span>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Adı (TR)</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Adana Kebap"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Adı (EN)</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Örn: Adana Kebab"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>Açıklama Sihirbazı</label>
              <button type="button" onClick={generateWithAI} disabled={aiLoading} 
                style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: aiLoading ? "rgba(255,255,255,.05)" : `linear-gradient(135deg, ${themeColor}, #ff8c00)`, border: "none", borderRadius: 10, padding: "6px 14px", cursor: aiLoading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: aiLoading ? "none" : `0 4px 15px ${themeColor}40`, transition: "all .3s" }}>
                {aiLoading ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: "#fff", animation: "pulse .6s infinite alternate" }} />
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: "#fff", animation: "pulse .6s .2s infinite alternate" }} />
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: "#fff", animation: "pulse .6s .4s infinite alternate" }} />
                  </div>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                    AI ile Yaz
                  </>
                )}
              </button>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ürününüzü en iyi şekilde tarif edin..." rows={3}
              style={{ width: "100%", padding: "16px", borderRadius: 16, border: aiLoading ? `1.5px solid ${themeColor}` : "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", transition: "all .3s", boxShadow: aiLoading ? `0 0 20px ${themeColor}20` : "none" }} />
          </div>

          <div>
            <button type="button" onClick={() => setShowOtherLangs(!showOtherLangs)} style={{ fontSize: 12, fontWeight: 700, color: themeColor, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showOtherLangs ? "rotate(90deg)" : "none", transition: "all .2s" }}><path d="M9 18l6-6-6-6"/></svg>
              Diğer Dilleri Düzenle (AR, DE, RU)
            </button>
            {showOtherLangs && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px", background: "rgba(255,255,255,.01)", borderRadius: 16, border: "1px solid rgba(255,255,255,.04)", marginTop: 12, animation: "fadeDown .3s both" }}>
                <div>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.3)", display: "block", marginBottom: 6, fontWeight: 700 }}>Açıklama (EN)</label>
                  <input type="text" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="English description..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="Ürün Adı (AR)" dir="rtl" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descAr} onChange={e => setDescAr(e.target.value)} placeholder="Açıklama (AR)" dir="rtl" style={{ flex: 2, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameDe} onChange={e => setNameDe(e.target.value)} placeholder="Ürün Adı (DE)" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descDe} onChange={e => setDescDe(e.target.value)} placeholder="Açıklama (DE)" style={{ flex: 2, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={nameRu} onChange={e => setNameRu(e.target.value)} placeholder="Ürün Adı (RU)" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <input type="text" value={descRu} onChange={e => setDescRu(e.target.value)} placeholder="Açıklama (RU)" style={{ flex: 2, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Fiyat (₺) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>İndirim (%)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" min="0" max="100"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          {(() => {
            const planOrder = ["free", "yenimekan", "starter", "pro"];
            const currentPlanIndex = planOrder.indexOf(restaurantPlan);
            const starterLocked = currentPlanIndex < planOrder.indexOf("starter");

            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Kalori (kcal)</label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0"
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                  </div>
                  <div style={{ opacity: starterLocked ? 0.5 : 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8, textTransform: "uppercase" }}>
                      Hazırlık (dk) {starterLocked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </label>
                    <input type="number" value={prepTime} onChange={e => !starterLocked && setPrepTime(e.target.value)} placeholder={starterLocked ? "Kilitli" : "0"} disabled={starterLocked}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                  </div>
                </div>

                <div style={{ opacity: starterLocked ? 0.5 : 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Alerjen Bilgisi</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ALLERGENS.map(a => {
                      const selected = allergens.includes(a.key);
                      return (
                        <button key={a.key} type="button"
                          onClick={() => setAllergens(prev => selected ? prev.filter(x => x !== a.key) : [...prev, a.key])}
                          style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${selected ? themeColor : "rgba(255,255,255,.06)"}`, background: selected ? `${themeColor}15` : "rgba(255,255,255,.02)", color: selected ? "#fff" : "rgba(255,255,255,.3)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="button" onClick={() => !starterLocked && setChefPick(!chefPick)} 
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 16, border: `1.5px solid ${chefPick ? themeColor : "rgba(255,255,255,.08)"}`, background: chefPick ? `${themeColor}08` : "rgba(255,255,255,.02)", cursor: starterLocked ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: starterLocked ? 0.5 : 1, transition: "all .2s" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 8, background: chefPick ? themeColor : "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {chefPick && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      Şefin Seçimi {starterLocked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Menüde özel etiket ile vurgulayın</div>
                  </div>
                </button>

                <div style={{ marginTop: 8, opacity: starterLocked ? 0.5 : 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12, textTransform: "uppercase" }}>
                    Ürün Ekstraları {starterLocked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {extras.map((ex, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", animation: "fadeUp .3s both" }}>
                        <input type="text" value={ex.name_tr} onChange={e => { const n = [...extras]; n[i].name_tr = e.target.value; setExtras(n); }} placeholder="Örn: Ekstra Peynir" disabled={starterLocked} style={{ flex: 2, padding: "12px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                        <div style={{ position: "relative", flex: 1 }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,.3)" }}>₺</span>
                          <input type="number" value={ex.price} onChange={e => { const n = [...extras]; n[i].price = Number(e.target.value); setExtras(n); }} placeholder="0" disabled={starterLocked} style={{ width: "100%", padding: "12px 14px 12px 28px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.08)", background: "#161616", color: "#fff", fontSize: 13, outline: "none", cursor: starterLocked ? "not-allowed" : "text" }} />
                        </div>
                        <button type="button" onClick={() => { const n = [...extras]; n[i].is_multiple = !n[i].is_multiple; setExtras(n); }} disabled={starterLocked} style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${ex.is_multiple ? themeColor : "rgba(255,255,255,.06)"}`, background: ex.is_multiple ? `${themeColor}15` : "rgba(255,255,255,.02)", color: ex.is_multiple ? themeColor : "rgba(255,255,255,.4)", fontSize: 11, fontWeight: 800, cursor: starterLocked ? "not-allowed" : "pointer", textTransform: "uppercase" }}>
                          {ex.is_multiple ? "Çoklu" : "Tekli"}
                        </button>
                        <button type="button" onClick={() => setExtras(extras.filter((_, idx) => idx !== i))} disabled={starterLocked} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "rgba(239,68,68,.1)", color: "#ef4444", cursor: starterLocked ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => !starterLocked && setExtras([...extras, { name_tr: "", price: 0, is_multiple: true }])} disabled={starterLocked} style={{ padding: "14px", borderRadius: 14, border: "2px dashed rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.3)", fontSize: 12, fontWeight: 700, cursor: starterLocked ? "not-allowed" : "pointer", transition: "all .2s" }}>
                      + Yeni Opsiyon Ekle
                    </button>
                  </div>
                </div>
              </>
            );
          })()}

          {error && <div style={{ padding: "14px", borderRadius: 14, background: "rgba(239,68,68,.1)", border: "1.5px solid rgba(239,68,68,.2)", fontSize: 13, color: "#f87171", fontWeight: 600 }}>{error}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 16, border: "1.5px solid rgba(255,255,255,.08)", background: "transparent", color: "rgba(255,255,255,.4)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>İptal</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "16px", borderRadius: 16, border: "none", background: saving ? `${themeColor}80` : themeColor, color: "#fff", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: `0 8px 25px ${themeColor}40` }}>
              {saving ? "Kaydediliyor..." : title}
            </button>
          </div>
        </div>
        <style>{`
          @keyframes pulse { to { opacity: 0.3; transform: scale(1.2); } }
          select option { background: #1a1a1a; color: #fff; }
        `}</style>
      </div>
    </div>
  );
}
