"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "خطا در ورود");
      }
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "linear-gradient(135deg,#0a2c39,#0e4d63)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "clamp(28px,5vw,48px)", width: "100%", maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,.35)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={56} height={56} style={{ objectFit: "contain", margin: "0 auto 12px" }} />
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#133b48" }}>پنل مدیریت</h1>
          <p style={{ margin: 0, color: "#6c8b95", fontSize: 14 }}>ایستگاه دندان</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#133b48", marginBottom: 8 }}>ایمیل</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@istgahedandan.ir" style={{ width: "100%", padding: "13px 15px", border: "1px solid #dceaef", borderRadius: 12, fontFamily: "inherit", fontSize: 15, color: "#133b48", outline: "none", boxSizing: "border-box", direction: "ltr", textAlign: "left" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#133b48", marginBottom: 8 }}>رمز عبور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: "100%", padding: "13px 15px", border: "1px solid #dceaef", borderRadius: 12, fontFamily: "inherit", fontSize: 15, color: "#133b48", outline: "none", boxSizing: "border-box", direction: "ltr" }} />
          </div>

          {error && (
            <div style={{ background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#dc2626" }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: "pointer", opacity: loading ? .7 : 1, marginTop: 8 }}>
            {loading ? "در حال ورود…" : "ورود به پنل"}
          </button>
        </form>
      </div>
    </div>
  );
}
