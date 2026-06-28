"use client";

import { useState } from "react";

interface Dentist {
  id: number; slug: string; title: string; shortDesc: string | null; longDesc: string | null;
  address: string | null; phones: string[]; socialLinks: Record<string, string> | null;
  mapLat: number | null; mapLng: number | null; featuredImage: string | null;
  metaTitle: string | null; metaDescription: string | null; status: string;
}

interface Location { id: number; title: string }

export default function DentistEditForm({ dentist, locations, linkedIds }: { dentist: Dentist; locations: Location[]; linkedIds: number[] }) {
  const [form, setForm] = useState({
    title: dentist.title,
    slug: dentist.slug,
    shortDesc: dentist.shortDesc || "",
    longDesc: dentist.longDesc || "",
    address: dentist.address || "",
    phones: dentist.phones.join("\n"),
    featuredImage: dentist.featuredImage || "",
    mapLat: dentist.mapLat?.toString() || "",
    mapLng: dentist.mapLng?.toString() || "",
    metaTitle: dentist.metaTitle || "",
    metaDescription: dentist.metaDescription || "",
    status: dentist.status,
  });
  const [selectedLocations, setSelectedLocations] = useState<number[]>(linkedIds);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/admin/dentists/${dentist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, phones: form.phones.split("\n").map(p => p.trim()).filter(Boolean), locationIds: selectedLocations }),
    });
    setSaving(false);
    if (res.ok) setMsg("ذخیره شد ✓");
    else setMsg("خطا در ذخیره‌سازی");
  };

  const toggleLocation = (id: number) => {
    setSelectedLocations(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const field = (label: string, key: string, type: "text" | "textarea" | "select" = "text", options?: string[]) => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} rows={5} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : type === "select" ? (
        <select value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", background: "#fff" }}>
          {options?.map(o => <option key={o} value={o}>{o === "PUBLISHED" ? "منتشر" : o === "HIDDEN" ? "پنهان" : "در انتظار"}</option>)}
        </select>
      ) : (
        <input type="text" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {field("نام / عنوان", "title")}
        {field("اسلاگ (URL)", "slug")}
        {field("وضعیت", "status", "select", ["PUBLISHED", "HIDDEN", "PENDING"])}
        {field("تصویر شاخص (URL)", "featuredImage")}
        {field("مختصات lat", "mapLat")}
        {field("مختصات lng", "mapLng")}
      </div>
      {field("توضیح کوتاه", "shortDesc", "textarea")}
      {field("توضیح کامل (HTML)", "longDesc", "textarea")}
      {field("آدرس", "address")}
      {field("شماره‌های تماس (هر شماره یک خط)", "phones", "textarea")}
      {field("عنوان سئو", "metaTitle")}
      {field("توضیح سئو", "metaDescription", "textarea")}

      {/* Locations */}
      <div>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 10 }}>مناطق</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {locations.map(l => (
            <button key={l.id} type="button" onClick={() => toggleLocation(l.id)} style={{ padding: "7px 14px", borderRadius: 9, border: selectedLocations.includes(l.id) ? "none" : "1px solid #dceaef", background: selectedLocations.includes(l.id) ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: selectedLocations.includes(l.id) ? "#fff" : "#6c8b95", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {l.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </form>
  );
}
