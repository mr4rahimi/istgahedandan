"use client";

import { useState } from "react";
import RichEditor from "@/components/admin/RichEditor";

interface Location { id: number; title: string; shortTitle: string | null; parentId: number | null }
interface Dentist { id: number; title: string }
interface Faq { q: string; a: string }

interface Settings {
  dl_short_desc?: string; dl_long_desc?: string; dl_popular_count?: string;
  dl_main_city_ids?: string; dl_region_ids?: string; dl_featured_ids?: string;
  dl_banner_image?: string; dl_banner_title?: string; dl_banner_link?: string;
  dl_faqs?: string; dl_meta_title?: string; dl_meta_desc?: string;
}

interface Props {
  settings: Settings;
  locations: Location[];
  dentists: Dentist[];
}

export default function DentistsListAdmin({ settings, locations, dentists }: Props) {
  const [form, setForm] = useState({
    dl_short_desc: settings.dl_short_desc || "",
    dl_long_desc: settings.dl_long_desc || "",
    dl_popular_count: settings.dl_popular_count || "6",
    dl_banner_image: settings.dl_banner_image || "",
    dl_banner_title: settings.dl_banner_title || "",
    dl_banner_link: settings.dl_banner_link || "",
    dl_meta_title: settings.dl_meta_title || "",
    dl_meta_desc: settings.dl_meta_desc || "",
  });
  const [mainCityIds, setMainCityIds] = useState<number[]>(
    settings.dl_main_city_ids ? JSON.parse(settings.dl_main_city_ids) : []
  );
  const [regionIds, setRegionIds] = useState<number[]>(
    settings.dl_region_ids ? JSON.parse(settings.dl_region_ids) : []
  );
  const [featuredIds, setFeaturedIds] = useState<number[]>(
    settings.dl_featured_ids ? JSON.parse(settings.dl_featured_ids) : []
  );
  const [faqs, setFaqs] = useState<Faq[]>(
    settings.dl_faqs ? JSON.parse(settings.dl_faqs) : []
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleId = (list: number[], setList: (l: number[]) => void, id: number) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/dentists-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dl_main_city_ids: JSON.stringify(mainCityIds),
        dl_region_ids: JSON.stringify(regionIds),
        dl_featured_ids: JSON.stringify(featuredIds),
        dl_faqs: JSON.stringify(faqs),
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "ذخیره شد ✓" : "خطا");
    setTimeout(() => setMsg(""), 3000);
  };

  const rootLocations = locations.filter(l => !l.parentId);
  const childLocations = locations.filter(l => l.parentId);

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, marginBottom: 18, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{title}</h3>
      {children}
    </div>
  );

  const inp = (label: string, key: string, type: "text" | "textarea" | "number" = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 6 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} rows={key === "dl_long_desc" ? 10 : 3}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: key === "dl_long_desc" ? "monospace" : "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", direction: key === "dl_long_desc" ? "ltr" : "rtl" }} />
      ) : (
        <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  const chipSelect = (label: string, items: { id: number; label: string }[], selected: number[], setSelected: (l: number[]) => void) => (
    <div>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map(item => (
          <button key={item.id} type="button" onClick={() => toggleId(selected, setSelected, item.id)}
            style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: selected.includes(item.id) ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: selected.includes(item.id) ? "#fff" : "#2a4f5b", borderColor: selected.includes(item.id) ? "transparent" : "#d7e6ea" }}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      {section("بخش هیرو", <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {inp("توضیح کوتاه (زیر عنوان اصلی)", "dl_short_desc", "textarea")}
        {inp("عنوان سئو", "dl_meta_title")}
        {inp("توضیح سئو", "dl_meta_desc")}
      </div>)}

      {/* Main Cities */}
      {section("شهرهای اصلی (نمایش در بخش شهرها)", chipSelect(
        "مناطق سطح اول (شهر):",
        rootLocations.map(l => ({ id: l.id, label: l.shortTitle || l.title })),
        mainCityIds, setMainCityIds
      ))}

      {/* Popular dentists */}
      {section("محبوب‌ترین دندانپزشکی‌ها", <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {inp("تعداد نمایش (بر اساس بالاترین امتیاز)", "dl_popular_count", "number")}
      </div>)}

      {/* Featured dentists */}
      {section("دندانپزشکی‌های نمونه (انتخاب دستی)", chipSelect(
        "انتخاب دندانپزشک‌ها:",
        dentists.map(d => ({ id: d.id, label: d.title })),
        featuredIds, setFeaturedIds
      ))}

      {/* Regional sections */}
      {section("دندانپزشکی‌های مناطق", chipSelect(
        "مناطق نمایش‌داده‌شده:",
        [...rootLocations, ...childLocations].map(l => ({ id: l.id, label: l.shortTitle || l.title })),
        regionIds, setRegionIds
      ))}

      {/* Banner */}
      {section("بنر", <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {inp("عنوان بنر", "dl_banner_title")}
        {inp("لینک بنر", "dl_banner_link")}
        {inp("تصویر بنر (URL)", "dl_banner_image")}
      </div>)}

      {/* Long desc */}
      {section("توضیحات بلند", <RichEditor value={form.dl_long_desc} onChange={v => set("dl_long_desc", v)} placeholder="توضیحات بلند صفحه لیست دندانپزشکان..." minHeight={240} />)}

      {/* FAQs */}
      {section("سوالات متداول", <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: "#f7fbfc", border: "1px solid #eef4f6", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: "#133b48" }}>سوال {i + 1}</span>
              <button onClick={() => setFaqs(f => f.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>حذف</button>
            </div>
            <input value={faq.q} onChange={e => setFaqs(f => f.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
              placeholder="سوال" style={{ width: "100%", marginBottom: 8, padding: "9px 11px", border: "1px solid #dceaef", borderRadius: 9, fontFamily: "inherit", fontSize: 13.5, outline: "none", boxSizing: "border-box" }} />
            <textarea value={faq.a} onChange={e => setFaqs(f => f.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
              placeholder="جواب" rows={2} style={{ width: "100%", padding: "9px 11px", border: "1px solid #dceaef", borderRadius: 9, fontFamily: "inherit", fontSize: 13.5, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={() => setFaqs(f => [...f, { q: "", a: "" }])}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1px dashed #d7e6ea", background: "#f7fbfc", color: "#0c8aa6", fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
          + افزودن سوال
        </button>
      </div>)}

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
        <button onClick={save} disabled={saving}
          style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره همه تغییرات"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </div>
  );
}
