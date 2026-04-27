"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";

const A = "#D4470A";

const plans = [
  {
    id: "free",
    name: "Ücretsiz",
    desc: "Dijital menüye ilk adım",
    price: 0,
    priceA: 0,
    target: "Yeni açılan küçük mekanlar",
    color: "rgba(255,255,255,.06)",
    highlight: false,
    cta: "Ücretsiz Başla",
    ctaHref: "/panel",
    features: [
      { text: "5 Ürün kapasitesi", ok: true },
      { text: "Temel QR Kod", ok: true },
      { text: "5 Dil desteği", ok: true },
      { text: "Karanlık Mod", ok: true },
      { text: "WiFi gösterimi", ok: true },
      { text: "Alerjen bilgileri ekleme", ok: true },
      { text: "Kalori Bilgisi", ok: true },
      { text: "Analitik & İstatistikler", ok: false },
      { text: "Mekan fotoğrafları", ok: false },
    ],
  },
  {
    id: "yenimekan",
    name: "Yeni Mekan",
    desc: "Büyümeye başlayan mekanlar",
    price: 49,
    priceA: 39,
    target: "Yeni nesil kafeler",
    color: "rgba(255,255,255,.06)",
    highlight: false,
    cta: "Hemen Başla",
    ctaHref: "/panel",
    features: [
      { text: "Ücretsiz plan özellikleri", ok: true, isGroup: true },
      { text: "10 Ürün kapasitesi", ok: true },
      { text: "Temel Analitik", ok: true },
      { text: "Mekan fotoğrafları", ok: true },
      { text: "Özelleştirilebilir QR Kod", ok: false },
      { text: "Sepete ekleme & Sipariş", ok: false },
    ],
  },
  {
    id: "starter",
    name: "Başlangıç",
    desc: "Profesyonel hizmet isteyenler",
    price: 149,
    priceA: 119,
    target: "Popüler restoranlar",
    color: A,
    highlight: true,
    cta: "Ücretsiz Dene",
    ctaHref: "/panel",
    features: [
      { text: "Yeni Mekan özellikleri", ok: true, isGroup: true },
      { text: "25 Ürün kapasitesi", ok: true },
      { text: "Özelleştirilebilir QR Kod", ok: true },
      { text: "Sepete ekleme & Sipariş", ok: true },
      { text: "Şefin seçimi bölümü", ok: true },
      { text: "Hazırlık süresi & Porsiyon", ok: true },
      { text: "Masa bazlı QR (10 Masa)", ok: true },
      { text: "Mutfak Paneli & KDS", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    desc: "Sınırsız güç ve kontrol",
    price: 299,
    priceA: 239,
    target: "Büyük zincirler & Restoranlar",
    color: "rgba(255,255,255,.08)",
    highlight: false,
    cta: "Hemen Yükselt",
    ctaHref: "/panel",
    features: [
      { text: "Başlangıç planı özellikleri", ok: true, isGroup: true },
      { text: "Sınırsız ürün kapasitesi", ok: true },
      { text: "Dijital Mutfak Paneli", ok: true },
      { text: "Müşteri Yorumları & Ayarları", ok: true },
      { text: "Yemek Önerileri (Benzerler)", ok: true },
      { text: "Logo kaldırma (White-label)", ok: true },
      { text: "Sınırsız Masa bazlı QR", ok: true },
    ],
  },
];

const faqs = [
  { q: "14 gün deneme nasıl çalışır?", a: "Başlangıç veya Pro planını seçin. 14 gün boyunca tüm özellikleri ücretsiz kullanın. Beğenmezseniz iptal edin, hiçbir ücret alınmaz." },
  { q: "İstediğim zaman plan değiştirebilir miyim?", a: "Evet. Üst plana geçişte fark anında yansır. Alt plana geçişte mevcut dönem sonunda uygulanır." },
  { q: "KDV dahil mi?", a: "Gösterilen fiyatlar KDV hariçtir. Faturanızda %20 KDV ayrıca gösterilir." },
  { q: "Başka gizli ücret var mı?", a: "Hayır. Sipariş başına komisyon yok, kurulum ücreti yok, trafik limiti yok. Sadece sabit aylık veya yıllık ücret." },
];

const compareRows = [
  ["Ürün limiti", "5", "10", "25", "Sınırsız"],
  ["QR kod tasarımı", "Temel", "Temel", "Özel", "Özel"],
  ["Analitik", "—", "Temel", "Temel", "Detaylı"],
  ["Sepete Ekleme", false, false, true, true],
  ["Şefin Seçimi", false, false, true, true],
  ["Hazırlık & Porsiyon", false, false, true, true],
  ["Masa Bazlı QR", false, false, "10 Masa", "Sınırsız"],
  ["Mutfak Paneli", false, false, false, true],
  ["Müşteri Yorumları", false, false, false, true],
  ["Logo Kaldırma", false, false, false, true],
  ["Benzer Öneriler", false, false, false, true],
];

export default function FiyatPage() {
  const [annual, setAnnual] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Outfit', system-ui, sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .6s cubic-bezier(.25,1,.5,1) both}
        .delay-1{animation-delay:.1s}
        .delay-2{animation-delay:.2s}
        .delay-3{animation-delay:.3s}
        .plan-card{transition:transform .2s, border-color .2s}
        .plan-card:hover{transform:translateY(-4px)}
        .btn-primary{transition:all .2s;cursor:pointer}
        .btn-primary:hover{opacity:.88;transform:translateY(-1px)}
        .btn-primary:active{transform:scale(.97)}
        .faq-btn{transition:background .15s}
        .faq-btn:hover{background:rgba(255,255,255,.04)!important}
        .compare-row:hover{background:rgba(255,255,255,.03)}
        @media(max-width:900px){
          .plans-grid{grid-template-columns:1fr!important}
          .plan-card{transform:none!important}
          .compare-table{display:none}
        }
        @media(max-width:600px){
          .hero-title{font-size:clamp(28px,8vw,40px)!important}
          .stats-row{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(8,8,8,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <Logo size="sm" />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[["Ana Sayfa", "/"], ["Demo", "/demo"], ["Panel", "/panel"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.5)", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.5)"}>{l}</Link>
          ))}
          <Link href="/panel" style={{ padding: "8px 18px", borderRadius: 9, background: A, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 16px ${A}40` }}>Başla</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 5% 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at 50% 0%, ${A}12 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${A}15`, border: `1px solid ${A}25`, borderRadius: 99, padding: "6px 16px", marginBottom: 28 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>Gizli ücret yok · Komisyon yok · İstediğin zaman iptal</span>
          </div>

          <h1 className="fade-up delay-1 hero-title" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 18 }}>
            Basit, şeffaf<br /><span style={{ color: A }}>fiyatlandırma</span>
          </h1>

          <p className="fade-up delay-2" style={{ fontSize: 16, color: "rgba(255,255,255,.45)", lineHeight: 1.65, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Restoranınıza uygun planı seçin. İstediğiniz zaman değiştirin veya iptal edin.
          </p>

          {/* Toggle */}
          <div className="fade-up delay-3" style={{ display: "inline-flex", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 3, gap: 3 }}>
            <button onClick={() => setAnnual(false)} style={{ padding: "10px 24px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: annual ? 400 : 700, fontFamily: "inherit", background: !annual ? "rgba(255,255,255,.1)" : "transparent", color: !annual ? "#fff" : "rgba(255,255,255,.45)", transition: "all .2s" }}>
              Aylık
            </button>
            <button onClick={() => setAnnual(true)} style={{ padding: "10px 24px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: annual ? 700 : 400, fontFamily: "inherit", background: annual ? "rgba(255,255,255,.1)" : "transparent", color: annual ? "#fff" : "rgba(255,255,255,.45)", transition: "all .2s", display: "flex", alignItems: "center", gap: 8 }}>
              Yıllık
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: A, padding: "2px 8px", borderRadius: 5 }}>%20 İNDİRİM</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: "0 5% 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, alignItems: "start" }}>
            {plans.map((plan, i) => {
              const price = annual ? plan.priceA : plan.price;
              const includedCount = plan.features.filter(f => f.ok).length;
              const lockedCount = plan.features.filter(f => !f.ok).length;

              return (
                <div key={plan.id} className={`plan-card fade-up delay-${i + 1}`}
                  style={{
                    borderRadius: 20,
                    border: plan.highlight ? `1.5px solid ${A}` : "1.5px solid rgba(255,255,255,.09)",
                    background: plan.highlight ? `linear-gradient(160deg, #1a0a05 0%, #120805 100%)` : "rgba(255,255,255,.03)",
                    padding: 28,
                    position: "relative",
                    boxShadow: plan.highlight ? `0 24px 64px ${A}18` : "none",
                  }}>

                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 18px", borderRadius: 99, letterSpacing: ".04em", whiteSpace: "nowrap", boxShadow: `0 4px 12px ${A}50` }}>
                      EN POPÜLER
                    </div>
                  )}

                  {/* Plan header */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: plan.highlight ? A : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 15, color: plan.highlight ? "#fff" : "rgba(255,255,255,.5)" }}>
                          {plan.id === "free" ? "○" : plan.id === "starter" ? "◐" : "●"}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{plan.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{plan.desc}</div>
                      </div>
                    </div>

                    <div style={{ display: "inline-block", padding: "4px 10px", background: plan.highlight ? `${A}20` : "rgba(255,255,255,.06)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: plan.highlight ? A : "rgba(255,255,255,.4)", marginBottom: 16 }}>
                      {plan.target}
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: 4 }}>
                      {price === 0 ? (
                        <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-.04em" }}>Ücretsiz</div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-.04em" }}>₺{price}</span>
                          <span style={{ fontSize: 14, color: "rgba(255,255,255,.35)" }}>/ay</span>
                        </div>
                      )}
                      {annual && price > 0 && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", textDecoration: "line-through", marginTop: 2 }}>₺{plan.price}/ay</div>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={plan.ctaHref} className="btn-primary" style={{
                    display: "block", textAlign: "center",
                    padding: "13px 0", borderRadius: 11,
                    background: plan.highlight ? A : "rgba(255,255,255,.08)",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    textDecoration: "none", marginBottom: 24,
                    boxShadow: plan.highlight ? `0 6px 20px ${A}40` : "none",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,.1)",
                  }}>{plan.cta}</Link>

                  {plan.id !== "free" && (
                    <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.25)", marginBottom: 20, marginTop: -18 }}>
                      Kredi kartı gerekli · İstediğin zaman iptal
                    </p>
                  )}

                  {/* Divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,.07)", marginBottom: 20 }} />

                  {/* Features */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {plan.features.filter(f => f.ok).map((f: any, j) => (
                      <div key={j} style={{ 
                        display: "flex", 
                        alignItems: "flex-start", 
                        gap: 10,
                        padding: f.isGroup ? "8px 12px" : "0",
                        background: f.isGroup ? (plan.highlight ? "rgba(255,255,255,.05)" : "rgba(212,71,10,.08)") : "transparent",
                        borderRadius: 8,
                        border: f.isGroup ? (plan.highlight ? "1px solid rgba(255,255,255,.1)" : `1px solid ${A}20`) : "none",
                        marginBottom: f.isGroup ? 4 : 0
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.isGroup ? A : (plan.highlight ? A : "#22c55e")} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: f.isGroup ? 2 : 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ 
                          fontSize: f.isGroup ? 12 : 13, 
                          color: f.isGroup ? (plan.highlight ? "#fff" : A) : "rgba(255,255,255,.7)", 
                          lineHeight: 1.4,
                          fontWeight: f.isGroup ? 800 : 400
                        }}>{f.text}</span>
                      </div>
                    ))}
                    {lockedCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, padding: "8px 10px", background: "rgba(255,255,255,.04)", borderRadius: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>{lockedCount} özellik kilitli</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compare toggle */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button onClick={() => setShowCompare(!showCompare)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: A, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${A}10`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {showCompare ? "Karşılaştırmayı Gizle ↑" : "Tüm Özellikleri Karşılaştır ↓"}
            </button>
          </div>

          {/* Compare Table */}
          {showCompare && (
            <div style={{ marginTop: 32, animation: "fadeUp .4s both" }}>
              <div style={{ 
                overflowX: "auto", 
                borderRadius: 20, 
                border: "1px solid rgba(255,255,255,.08)", 
                background: "rgba(255,255,255,.02)",
                WebkitOverflowScrolling: "touch"
              }}>
                <div style={{ minWidth: 800 }}>
                  {/* Table Header */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "240px repeat(4, 1fr)", 
                    background: "rgba(255,255,255,.03)", 
                    borderBottom: "1px solid rgba(255,255,255,.08)", 
                    padding: "20px 24px" 
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.25)", letterSpacing: ".1em" }}>ÖZELLİK</span>
                    {plans.map((p, i) => (
                      <div key={p.id} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: p.highlight ? A : "#fff", marginBottom: 2 }}>{p.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.3)" }}>{p.price === 0 ? "Ücretsiz" : `₺${p.price}/ay`}</div>
                      </div>
                    ))}
                  </div>

                  {/* Table Body */}
                  {compareRows.map((row, i) => (
                    <div key={i} className="compare-row" style={{ 
                      display: "grid", 
                      gridTemplateColumns: "240px repeat(4, 1fr)", 
                      padding: "16px 24px", 
                      borderBottom: i < compareRows.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                      background: i % 2 ? "rgba(255,255,255,.01)" : "transparent",
                      transition: "background .2s"
                    }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{row[0]}</span>
                      {row.slice(1).map((val, j) => (
                        <div key={j} style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {typeof val === 'boolean' ? (
                            val ? (
                              <div style={{ width: 22, height: 22, borderRadius: 99, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,.1)", fontSize: 14 }}>—</span>
                            )
                          ) : (
                            <span style={{ 
                              fontSize: 13, 
                              fontWeight: 600, 
                              color: j === 2 ? "#fff" : "rgba(255,255,255,.5)" 
                            }}>{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "60px 5%", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40, textAlign: "center" }}>
            {[
              { value: "5 Dil", label: "Desteklenen Dil" },
              { value: "%99.9", label: "Çalışma Süresi" },
              { value: "30sn", label: "Kurulum Süresi" },
              { value: "14 Gün", label: "Ücretsiz Deneme" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: "-.04em", marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: "60px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: "256-bit SSL" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, text: "iyzico Güvencesi" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, text: "e-Arşiv Fatura" },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, text: "İstediğin Zaman İptal" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {b.icon}
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "60px 5% 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-.04em", textAlign: "center", marginBottom: 8 }}>Sık sorulan sorular</h2>
          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,.35)", marginBottom: 40 }}>Aklınızdaki soruların cevapları burada.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, overflow: "hidden" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: openFaq === i ? "rgba(255,255,255,.03)" : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>{faq.q}</span>
                  <div style={{ width: 24, height: 24, borderRadius: 99, border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform .2s, background .2s", transform: openFaq === i ? "rotate(45deg)" : "none", background: openFaq === i ? `${A}20` : "transparent" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? A : "rgba(255,255,255,.4)"} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 24px 20px", fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.7, animation: "fadeUp .2s both" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 5%", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.06)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at 50% 100%, ${A}10 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 16 }}>
            Hâlâ kararsız mısınız?<br /><span style={{ color: A }}>Ücretsiz başlayın.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.4)", marginBottom: 32, lineHeight: 1.6 }}>
            Kredi kartı gerekmez. 30 saniyede kurulum. Beğenmezseniz bırakırsınız.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/panel" className="btn-primary" style={{ padding: "14px 32px", borderRadius: 11, background: A, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: `0 8px 28px ${A}40` }}>
              Ücretsiz Başla →
            </Link>
            <Link href="/demo" style={{ padding: "14px 32px", borderRadius: 11, border: "1.5px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.3)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>
              Demo Gör
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginTop: 20 }}>
            Kredi kartı gerekmez · 14 gün ücretsiz · İstediğin zaman iptal
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#040404", padding: "40px 5% 28px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size="sm" />
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Ana Sayfa", "/"], ["Demo", "/demo"], ["Panel", "/panel"], ["Gizlilik", "#"], ["KVKK", "#"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.15)" }}>© 2026 TEMeat</p>
        </div>
      </footer>
    </div>
  );
}