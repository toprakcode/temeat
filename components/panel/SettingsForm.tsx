import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant } from "@/types";

export function SettingsForm({
  restaurant,
  themeColor,
  onUpdate
}: {
  restaurant: Restaurant;
  themeColor: string;
  onUpdate: (updated: Partial<Restaurant>) => void;
}) {
  const [wifi, setWifi] = useState(restaurant.wifi_password || "");
  const initialHours = restaurant.hours || "09:00-23:00";
  const [hOpen, hClose] = initialHours.split("-");
  const [openHour, setOpenHour] = useState(hOpen?.split(":")[0] || "09");
  const [openMin, setOpenMin] = useState(hOpen?.split(":")[1] || "00");
  const [closeHour, setCloseHour] = useState(hClose?.split(":")[0] || "23");
  const [closeMin, setCloseMin] = useState(hClose?.split(":")[1] || "00");

  const [color, setColor] = useState(restaurant.theme_color || "#D4470A");
  const [showReviews, setShowReviews] = useState(restaurant.show_reviews ?? true);
  const [acceptOrders, setAcceptOrders] = useState(restaurant.accept_orders ?? true);
  const [orderSound, setOrderSound] = useState(restaurant.order_sound ?? true);
  const [tableCount, setTableCount] = useState(restaurant.table_count || 10);
  const [manualHours, setManualHours] = useState(false);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo_url || null);
  const [logoUploading, setLogoUploading] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    let finalLogoUrl = logoPreview; // Use current preview (might be null if removed)

    if (logoFile) {
      setLogoUploading(true);
      const ext = logoFile.name.split(".").pop();
      const path = `logos/${restaurant.id}-${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, logoFile, { upsert: true });
        
      if (uploadError) {
        setError("Logo yüklenemedi.");
        setSaving(false);
        setLogoUploading(false);
        return;
      }
      
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      finalLogoUrl = urlData.publicUrl;
      setLogoUploading(false);
    }

    const updates = {
      wifi_password: wifi.trim() || null,
      hours: `${openHour}:${openMin}-${closeHour}:${closeMin}`,
      theme_color: color,
      logo_url: finalLogoUrl,
      show_reviews: showReviews,
      accept_orders: acceptOrders,
      order_sound: orderSound,
      table_count: Number(tableCount)
    };

    const { error: updateError } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", restaurant.id);

    if (updateError) {
      setError(`Hata: ${updateError.message}`);
      console.error("Güncelleme hatası:", updateError);
    } else {
      setSuccess(true);
      onUpdate(updates);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minsList = ["00", "15", "30", "45"];

  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Restoran Ayarları</div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>Logo</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {logoPreview ? (
              <div style={{ position: "relative" }}>
                <img src={logoPreview} alt="Logo" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#fff" }} />
                <button type="button" onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 99, background: "#ef4444", color: "#fff", border: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }}>✕</button>
              </div>
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 10, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏢</div>
            )}
            <label style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,.2)", background: "rgba(255,255,255,.04)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.5)", fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {logoUploading ? "Yükleniyor..." : logoFile ? logoFile.name : "Yeni Logo Seç"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogoFile(file);
                  setLogoPreview(URL.createObjectURL(file));
                }
              }} />
            </label>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>WiFi Şifresi</label>
              <input type="text" value={wifi} onChange={e => setWifi(e.target.value)} placeholder="Müşterileriniz için"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Masa Sayısı</label>
              <input type="number" value={tableCount} onChange={e => setTableCount(Number(e.target.value))} placeholder="20"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>Açılış Saati</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {!manualHours ? (
                  <>
                    <select value={openHour} onChange={e => setOpenHour(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", fontSize: 13 }}>
                      {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <div style={{ color: "rgba(255,255,255,.3)" }}>:</div>
                    <select value={openMin} onChange={e => setOpenMin(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", fontSize: 13 }}>
                      {minsList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <input value={openHour} onChange={e => setOpenHour(e.target.value.slice(0,2))} placeholder="09" style={{ width: 64, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", textAlign: "center", fontSize: 14 }} />
                    <div style={{ color: "rgba(255,255,255,.3)" }}>:</div>
                    <input value={openMin} onChange={e => setOpenMin(e.target.value.slice(0,2))} placeholder="00" style={{ width: 64, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", textAlign: "center", fontSize: 14 }} />
                  </>
                )}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>Kapanış Saati</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {!manualHours ? (
                  <>
                    <select value={closeHour} onChange={e => setCloseHour(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", fontSize: 13 }}>
                      {hoursList.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <div style={{ color: "rgba(255,255,255,.3)" }}>:</div>
                    <select value={closeMin} onChange={e => setCloseMin(e.target.value)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", fontSize: 13 }}>
                      {minsList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <input value={closeHour} onChange={e => setCloseHour(e.target.value.slice(0,2))} placeholder="22" style={{ width: 64, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", textAlign: "center", fontSize: 14 }} />
                    <div style={{ color: "rgba(255,255,255,.3)" }}>:</div>
                    <input value={closeMin} onChange={e => setCloseMin(e.target.value.slice(0,2))} placeholder="00" style={{ width: 64, padding: "10px", borderRadius: 8, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", textAlign: "center", fontSize: 14 }} />
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setManualHours(!manualHours)} style={{ background: "none", border: "none", padding: 0, color: themeColor, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            {manualHours ? " Seçerek Belirle" : " Elle Saat Gir"}
          </button>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Tema Rengi (HEX)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 10, background: "transparent", cursor: "pointer" }} />
            <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="#D4470A"
              style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Müşteri Yorumları</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Menüde yorumları ve puanları göster</div>
          </div>
          <button onClick={() => setShowReviews(!showReviews)} style={{ width: 44, height: 24, borderRadius: 99, background: showReviews ? themeColor : "rgba(255,255,255,.1)", position: "relative", border: "none", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ position: "absolute", top: 3, left: showReviews ? 23 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "all .2s" }} />
          </button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Masadan Sipariş</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Müşterilerin dijital menüden sipariş vermesini sağla</div>
          </div>
          <button onClick={() => setAcceptOrders(!acceptOrders)} style={{ width: 44, height: 24, borderRadius: 99, background: acceptOrders ? themeColor : "rgba(255,255,255,.1)", position: "relative", border: "none", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ position: "absolute", top: 3, left: acceptOrders ? 23 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "all .2s" }} />
          </button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Sesli Bildirimler</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Yeni sipariş geldiğinde sesli uyarı ver</div>
          </div>
          <button onClick={() => setOrderSound(!orderSound)} style={{ width: 44, height: 24, borderRadius: 99, background: orderSound ? themeColor : "rgba(255,255,255,.1)", position: "relative", border: "none", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ position: "absolute", top: 3, left: orderSound ? 23 : 3, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "all .2s" }} />
          </button>
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", fontSize: 13, color: "#f87171" }}>{error}</div>}
        {success && <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", fontSize: 13, color: "#22c55e" }}>Ayarlar başarıyla kaydedildi!</div>}

        <button onClick={handleSave} disabled={saving} style={{ padding: "13px 0", marginTop: 8, borderRadius: 11, border: "none", background: saving ? `${themeColor}80` : themeColor, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${themeColor}40` }}>
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>
    </div>
  );
}
