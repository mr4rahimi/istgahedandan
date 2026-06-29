"use client";

import { useState } from "react";

interface Dentist {
  id: number; title: string; shortDesc: string | null; longDesc: string | null;
  address: string | null; phones: string[]; whatsapp: string | null;
  telegram: string | null; instagram: string | null; workingHours: string | null;
  mapLat: number | null; mapLng: number | null; featuredImage: string | null;
  gallery: string[]; metaTitle: string | null; metaDescription: string | null;
  faqs: { id: number; question: string; answer: string; order: number }[];
}

export default function DentistProfileForm({ dentist }: { dentist: Dentist }) {
  const [form, setForm] = useState({
    title: dentist.title,
    shortDesc: dentist.shortDesc || "",
    longDesc: dentist.longDesc || "",
    address: dentist.address || "",
    phones: dentist.phones.join("\n"),
    whatsapp: dentist.whatsapp || "",
    telegram: dentist.telegram || "",
    instagram: dentist.instagram || "",
    workingHours: dentist.workingHours || "",
    mapLat: dentist.mapLat?.toString() || "",
    mapLng: dentist.mapLng?.toString() || "",
    featuredImage: dentist.featuredImage || "",
    metaTitle: dentist.metaTitle || "",
    metaDescription: dentist.metaDescription || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"basic" | "contact" | "seo">("basic");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    const res = await fetch("/api/dentist/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        phones: form.phones.split("\n").map(p => p.trim()).filter(Boolean),
        mapLat: form.mapLat ? parseFloat(form.mapLat) : null,
        mapLng: form.mapLng ? parseFloat(form.mapLng) : null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "خطا"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = { width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "11px 14px", fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#f8fbfc" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#2a4f5b", marginBottom: 6 };

  const TABS = [
    { key: "basic", label: "اطلاعات اصلی" },
    { key: "contact", label: "تماس و موقعیت" },
    { key: "seo", label: "SEO" },
  ] as const;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>ویرایش پروفایل</h1>
        <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 6px 16px -4px rgba(12,138,166,.5)" }}>
          {saving ? "در حال ذخیره…" : saved ? "✓ ذخیره شد" : "ذخیره تغییرات"}
        </button>
      </div>

      {error && <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#c0392b" }}>{error}</div>}
      {saved && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#16a34a" }}>تغییرات با موفقیت ذخیره شد</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f0f6f8", borderRadius: 14, padding: 4, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, border: "none", borderRadius: 10, padding: "10px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#0c8aa6" : "#6c8b95", boxShadow: tab === t.key ? "0 2px 8px rgba(0,0,0,.08)" : "none", transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1px solid #e7f0f3", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)", display: "flex", flexDirection: "column", gap: 18 }}>

        {tab === "basic" && <>
          <div>
            <label style={labelStyle}>نام کلینیک / دندانپزشکی</label>
            <input value={form.title} onChange={set("title")} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>توضیح کوتاه</label>
            <textarea value={form.shortDesc} onChange={set("shortDesc")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>توضیحات کامل</label>
            <textarea value={form.longDesc} onChange={set("longDesc")} rows={8} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>تصویر اصلی (URL)</label>
            <input value={form.featuredImage} onChange={set("featuredImage")} placeholder="https://..." style={{ ...inputStyle, direction: "ltr" }} />
            {form.featuredImage && (
              <img src={form.featuredImage} alt="" style={{ marginTop: 10, height: 100, borderRadius: 10, objectFit: "cover" }} />
            )}
          </div>
          <div>
            <label style={labelStyle}>ساعات کاری</label>
            <textarea value={form.workingHours} onChange={set("workingHours")} rows={4} placeholder="شنبه تا چهارشنبه: ۹ تا ۲۰&#10;پنجشنبه: ۹ تا ۱۴" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </>}

        {tab === "contact" && <>
          <div>
            <label style={labelStyle}>آدرس</label>
            <textarea value={form.address} onChange={set("address")} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>شماره‌های تماس (هر شماره در یک خط)</label>
            <textarea value={form.phones} onChange={set("phones")} rows={3} placeholder="021-12345678&#10;09123456789" style={{ ...inputStyle, direction: "ltr", resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>واتساپ</label>
              <input value={form.whatsapp} onChange={set("whatsapp")} placeholder="09..." style={{ ...inputStyle, direction: "ltr" }} />
            </div>
            <div>
              <label style={labelStyle}>تلگرام</label>
              <input value={form.telegram} onChange={set("telegram")} placeholder="@username" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
            <div>
              <label style={labelStyle}>اینستاگرام</label>
              <input value={form.instagram} onChange={set("instagram")} placeholder="@username" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>عرض جغرافیایی (Lat)</label>
              <input value={form.mapLat} onChange={set("mapLat")} placeholder="35.123456" type="number" step="any" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
            <div>
              <label style={labelStyle}>طول جغرافیایی (Lng)</label>
              <input value={form.mapLng} onChange={set("mapLng")} placeholder="51.123456" type="number" step="any" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
          </div>
        </>}

        {tab === "seo" && <>
          <div>
            <label style={labelStyle}>عنوان متا (Meta Title)</label>
            <input value={form.metaTitle} onChange={set("metaTitle")} style={{ ...inputStyle, direction: "ltr" }} />
            <div style={{ fontSize: 12, color: "#9bb6bf", marginTop: 5 }}>{form.metaTitle.length} / 60 کاراکتر</div>
          </div>
          <div>
            <label style={labelStyle}>توضیحات متا (Meta Description)</label>
            <textarea value={form.metaDescription} onChange={set("metaDescription")} rows={3} style={{ ...inputStyle, direction: "ltr", resize: "vertical" }} />
            <div style={{ fontSize: 12, color: "#9bb6bf", marginTop: 5 }}>{form.metaDescription.length} / 160 کاراکتر</div>
          </div>
        </>}
      </div>
    </div>
  );
}
