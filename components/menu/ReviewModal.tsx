"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant } from "@/types";

export function ReviewModal({
  restaurant,
  onClose,
  onSuccess
}: {
  restaurant: Restaurant;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const A = restaurant.theme_color || "#D4470A";

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Lütfen isminizi girin.");
    setSaving(true);
    
    const { error } = await supabase.from("reviews").insert({
      restaurant_id: restaurant.id,
      customer_name: name.trim(),
      rating,
      comment: comment.trim() || null,
      is_public: true
    });

    if (error) {
      alert("Hata oluştu, tekrar deneyin.");
    } else {
      onSuccess();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,.2)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#111" }}>Bizi Değerlendirin</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Deneyiminizi paylaşarak bize destek olabilirsiniz.</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)} style={{ background: "none", border: "none", fontSize: 32, cursor: "pointer", filter: s <= rating ? "none" : "grayscale(1) opacity(0.3)", transition: "all .2s" }}>
              ⭐
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#999", display: "block", marginBottom: 6, textTransform: "uppercase" }}>İsminiz</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Ahmet Y." style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #eee", background: "#f9f9f9", fontSize: 14, outline: "none", color: "#111" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#999", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Yorumunuz (Opsiyonel)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Yemeği nasıl buldunuz?" rows={3} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #eee", background: "#f9f9f9", fontSize: 14, outline: "none", color: "#111", resize: "none" }} />
          </div>

          <button onClick={handleSubmit} disabled={saving} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
            {saving ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
          </button>
          <button onClick={onClose} style={{ width: "100%", padding: "10px 0", borderRadius: 14, border: "none", background: "transparent", color: "#999", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Vazgeç</button>
        </div>
      </div>
    </div>
  );
}
