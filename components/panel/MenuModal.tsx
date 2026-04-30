"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, Category } from "@/types";

export function MenuModal({
  onClose,
  onSave,
  products = [],
  categories = [],
  initial,
  themeColor = "#D4470A",
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  products: Product[];
  categories: Category[];
  initial?: Partial<Product>;
  themeColor?: string;
}) {
  const [name, setName] = useState(initial?.name_tr || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initial?.category_id || "");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [selectedItems, setSelectedItems] = useState<string[]>(initial?.combo_items || []);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      !p.is_combo && 
      (p.name_tr.toLowerCase().includes(searchTerm.toLowerCase()) || 
       categories.find(c => c.id === p.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm, categories]);

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name || !selectedCategoryId || !price || selectedItems.length === 0) {
      alert("Lütfen tüm alanları doldurun ve en az bir ürün seçin.");
      return;
    }

    onSave({
      name_tr: name,
      category_id: selectedCategoryId,
      price: Number(price),
      is_combo: true,
      combo_items: selectedItems,
      is_active: true,
      is_available: true,
      desc_tr: initial?.desc_tr || `${selectedItems.length} ürünlük özel menü.`
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(12px)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800, height: "85vh", background: "#0a0a0a", borderRadius: 32, border: "1px solid rgba(255,255,255,.1)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeUp .3s both" }}>
        
        {/* HEADER */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{initial ? "Menüyü Düzenle" : "Yeni Menü Oluştur"}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Mevcut ürünleri birleştirerek avantajlı bir paket oluşturun</p>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.03)", border: "none", color: "#fff", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", overflow: "hidden" }}>
          
          {/* LEFT: FORM SETTINGS */}
          <div style={{ padding: 32, borderRight: "1px solid rgba(255,255,255,.05)", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: themeColor, marginBottom: 8, display: "block" }}>MENÜ ADI</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Efsane Öğle Menüsü" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: themeColor, marginBottom: 8, display: "block" }}>KATEGORİ</label>
                <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#161616", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none", colorScheme: "dark" }}>
                  <option value="" style={{ background: "#161616" }}>Seçiniz...</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{ background: "#161616" }}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: themeColor, marginBottom: 8, display: "block" }}>MENÜ FİYATI (₺)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "14px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} />
              </div>

              <div style={{ marginTop: 20, padding: 20, borderRadius: 20, background: `${themeColor}10`, border: `1px solid ${themeColor}20` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: themeColor, marginBottom: 12 }}>SEÇİLEN ÜRÜNLER ({selectedItems.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedItems.map(id => {
                    const p = products.find(prod => prod.id === id);
                    return (
                      <div key={id} style={{ fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                        <span>• {p?.name_tr}</span>
                        <span style={{ opacity: .4 }}>₺{p?.price}</span>
                      </div>
                    );
                  })}
                  {selectedItems.length === 0 && <div style={{ fontSize: 12, opacity: .3 }}>Henüz ürün seçilmedi</div>}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT SELECTION */}
          <div style={{ padding: 32, overflowY: "auto", background: "rgba(255,255,255,.01)" }}>
            <div style={{ marginBottom: 24, position: "relative" }}>
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Ürün ara..." 
                style={{ width: "100%", padding: "14px 44px", borderRadius: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", outline: "none" }} 
              />
              <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: .3 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {filteredProducts.map(p => {
                const isSelected = selectedItems.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => handleToggleItem(p.id)}
                    style={{ 
                      padding: 16, 
                      borderRadius: 20, 
                      background: isSelected ? `${themeColor}15` : "rgba(255,255,255,.03)", 
                      border: `1.5px solid ${isSelected ? themeColor : "rgba(255,255,255,.05)"}`,
                      cursor: "pointer",
                      transition: "all .2s",
                      position: "relative"
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.name_tr}</div>
                    <div style={{ fontSize: 12, opacity: .4 }}>{categories.find(c => c.id === p.category_id)?.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 12, color: isSelected ? themeColor : "#fff" }}>₺{p.price}</div>
                    
                    {isSelected && (
                      <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: 99, background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>İptal</button>
          <button onClick={handleSave} style={{ padding: "12px 32px", borderRadius: 12, background: themeColor, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${themeColor}40` }}>{initial ? "Değişiklikleri Kaydet" : "Menüyü Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}
