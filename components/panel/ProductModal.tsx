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
  flash,
}: {
  title: string;
  categories: Category[];
  initial: Partial<Product> & { category_id?: string | null };
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  allProducts?: Product[];
  themeColor?: string;
  restaurantPlan?: string;
  flash?: (msg: string) => void;
}) {
  const [step, setStep] = useState(1);
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
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [discount, setDiscount] = useState(initial.discount_pct ? String(initial.discount_pct) : "0");
  const [label, setLabel] = useState((initial as any).label || ""); 
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
    
    const generate = (n: string) => {
      const lower = n.toLowerCase();
      if (lower.includes("kebap") || lower.includes("et")) return `Usta ellerin geleneksel tarifiyle hazırlanan, zırh kıyması ve özel baharatların muhteşem uyumu. Her lokmada gerçek bir lezzet şöleni.`;
      if (lower.includes("çorba")) return `Günün her saati iç ısıtan, süzme kıvamı ve tereyağlı özel sosuyla hazırlanan geleneksel bir başlangıç.`;
      if (lower.includes("tatlı") || lower.includes("pasta")) return `Yemeğin en tatlı finali. Özenle seçilmiş malzemelerle hazırlanan, hafif ve damakta iz bırakan eşsiz bir lezzet.`;
      if (lower.includes("pizza") || lower.includes("burger")) return `Modern mutfağın vazgeçilmezi. El yapımı özel hamuru/köftesi ve taze malzemelerin buluştuğu doyurucu bir gurme deneyimi.`;
      return `${n}, taze malzemelerle özenle hazırlanan, işletmemizin en özel lezzetlerinden biridir. Afiyet olsun!`;
    };
    
    await new Promise(r => setTimeout(r, 1500)); 
    setDesc(generate(name));
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { setStep(1); setError("Ürün adı zorunlu."); return; }
    if (!price || isNaN(Number(price))) { setStep(3); setError("Geçerli bir fiyat girin."); return; }
    if (!catId) { setStep(1); setError("Kategori seçin."); return; }
    
    setSaving(true); 
    setError(null);
    
    try {
      let finalImageUrl = imagePreview;
      if (imageFile) {
        setImageUploading(true);
        const ext = imageFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("product-images").upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        
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
        label: label || null,
        calories: calories ? Number(calories) : null,
        prep_time: prepTime ? Number(prepTime) : null,
        is_chef_pick: chefPick,
        is_combo: false,
        combo_items: [],
        allergens,
        image_url: finalImageUrl,
        extras: extras.filter(e => e.name_tr.trim() !== ""),
      });

    } catch (err: any) {
      setError(err.message || "Kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? themeColor : "rgba(255,255,255,.05)", transition: "all .3s" }} />
      ))}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)", animation: "fadeIn .3s" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 550, maxHeight: "90vh", overflowY: "auto", background: "#080808", borderRadius: 32, border: "1px solid rgba(255,255,255,.1)", padding: "40px", animation: "fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        
        <StepIndicator />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: themeColor, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Adım {step} / 3</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-.02em" }}>
              {step === 1 ? "Kimlik & Görsel" : step === 2 ? "Ekstralar & Detaylar" : "Satış Ayarları"}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {step === 1 && (
            <div style={{ animation: "fadeIn .4s both", display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 12, display: "block" }}>ÜRÜN GÖRSELİ</label>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 100, height: 100, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                    {imagePreview ? <img src={imagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    <input type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Yüksek kaliteli bir görsel <br/> müşterileri etkiler.</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>KATEGORİ</label>
                <select value={catId} onChange={e => setCatId(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", colorScheme: "dark" }}>
                  <option value="" style={{ background: "#111" }}>Kategori Seçin...</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ background: "#111" }}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)" }}>ÜRÜN ADI</label>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Gurme Burger" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
              </div>

              {/* OTHER LANGUAGES (COLLAPSIBLE OR GRID) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ opacity: nameEn ? 1 : 0.3 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 4, display: "block" }}>ENGLISH NAME</label>
                  <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Name (EN)" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: 12 }} />
                </div>
                <div style={{ opacity: nameAr ? 1 : 0.3 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 4, display: "block" }}>ARABIC NAME</label>
                  <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="Name (AR)" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: 12, textAlign: "right" }} />
                </div>
                <div style={{ opacity: nameDe ? 1 : 0.3 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 4, display: "block" }}>GERMAN NAME</label>
                  <input value={nameDe} onChange={e => setNameDe(e.target.value)} placeholder="Name (DE)" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: 12 }} />
                </div>
                <div style={{ opacity: nameRu ? 1 : 0.3 }}>
                  <label style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 4, display: "block" }}>RUSSIAN NAME</label>
                  <input value={nameRu} onChange={e => setNameRu(e.target.value)} placeholder="Name (RU)" style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "#fff", fontSize: 12 }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)" }}>AÇIKLAMA (TR)</label>
                  <button onClick={generateWithAI} disabled={aiLoading} style={{ fontSize: 10, fontWeight: 800, color: themeColor, background: "transparent", border: "none", cursor: "pointer" }}>{aiLoading ? "YAZILIYOR..." : "AI İLE YAZ"}</button>
                </div>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ürününüzü tarif edin..." rows={2} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", resize: "none" }} />
              </div>

            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeIn .4s both", display: "flex", flexDirection: "column", gap: 24 }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>KALORİ</label>
                  <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>HAZIRLIK (DK)</label>
                  <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="0" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)" }}>EKSTRA SEÇENEKLER</label>
                  <button onClick={() => setExtras([...extras, { name_tr: "", price: 0, is_multiple: true }])} style={{ fontSize: 10, fontWeight: 800, color: themeColor, background: "transparent", border: "none", cursor: "pointer" }}>+ EKLE</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {extras.map((ex, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={ex.name_tr} onChange={e => { const n = [...extras]; n[i].name_tr = e.target.value; setExtras(n); }} placeholder="Ekstra" style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13 }} />
                      <input type="number" value={ex.price} onChange={e => { const n = [...extras]; n[i].price = Number(e.target.value); setExtras(n); }} placeholder="₺" style={{ width: 70, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 13 }} />
                      <button onClick={() => setExtras(extras.filter((_, idx) => idx !== i))} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,.1)", color: "#ef4444", border: "none" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 12, display: "block" }}>ALERJENLER</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ALLERGENS.map(a => {
                    const sel = allergens.includes(a.key);
                    return <button key={a.key} onClick={() => setAllergens(prev => sel ? prev.filter(x => x !== a.key) : [...prev, a.key])} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: sel ? themeColor : "transparent", color: "#fff", fontSize: 11, fontWeight: 600 }}>{a.label}</button>
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: "fadeIn .4s both", display: "flex", flexDirection: "column", gap: 24 }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>FİYAT (₺)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 18, fontWeight: 800 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>İNDİRİM (%)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontSize: 18, fontWeight: 800 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, display: "block" }}>ETİKET</label>
                <select value={label} onChange={e => setLabel(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }}>
                  <option value="">Yok</option>
                  <option value="YENİ">YENİ</option>
                  <option value="POPÜLER">POPÜLER</option>
                  <option value="VEGAN">VEGAN</option>
                </select>
              </div>

              <button onClick={() => setChefPick(!chefPick)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 16, background: chefPick ? `${themeColor}10` : "rgba(255,255,255,.02)", border: `1px solid ${chefPick ? themeColor : "rgba(255,255,255,.1)"}`, textAlign: "left", cursor: "pointer" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: chefPick ? themeColor : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>{chefPick && "✓"}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Şefin Seçimi</div>
                  <div style={{ fontSize: 12, opacity: .4 }}>Menüde yıldız ile vurgulanır.</div>
                </div>
              </button>
            </div>
          )}

          {error && <div style={{ padding: "12px", borderRadius: 12, background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13, fontWeight: 700 }}>{error}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {step > 1 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontWeight: 600 }}>Geri</button>}
            <button onClick={() => step < 3 ? setStep(step + 1) : handleSave()} disabled={saving} style={{ flex: 2, padding: "14px", borderRadius: 12, background: themeColor, color: "#fff", fontWeight: 800, border: "none" }}>{saving ? "KAYDEDİLİYOR..." : step < 3 ? "DEVAM ET" : title}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
