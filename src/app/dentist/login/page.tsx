"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DentistLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/dentist/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "خطا رخ داد"); return; }
    router.push("/dentist/dashboard");
  };

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", minHeight: "100vh", background: "linear-gradient(135deg,#0e4d63 0%,#0a2f3e 60%,#061e28 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/">
            <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={60} height={60} style={{ objectFit: "contain", margin: "0 auto 12px" }} />
          </Link>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff" }}>ورود به پنل دندانپزشک</h1>
          <p style={{ margin: "8px 0 0", color: "#8fb6c0", fontSize: 14 }}>ایستگاه دندان</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
          {error && (
            <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#c0392b", lineHeight: 1.6 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#2a4f5b", marginBottom: 7 }}>ایمیل</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="example@email.com"
                style={{ width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: "ltr", textAlign: "left" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#2a4f5b", marginBottom: 7 }}>رمز عبور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: "ltr" }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginTop: 4, boxShadow: "0 8px 20px -6px rgba(12,138,166,.6)" }}>
              {loading ? "در حال ورود…" : "ورود"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "#6c8b95" }}>
            حساب ندارید؟{" "}
            <Link href="/dentist/register" style={{ color: "#0c8aa6", fontWeight: 700, textDecoration: "none" }}>ثبت‌نام کنید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
