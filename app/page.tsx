export default function Home() {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FAFAFA", fontFamily: "system-ui, sans-serif" }}>

      {/* Navbar */}
      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEE", background: "#FFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <div style={{ width: 16, height: 2, background: "#D4470A", borderRadius: 99 }} />
            <div style={{ width: 11, height: 2, background: "#D4470A", borderRadius: 99 }} />
            <div style={{ width: 16, height: 2, background: "#D4470A", borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#111" }}>TEM</span>
            <span style={{ color: "#D4470A" }}>eat</span>
          </span>
        </div>
        <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#111", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Ücretsiz Başla
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#D4470A08", border: "1px solid #D4470A20", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: "#D4470A" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#D4470A" }}>Yeni nesil dijital menü</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "0 0 12px", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
          Menünüzü<br />Dijitale Taşıyın
        </h1>

        <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px", lineHeight: 1.6 }}>
          QR kod ile açılan, 5 dilli, WhatsApp sipariş destekli dijital menü. 2 dakikada kurulur.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "#D4470A", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(212,71,10,0.3)" }}>
            Ücretsiz Başla →
          </button>
          <button style={{ padding: "14px 20px", borderRadius: 10, border: "1.5px solid #DDD", background: "#FFF", color: "#333", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Demo Gör
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "0 20px 32px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>200K+</div>
          <div style={{ fontSize: 10, color: "#999" }}>Potansiyel Restoran</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>5</div>
          <div style={{ fontSize: 10, color: "#999" }}>Dil Desteği</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>₺0</div>
          <div style={{ fontSize: 10, color: "#999" }}>Başlangıç Maliyeti</div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "32px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#D4470A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Nasıl Çalışır?</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 24px", letterSpacing: "-0.03em" }}>3 Adımda Başlayın</h2>

        {[
          { num: "01", title: "Kayıt Olun", desc: "Telefon numaranız ve restoran adınızla 30 saniyede hesap açın." },
          { num: "02", title: "Menüyü Girin", desc: "Yemeklerinizi ekleyin, fotoğraf yükleyin, fiyatları yazın." },
          { num: "03", title: "QR Kodu Basın", desc: "Sistem QR kodunuzu üretir. İndirin, bastırın, masalara koyun." },
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: i === 0 ? "#D4470A" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: i === 0 ? "#fff" : "#999", flexShrink: 0 }}>
              {step.num}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 3 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 20px", borderTop: "1px solid #EEE" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ width: 12, height: 1.5, background: "#D4470A", borderRadius: 99 }} />
            <div style={{ width: 8, height: 1.5, background: "#D4470A", borderRadius: 99 }} />
            <div style={{ width: 12, height: 1.5, background: "#D4470A", borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 800 }}>
            <span style={{ color: "#111" }}>TEM</span>
            <span style={{ color: "#D4470A" }}>eat</span>
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#999" }}>temeat.com.tr</div>
        <div style={{ fontSize: 9, color: "#CCC", marginTop: 4 }}>© 2026 TEMeat. Tüm hakları saklıdır.</div>
      </div>

    </div>
  );
}