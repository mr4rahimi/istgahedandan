"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import RichEditor from "@/components/admin/RichEditor";
import DentistMediaManager from "./DentistMediaManager";

const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), {
  ssr: false,
  loading: () => <div style={{ height: 320, background: "#eef4f6", borderRadius: 14, display: "grid", placeItems: "center", color: "#9bb6bf" }}>در حال بارگذاری نقشه…</div>,
});

interface Dentist {
  id: number; title: string; shortDesc: string | null; longDesc: string | null;
  address: string | null; phones: string[]; whatsapp: string | null;
  telegram: string | null; instagram: string | null; workingHours: string | null;
  mapLat: number | null; mapLng: number | null; centerCode: string | null;
  featuredImage: string | null; gallery: string[];
  metaTitle: string | null; metaDescription: string | null;
  dentistVideos?: { id: number; url: string; title: string; order: number }[];
}

const TABS = [
  { key: "info", label: "اطلاعات اصلی" },
  { key: "contact", label: "تماس و موقعیت" },
  { key: "gallery", label: "گالری" },
  { key: "videos", label: "ویدئوها" },
  { key: "seo", label: "سئو" },
] as const;
type Tab = typeof TABS[number]["key"];

export default function DentistProfileForm({ dentist }: { dentist: Dentist }) {
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState({
    title: dentist.title,
    shortDesc: dentist.shortDesc || "",
    longDesc: dentist.longDesc || "",
    centerCode: dentist.centerCode || "",
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
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const uploadFeatured = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/dentist/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) set("featuredImage", data.url);
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/dentist/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        phones: form.phones.split("\n").map(p => p.trim()).filter(Boolean),
        mapLat: form.mapLat ? parseFloat(form.mapLat) : null,
        mapLng: form.mapLng ? parseFloat(form.mapLng) : null,
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "ذخیره شد ✓" : "خطا در ذخیره‌سازی");
    setTimeout(() => setMsg(""), 3000);
  };

  const inp = (label: string, key: string, type: "text" | "textarea" = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type="text" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)", marginBottom: 18 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );

  const showSaveBtn = tab === "info" || tab === "contact" || tab === "seo";

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>ویرایش پروفایل</h1>
        {showSaveBtn && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
            <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", opacity: saving ? .7 : 1 }}>
              {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e7f0f3", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "11px 20px", border: "none", background: "transparent", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", color: tab === t.key ? "#0c8aa6" : "#6c8b95", borderBottom: `2px solid ${tab === t.key ? "#0c8aa6" : "transparent"}`, marginBottom: -2, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Info */}
      {tab === "info" && <>
        {section("اطلاعات پایه", <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {inp("نام کلینیک / دندانپزشکی", "title")}
            {inp("کد مرکز", "centerCode")}
          </div>
          {inp("توضیح کوتاه", "shortDesc", "textarea")}
        </>)}

        {section("تصویر شاخص", <>
          {form.featuredImage && (
            <div style={{ width: 200, height: 120, borderRadius: 12, overflow: "hidden", position: "relative", background: "#eef4f6" }}>
              <Image src={form.featuredImage} alt="تصویر شاخص" fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={form.featuredImage} onChange={e => set("featuredImage", e.target.value)} placeholder="لینک تصویر" style={{ flex: 1, padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", direction: "ltr" }} />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFeatured(f); }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "0 16px", border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "#2a4f5b", cursor: "pointer", whiteSpace: "nowrap" }}>
              {uploading ? "…" : "آپلود"}
            </button>
          </div>
        </>)}

        {section("توضیحات کامل", <>
          <RichEditor value={form.longDesc} onChange={v => set("longDesc", v)} placeholder="توضیحات کامل دندانپزشکی را وارد کنید..." minHeight={300} />
        </>)}

        {section("ساعات کاری", <>
          {inp("ساعات کاری (هر روز در یک خط)", "workingHours", "textarea")}
        </>)}
      </>}

      {/* Contact */}
      {tab === "contact" && <>
        {section("اطلاعات تماس", <>
          {inp("شماره‌های تماس (هر شماره در یک خط)", "phones", "textarea")}
          {inp("آدرس کامل", "address", "textarea")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {inp("واتساپ", "whatsapp")}
            {inp("تلگرام", "telegram")}
            {inp("اینستاگرام", "instagram")}
          </div>
        </>)}

        {section("موقعیت روی نقشه", <>
          <MapPicker
            lat={form.mapLat}
            lng={form.mapLng}
            onChange={(la, lo) => setForm(f => ({ ...f, mapLat: la, mapLng: lo }))}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
            {inp("عرض جغرافیایی (lat)", "mapLat")}
            {inp("طول جغرافیایی (lng)", "mapLng")}
          </div>
        </>)}
      </>}

      {/* Gallery */}
      {tab === "gallery" && (
        <DentistMediaManager
          type="gallery"
          initialItems={dentist.gallery.map((url, i) => ({ id: i, url, title: "" }))}
          titleLabel="" urlLabel="لینک تصویر" addLabel="+ تصویر جدید"
          noTitle
          saveEndpoint="/api/dentist/gallery"
          saveBody={(items) => ({ gallery: items.map(i => i.url) })}
          uploadEndpoint="/api/dentist/upload"
        />
      )}

      {/* Videos */}
      {tab === "videos" && (
        <DentistMediaManager
          type="videos"
          initialItems={(dentist.dentistVideos || []).map(v => ({ id: v.id, url: v.url, title: v.title }))}
          titleLabel="عنوان ویدئو" urlLabel="لینک ویدئو" addLabel="+ ویدئو جدید"
          saveEndpoint="/api/dentist/videos"
          saveBody={(items) => items.map(i => ({ url: i.url, title: i.title }))}
          uploadEndpoint="/api/dentist/upload"
          accept="image/*,video/mp4,video/webm"
        />
      )}

      {/* SEO */}
      {tab === "seo" && <>
        {section("سئو", <>
          {inp("عنوان متا (Meta Title)", "metaTitle")}
          <div style={{ fontSize: 12, color: form.metaTitle.length > 60 ? "#dc2626" : "#9bb6bf", marginTop: -10 }}>{form.metaTitle.length} / 60 کاراکتر</div>
          {inp("توضیحات متا (Meta Description)", "metaDescription", "textarea")}
          <div style={{ fontSize: 12, color: form.metaDescription.length > 160 ? "#dc2626" : "#9bb6bf", marginTop: -10 }}>{form.metaDescription.length} / 160 کاراکتر</div>
        </>)}
      </>}
    </div>
  );
}
