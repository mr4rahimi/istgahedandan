"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import RichEditor from "@/components/admin/RichEditor";

interface Dentist {
  id: number; slug: string; title: string; shortDesc: string; longDesc: string;
  address: string; phones: string[]; whatsapp: string; telegram: string; instagram: string;
  workingHours: string; mapLat: string; mapLng: string; centerCode: string;
  featuredImage: string; gallery: string[]; metaTitle: string; metaDescription: string; status: string;
}

export default function DentistEditForm({ dentist }: { dentist: Dentist }) {
  const [form, setForm] = useState({
    title: dentist.title,
    slug: dentist.slug,
    shortDesc: dentist.shortDesc,
    longDesc: dentist.longDesc,
    address: dentist.address,
    phones: dentist.phones.join("\n"),
    whatsapp: dentist.whatsapp,
    telegram: dentist.telegram,
    instagram: dentist.instagram,
    workingHours: dentist.workingHours,
    mapLat: dentist.mapLat,
    mapLng: dentist.mapLng,
    centerCode: dentist.centerCode,
    featuredImage: dentist.featuredImage,
    metaTitle: dentist.metaTitle,
    metaDescription: dentist.metaDescription,
    status: dentist.status,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const uploadFeatured = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json() as { url?: string; error?: string };
    setUploading(false);
    if (data.url) set("featuredImage", data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    const res = await fetch(`/api/admin/dentists/${dentist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        phones: form.phones.split("\n").map(p => p.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "ذخیره شد ✓" : "خطا در ذخیره‌سازی");
    setTimeout(() => setMsg(""), 3000);
  };

  const inp = (label: string, key: string, type: "text" | "textarea" | "select" = "text", opts?: string[]) => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} rows={key === "longDesc" ? 12 : 3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: key === "longDesc" ? "monospace" : "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", direction: key === "longDesc" ? "ltr" : "rtl" }} />
      ) : type === "select" ? (
        <select value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", background: "#fff" }}>
          {opts?.map(o => <option key={o} value={o}>{o === "PUBLISHED" ? "منتشر" : o === "HIDDEN" ? "پنهان" : "در انتظار"}</option>)}
        </select>
      ) : (
        <input type="text" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)", marginBottom: 18 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {section("اطلاعات پایه", <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {inp("نام / عنوان", "title")}
          {inp("اسلاگ (URL)", "slug")}
          {inp("وضعیت", "status", "select", ["PUBLISHED", "HIDDEN", "PENDING"])}
          {inp("کد مرکز", "centerCode")}
        </div>
        {inp("توضیح کوتاه", "shortDesc", "textarea")}
      </>)}

      {section("تصویر شاخص", <>
        {form.featuredImage && (
          <div style={{ width: 160, height: 90, borderRadius: 10, overflow: "hidden", position: "relative", background: "#eef4f6" }}>
            <Image src={form.featuredImage} alt="تصویر شاخص" fill style={{ objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input value={form.featuredImage} onChange={e => set("featuredImage", e.target.value)} placeholder="لینک تصویر" style={{ flex: 1, padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", direction: "ltr" }} />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFeatured(f); }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "0 14px", border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "#2a4f5b", cursor: "pointer", whiteSpace: "nowrap" }}>
            {uploading ? "…" : "آپلود"}
          </button>
        </div>
      </>)}

      {section("اطلاعات تماس", <>
        {inp("شماره‌های تماس (هر شماره یک خط)", "phones", "textarea")}
        {inp("آدرس", "address")}
        {inp("ساعت کاری", "workingHours")}
      </>)}

      {section("شبکه‌های اجتماعی", <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {inp("واتساپ (لینک)", "whatsapp")}
          {inp("تلگرام (لینک)", "telegram")}
          {inp("اینستاگرام (لینک)", "instagram")}
        </div>
      </>)}

      {section("موقعیت جغرافیایی", <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {inp("عرض جغرافیایی (lat)", "mapLat")}
          {inp("طول جغرافیایی (lng)", "mapLng")}
        </div>
      </>)}

      {section("توضیحات کامل", <>
        <RichEditor value={form.longDesc} onChange={v => set("longDesc", v)} placeholder="توضیحات کامل دندانپزشکی را وارد کنید..." minHeight={280} />
      </>)}

      {section("سئو", <>
        {inp("عنوان سئو", "metaTitle")}
        {inp("توضیح سئو", "metaDescription", "textarea")}
      </>)}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </form>
  );
}
