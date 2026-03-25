"use client";

import { useState } from "react";

var A = "#D4470A";

var plans = [
  {
    id: "free",
    name: "Ücretsiz",
    nameEn: "Free",
    desc: "Dijital menüye ilk adım",
    price: 0,
    priceAnnual: 0,
    color: "#666",
    popular: false,
    target: "Yeni açılan küçük mekanlar",
    features: [
      { text: "15 ürüne kadar", included: true },
      { text: "1 menü", included: true },
      { text: "Temel QR kod", included: true },
      { text: "5 dil desteği", included: true },
      { text: "Karanlık mod", included: true },
      { text: "Mekan fotoğrafları", included: true },
      { text: "WiFi gösterimi", included: true },
      { text: "Garson çağır butonu", included: true },
      { text: "Sepet & WhatsApp sipariş", included: false },
      { text: "Şefin seçimi bölümü", included: false },
      { text: "Fotoğraf galerisi", included: false },
      { text: "Hazırlık süresi & porsiyon", included: false },
      { text: "Benzer yemek önerileri", included: false },
      { text: "Kampanya & indirim", included: false },
      { text: "Detaylı analitik", included: false },
      { text: "Logo kaldırma", included: false },
      { text: "Özel domain", included: false },
      { text: "Masa bazlı QR", included: false },
      { text: "Çoklu şube", included: false },
      { text: "API erişimi", included: false },
    ]
  },
  {
    id: "starter",
    name: "Başlangıç",
    nameEn: "Starter",
    desc: "Büyümek isteyen restoranlar",
    price: 149,
    priceAnnual: 119,
    color: "#2563eb",
    popular: false,
    target: "Tek şubeli aktif restoranlar",
    features: [
      { text: "50 ürüne kadar", included: true },
      { text: "1 menü", included: true },
      { text: "Özelleştirilebilir QR kod", included: true },
      { text: "5 dil desteği", included: true },
      { text: "Karanlık mod", included: true },
      { text: "Mekan fotoğrafları", included: true },
      { text: "WiFi gösterimi", included: true },
      { text: "Garson çağır butonu", included: true },
      { text: "Sepet & WhatsApp sipariş", included: true },
      { text: "Şefin seçimi bölümü", included: true },
      { text: "Fotoğraf galerisi (3 foto/ürün)", included: true },
      { text: "Hazırlık süresi & porsiyon", included: true },
      { text: "Benzer yemek önerileri", included: false },
      { text: "Kampanya & indirim", included: false },
      { text: "Temel analitik", included: true },
      { text: "Logo kaldırma", included: false },
      { text: "Özel domain", included: false },
      { text: "Masa bazlı QR (5 masa)", included: true },
      { text: "Çoklu şube", included: false },
      { text: "API erişimi", included: false },
    ]
  },
  {
    id: "pro",
    name: "Profesyonel",
    nameEn: "Pro",
    desc: "Tüm özellikler, sınırsız güç",
    price: 299,
    priceAnnual: 239,
    color: A,
    popular: true,
    target: "Yoğun restoranlar & kafeler",
    features: [
      { text: "Sınırsız ürün", included: true },
      { text: "Sınırsız menü", included: true },
      { text: "Premium QR kod tasarımı", included: true },
      { text: "5 dil desteği", included: true },
      { text: "Karanlık mod", included: true },
      { text: "Mekan fotoğrafları", included: true },
      { text: "WiFi gösterimi", included: true },
      { text: "Garson çağır butonu", included: true },
      { text: "Sepet & WhatsApp sipariş", included: true },
      { text: "Şefin seçimi bölümü", included: true },
      { text: "Fotoğraf galerisi (sınırsız)", included: true },
      { text: "Hazırlık süresi & porsiyon", included: true },
      { text: "Benzer yemek önerileri", included: true },
      { text: "Kampanya & indirim", included: true },
      { text: "Detaylı analitik", included: true },
      { text: "Logo kaldırma (white-label)", included: true },
      { text: "Özel domain", included: true },
      { text: "Masa bazlı QR (sınırsız)", included: true },
      { text: "Çoklu şube", included: false },
      { text: "API erişimi", included: false },
    ]
  },
  {
    id: "enterprise",
    name: "İşletme",
    nameEn: "Enterprise",
    desc: "Zincir restoranlar & oteller",
    price: 699,
    priceAnnual: 559,
    color: "#111",
    popular: false,
    target: "2+ şubeli zincirler, oteller",
    features: [
      { text: "Sınırsız ürün", included: true },
      { text: "Sınırsız menü", included: true },
      { text: "Premium QR kod tasarımı", included: true },
      { text: "5+ dil desteği (özel dil ekle)", included: true },
      { text: "Karanlık mod", included: true },
      { text: "Mekan fotoğrafları", included: true },
      { text: "WiFi gösterimi", included: true },
      { text: "Garson çağır butonu", included: true },
      { text: "Sepet & WhatsApp sipariş", included: true },
      { text: "Şefin seçimi bölümü", included: true },
      { text: "Fotoğraf galerisi (sınırsız)", included: true },
      { text: "Hazırlık süresi & porsiyon", included: true },
      { text: "Benzer yemek önerileri", included: true },
      { text: "Kampanya & indirim", included: true },
      { text: "Gelişmiş analitik & raporlama", included: true },
      { text: "Tam white-label", included: true },
      { text: "Özel domain", included: true },
      { text: "Masa bazlı QR (sınırsız)", included: true },
      { text: "Çoklu şube yönetimi", included: true },
      { text: "API erişimi", included: true },
    ]
  }
];

var extras = [
  { text: "Öncelikli destek", free: "—", starter: "Email", pro: "Email + Chat", ent: "7/24 Telefon" },
  { text: "Kurulum desteği", free: "—", starter: "Rehber", pro: "Bire bir", ent: "Özel ekip" },
  { text: "Güncellemeler", free: "✓", starter: "✓", pro: "✓ Erken erişim", ent: "✓ Beta erişim" },
  { text: "Veri yedekleme", free: "—", starter: "Haftalık", pro: "Günlük", ent: "Anlık" },
  { text: "SLA garantisi", free: "—", starter: "—", pro: "%99.5", ent: "%99.9" },
];

export default function FiyatPage() {
  var [annual, setAnnual] = useState(false);
  var [showCompare, setShowCompare] = useState(false);
  var [selectedFaq, setSelectedFaq] = useState(null);

  var faqs = [
    { q: "14 gün deneme nasıl çalışır?", a: "Başlangıç, Pro veya İşletme planlarından birini seçin. 14 gün boyunca tüm özellikleri ücretsiz kullanın. Beğenmezseniz iptal edin, ücret alınmaz. Kredi kartı bilgisi istenir ama 14 gün içinde çekim yapılmaz." },
    { q: "İstediğim zaman plan değiştirebilir miyim?", a: "Evet. Üst plana geçişte fark anında yansır. Alt plana geçişte mevcut dönem sonunda uygulanır. Ücretsiz plana dönüşte Pro özellikler kapanır ama verileriniz silinmez." },
    { q: "KDV dahil mi?", a: "Gösterilen fiyatlar KDV hariçtir. Faturanızda KDV ayrıca gösterilir. Örneğin Pro plan: ₺299 + %20 KDV = ₺358,80/ay" },
    { q: "Yıllık planda erken iptal edersem?", a: "Yıllık planda kalan ayların ücretini iade ederiz. Sözleşme yok, risk yok." },
    { q: "Başka gizli ücret var mı?", a: "Hayır. Sipariş başına komisyon yok, kurulum ücreti yok, trafik limiti yok. Sadece sabit aylık/yıllık ücret." },
    { q: "Özel fiyat alabilir miyim?", a: "10+ şubeniz varsa size özel fiyat teklifi sunabiliriz. İletişime geçin." },
  ];

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..900&display=swap" rel="stylesheet" />
      <style>{`*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.si{animation:si .4s cubic-bezier(.25,1,.5,1) both}.pr:active{transform:scale(.977);transition:transform .06s}::-webkit-scrollbar{display:none}`}</style>

      {/* Header */}
      <div style={{ padding: "32px 20px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
            <div style={{ width: 11, height: 2, background: A, borderRadius: 99 }} />
            <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.03em" }}><span style={{ color: "#111" }}>TEM</span><span style={{ color: A }}>eat</span></span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 8px", letterSpacing: "-.04em", lineHeight: 1.1 }}>
          Basit, Şeffaf<br />Fiyatlandırma
        </h1>
        <p style={{ fontSize: 13, color: "#777", margin: "0 0 24px", lineHeight: 1.5 }}>
          Gizli ücret yok, komisyon yok, sözleşme yok.<br />İstediğiniz zaman iptal edin.
        </p>

        {/* Toggle */}
        <div style={{ display: "inline-flex", background: "#EFEFEF", borderRadius: 12, padding: 3, marginBottom: 28 }}>
          <button onClick={function() { setAnnual(false); }}
            style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: !annual ? "#FFF" : "transparent", color: !annual ? "#111" : "#999", boxShadow: !annual ? "0 1px 4px rgba(0,0,0,.06)" : "none", transition: "all .2s" }}>
            Aylık
          </button>
          <button onClick={function() { setAnnual(true); }}
            style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: annual ? "#FFF" : "transparent", color: annual ? "#111" : "#999", boxShadow: annual ? "0 1px 4px rgba(0,0,0,.06)" : "none", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}>
            Yıllık <span style={{ fontSize: 10, fontWeight: 700, color: A, background: A + "12", padding: "2px 6px", borderRadius: 4 }}>%20 indirim</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding: "0 16px" }}>
        {plans.map(function(plan, i) {
          var price = annual ? plan.priceAnnual : plan.price;
          var isPro = plan.popular;

          return (
            <div key={plan.id} className="si" style={{
              background: isPro ? "#111" : "#FFF",
              borderRadius: 20,
              padding: "24px 20px",
              marginBottom: 12,
              border: isPro ? "2px solid " + A : "1.5px solid #EBEBEB",
              position: "relative",
              animationDelay: i * 0.06 + "s"
            }}>
              {/* Popular badge */}
              {isPro && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 99 }}>
                  En Popüler
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  {/* Plan icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: plan.color + (isPro ? "" : "12"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14, color: isPro ? "#FFF" : plan.color }}>
                        {plan.id === "free" ? "○" : plan.id === "starter" ? "◐" : plan.id === "pro" ? "●" : "◆"}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isPro ? "#FFF" : "#111" }}>{plan.name}</div>
                      <div style={{ fontSize: 10, color: isPro ? "#888" : "#999" }}>{plan.desc}</div>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: "right" }}>
                  {price === 0 ? (
                    <div style={{ fontSize: 28, fontWeight: 800, color: isPro ? "#FFF" : "#111" }}>₺0</div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: isPro ? "#FFF" : "#111" }}>₺{price}</span>
                        <span style={{ fontSize: 11, color: isPro ? "#888" : "#999" }}>/ay</span>
                      </div>
                      {annual && (
                        <div style={{ fontSize: 10, color: isPro ? "#666" : "#BBB", textDecoration: "line-through" }}>₺{plan.price}/ay</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Target */}
              <div style={{ fontSize: 11, color: isPro ? A : plan.color, fontWeight: 600, marginBottom: 14, background: isPro ? A + "15" : plan.color + "08", display: "inline-block", padding: "4px 10px", borderRadius: 6 }}>
                {plan.target}
              </div>

              {/* Key features (show top 6-8) */}
              <div style={{ marginBottom: 16 }}>
                {plan.features.slice(0, plan.id === "free" ? 8 : plan.id === "starter" ? 12 : plan.id === "enterprise" ? 14 : 18).map(function(f, j) {
                  if (!f.included) return null;
                  return (
                    <div key={j} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 12, color: isPro ? "#CCC" : "#444" }}>
                      <span style={{ color: f.included ? (isPro ? A : "#16a34a") : "#DDD", flexShrink: 0 }}>✓</span>
                      <span>{f.text}</span>
                    </div>
                  );
                })}
                {plan.features.filter(function(f) { return !f.included; }).length > 0 && (
                  <div style={{ fontSize: 10, color: isPro ? "#555" : "#BBB", marginTop: 6 }}>
                    + {plan.features.filter(function(f) { return !f.included; }).length} özellik kilitli
                  </div>
                )}
              </div>

              {/* CTA */}
              {plan.id === "free" ? (
                <button className="pr" style={{ width: "100%", padding: 13, borderRadius: 12, border: "1.5px solid #DDD", background: "#FFF", color: "#333", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Ücretsiz Başla
                </button>
              ) : plan.id === "enterprise" ? (
                <button className="pr" style={{ width: "100%", padding: 13, borderRadius: 12, border: "1.5px solid #333", background: "#111", color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  İletişime Geçin
                </button>
              ) : (
                <button className="pr" style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: isPro ? A : plan.color, color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: isPro ? "0 4px 16px " + A + "40" : "none" }}>
                  14 Gün Ücretsiz Dene
                </button>
              )}

              {plan.id !== "free" && (
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: isPro ? "#555" : "#BBB" }}>
                  Kredi kartı gerekli · İstediğin zaman iptal
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compare button */}
      <div style={{ padding: "12px 16px 0", textAlign: "center" }}>
        <button onClick={function() { setShowCompare(!showCompare); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: A, fontFamily: "inherit", padding: "8px 16px" }}>
          {showCompare ? "Karşılaştırmayı Gizle ↑" : "Tüm Özellikleri Karşılaştır ↓"}
        </button>
      </div>

      {/* Feature Comparison Table */}
      {showCompare && (
        <div style={{ padding: "12px 16px", overflowX: "auto" }}>
          <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #EEE", overflow: "hidden", minWidth: 460 }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 58px 58px 58px", padding: "12px 14px", borderBottom: "1px solid #EEE", background: "#FAFAFA" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#999" }}>ÖZELLİK</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#999", textAlign: "center" }}>Free</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#2563eb", textAlign: "center" }}>Start</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: A, textAlign: "center" }}>Pro</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#111", textAlign: "center" }}>Enterp</span>
            </div>

            {/* Rows */}
            {[
              ["Ürün limiti", "15", "50", "∞", "∞"],
              ["Menü sayısı", "1", "1", "∞", "∞"],
              ["Dil desteği", "5", "5", "5", "5+"],
              ["Karanlık mod", "✓", "✓", "✓", "✓"],
              ["Mekan fotoğrafları", "✓", "✓", "✓", "✓"],
              ["WiFi & Garson", "✓", "✓", "✓", "✓"],
              ["Sepet & Sipariş", "—", "✓", "✓", "✓"],
              ["Şefin seçimi", "—", "✓", "✓", "✓"],
              ["Fotoğraf galerisi", "1", "3/ürün", "∞", "∞"],
              ["Hazırlık & porsiyon", "—", "✓", "✓", "✓"],
              ["Benzer öneriler", "—", "—", "✓", "✓"],
              ["Kampanyalar", "—", "—", "✓", "✓"],
              ["Analitik", "—", "Temel", "Detaylı", "Gelişmiş"],
              ["Logo kaldırma", "—", "—", "✓", "✓"],
              ["Özel domain", "—", "—", "✓", "✓"],
              ["Masa bazlı QR", "—", "5", "∞", "∞"],
              ["Çoklu şube", "—", "—", "—", "✓"],
              ["API erişimi", "—", "—", "—", "✓"],
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 58px 58px 58px 58px", padding: "8px 14px", borderBottom: i < 17 ? "1px solid #F5F5F5" : "none", background: i % 2 ? "#FAFAFA" : "#FFF" }}>
                  <span style={{ fontSize: 11, color: "#333", fontWeight: 500 }}>{row[0]}</span>
                  {[row[1], row[2], row[3], row[4]].map(function(val, j) {
                    var isCheck = val === "✓";
                    var isDash = val === "—";
                    return (
                      <span key={j} style={{ fontSize: 10, textAlign: "center", fontWeight: isCheck ? 600 : isDash ? 400 : 600, color: isDash ? "#DDD" : isCheck ? "#16a34a" : j === 2 ? A : "#333" }}>
                        {val}
                      </span>
                    );
                  })}
                </div>
              );
            })}

            {/* Support extras */}
            <div style={{ padding: "8px 14px", background: "#F8F8F8", borderTop: "1px solid #EEE" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#999", marginBottom: 6, letterSpacing: ".06em" }}>DESTEK & HİZMET</div>
            </div>
            {extras.map(function(row, i) {
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 58px 58px 58px 58px", padding: "8px 14px", borderBottom: i < 4 ? "1px solid #F5F5F5" : "none" }}>
                  <span style={{ fontSize: 11, color: "#333" }}>{row.text}</span>
                  <span style={{ fontSize: 9, color: row.free === "—" ? "#DDD" : "#333", textAlign: "center" }}>{row.free}</span>
                  <span style={{ fontSize: 9, color: "#333", textAlign: "center" }}>{row.starter}</span>
                  <span style={{ fontSize: 9, color: A, textAlign: "center", fontWeight: 600 }}>{row.pro}</span>
                  <span style={{ fontSize: 9, color: "#111", textAlign: "center", fontWeight: 600 }}>{row.ent}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue Calculator */}
      <div style={{ padding: "24px 16px 0" }}>
        <div style={{ background: "#FFF", borderRadius: 16, border: "1px solid #EEE", padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>Yatırımınızın Karşılığı</div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 16 }}>Pro plan ile kazanacağınız değer</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Basılı menü tasarruf", value: "₺500+/ay", desc: "Baskı maliyeti sıfır" },
              { label: "Sipariş artışı", value: "%15-25", desc: "Görsel menü etkisi" },
              { label: "Garson verimliliği", value: "%30+", desc: "Daha az soru, daha hızlı servis" },
              { label: "Turist memnuniyeti", value: "%90+", desc: "5 dilde menü" },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ background: "#FAFAFA", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: A }}>{item.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#333", marginTop: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{item.desc}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: A + "08", border: "1px solid " + A + "20", borderRadius: 12, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#555" }}>Pro plan maliyeti: <strong style={{ color: "#111" }}>günde sadece ₺10</strong></div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Bir çay fiyatına tüm dijital menü sistemi</div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[
            { icon: "🔒", text: "256-bit SSL" },
            { icon: "💳", text: "iyzico güvencesi" },
            { icon: "📄", text: "e-Arşiv fatura" },
            { icon: "🔄", text: "İstediğin zaman iptal" },
          ].map(function(badge, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{badge.icon}</span>
                <span style={{ fontSize: 10, color: "#999", fontWeight: 500 }}>{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: "32px 16px" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111", textAlign: "center", marginBottom: 16, letterSpacing: "-.03em" }}>Sık Sorulan Sorular</div>

        {faqs.map(function(faq, i) {
          return (
            <div key={i} style={{ borderBottom: "1px solid #EEE" }}>
              <button onClick={function() { setSelectedFaq(selectedFaq === i ? null : i); }}
                style={{ width: "100%", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111", textAlign: "left" }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: "#999", transform: selectedFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {selectedFaq === i && (
                <div style={{ padding: "0 0 14px", fontSize: 12, color: "#666", lineHeight: 1.6 }}>{faq.a}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final CTA */}
      <div style={{ padding: "0 16px 32px", textAlign: "center" }}>
        <div style={{ background: "#111", borderRadius: 20, padding: "28px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#FFF", marginBottom: 6, letterSpacing: "-.03em" }}>Hâlâ emin değil misiniz?</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Ücretsiz planla başlayın, beğenince yükseltin.</div>
          <button className="pr" style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px " + A + "40" }}>
            Ücretsiz Başla →
          </button>
          <div style={{ fontSize: 10, color: "#555", marginTop: 10 }}>Kredi kartı gerekmez · 30 saniyede kurulum</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "0 0 20px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 8, height: 1.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#111", letterSpacing: "-.02em" }}><span style={{ color: "#111" }}>TEM</span><span style={{ color: A }}>eat</span></span>
        </div>
        <div style={{ fontSize: 9, color: "#BBB", marginTop: 4 }}>temeat.com.tr</div>
      </div>
    </div>
  );
}
