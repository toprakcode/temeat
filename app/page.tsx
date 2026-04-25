"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./components/Logo";

const A = "#D4470A";

// ÖZEL SVG İKONLAR
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IconBell = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const IconSettings = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconSmartphone = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
const IconGlobe = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const IconPhone = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /></svg>;
const IconChart = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;

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
      price: 149,
      priceA: 119,
      desc: "Büyümek isteyenler için",
      features: [
        "50 ürüne kadar",
        "1 menü",
        "Özelleştirilebilir QR kod",
        "5 dil desteği",
        "Sepet & WhatsApp sipariş",
        "Şefin seçimi bölümü",
        "Fotoğraf galerisi",
        "Hazırlık süresi & porsiyon",
        "Temel analitik",
        "Masa bazlı QR (5 masa)",
      ],
      cta: "14 Gün Ücretsiz Dene",
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 299,
      priceA: 239,
      desc: "Tüm özellikler",
      features: [
        "Sınırsız ürün & menü",
        "Premium QR kod tasarımı",
        "Benzer yemek önerileri",
        "Kampanya & indirim",
        "Detaylı analitik",
        "Logo kaldırma (white-label)",
        "Özel domain",
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
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 99,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 32,
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)"
          }}>
            <span style={{ color: A, display: "flex" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            </span> Yeni Nesil Dijital Menü Deneyimi
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.05em", color: "#fff", marginBottom: 32
          }}>
            Restoranınızı <br /> <span style={{ color: A }}>Dijitalleştirin</span>
          </h1>

          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.4)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.6 }}>
            TEMeat ile saniyeler içinde QR menünüzü oluşturun, siparişlerinizi yönetin ve müşteri deneyimini zirveye taşıyın.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/auth" style={{ padding: "20px 48px", borderRadius: 16, background: A, color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", boxShadow: `0 20px 40px ${A}40` }}>Hemen Başla</Link>
            <Link href="/demo" style={{ padding: "20px 48px", borderRadius: 16, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>Demoyu İncele</Link>
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
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Gelişmiş QR Menü</h3>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Uygulama indirmeye gerek kalmadan, akıcı ve iştah açıcı bir dijital menü deneyimi. Müşterileriniz fotoğraflı menünüzü saniyeler içinde keşfetsin.</p>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 5", gridRow: "span 1" }}>
              <div style={{ color: A, marginBottom: 20, background: `${A}15`, width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><IconChart /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Anlık Analitik</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Hangi ürün daha çok bakıldı? Hangi saatler daha yoğunsunuz? Veriye dayalı kararlar alın.</p>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 5", gridRow: "span 2" }}>
              <div style={{ color: A, marginBottom: 24, background: `${A}15`, width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}><IconPhone /></div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Sipariş Sistemi</h3>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Müşterileriniz masadan tek tıkla WhatsApp üzerinden sipariş verebilir. Yanlış anlaşılmalara son verin.</p>
            </div>
            <div className="bento-card" style={{ gridColumn: "span 7", gridRow: "span 1" }}>
              <div style={{ color: A, marginBottom: 20, background: `${A}15`, width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><IconSettings /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Sınırsız Özelleştirme</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>Marka renklerinize, logonuza ve konseptinize uygun menü tasarımları oluşturun.</p>
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
                      <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,.7)" : "#555" }}>✓ {f}</span>
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
              { q: "WhatsApp üzerinden sipariş nasıl çalışıyor?", a: "Müşteri ürünleri seçer, sepetini onaylar. Sistem otomatik olarak bir sipariş özeti hazırlar ve tek tuşla sizin WhatsApp hattınıza gönderir." },
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