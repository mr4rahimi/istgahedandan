"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function DentistRegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("رمز عبور و تکرار آن یکسان نیستند"); return; }
    if (form.password.length < 8) { setError("رمز عبور باید حداقل ۸ کاراکتر باشد"); return; }
    setLoading(true);
    const res = await fetch("/api/dentist/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "خطا رخ داد"); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ direction: "rtl", fontFamily: "inherit", minHeight: "100vh", background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 32px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: "#133b48" }}>ثبت‌نام انجام شد</h2>
          <p style={{ color: "#6c8b95", fontSize: 15, lineHeight: 1.8, margin: "0 0 24px" }}>
            حساب شما با موفقیت ساخته شد.<br />
            <strong>لطفاً منتظر تأیید ادمین باشید.</strong><br />
            پس از تأیید می‌توانید وارد شوید.
          </p>
          <Link href="/dentist/login" style={{ display: "inline-block", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 13 }}>
            رفتن به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", minHeight: "100vh", background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/"><Image src="/assets/logo.webp" alt="" width={56} height={56} style={{ objectFit: "contain", margin: "0 auto 10px" }} /></Link>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>ثبت‌نام دندانپزشک</h1>
          <p style={{ margin: "6px 0 0", color: "#8fb6c0", fontSize: 13.5 }}>بعد از ثبت‌نام، ادمین حساب شما را تأیید می‌کند</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
          {error && (
            <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "12px 16px", marginBottom: 18, fontSize: 14, color: "#c0392b" }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "name", label: "نام کامل", type: "text", placeholder: "دکتر احمد محمدی", dir: "rtl" },
              { key: "email", label: "ایمیل", type: "email", placeholder: "example@email.com", dir: "ltr" },
              { key: "phone", label: "شماره موبایل", type: "tel", placeholder: "09123456789", dir: "ltr" },
              { key: "password", label: "رمز عبور (حداقل ۸ کاراکتر)", type: "password", placeholder: "••••••••", dir: "ltr" },
              { key: "confirm", label: "تکرار رمز عبور", type: "password", placeholder: "••••••••", dir: "ltr" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2a4f5b", marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={set(f.key)} required={f.key !== "phone"} placeholder={f.placeholder}
                  style={{ width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "11px 14px", fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: f.dir as "rtl" | "ltr" }}
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginTop: 6, boxShadow: "0 8px 20px -6px rgba(12,138,166,.6)" }}>
              {loading ? "در حال ثبت‌نام…" : "ثبت‌نام"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6c8b95" }}>
            حساب دارید؟{" "}
            <Link href="/dentist/login" style={{ color: "#0c8aa6", fontWeight: 700, textDecoration: "none" }}>وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
