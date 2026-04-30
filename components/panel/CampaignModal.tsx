"use client";

import { useState } from "react";
import { Product } from "@/types";

export function CampaignModal({
  onClose,
  onSave,
  products = [],
  themeColor = "#D4470A",
  initialData = null
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  products: Product[];
  themeColor?: string;
  initialData?: any;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "percentage");
  const [value, setValue] = useState(initialData?.value || "");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.products || []);
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");

  const handleSave = () => {
    if (!name || !value) return;
    onSave({
      name,
      type,
      value,
      products: selectedProducts,
      start_date: startDate,
      end_date: endDate,
      status: "Aktif"
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(10px)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 500, background: "#0a0a0a", borderRadius: 28, border: "1px solid rgba(255,255,255,.1)", padding: "32px", animation: "fadeUp .3s both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{initialData ? "Kampanyayı Düzenle" : "Yeni Kampanya"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8 }}>KAMPANYA ADI</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Hafta Sonu İndirimi" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8 }}>TİP</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }}>
                <option value="percentage">Yüzde İndirim (%)</option>
                <option value="fixed">Sabit Fiyat (₺)</option>
                <option value="bogo">1 Alana 1 Bedava</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8 }}>DEĞER</label>
              <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="Örn: 15" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8 }}>UYGULANACAK ÜRÜNLER</label>
            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "rgba(255,255,255,.02)", borderRadius: 12 }}>
              {products.map(p => (
                <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={e => {
                    if (e.target.checked) setSelectedProducts([...selectedProducts, p.id]);
                    else setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                  }} />
                  {p.name_tr}
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSave} style={{ width: "100%", padding: "16px", borderRadius: 14, background: themeColor, border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 12 }}>
            Kampanyayı {initialData ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
