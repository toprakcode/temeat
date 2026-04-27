"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./components/Logo";

const A = "#D4470A";

// ÖZEL SVG İKONLAR
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IconBell = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconSmartphone = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
const IconGlobe = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const IconPhone = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>;
const IconChart = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconCheck = ({ size = 18, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconStar = ({ size = 14, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
const IconZap = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const IconDollar = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const IconBox = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const IconEye = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;

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
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate], .reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Eski özellikler verisi kaldırıldı

  const plans = [
    {
      id: "free",
      name: "Ücretsiz",
      price: 0,
      priceA: 0,
      desc: "Başlamak için",
      features: [
        "15 ürüne kadar",
        "1 menü",
        "5 dil desteği",
        "Temel QR kod",
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
      price: 299,
      priceA: 239,
      desc: "Büyümek isteyenler için",
      features: [
        "50 ürüne kadar",
        "Özelleştirilebilir QR kod",
        "5 dil desteği",
        "Sepet & WhatsApp sipariş",
        "Şefin seçimi bölümü",
        "Fotoğraf galerisi",
        "Hazırlık süresi & porsiyon",
        "Temel analitik",
        "Masa bazlı QR (10 masa)",
      ],
      cta: "14 Gün Ücretsiz Dene",
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 599,
      priceA: 479,
      desc: "Tam performans",
      features: [
        "Sınırsız ürün & menü",
        "Dijital Mutfak Paneli (KDS)",
        "Müşteri Yorum Moderasyonu",
        "Premium QR kod tasarımı",
        "AI Benzer yemek önerileri",
        "Detaylı Satış Analitiği",
        "Logo kaldırma (white-label)",
        "Sınırsız masa bazlı QR",
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
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#050505", color: "#fff", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;background:#050505}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .animate{opacity:0;transform:translateY(20px);transition:opacity .6s ease-out, transform .6s ease-out}
        .animate.visible{opacity:1;transform:translateY(0)}
        .btn-hover{transition:all .2s;cursor:pointer}
        .btn-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,71,10,.3)!important}
        .btn-hover:active{transform:translateY(0)}
        .card-hover{transition:all .3s}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.1)!important}
        .hero-aura{position:absolute;width:800px;height:800px;background:radial-gradient(circle, ${A}15 0%, transparent 70%);filter:blur(80px);border-radius:999px;z-index:0;pointer-events:none}
        .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
        @media (max-width: 968px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card { grid-column: span 1 !important; grid-row: span 1 !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
        .bento-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 32px; transition: all 0.3s; }
        .bento-card:hover { background: rgba(255,255,255,0.05); border-color: ${A}40; transform: translateY(-5px); }
        .animate { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate.visible { opacity: 1; transform: translateY(0); }
        .floating { animation: floating 6s ease-in-out infinite; }
        @keyframes floating { 0%, 100% { transform: translateY(0) rotateX(5deg); } 50% { transform: translateY(-20px) rotateX(5deg); } }
        .reveal{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(0.16,1,0.3,1)}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .nav-link:hover { color: #fff; }
        .header-glass { background: rgba(0,0,0,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        html { scroll-behavior: smooth; }
        @media(max-width:960px){
          .bento-grid{grid-template-columns:1fr!important}
          .bento-card{grid-column:span 12!important;grid-row:span 1!important}
        }
      `}</style>

      {/* STICKY HEADER */}
      <header className="header-glass" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size="sm" withTagline={false} />
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#ozellikler" className="nav-link">Özellikler</a>
            <a href="#nasil-calisir" className="nav-link">Nasıl Çalışır</a>
            <a href="#fiyat" className="nav-link">Fiyatlandırma</a>
            <a href="#sss" className="nav-link">SSS</a>
            <Link href="/auth" style={{
              background: A, color: "#fff", padding: "8px 20px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 12px ${A}30`
            }}>Giriş Yap</Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{
        minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 5%", overflow: "hidden", background: "#050505"
      }}>
        <div className="hero-aura" style={{ top: "-10%", right: "-10%" }} />
        <div className="hero-aura" style={{ bottom: "-10%", left: "-10%", background: "radial-gradient(circle, #22c55e0a 0%, transparent 70%)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 99, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 32, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
            <IconStar size={14} color={A} /> Dijital Dönüşümün Yeni Standartı
          </div>

          <h1 style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.05em", color: "#fff", marginBottom: 32 }}>
            Restoranınızı <br /> <span style={{ color: A }}>Tek Panelden</span> Yönetin
          </h1>

          <p style={{ fontSize: "clamp(16px, 2vw, 19px)", color: "rgba(255,255,255,0.5)", maxWidth: 700, margin: "0 auto 48px", lineHeight: 1.6 }}>
            Sadece bir QR menü değil; sipariş yönetiminden mutfak ekranına, yorum moderasyonundan detaylı analitiğe kadar tam kapsamlı restoran işletim sistemi.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 60 }}>
            <Link href="/auth" style={{ padding: "18px 40px", borderRadius: 12, background: A, color: "#fff", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: `0 20px 40px ${A}40` }}>Şimdi Ücretsiz Dene</Link>
            <Link href="/demo" style={{ padding: "18px 40px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>Sistemi İncele</Link>
          </div>

          {/* TRUST BADGES */}
          <div className="reveal" style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 60px)", flexWrap: "wrap", opacity: 0.5, marginBottom: 100 }}>
            {[
              { t: "Sıfır Komisyon", i: <IconDollar size={14} /> },
              { t: "Sınırsız Ürün", i: <IconBox size={14} /> },
              { t: "7/24 Canlı Destek", i: <IconBell size={14} /> },
              { t: "Anında Kurulum", i: <IconZap size={14} /> }
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                {b.i} {b.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TEMEAT COMPARISON SECTION */}
      <section style={{ padding: "100px 5%", background: "#050505" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, marginBottom: 16 }}>Neden <span style={{ color: A }}>TEMeat?</span></h2>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Geleneksel yöntemlerle zaman ve para kaybetmeyin.</p>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={{ padding: "24px", textAlign: "left", color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>ÖZELLİK</th>
                  <th style={{ padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>KAĞIT MENÜ</th>
                  <th style={{ padding: "24px", textAlign: "center", color: A, fontWeight: 800 }}>TEMEAT 2.0</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "Fiyat Güncelleme", old: "Günler sürer", new: "Anında" },
                  { f: "Sipariş Alma", old: "Garson beklemek şart", new: "Müşteri yapabilir" },
                  { f: "Çoklu Dil", old: "Kısıtlı veya yok", new: "5 dilde otomatik" },
                  { f: "Analiz & Takip", old: "İmkan yok", new: "Canlı dashboard" },
                  { f: "Baskı Maliyeti", old: "Sürekli gider", new: "Sıfır" }
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "20px 24px", fontWeight: 700 }}>{row.f}</td>
                    <td style={{ padding: "20px 24px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>{row.old}</td>
                    <td style={{ padding: "20px 24px", textAlign: "center", fontWeight: 800, color: "#fff" }}>{row.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* KITCHEN PANEL SHOWCASE */}
      <section style={{ padding: "100px 5%", background: "#080808", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 60, alignItems: "center" }}>
          <div className="reveal">
            <div style={{ fontSize: 12, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>Sıfır Hata Payı</div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>Gerçek Zamanlı <br />Mutfak Paneli</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 32 }}>
              Siparişler masadan verildiği anda mutfak ekranınıza düşer. Koordinasyonu mükemmelleştirin, servis hızınızı ikiye katlayın.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                "Sesli yeni sipariş bildirimi",
                "Masa bazlı sipariş takibi",
                "Ürün bazlı özel notlar",
                "Tahmini hazırlık süresi yönetimi"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600 }}>
                  <IconCheck size={18} color={A} /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="reveal">
            {/* Real UI Mockup using CSS */}
            <div style={{ background: "#111", borderRadius: 24, border: "4px solid #1a1a1a", padding: 24, boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: ".05em" }}>MUTFAK EKRANI</div>
                <div style={{ fontSize: 11, color: A, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 99, background: A, animation: "pulse 2s infinite" }} />
                  CANLI · 3 SİPARİŞ
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { m: "MASA 4", t: "2x Burger, 1x Kola", s: "Hazırlanıyor", c: A },
                  { m: "MASA 12", t: "1x Pizza, 1x Su", s: "Hazır", c: "#22c55e" },
                  { m: "MASA 7", t: "Tatlılar", s: "Bekliyor", c: "rgba(255,255,255,.2)" }
                ].map((o, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: 18, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{o.m}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{o.t}</div>
                    </div>
                    <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, background: o.c, color: "#fff" }}>{o.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS MANAGEMENT SHOWCASE */}
      <section style={{ padding: "100px 5%", background: "#050505" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 60, alignItems: "center" }}>
          <div className="reveal" style={{ order: 2 }}>
            {/* Reviews UI Mockup */}
            <div style={{ background: "#111", borderRadius: 24, border: "4px solid #1a1a1a", padding: 24, boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 20 }}>MÜŞTERİ YORUMLARI</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { n: "Ahmet Y.", r: 5, c: "Yemekler harikaydı, servis çok hızlı!", s: "Onaylandı" },
                  { n: "Caner T.", r: 4, c: "Menü çok şık, kolay sipariş verdik.", s: "Bekliyor" }
                ].map((r, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>{r.n}</span>
                      <div style={{ display: "flex", gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, si) => (
                          <IconStar key={si} size={10} color={si < r.r ? "#fbbf24" : "rgba(255,255,255,0.1)"} />
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, marginBottom: 8 }}>{r.c}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: r.s === "Onaylandı" ? "#22c55e" : A }}>{r.s.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="reveal" style={{ order: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>İtibar Yönetimi</div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>Geri Bildirimleri <br />Kontrol Edin</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 32 }}>
              Müşterilerinizin dijital menü üzerinden bıraktığı yorumları anında görün. Olumlu yorumları onaylayarak ana sayfanızda sergileyin, eleştirileri cevaplayarak müşteri memnuniyetini artırın.
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>%98</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Müşteri Memnuniyeti</div>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>4.9/5</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Ortalama Puan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SHOWCASE */}
      <section style={{ padding: "100px 5%", background: "linear-gradient(to bottom, #080808, #050505)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div className="reveal" style={{ marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>Veriye Dayalı Yönetim</div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, marginBottom: 24 }}>İşletmenizi <span style={{ color: A }}>Verilerle</span> Büyütün</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", maxWidth: 700, margin: "0 auto" }}>
              Hangi ürününüz daha çok satıyor? En yoğun saatleriniz hangileri? Hangi masa daha çok sipariş veriyor? Tüm cevaplar tek bir ekranda.
            </p>
          </div>
          
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {[
              { t: "Popüler Ürünler", d: "En çok tercih edilen 10 lezzeti analiz edin.", i: <IconChart size={32} color={A} /> },
              { t: "Ciro Takibi", d: "Günlük, haftalık ve aylık kazancınızı izleyin.", i: <IconDollar size={32} color={A} /> },
              { t: "Müşteri Trafiği", d: "Menünüzün kaç kez görüntülendiğini takip edin.", i: <IconEye size={32} color={A} /> },
              { t: "Garson Performansı", d: "Servis çağrılarına dönüş sürelerini ölçün.", i: <IconZap size={32} color={A} /> }
            ].map((f, i) => (
              <div key={i} className="card" style={{ textAlign: "left", padding: 32 }}>
                <div style={{ marginBottom: 20 }}>{f.i}</div>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{f.t}</h4>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGNED FOR TURKEY */}
      <section style={{ padding: "80px 5%", background: "#050505", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", opacity: 0.6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Türkiye'nin Restoranları İçin Özel Olarak Tasarlandı</span>
          <div style={{ width: 4, height: 4, borderRadius: 99, background: A }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>%100 Yerel Yazılım</span>
        </div>
      </section>

      {/* INTERACTIVE QR PREVIEW */}
      <section style={{ padding: "100px 5%", background: "#080808" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="cardSi" style={{ 
            background: "linear-gradient(135deg, rgba(212,71,10,0.1) 0%, rgba(0,0,0,0) 100%)", 
            padding: "60px 40px", borderRadius: 32, border: "1px solid rgba(212,71,10,0.2)",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center"
          }}>
            <div className="reveal">
              <h2 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>Markanıza Özel <br /><span style={{ color: A }}>QR Kodunuzu</span> Görün</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.6 }}>
                Restoranınızın adını yazın, sistemimizin size özel oluşturacağı şık QR kod tasarımını anında görün. Müşterileriniz bu kaliteyi hak ediyor.
              </p>
              <div style={{ position: "relative", maxWidth: 400 }}>
                <input 
                  id="qr-input"
                  type="text" 
                  placeholder="Restoran Adını Yazın..." 
                  onInput={(e: any) => {
                    const el = document.getElementById("qr-preview-text");
                    if (el) el.innerText = e.target.value || "Sizin Restoranınız";
                    const qrImg = document.getElementById("qr-preview-img") as HTMLImageElement;
                    if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://temeat.com.tr/${e.target.value || "demo"}`;
                  }}
                  style={{ width: "100%", padding: "18px 24px", borderRadius: 16, background: "#111", border: "2px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 16, outline: "none", transition: "all .3s" }} 
                />
              </div>
            </div>
            <div className="reveal" style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#fff", padding: "30px", borderRadius: 24, boxShadow: `0 20px 60px ${A}30`, textAlign: "center", width: "fit-content" }}>
                <img id="qr-preview-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://temeat.com.tr/demo" alt="QR" style={{ width: 180, height: 180, marginBottom: 20 }} />
                <div id="qr-preview-text" style={{ color: "#000", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: ".05em" }}>Sizin Restoranınız</div>
                <div style={{ color: "#999", fontSize: 11, marginTop: 4, fontWeight: 700 }}>TEMeat Dijital Menü</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section id="ozellikler" style={{ padding: "100px 5%", background: "#050505" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 900, color: "#fff", letterSpacing: "-.04em", marginBottom: 16 }}>İşletmeniz İçin <span style={{ color: A }}>Tam Güç</span></h2>
          </div>
          <div className="bento-grid">
            <div className="bento-card" style={{ gridColumn: "span 7", gridRow: "span 2" }}>
              <div style={{ color: A, marginBottom: 24, background: `${A}15`, width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><IconSmartphone /></div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Dijital Mutfak Paneli (KDS)</h3>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Siparişler anında mutfağınıza düşsün. Sesli bildirimler ve durum takibi (Hazırlanıyor, Hazır, Tamamlandı) ile operasyonunuzu sıfır hata ile yönetin.</p>
              <div style={{ marginTop: 24, padding: "12px", background: "rgba(255,255,255,.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,.05)", fontSize: 13, color: A, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <IconBell size={14} color={A} /> Yeni: Sesli Bildirim Desteği
              </div>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 5", gridRow: "span 1" }}>
              <div style={{ color: A, marginBottom: 20, background: `${A}15`, width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><IconBell /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Akıllı Garson Çağrı</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Müşterileriniz masadan tek tıkla garson çağırabilir veya hesap isteyebilir. İstekler anında panelinize düşer.</p>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 5", gridRow: "span 2" }}>
              <div style={{ color: A, marginBottom: 24, background: `${A}15`, width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><IconChart /></div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Gelişmiş Analitik</h3>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Hangi ürünler daha çok satıyor? En yoğun saatleriniz hangileri? Cironuzu ve müşteri tercihlerini anlık grafiklerle takip edin.</p>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 7", gridRow: "span 1" }}>
              <div style={{ color: A, marginBottom: 20, background: `${A}15`, width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><IconSettings /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Yorum Moderasyonu</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Müşteri geri bildirimlerini kontrol edin, onaylayın ve doğrudan cevaplayarak müşteri sadakatini artırın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" style={{ padding: "100px 5%", background: "#050505", borderTop: "1px solid rgba(255,255,255,.03)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 80 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 900, color: "#fff", letterSpacing: "-.04em", marginBottom: 16 }}>3 Adımda <span style={{ color: A }}>Başlayın</span></h2>
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
            {[
              { t: "Kayıt Ol", d: "Saniyeler içinde hesabınızı oluşturun ve restoran bilgilerinizi girin.", i: "1" },
              { t: "Menünü Oluştur", d: "Ürünlerini, fiyatlarını ve görsellerini yükle. İstediğin an güncelle.", i: "2" },
              { t: "QR Kodunu Al", d: "Masalarına özel üretilen QR kodları indir ve masalara yerleştir.", i: "3" }
            ].map((s, i) => (
              <div key={i} className="reveal" style={{ position: "relative" }}>
                <div style={{ fontSize: 120, fontWeight: 900, color: "rgba(255,255,255,0.03)", position: "absolute", top: -60, left: -20, zIndex: 0 }}>{s.i}</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{s.t}</h3>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="fiyat" style={{ padding: "100px 5%", background: "#fff", color: "#111" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div id="price-header" data-animate style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: 24 }}>Basit, şeffaf fiyatlar</h2>
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {plans.map((plan, i) => (
              <div key={plan.id} style={{ borderRadius: 24, padding: 28, background: plan.highlight ? "#0a0a0a" : "#fff", border: plan.highlight ? `2px solid ${A}` : "1.5px solid #ebebeb" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,.5)" : "#999", marginBottom: 16 }}>{plan.name}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? "#fff" : "#111", marginBottom: 24 }}>{plan.price === 0 ? "Ücretsiz" : `₺${plan.price}`}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconCheck size={14} color={plan.highlight ? A : "#22c55e"} />
                      <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,.7)" : "#555" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="sss" style={{ padding: "100px 5%", background: "#fff", color: "#111" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, textAlign: "center", marginBottom: 60 }}>SSS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { q: "Müşterilerim uygulama indirmek zorunda mı?", a: "Hayır. QR kodu okuttukları anda tarayıcı üzerinden menünüz anında açılır. Sıfır sürtünme, maksimum hız." },
              { q: "Menüdeki fiyatları istediğim an değiştirebilir miyim?", a: "Evet. Yönetim panelinden yaptığınız her değişiklik saniyeler içinde tüm QR kodlara yansır. Kağıt menü maliyetinden kurtulursunuz." },
              { q: "Siparişler mutfağa nasıl iletiliyor?", a: "Müşteri sipariş verdiğinde, yönetim panelinizdeki Mutfak Ekranına anlık olarak düşer. Sesli uyarı ile personeliniz bilgilendirilir." },
              { q: "Aylık ücret dışında bir komisyon alıyor musunuz?", a: "Hayır. TEMeat komisyon almaz. Sadece seçtiğiniz paketin sabit aylık veya yıllık ücretini ödersiniz." }
            ].map((f, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, background: "#f9f9f9" }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{f.q}</h4>
                <p style={{ fontSize: 15, color: "#555" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 5%", background: "#0a0a0a", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 50% 50%, ${A}15, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "#fff", marginBottom: 20 }}>
            Dijital menünüzü <br /><span style={{ color: A }}>hemen oluşturun.</span>
          </h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/fiyat" className="btn-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 12, background: A, color: "#fff", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: `0 8px 32px ${A}40` }}>
              Ücretsiz Başla
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
            <a href="/demo" style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", fontSize: 16, fontWeight: 600, textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}>
              Demo Gör
            </a>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 20 }}>
            Kredi kartı gerekmez <span style={{ color: A, margin: "0 8px" }}>•</span> 14 gün ücretsiz <span style={{ color: A, margin: "0 8px" }}>•</span> İstediğin zaman iptal
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000", padding: "48px 5% 32px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Logo size="sm" />
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