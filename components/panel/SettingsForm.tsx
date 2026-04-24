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
  const [hours, setHours] = useState(restaurant.hours || "");
  const [color, setColor] = useState(restaurant.theme_color || "#D4470A");
  
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

    let finalLogoUrl = restaurant.logo_url;

    if (logoFile) {
      setLogoUploading(true);
      const ext = logoFile.name.split(".").pop();
      const path = `logos/${restaurant.id}-${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images") // Reusing the same bucket for simplicity or use a 'logos' bucket
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
      hours: hours.trim() || null,
      theme_color: color,
      logo_url: finalLogoUrl
    };

    const { error: updateError } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", restaurant.id);

    if (updateError) {
      setError("Ayarlar kaydedilemedi.");
    } else {
      setSuccess(true);
      onUpdate(updates);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>Restoran Ayarları</div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8 }}>Logo</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0, background: "#fff" }} />
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>WiFi Şifresi</label>
            <input type="text" value={wifi} onChange={e => setWifi(e.target.value)} placeholder="Müşterileriniz için"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Çalışma Saatleri</label>
            <input type="text" value={hours} onChange={e => setHours(e.target.value)} placeholder="09:00 - 23:00"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Tema Rengi (HEX)</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 10, background: "transparent", cursor: "pointer" }} />
            <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="#D4470A"
              style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
          </div>
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
