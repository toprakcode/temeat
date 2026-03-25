"use client";

import { useState, useEffect } from "react";

const A = "#D4470A";

// SVG İkonlar
function IconGlobe({ size = 56, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconPhone({ size = 56, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function IconChart({ size = 56, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      tag: "Çoklu Dil",
      title: "5 dilde menü,\nhiç çeviri derdi yok",
      desc: "Türkçe, İngilizce, Arapça, Almanca ve Rusça otomatik. Turistler kendi dilinde sipariş veriyor, siz sadece servis ediyorsunuz.",
      items: ["Otomatik dil algılama", "Anlık içerik güncelleme", "RTL dil desteği (Arapça)"],
      color: "#1a1a1a",
      icon: <IconGlobe size={48} color={A} />,
      iconLabel: "5 Dil Desteği",
      iconSub: "Tr · En · Ar · De · Ru",
    },
    {
      tag: "Sipariş Sistemi",
      title: "QR tara, seç,\nWhatsApp'a gönder",
      desc: "Müşteri masadan QR kodu okutup sepete ekliyor, tek tuşla WhatsApp'tan sipariş geliyor. Yanlış anlaşılma sıfır.",
      items: ["Masa bazlı QR kodlar", "WhatsApp entegrasyonu", "Anlık bildirim"],
      color: "#0f0f0f",
      icon: <IconPhone size={48} color={A} />,
      iconLabel: "QR → Sipariş",
      iconSub: "2 dokunuşta sipariş",
    },
    {
      tag: "Analitik",
      title: "Hangi ürün kaç\nkez görüldü, bil",
      desc: "Hangi yemek en çok ilgi görüyor, hangi saatte zirve yapıyor? Veriye dayalı karar ver, menünü optimize et.",
      items: ["Günlük görüntülenme", "Dil bazlı istatistik", "Popüler ürün sıralaması"],
      color: "#111111",
      icon: <IconChart size={48} color={A} />,
      iconLabel: "Canlı Analitik",
      iconSub: "Anlık veriler",
    },
  ];

  const plans = [
  {
    id: "free",
    name: "Ücretsiz",
    price: 0,
    priceA: 0,
    desc: "Dijital menüye ilk adım",
    features: [
      "15 ürüne kadar",
      "1 menü",
      "Temel QR kod",
      "5 dil desteği",
      "Karanlık mod",
      "Mekan fotoğrafları",
      "WiFi gösterimi",
      "Garson çağır butonu",
    ],
    cta: "Ücretsiz Başla",
    highlight: false,
  },
  {
    id: "starter",
    name: "Başlangıç",
    price: 149,
    priceA: 119,
    desc: "Büyümek isteyen restoranlar",
    features: [
      "50 ürüne kadar",
      "1 menü",
      "Özelleştirilebilir QR kod",
      "5 dil desteği",
      "Karanlık mod",
      "Mekan fotoğrafları",
      "WiFi gösterimi",
      "Garson çağır butonu",
      "Sepet & WhatsApp sipariş",
      "Şefin seçimi bölümü",
      "Fotoğraf galerisi (3 foto/ürün)",
      "Hazırlık süresi & porsiyon",
      "Masa bazlı QR (5 masa)",
      "Temel analitik",
    ],
    cta: "14 Gün Ücretsiz Dene",
    highlight: false,
  },
  {
    id: "pro",
    name: "Profesyonel",
    price: 299,
    priceA: 239,
    desc: "Tüm özellikler, sınırsız güç",
    features: [
      "Sınırsız ürün & menü",
      "Premium QR kod tasarımı",
      "5 dil desteği",
      "Karanlık mod & mekan fotoğrafları",
      "Sepet & WhatsApp sipariş",
      "Şefin seçimi bölümü",
      "Fotoğraf galerisi (sınırsız)",
      "Hazırlık süresi & porsiyon",
      "Benzer yemek önerileri",
      "Kampanya & indirim",
      "Detaylı analitik",
      "Logo kaldırma (white-label)",
      "Özel domain",
      "Masa bazlı QR (sınırsız)",
    ],
    cta: "14 Gün Ücretsiz Dene",
    highlight: true,
  },
];

  const testimonials = [
    { name: "Ahmet Yılmaz", role: "Sultanahmet Ocakbaşı", text: "Turistler artık 'menü yok mu' diye sormadan kendileri hallediyor. Garsonlarımız çok daha hızlı.", avatar: "AY" },
    { name: "Fatma Kaya", role: "Kapalıçarşı Cafe", text: "Arapça müşterilerimiz menüyü anlayabiliyorlar, sipariş hataları neredeyse sıfıra indi.", avatar: "FK" },
    { name: "Mehmet Demir", role: "Bosphorus Restaurant", text: "Fiyat güncellemesi artık 2 dakika sürüyor. Eskiden basılı menüyü değiştirmek günler alıyordu.", avatar: "MD" },
    { name: "Zeynep Arslan", role: "Galata Bistro", text: "Basılı menü masrafım sıfırlandı. Her ay ciddi bir tasarruf yapıyorum.", avatar: "ZA" },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#FAFAFA", color: "#111", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#f1f1f1}
        ::-webkit-scrollbar-thumb{background:#ddd;border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .animate{opacity:0}
        .animate.visible{animation:fadeUp .7s cubic-bezier(.25,1,.5,1) forwards}
        .animate-delay-1.visible{animation-delay:.1s}
        .animate-delay-2.visible{animation-delay:.2s}
        .animate-delay-3.visible{animation-delay:.3s}
        .btn-hover{transition:all .2s;cursor:pointer}
        .btn-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,71,10,.3)!important}
        .btn-hover:active{transform:translateY(0)}
        .card-hover{transition:all .3s}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.1)!important}
        @media(max-width:768px){
          .hide-mobile{display:none!important}
          .hero-grid{grid-template-columns:1fr!important}
          .features-row{grid-template-columns:1fr!important;direction:ltr!important}
          .features-row > div{order:unset!important}
          .plans-grid{grid-template-columns:1fr!important}
          .testimonials-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .footer-inner{flex-direction:column!important}
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 5%", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,10,.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
        transition: "all .3s",
      }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: 18, height: 2.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 12, height: 2.5, background: A, borderRadius: 99 }} />
            <div style={{ width: 18, height: 2.5, background: A, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.03em", color: "#fff" }}>
            TEM<span style={{ color: A }}>eat</span>
          </span>
        </a>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {[["Özellikler", "#ozellikler"], ["Fiyat", "#fiyat"], ["Demo", "/demo"], ["Panel", "/panel"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.7)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/panel" className="hide-mobile" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>Giriş Yap</a>
          <a href="/fiyat" className="btn-hover" style={{
            padding: "9px 20px", borderRadius: 10, background: A,
            color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            boxShadow: `0 4px 16px ${A}40`,
          }}>Ücretsiz Başla</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0a0a 0%, #1a0a05 50%, #0a0a0a 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "100px 5% 60px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 50%, ${A}15 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${A}08 0%, transparent 40%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            <div style={{ animation: "fadeUp .8s cubic-bezier(.25,1,.5,1) both" }}>
              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${A}15`, border: `1px solid ${A}30`,
                borderRadius: 99, padding: "6px 14px", marginBottom: 28,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>Restoranlar için dijital menü</span>
              </div>

              <h1 style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                fontWeight: 900, color: "#fff",
                letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 24,
              }}>
                Restoranınızın<br />
                <span style={{ color: A }}>dijital menüsü</span><br />
                dakikada hazır
              </h1>

              <p style={{ fontSize: 17, color: "rgba(255,255,255,.6)", lineHeight: 1.65, marginBottom: 36, maxWidth: 440 }}>
                QR kod tara, 5 dilde gör, WhatsApp'tan sipariş ver. Basılı menü masrafı yok, güncelleme derdi yok.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/demo" className="btn-hover" style={{
                  padding: "14px 28px", borderRadius: 12, background: A,
                  color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none",
                  boxShadow: `0 8px 24px ${A}40`,
                }}>Demo Menüyü Gör →</a>
                <a href="/fiyat" style={{
                  padding: "14px 28px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,.15)",
                  color: "rgba(255,255,255,.8)", fontSize: 15, fontWeight: 600,
                  textDecoration: "none", transition: "all .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; }}
                >Fiyatları İncele</a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40, flexWrap: "wrap" }}>
                {[["Kredi kartı gerekmez"], ["30 sn'de kurulum"], ["14 gün ücretsiz"]].map(([text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="hide-mobile" style={{ display: "flex", justifyContent: "center", animation: "fadeUp 1s .2s cubic-bezier(.25,1,.5,1) both" }}>
              <div style={{ position: "relative", width: 280 }}>
                <div style={{ position: "absolute", inset: -40, background: `radial-gradient(circle, ${A}30 0%, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{
                  width: 280, borderRadius: 40,
                  background: "#111", border: "8px solid #222",
                  boxShadow: "0 40px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.1)",
                  overflow: "hidden", position: "relative",
                  animation: "float 4s ease-in-out infinite",
                }}>
                  <div style={{ height: 28, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 80, height: 16, background: "#000", borderRadius: 99 }} />
                  </div>
                  <div style={{ background: "#FAFAFA", padding: "12px 14px", minHeight: 480 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#111" }}>Sultanahmet Ocakbaşı</div>
                        <div style={{ fontSize: 8, color: "#999" }}>● Açık · 4.7 ★</div>
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {["Tr","En","Ar"].map(l => (
                          <div key={l} style={{ padding: "2px 5px", background: l==="Tr"?"#111":"#f0f0f0", borderRadius: 4, fontSize: 7, fontWeight: 700, color: l==="Tr"?"#fff":"#999" }}>{l}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {["Başlangıç","Izgara","Tatlı","İçecek"].map((c, i) => (
                        <div key={c} style={{ padding: "4px 10px", borderRadius: 6, background: i===0?A:"#f0f0f0", fontSize: 8, fontWeight: 700, color: i===0?"#fff":"#999", whiteSpace: "nowrap", flexShrink: 0 }}>{c}</div>
                      ))}
                    </div>
                    {[
                      { name: "Adana Kebap", price: "₺220", cal: "450 kal", badge: "🔥 Popüler", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=80&h=80&fit=crop" },
                      { name: "İskender", price: "₺250", cal: "580 kal", badge: "⭐ Şefin seçimi", img: "https://images.unsplash.com/photo-1644789379364-23c3e07f0e9d?w=80&h=80&fit=crop" },
                      { name: "Kuzu Pirzola", price: "₺320", cal: "520 kal", badge: "", img: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=80&h=80&fit=crop" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ flex: 1 }}>
                          {item.badge && <div style={{ fontSize: 7, fontWeight: 700, color: A, marginBottom: 2 }}>{item.badge}</div>}
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>{item.name}</div>
                          <div style={{ fontSize: 8, color: "#999", marginTop: 1 }}>{item.cal}</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: "#111", marginTop: 3 }}>{item.price}</div>
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                          <img src={item.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#fff", padding: "10px 14px", display: "flex", gap: 6, borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ flex: 1, padding: "8px 0", background: "#f5f5f5", borderRadius: 8, fontSize: 9, fontWeight: 600, color: "#333", textAlign: "center" }}>Garson Çağır</div>
                    <div style={{ flex: 2, padding: "8px 0", background: A, borderRadius: 8, fontSize: 9, fontWeight: 700, color: "#fff", textAlign: "center" }}>Sepetim · ₺470</div>
                  </div>
                </div>

                {/* Floating badges */}
                <div style={{ position: "absolute", top: 60, right: -50, background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.15)", animation: "float 3s 1s ease-in-out infinite" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>🌍 5 Dil</div>
                  <div style={{ fontSize: 8, color: "#999" }}>Otomatik</div>
                </div>
                <div style={{ position: "absolute", bottom: 100, left: -60, background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.15)", animation: "float 3.5s ease-in-out infinite" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>↑ +23%</div>
                  <div style={{ fontSize: 8, color: "#999" }}>Bu hafta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", letterSpacing: ".1em" }}>KAYDIRIN</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(255,255,255,.3), transparent)" }} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="ozellikler" style={{ padding: "100px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div id="feat-header" data-animate style={{ textAlign: "center", marginBottom: 64 }}
            className={`animate ${visibleSections.has("feat-header") ? "visible" : ""}`}>
            <p style={{ fontSize: 12, fontWeight: 700, color: A, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Özellikler</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.1 }}>
              Restoranınızın ihtiyacı<br />olan her şey
            </h2>
          </div>

          {features.map((feat, i) => (
            <div key={i} id={`feat-${i}`} data-animate
              className={`features-row animate animate-delay-${i + 1} ${visibleSections.has(`feat-${i}`) ? "visible" : ""}`}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", marginBottom: 80 }}>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ display: "inline-block", padding: "5px 12px", background: `${A}12`, borderRadius: 6, fontSize: 11, fontWeight: 700, color: A, marginBottom: 16 }}>{feat.tag}</div>
                <h3 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.15, marginBottom: 16, whiteSpace: "pre-line" }}>{feat.title}</h3>
                <p style={{ fontSize: 16, color: "#666", lineHeight: 1.65, marginBottom: 24 }}>{feat.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {feat.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 99, background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 14, color: "#444", fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <div style={{
                  borderRadius: 24, background: feat.color,
                  padding: 40, minHeight: 280,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 30%, ${A}20, transparent 60%)` }} />
                  <div style={{ position: "relative", textAlign: "center", color: "#fff" }}>
                    <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>{feat.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{feat.iconLabel}</div>
                    <div style={{ fontSize: 13, opacity: .5, marginTop: 6 }}>{feat.iconSub}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "80px 5%", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {[
              { value: "5 Dil", label: "Desteklenen Dil" },
              { value: "%99.9", label: "Çalışma Süresi" },
              { value: "30sn", label: "Kurulum Süresi" },
            ].map((stat, i) => (
              <div key={i} id={`stat-${i}`} data-animate
                className={`animate animate-delay-${i + 1} ${visibleSections.has(`stat-${i}`) ? "visible" : ""}`}
                style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "100px 5%", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div id="test-header" data-animate style={{ textAlign: "center", marginBottom: 56 }}
            className={`animate ${visibleSections.has("test-header") ? "visible" : ""}`}>
            <p style={{ fontSize: 12, fontWeight: 700, color: A, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Müşteriler</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-.04em" }}>
              Restoranlar ne diyor?
            </h2>
          </div>

          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} id={`test-${i}`} data-animate
                className={`card-hover animate animate-delay-${(i % 2) + 1} ${visibleSections.has(`test-${i}`) ? "visible" : ""}`}
                style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #ebebeb" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={A} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "#333", lineHeight: 1.6, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 99, background: A, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="fiyat" style={{ padding: "100px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div id="price-header" data-animate style={{ textAlign: "center", marginBottom: 48 }}
            className={`animate ${visibleSections.has("price-header") ? "visible" : ""}`}>
            <p style={{ fontSize: 12, fontWeight: 700, color: A, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>Fiyatlandırma</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: 24 }}>
              Basit, şeffaf fiyatlar
            </h2>
            <div style={{ display: "inline-flex", background: "#f0f0f0", borderRadius: 12, padding: 3 }}>
              <button onClick={() => setAnnual(false)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: !annual ? "#fff" : "transparent", color: !annual ? "#111" : "#999", boxShadow: !annual ? "0 1px 4px rgba(0,0,0,.06)" : "none", transition: "all .2s" }}>Aylık</button>
              <button onClick={() => setAnnual(true)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: annual ? "#fff" : "transparent", color: annual ? "#111" : "#999", boxShadow: annual ? "0 1px 4px rgba(0,0,0,.06)" : "none", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}>
                Yıllık <span style={{ fontSize: 10, fontWeight: 700, color: A, background: `${A}12`, padding: "2px 6px", borderRadius: 4 }}>%20</span>
              </button>
            </div>
          </div>

          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <div key={plan.id} id={`plan-${i}`} data-animate
                className={`animate animate-delay-${i + 1} ${visibleSections.has(`plan-${i}`) ? "visible" : ""}`}
                style={{
                  borderRadius: 24, padding: 28,
                  background: plan.highlight ? "#0a0a0a" : "#fff",
                  border: plan.highlight ? `2px solid ${A}` : "1.5px solid #ebebeb",
                  position: "relative",
                  boxShadow: plan.highlight ? `0 20px 60px ${A}20` : "none",
                  marginTop: plan.highlight ? 0 : 0,
                }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 99, whiteSpace: "nowrap" }}>
                    En Popüler
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,.5)" : "#999", marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,.3)" : "#bbb", marginBottom: 16 }}>{plan.desc}</div>
                <div style={{ marginBottom: 24 }}>
                  {plan.price === 0 ? (
                    <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? "#fff" : "#111" }}>Ücretsiz</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? "#fff" : "#111" }}>₺{annual ? plan.priceA : plan.price}</span>
                      <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,.4)" : "#999" }}>/ay</span>
                    </div>
                  )}
                  {annual && plan.price > 0 && (
                    <div style={{ fontSize: 11, color: plan.highlight ? "rgba(255,255,255,.3)" : "#bbb", textDecoration: "line-through", marginTop: 2 }}>₺{plan.price}/ay</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? A : "#16a34a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,.7)" : "#555", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/fiyat" className="btn-hover" style={{
                  display: "block", textAlign: "center",
                  padding: "13px 0", borderRadius: 12,
                  background: plan.highlight ? A : "transparent",
                  border: plan.highlight ? "none" : "1.5px solid #ddd",
                  color: plan.highlight ? "#fff" : "#333",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  boxShadow: plan.highlight ? `0 4px 16px ${A}40` : "none",
                }}>{plan.cta}</a>
                {plan.id !== "free" && (
                  <p style={{ textAlign: "center", fontSize: 11, color: plan.highlight ? "rgba(255,255,255,.3)" : "#bbb", marginTop: 10 }}>Kredi kartı gerekli · İstediğin zaman iptal</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 5%", background: "#0a0a0a", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 50% 50%, ${A}15, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "#fff", letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 20 }}>
            Dijital menünüz<br /><span style={{ color: A }}>hazır mı?</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.5)", marginBottom: 36, lineHeight: 1.6 }}>
            30 saniyede oluştur, QR kodunu masalara koy, hemen kullanmaya başla.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/fiyat" className="btn-hover" style={{ padding: "16px 36px", borderRadius: 12, background: A, color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: `0 8px 32px ${A}40` }}>
              Ücretsiz Başla →
            </a>
            <a href="/demo" style={{ padding: "16px 36px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", fontSize: 16, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>
              Demo Gör
            </a>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 20 }}>Kredi kartı gerekmez · 14 gün ücretsiz · İstediğin zaman iptal</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000", padding: "48px 5% 32px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
                  <div style={{ width: 11, height: 2, background: A, borderRadius: 99 }} />
                  <div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>TEM<span style={{ color: A }}>eat</span></span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", maxWidth: 220, lineHeight: 1.6 }}>Restoranlar için QR tabanlı dijital menü sistemi.</p>
            </div>
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", marginBottom: 14 }}>ÜRÜN</div>
                {[["Demo", "/demo"], ["Fiyat", "/fiyat"], ["Panel", "/panel"]].map(([l, h]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <a href={h} style={{ fontSize: 14, color: "rgba(255,255,255,.5)", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>{l}</a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.3)", letterSpacing: ".1em", marginBottom: 14 }}>YASAL</div>
                {[["Gizlilik", "#"], ["Kullanım Şartları", "#"], ["KVKK", "#"]].map(([l, h]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <a href={h} style={{ fontSize: 14, color: "rgba(255,255,255,.5)", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>{l}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>© 2026 TEMeat. Tüm hakları saklıdır.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)" }}>temeat.com.tr</p>
          </div>
        </div>
      </footer>
    </div>
  );
}