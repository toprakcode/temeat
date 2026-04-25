"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Logo from "../components/Logo";

const A = "#D4470A";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) setError(error.message);
      else setSuccess("Kayıt başarılı! E-postanızı doğrulayın.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError("E-posta veya şifre hatalı.");
      else window.location.href = "/panel";
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', system-ui, sans-serif",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(255,255,255,.25)}
        input:focus{outline:none;border-color:${A}!important}
      `}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at 50% 0%, ${A}12 0%, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp .5s cubic-bezier(.25,1,.5,1) both", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <Logo withTagline={false} />
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 20, padding: "32px 28px" }}>

          {/* Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,.06)", borderRadius: 10, padding: 3, marginBottom: 28, gap: 3 }}>
            {[["login", "Giriş Yap"], ["register", "Kayıt Ol"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m as "login" | "register"); setError(null); setSuccess(null); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: mode === m ? 700 : 400, background: mode === m ? "rgba(255,255,255,.1)" : "transparent", color: mode === m ? "#fff" : "rgba(255,255,255,.4)", transition: "all .2s" }}>
                {label}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", marginBottom: 6 }}>
            {mode === "login" ? "Tekrar hoş geldiniz" : "Hesap oluşturun"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", marginBottom: 24 }}>
            {mode === "login" ? "Restoran panelinize giriş yapın." : "Ücretsiz hesabınızı oluşturun."}
          </p>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Restoran Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sultanahmet Ocakbaşı"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", transition: "border-color .2s" }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>E-posta</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="restoran@email.com"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", transition: "border-color .2s" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: 14, fontFamily: "inherit", transition: "border-color .2s" }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", fontSize: 13, color: "#4ade80" }}>
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: "100%", padding: "13px 0", borderRadius: 11, border: "none", background: loading ? "rgba(212,71,10,.5)" : A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "opacity .2s", boxShadow: `0 6px 20px ${A}40`, marginTop: 4 }}>
              {loading ? "Yükleniyor..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.2)", marginTop: 20 }}>
          © 2026 TEMeat · <a href="/" style={{ color: "rgba(255,255,255,.3)", textDecoration: "none" }}>Ana Sayfa</a>
        </p>
      </div>
    </div>
  );
}