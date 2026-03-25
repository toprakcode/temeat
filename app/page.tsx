"use client";
import { useState } from "react";

const A = "#D4470A";

const FEATURES = [
  { icon: "🌍", title: "5 Dil Desteği", desc: "Türkçe, İngilizce, Arapça, Almanca, Rusça" },
  { icon: "📱", title: "QR Kod Erişim", desc: "Uygulama indirmeye gerek yok. Tara, aç" },
  { icon: "🛒", title: "WhatsApp Sipariş", desc: "Sepete ekle, tek tuşla sipariş gönder" },
  { icon: "🌙", title: "Karanlık Mod", desc: "Akşam ortamına uygun şık tema" },
  { icon: "👨‍🍳", title: "Şefin Seçimi", desc: "Özel yemeklerinizi öne çıkarın" },
  { icon: "📸", title: "Fotoğraf Galerisi", desc: "Her yemeğe birden fazla fotoğraf" },
  { icon: "⏱", title: "Hazırlık Süresi", desc: "Müşteri bekleme süresini görsün" },
  { icon: "📊", title: "Detaylı Analitik", desc: "Hangi yemek çok bakılıyor? Veriyle karar alın" },
  { icon: "🔗", title: "Benzer Öneriler", desc: "Otomatik çapraz satış yapın" },
  { icon: "🏷", title: "Kampanya & İndirim", desc: "Özel günlerde fırsatlarınızı gösterin" },
  { icon: "🏠", title: "Mekan Fotoğrafları", desc: "Ambiyansınızı menüden gösterin" },
  { icon: "💰", title: "Sıfır Komisyon", desc: "Sipariş başına kesinti yok" },
];

const STEPS = [
  { num: "01", title: "Kayıt Olun", desc: "Telefon numaranız ve restoran adınızla 30 saniyede hesap açın." },
  { num: "02", title: "Menüyü Girin", desc: "Yemeklerinizi ekleyin, fotoğraf yükleyin, fiyatları yazın. 10 dakika." },
  { num: "03", title: "QR Kodu Basın", desc: "Sistem QR kodunuzu üretir. İndirin, bastırın, masalara koyun." },
];

const TESTIMONIALS = [
  { name: "Ahmet K.", role: "Sultanahmet Kebapçısı", text: "Turistler menüyü kendi dilinde görünce çok memnun oluyor. Sipariş artışı gözle görülür seviyede.", rating: 5 },
  { name: "Elif S.", role: "Cafe Beyoğlu", text: "Fiyat değişikliklerini anında yapabiliyorum. Basılı menü masrafından kurtuldum.", rating: 5 },
  { name: "Mustafa D.", role: "Ocakbaşı Kadıköy", text: "WhatsApp sipariş özelliği garsonların yükünü azalttı. Servis hızımız arttı.", rating: 5 },
];

const FAQ = [
  { q: "Ücretsiz plan gerçekten ücretsiz mi?", a: "Evet, kredi kartı gerekmez. 15 ürüne kadar tamamen ücretsiz. Süre sınırı yok." },
  { q: "Müşterinin uygulama indirmesi gerekiyor mu?", a: "Hayır. QR kodu tarayınca menü tarayıcıda açılır. Hiçbir indirme gerekmez." },
  { q: "Menümü ne sıklıkla güncelleyebilirim?", a: "İstediğiniz kadar. Fiyat, ürün, fotoğraf anında güncellenir, baskı maliyeti sıfır." },
  { q: "İstediğim zaman iptal edebilir miyim?", a: "Evet, sözleşme yok. İstediğiniz ay iptal edin." },
  { q: "Teknik bilgi gerekiyor mu?", a: "Hayır. WhatsApp kullanabiliyorsanız TEMeat'i de kullanabilirsiniz." },
];

function Logo({ size }: { size: "sm" | "md" }) {
  var s = size === "sm";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s ? 6 : 8 }}>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: s ? 2 : 2.5 }}>
        <div style={{ width: s ? 12 : 16, height: s ? 1.5 : 2, background: A, borderRadius: 99 }} />
        <div style={{ width: s ? 8 : 11, height: s ? 1.5 : 2, background: A, borderRadius: 99 }} />
        <div style={{ width: s ? 12 : 16, height: s ? 1.5 : 2, background: A, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: s ? 12 : 14, fontWeight: 800, letterSpacing: "-0.03em" }}>
        <span style={{ color: "#111" }}>TEM</span>
        <span style={{ color: A }}>eat</span>
      </span>
    </div>
  );
}

export default function Home() {
  var [openFaq, setOpenFaq] = useState<number | null>(null);
  var [annual, setAnnual] = useState(false);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FAFAFA", fontFamily: "system-ui, sans-serif" }}>

      {/* Nav */}
      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEE", background: "#FFF", position: "sticky", top: 0, zIndex: 10 }}>
        <Logo size="md" />
        <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ücretsiz Başla</button>
      </div>

      {/* Hero */}
      <div style={{ padding: "44px 20px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: A + "08", border: "1px solid " + A + "20", borderRadius: 100, padding: "5px 14px", marginBottom: 18 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: A }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: A }}>Yeni nesil dijital menü sistemi</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#111", margin: "0 0 12px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>Menünüzü<br />Dijitale Taşıyın</h1>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px", lineHeight: 1.6 }}>QR kod ile açılan, 5 dilli, WhatsApp sipariş destekli dijital menü. 2 dakikada kurulur, sıfır teknik bilgi gerektirir.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          <button style={{ padding: "13px 28px", borderRadius: 10, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px " + A + "30" }}>Ücretsiz Başla →</button>
          <a href="/demo" style={{ padding: "13px 20px", borderRadius: 10, border: "1.5px solid #DDD", background: "#FFF", color: "#333", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>Demo Gör</a>
        </div>

        {/* Phone mockup */}
        <div style={{ background: "#111", borderRadius: 24, padding: 8, maxWidth: 220, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
          <div style={{ background: "#161616", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#EEE" }}>Demo Restoran</span>
              <div style={{ display: "flex", gap: 3 }}>
                {["Tr", "En", "عر"].map(function(l, i) {
                  return <span key={l} style={{ fontSize: 7, padding: "3px 5px", borderRadius: 4, background: i === 0 ? "#EEE" : "#333", color: i === 0 ? "#111" : "#666", fontWeight: 600 }}>{l}</span>;
                })}
              </div>
            </div>
            {[
              { name: "Adana Kebap", price: "₺220", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=100&h=100&fit=crop&q=60" },
              { name: "İskender", price: "₺250", img: "https://images.unsplash.com/photo-1644789379364-23c3e07f0e9d?w=100&h=100&fit=crop&q=60" },
              { name: "Künefe", price: "₺130", img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=100&h=100&fit=crop&q=60" },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 14px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#EEE" }}>{item.name}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#EEE", marginTop: 1 }}>{item.price}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden" }}>
                    <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "8px 14px 10px" }}>
              <div style={{ background: A, borderRadius: 8, padding: 6, textAlign: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>Sepetim · 2 — ₺470</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
          {[{ num: "200K+", label: "Restoran" }, { num: "5", label: "Dil" }, { num: "₺0", label: "Başlangıç" }].map(function(s) {
            return (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{s.num}</div>
                <div style={{ fontSize: 10, color: "#999" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "48px 20px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Nasıl Çalışır?</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 24px", letterSpacing: "-0.03em" }}>3 Adımda Başlayın</h2>
        {STEPS.map(function(step, i) {
          return (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: i === 0 ? A : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: i === 0 ? "#fff" : "#999", flexShrink: 0 }}>{step.num}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features */}
      <div style={{ padding: "40px 20px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Özellikler</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 24px", letterSpacing: "-0.03em" }}>Her Şey Tek Platformda</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {FEATURES.map(function(f, i) {
            return (
              <div key={i} style={{ background: "#FFF", border: "1px solid #EEE", borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#111", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: "48px 20px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Fiyatlandırma</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 8px", letterSpacing: "-0.03em" }}>Basit, Şeffaf Fiyat</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>Gizli ücret yok, komisyon yok.</p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", background: "#F0F0F0", borderRadius: 10, padding: 3 }}>
            <button onClick={function() { setAnnual(false); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: !annual ? "#FFF" : "transparent", color: !annual ? "#111" : "#999", boxShadow: !annual ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>Aylık</button>
            <button onClick={function() { setAnnual(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: annual ? "#FFF" : "transparent", color: annual ? "#111" : "#999", boxShadow: annual ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>Yıllık <span style={{ color: A, fontSize: 10 }}>-20%</span></button>
          </div>
        </div>

        {/* Free */}
        <div style={{ background: "#FFF", border: "1px solid #EEE", borderRadius: 16, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4 }}>Ücretsiz</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>₺0</span>
            <span style={{ fontSize: 12, color: "#999" }}>sonsuza kadar</span>
          </div>
          {["15 ürüne kadar", "5 dil desteği", "Karanlık mod", "Mekan fotoğrafları", "WiFi & Garson çağır"].map(function(f) {
            return <div key={f} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 12, color: "#555" }}><span style={{ color: "#16a34a" }}>✓</span>{f}</div>;
          })}
          <button style={{ width: "100%", padding: 12, marginTop: 14, borderRadius: 10, border: "1.5px solid #DDD", background: "#FFF", color: "#333", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ücretsiz Başla</button>
        </div>

        {/* Pro */}
        <div style={{ background: "#111", borderRadius: 16, padding: 20, marginBottom: 12, position: "relative" as const }}>
          <div style={{ position: "absolute" as const, top: -10, right: 16, background: A, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 6 }}>En Popüler</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#EEE", marginBottom: 4 }}>Profesyonel</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#FFF" }}>{annual ? "₺239" : "₺299"}</span>
            <span style={{ fontSize: 12, color: "#888" }}>/ay</span>
            {annual && <span style={{ fontSize: 11, color: "#666", textDecoration: "line-through", marginLeft: 4 }}>₺299</span>}
          </div>
          {["Sınırsız ürün", "Sepet & WhatsApp sipariş", "Şefin seçimi bölümü", "Fotoğraf galerisi", "Kampanya & indirim", "Logo kaldırma (white-label)", "Masa bazlı QR (sınırsız)", "Detaylı analitik", "Özel domain", "Öncelikli destek"].map(function(f) {
            return <div key={f} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 12, color: "#CCC" }}><span style={{ color: A }}>✓</span>{f}</div>;
          })}
          <a href="/fiyat" style={{ display: "block", width: "100%", padding: 12, marginTop: 14, borderRadius: 10, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center", boxShadow: "0 4px 16px " + A + "40" }}>14 Gün Ücretsiz Dene</a>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: "48px 20px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Müşteri Yorumları</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 20px", letterSpacing: "-0.03em" }}>Restoranlar Ne Diyor?</h2>
        {TESTIMONIALS.map(function(t, i) {
          return (
            <div key={i} style={{ background: "#FFF", border: "1px solid #EEE", borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {Array(t.rating).fill(0).map(function(_, j) { return <div key={j} style={{ width: 5, height: 5, borderRadius: 99, background: A }} />; })}
              </div>
              <div style={{ fontSize: 13, color: "#333", lineHeight: 1.6, marginBottom: 10 }}>&ldquo;{t.text}&rdquo;</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 99, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: A }}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: "#999" }}>{t.role}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ padding: "48px 20px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: A, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 8 }}>Sık Sorulan Sorular</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 20px", letterSpacing: "-0.03em" }}>Merak Edilenler</h2>
        {FAQ.map(function(faq, i) {
          return (
            <div key={i} style={{ borderBottom: "1px solid #EEE" }}>
              <button onClick={function() { setOpenFaq(openFaq === i ? null : i); }} style={{ width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111", textAlign: "left" as const }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: "#999", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: 12 }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: "0 0 16px", fontSize: 13, color: "#666", lineHeight: 1.6 }}>{faq.a}</div>}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ background: "#111", borderRadius: 20, padding: "32px 24px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FFF", margin: "0 0 8px", letterSpacing: "-0.03em" }}>Hemen Başlayın</h2>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px" }}>2 dakikada dijital menünüzü oluşturun.</p>
          <button style={{ padding: "14px 32px", borderRadius: 10, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px " + A + "40" }}>Ücretsiz Hesap Oluştur →</button>
          <div style={{ fontSize: 11, color: "#555", marginTop: 12 }}>✓ Kredi kartı gerekmez · ✓ 30 saniyede kurulum</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "20px", borderTop: "1px solid #EEE", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <Logo size="sm" />
        </div>
        <div style={{ fontSize: 10, color: "#999", lineHeight: 1.8 }}>
          temeat.com.tr · info@temeat.com.tr<br />
          © 2026 TEMeat. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}