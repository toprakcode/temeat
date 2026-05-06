"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./components/Logo";

const A = "#D4470A"; // Accent Orange

// ICONS
const IconCheck = ({ size = 18, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconZap = ({ size = 16, color = "currentColor" }: { size?: number, color?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
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
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#050505", color: "#fff", fontFamily: "var(--font-plus-jakarta)", overflowX: "hidden" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .animate { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate.visible { opacity: 1; transform: translateY(0); }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); border-radius: 24px; }
        .nav-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 15px; font-weight: 600; transition: 0.2s; }
        .nav-link:hover { color: #fff; }
        .text-gradient { background: linear-gradient(135deg, #fff 0%, ${A} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-bg { position: absolute; inset: 0; background: url('/hero.png') center/cover; opacity: 0.3; z-index: 0; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #050505); z-index: 1; }
        .pricing-card { background: #fff; color: #000; border-radius: 24px; padding: 40px; display: flex; flexDirection: column; transition: 0.3s; }
        .pricing-card.highlight { background: #000; color: #fff; border: 2px solid ${A}; transform: scale(1.05); z-index: 2; }
        .badge-orange { background: #fff2eb; color: ${A}; padding: 4px 12px; borderRadius: 100px; fontSize: 12px; fontWeight: 700; }
      `}</style>

      {/* NAVBAR */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "24px 5%", background: scrolled ? "rgba(0,0,0,0.85)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition: "0.3s" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo size="sm" isDark={true} withTagline={false} />
          <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <a href="#ozellikler" className="nav-link">Özellikler</a>
            <a href="#nasil-calisir" className="nav-link">Nasıl Çalışır</a>
            <a href="#fiyat" className="nav-link">Fiyatlandırma</a>
            <a href="#sss" className="nav-link">SSS</a>
            <Link href="/auth" style={{ background: A, color: "#fff", padding: "12px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: `0 10px 20px ${A}30` }}>Giriş Yap</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 5%" }}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 900 }}>
          <h1 data-animate className="animate" style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 900, lineHeight: 0.9, marginBottom: 32 }}>
            Menünüzü <br /> <span className="text-gradient">Tek Panelden</span> Yönetin
          </h1>
          <p data-animate className="animate" style={{ fontSize: "clamp(18px, 2vw, 22px)", color: "rgba(255,255,255,0.5)", marginBottom: 48, maxWidth: 700, marginInline: "auto" }}>
            Sadece bir QR menü değil; mutfak yönetimi, canlı analizler ve AI destekli önerilerle tam donanımlı bir işletim sistemi.
          </p>
          <div data-animate className="animate" style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            <Link href="/auth" style={{ padding: "20px 48px", borderRadius: 16, background: A, color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none" }}>Ücretsiz Dene</Link>
            <Link href="/demo" className="glass" style={{ padding: "20px 48px", color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none" }}>Demoyu Gör</Link>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE (IMAGE 1) */}
      <section style={{ padding: "120px 5%", background: "#050505" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 data-animate className="animate" style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, marginBottom: 16 }}>Neden <span style={{ color: A }}>TEMeat?</span></h2>
          <p data-animate className="animate" style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, marginBottom: 64 }}>Geleneksel yöntemlerle zaman ve para kaybetmeyin.</p>
          
          <div data-animate className="animate glass" style={{ padding: "40px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "20px", color: "rgba(255,255,255,0.3)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>ÖZELLİK</th>
                  <th style={{ padding: "20px", color: "rgba(255,255,255,0.3)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>KAĞIT MENÜ</th>
                  <th style={{ padding: "20px", color: A, fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>TEMEAT 2.0</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Fiyat Güncelleme", "Günler sürer", "Anında"],
                  ["Sipariş Alma", "Garson beklemek şart", "Müşteri yapabilir"],
                  ["Çoklu Dil", "Kısıtlı veya yok", "5 dilde otomatik"],
                  ["Analiz & Takip", "İmkan yok", "Canlı dashboard"],
                  ["Baskı Maliyeti", "Sürekli gider", "Sıfır"],
                ].map(([f, old, tm], i) => (
                  <tr key={i} style={{ borderBottom: i === 4 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "24px 20px", fontWeight: 700, fontSize: 16 }}>{f}</td>
                    <td style={{ padding: "24px 20px", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>{old}</td>
                    <td style={{ padding: "24px 20px", fontWeight: 800, fontSize: 16, color: "#fff" }}>{tm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MUTFAK PANELI (IMAGE 2) */}
      <section id="ozellikler" style={{ padding: "120px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 80, alignItems: "center" }}>
          <div data-animate className="animate">
            <div style={{ color: A, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>SIFIR HATA PAYI</div>
            <h2 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>Gerçek Zamanlı <br /> Mutfak Paneli</h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 40 }}>Siparişler masadan verildiği anda mutfak ekranınıza düşer. Koordinasyonu mükemmelleştirin, servis hızınızı ikiye katlayın.</p>
            <div style={{ display: "grid", gap: 20 }}>
              {["Sesli yeni sipariş bildirimi", "Masa bazlı sipariş takibi", "Ürün bazlı özel notlar", "Tahmini hazırlık süresi yönetimi"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 700 }}>
                  <IconCheck color={A} /> {t}
                </div>
              ))}
            </div>
          </div>
          <div data-animate className="animate glass" style={{ padding: 32 }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>MUTFAK EKRANI</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: A }}>● CANLI • 3 SİPARİŞ</span>
             </div>
             {[
               { m: "MASA 4", p: "2x Burger, 1x Kola", s: "Hazırlanıyor", c: A },
               { m: "MASA 12", p: "1x Pizza, 1x Su", s: "Hazır", c: "#22c55e" },
               { m: "MASA 7", p: "Tatlılar", s: "Bekliyor", c: "#444" },
             ].map((o, i) => (
               <div key={i} style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{o.m}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{o.p}</div>
                  </div>
                  <div style={{ background: o.c, color: "#fff", fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 8 }}>{o.s}</div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* FEEDBACK (IMAGE 2 CONTINUED) */}
      <section style={{ padding: "120px 5%", background: "#050505" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 80, alignItems: "center" }}>
          <div data-animate className="animate glass" style={{ padding: 32, order: 1 }}>
             <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>MÜŞTERİ YORUMLARI</div>
             {[
               { n: "Ahmet Y.", t: "Yemekler harikaydı, servis çok hızlı!", s: "ONAYLANDI", sc: "#22c55e" },
               { n: "Caner T.", t: "Menü çok şık, kolay sipariş verdik.", s: "BEKLİYOR", sc: A },
             ].map((r, i) => (
               <div key={i} style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{r.n}</div>
                    <div style={{ color: "#f59e0b", fontSize: 10 }}>★★★★★</div>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>{r.t}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: r.sc, letterSpacing: ".1em" }}>{r.s}</div>
               </div>
             ))}
          </div>
          <div data-animate className="animate" style={{ order: 0 }}>
            <div style={{ color: A, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>İTİBAR YÖNETİMİ</div>
            <h2 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>Geri Bildirimleri <br /> Kontrol Edin</h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 48 }}>Müşterilerinizin dijital menü üzerinden bıraktığı yorumları anında görün. Olumlu yorumları onaylayarak ana sayfanızda sergileyin.</p>
            <div style={{ display: "flex", gap: 64 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>%98</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700, marginTop: 4 }}>Müşteri Memnuniyeti</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>4.9/5</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700, marginTop: 4 }}>Ortalama Puan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING (IMAGE 3) - FIXED LAYOUT */}
      <section id="fiyat" style={{ padding: "100px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "32px", 
            alignItems: "stretch" 
          }}>
            
            {/* Ücretsiz */}
            <div data-animate className="animate pricing-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#888", marginBottom: 16 }}>Ücretsiz</div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>₺</span>
                  <span style={{ fontSize: 56, fontWeight: 900 }}>0</span>
                  <span style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>/ aylık</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {["5 Ürün kapasitesi", "Temel QR Kod", "5 Dil desteği", "Karanlık Mod", "WiFi gösterimi", "Alerjen bilgileri", "Kalori Bilgisi"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#333", fontWeight: 600, lineHeight: 1.4 }}>
                    <IconCheck color="#22c55e" size={16} /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Yeni Mekan */}
            <div data-animate className="animate pricing-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#888", marginBottom: 16 }}>Yeni Mekan</div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>₺</span>
                  <span style={{ fontSize: 56, fontWeight: 900 }}>49</span>
                  <span style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>/ aylık</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <span className="badge-orange" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <IconCheck size={10} color={A} /> Ücretsiz plan özellikleri
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {["10 Ürün kapasitesi", "Temel Analitik", "Mekan fotoğrafları"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#333", fontWeight: 600, lineHeight: 1.4 }}>
                    <IconCheck color="#22c55e" size={16} /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Başlangıç */}
            <div data-animate className="animate pricing-card highlight" style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: A, color: "#fff", padding: "6px 20px", borderRadius: 10, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>EN POPÜLER</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Başlangıç</div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>₺</span>
                  <span style={{ fontSize: 56, fontWeight: 900 }}>149</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>/ aylık</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "6px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <IconCheck size={10} color="#fff" /> Yeni Mekan özellikleri
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {["25 Ürün kapasitesi", "Özelleştirilebilir QR Kod", "Sepete ekleme & Sipariş", "Şefin seçimi bölümü", "Hazırlık süresi & Porsiyon", "Masa bazlı QR (10 masa)"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
                    <IconCheck color={A} size={16} /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div data-animate className="animate pricing-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#888", marginBottom: 16 }}>Pro</div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>₺</span>
                  <span style={{ fontSize: 56, fontWeight: 900 }}>299</span>
                  <span style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>/ aylık</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <span className="badge-orange" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <IconCheck size={10} color={A} /> Başlangıç planı özellikleri
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {["Sınırsız ürün kapasitesi", "Dijital Mutfak Paneli", "Müşteri Yorum Ayarları", "AI Yemek Önerileri", "AI Ürün Açıklama Sihirbazı", "Logo kaldırma", "Sınırsız masa bazlı QR"].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#333", fontWeight: 600, lineHeight: 1.4 }}>
                    <IconCheck color="#22c55e" size={16} /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" style={{ padding: "100px 5%", background: "#050505" }}>
         <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <h2 data-animate className="animate" style={{ fontSize: 48, fontWeight: 900, marginBottom: 64 }}>4 Adımda Başlayın</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
               {[
                 { t: "Kayıt Ol", d: "Saniyeler içinde hesabınızı oluşturun.", i: "01" },
                 { t: "Menünü Yükle", d: "Ürünlerinizi ve kategorilerinizi ekleyin.", i: "02" },
                 { t: "QR Kodu Bas", d: "Özel QR kodun çıktısını alın.", i: "03" },
                 { t: "Yönetmeye Başla", d: "Müşteriler sipariş versin, siz izleyin.", i: "04" },
               ].map((s, i) => (
                 <div key={i} data-animate className="glass animate" style={{ padding: 48, textAlign: "left" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "rgba(255,255,255,0.05)", marginBottom: -24 }}>{s.i}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, position: "relative" }}>{s.t}</h3>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.d}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ SECTION */}
      <section id="sss" style={{ padding: "100px 5%", background: "#f9f9f9" }}>
         <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 data-animate className="animate" style={{ fontSize: 48, fontWeight: 900, marginBottom: 64, textAlign: "center", color: "#000" }}>SSS</h2>
            <div style={{ display: "grid", gap: 20 }}>
               {[
                 { q: "Müşterilerim uygulama indirmek zorunda mı?", a: "Hayır. QR kodu okuttukları anda tarayıcı üzerinden menünüz anında açılır. Sıfır sürtünme, maksimum hız." },
                 { q: "Menüdeki fiyatları istediğim an değiştirebilir miyim?", a: "Evet. Yönetim panelinden yaptığınız her değişiklik saniyeler içinde tüm QR kodlara yansır. Kağıt menü maliyetinden kurtulursunuz." },
                 { q: "Siparişler mutfağa nasıl iletiliyor?", a: "Müşteri sipariş verdiğinde, yönetim panelinizdeki Mutfak Ekranına anlık olarak düşer. Sesli uyarı ile personeliniz bilgilendirilir." },
                 { q: "Aylık ücret dışında bir komisyon alıyor musunuz?", a: "Hayır. TEMeat komisyon almaz. Sadece seçtiğiniz paketin sabit aylık veya yıllık ücretini ödersiniz." },
                 { q: "Birden fazla şube yönetebilir miyim?", a: "Evet, Pro paketimiz ile birden fazla şubenizi tek bir merkezden yönetebilirsiniz." },
                 { q: "Kendi logomuzu ekleyebiliyor muyuz?", a: "Kesinlikle. Tüm menülerde ve QR kodlarda kendi logonuzu ve kurumsal renklerinizi kullanabilirsiniz." },
                 { q: "Ödemeler nasıl alınıyor?", a: "TEMeat şu an için sipariş yönetimine odaklanmıştır. Ödemeleri mevcut POS sisteminiz veya nakit/kart ile masada almaya devam edebilirsiniz." },
                 { q: "Sözleşme veya taahhüt var mı?", a: "Hayır, herhangi bir taahhüt bulunmamaktadır. İstediğiniz ay üyeliğinizi iptal edebilir veya plan değiştirebilirsiniz." },
               ].map((item, i) => (
                 <div key={i} data-animate className="animate" style={{ padding: 32, background: "#fff", borderRadius: 24, border: "1px solid #eee", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "#000" }}>{item.q}</h3>
                    <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* BOTTOM CTA (IMAGE 4) */}
      <section style={{ padding: "140px 5%", background: "#050505", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 data-animate className="animate" style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, marginBottom: 24 }}>Dijital menünüzü <br /> <span style={{ color: A }}>hemen oluşturun.</span></h2>
        <div data-animate className="animate" style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 48 }}>
           <Link href="/auth" style={{ background: A, color: "#fff", padding: "20px 48px", borderRadius: 16, fontSize: 18, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>Ücretsiz Başla <span style={{ fontSize: 20 }}>→</span></Link>
           <Link href="/demo" className="glass" style={{ color: "#fff", padding: "20px 48px", borderRadius: 16, fontSize: 18, fontWeight: 800, textDecoration: "none" }}>Demo Gör</Link>
        </div>
        <div data-animate className="animate" style={{ marginTop: 32, color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, display: "flex", gap: 24, justifyContent: "center" }}>
           <span>Kredi kartı gerekmez</span>
           <span>•</span>
           <span>14 gün ücretsiz</span>
           <span>•</span>
           <span>İstediğin zaman iptal</span>
        </div>
      </section>

      {/* FOOTER (IMAGE 4 CONTINUED) */}
      <footer style={{ padding: "80px 5%", background: "#000", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 64, marginBottom: 80 }}>
            <div style={{ maxWidth: 300 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, background: A, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>ψ</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>TEMeat</div>
               </div>
               <div style={{ fontSize: 10, fontWeight: 800, color: A, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>DİJİTAL MENÜ SİSTEMİ</div>
               <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>Restoranlar için QR tabanlı dijital menü sistemi.</p>
            </div>
            
            <div style={{ display: "flex", gap: 80 }}>
               <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", marginBottom: 24, letterSpacing: ".1em" }}>ÜRÜN</div>
                  <div style={{ display: "grid", gap: 16 }}>
                    <a href="/demo" className="nav-link">Demo</a>
                    <a href="#fiyat" className="nav-link">Fiyat</a>
                    <a href="/panel" className="nav-link">Panel</a>
                  </div>
               </div>
               <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", marginBottom: 24, letterSpacing: ".1em" }}>YASAL</div>
                  <div style={{ display: "grid", gap: 16 }}>
                    <a href="#" className="nav-link">Gizlilik</a>
                    <a href="#" className="nav-link">Kullanım Şartları</a>
                    <a href="#" className="nav-link">KVKK</a>
                  </div>
               </div>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>© 2026 TEMeat. Tüm hakları saklıdır.</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>temeat.com.tr</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
