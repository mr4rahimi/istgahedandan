"use client";

import { useState, useCallback, useRef } from "react";
import RichEditor from "@/components/admin/RichEditor";

const GRADIENTS = [
  "linear-gradient(135deg,#0c5e7c,#0a3f54)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#f43f5e,#a21caf)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#f59e0b,#ec4899)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
];

interface Svc { id: number; slug: string; title: string; shortDesc: string | null; bgGradient: string | null; order: number; _count: { dentists: number } }
interface InfoItem { label: string; value: string }
interface FullSvc extends Svc { content: string | null; featuredImage: string | null; iconSvgPath: string | null; infoItems: InfoItem[] | null; metaTitle: string | null; metaDescription: string | null }

function emptyForm(): Omit<FullSvc, "id" | "_count"> & { id?: number } {
  return { slug: "", title: "", shortDesc: "", bgGradient: GRADIENTS[0], iconSvgPath: "", content: "", featuredImage: "", order: 0, infoItems: [], metaTitle: "", metaDescription: "" };
}

export default function ServicesAdmin({ initial }: { initial: Svc[] }) {
  const [list, setList] = useState<Svc[]>(initial);
  const [editId, setEditId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const contentRef = useRef(form.content ?? "");
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const reload = useCallback(async () => {
    const r = await fetch("/api/admin/services");
    setList(await r.json() as Svc[]);
  }, []);

  const openNew = () => {
    const f = emptyForm();
    setForm(f);
    contentRef.current = "";
    setEditId("new");
  };

  const openEdit = async (id: number) => {
    const r = await fetch(`/api/admin/services/${id}`);
    const d = await r.json() as FullSvc;
    const f = { ...d, infoItems: d.infoItems || [], content: d.content || "", shortDesc: d.shortDesc || "", bgGradient: d.bgGradient || GRADIENTS[0], iconSvgPath: d.iconSvgPath || "", featuredImage: d.featuredImage || "", metaTitle: d.metaTitle || "", metaDescription: d.metaDescription || "" };
    contentRef.current = f.content;
    setForm(f as typeof form);
    setEditId(id);
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (title: string) => {
    set("title", title);
    if (editId === "new") {
      const s = title.trim().replace(/\s+/g, "-").toLowerCase();
      setForm(f => ({ ...f, title, slug: f.slug || s }));
    }
  };

  const save = async () => {
    if (!form.title || !form.slug) { flash("عنوان و اسلاگ الزامی است"); return; }
    setSaving(true);
    try {
      const payload = { ...form, content: contentRef.current, infoItems: form.infoItems?.filter(x => x.label) };
      if (editId === "new") {
        await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`/api/admin/services/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      await reload(); setEditId(null); flash("ذخیره شد ✓");
    } catch { flash("خطا"); }
    setSaving(false);
  };

  const del = async (s: Svc) => {
    if (!confirm(`حذف خدمت «${s.title}»؟\n${s._count.dentists} دندانپزشک با این خدمت لینک دارند.`)) return;
    await fetch(`/api/admin/services/${s.id}`, { method: "DELETE" });
    await reload(); flash("حذف شد");
  };

  const addInfo = () => setForm(f => ({ ...f, infoItems: [...(f.infoItems || []), { label: "", value: "" }] }));
  const setInfo = (i: number, k: "label" | "value", v: string) => setForm(f => ({ ...f, infoItems: (f.infoItems || []).map((x, j) => j === i ? { ...x, [k]: v } : x) }));
  const delInfo = (i: number) => setForm(f => ({ ...f, infoItems: (f.infoItems || []).filter((_, j) => j !== i) }));

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#6c8b95" }}>{list.length} خدمت</span>
        <div style={{ display: "flex", gap: 10 }}>
          {msg && <span style={{ fontSize: 14, fontWeight: 600, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
          <button onClick={openNew} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 11, padding: "10px 20px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ خدمت جدید</button>
        </div>
      </div>

      {/* Edit Panel */}
      {editId !== null && (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{editId === "new" ? "خدمت جدید" : "ویرایش خدمت"}</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>عنوان</label>
              <input value={form.title} onChange={e => autoSlug(e.target.value)} style={inp} /></div>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>اسلاگ (URL)</label>
              <input value={form.slug} onChange={e => set("slug", e.target.value)} style={{ ...inp, direction: "ltr" }} /></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>توضیح کوتاه (کارت)</label>
            <textarea value={form.shortDesc ?? ""} onChange={e => set("shortDesc", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
          </div>

          {/* Gradient picker */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 8 }}>رنگ پس‌زمینه</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GRADIENTS.map(g => (
                <button key={g} onClick={() => set("bgGradient", g)} style={{ width: 40, height: 40, borderRadius: 10, background: g, border: form.bgGradient === g ? "3px solid #0c8aa6" : "3px solid transparent", cursor: "pointer", outline: "none" }} />
              ))}
              <input value={form.bgGradient ?? ""} onChange={e => set("bgGradient", e.target.value)} placeholder="linear-gradient(…)" style={{ ...inp, flex: 1, minWidth: 160, direction: "ltr" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>ترتیب نمایش</label>
              <input type="number" value={form.order} onChange={e => set("order", parseInt(e.target.value) || 0)} style={{ ...inp, direction: "ltr" }} /></div>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>تصویر شاخص (URL)</label>
              <input value={form.featuredImage ?? ""} onChange={e => set("featuredImage", e.target.value)} style={{ ...inp, direction: "ltr" }} /></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>مسیر SVG آیکون</label>
            <input value={form.iconSvgPath ?? ""} onChange={e => set("iconSvgPath", e.target.value)} style={{ ...inp, direction: "ltr", fontFamily: "monospace" }} placeholder="M12 2c-1.5 0..." />
          </div>

          {/* Info items */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#133b48" }}>اطلاعات کلی (sidebar)</label>
              <button onClick={addInfo} style={{ fontSize: 13, color: "#0c8aa6", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer" }}>+ افزودن</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(form.infoItems || []).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={item.label} onChange={e => setInfo(i, "label", e.target.value)} placeholder="برچسب (مثلاً: مدت درمان)" style={{ ...inp, flex: 1 }} />
                  <input value={item.value} onChange={e => setInfo(i, "value", e.target.value)} placeholder="مقدار (مثلاً: ۳ تا ۶ ماه)" style={{ ...inp, flex: 1 }} />
                  <button onClick={() => delInfo(i)} style={{ color: "#dc2626", background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>محتوا</label>
            <RichEditor value={contentRef.current} onChange={v => { contentRef.current = v; }} minHeight={280} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>متا عنوان</label>
              <input value={form.metaTitle ?? ""} onChange={e => set("metaTitle", e.target.value)} style={inp} /></div>
            <div><label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>متا توضیحات</label>
              <input value={form.metaDescription ?? ""} onChange={e => set("metaDescription", e.target.value)} style={inp} /></div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "…" : "ذخیره"}
            </button>
            <button onClick={() => setEditId(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #d7e6ea", background: "transparent", color: "#6c8b95", fontFamily: "inherit", cursor: "pointer" }}>انصراف</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fbfc", borderBottom: "1px solid #e7f0f3" }}>
              <th style={{ padding: "13px 14px", textAlign: "right", fontWeight: 700, color: "#6c8b95" }}>خدمت</th>
              <th style={{ padding: "13px 14px", textAlign: "right", fontWeight: 700, color: "#6c8b95" }}>اسلاگ</th>
              <th style={{ padding: "13px 14px", textAlign: "center", fontWeight: 700, color: "#6c8b95" }}>دندانپزشکان</th>
              <th style={{ padding: "13px 14px", textAlign: "center", fontWeight: 700, color: "#6c8b95" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < list.length - 1 ? "1px solid #f1f8fa" : "none" }}>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: s.bgGradient || GRADIENTS[i % GRADIENTS.length], flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: "#143945" }}>{s.title}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 14px", color: "#6c8b95", fontFamily: "monospace", fontSize: 13 }}>/{s.slug}</td>
                <td style={{ padding: "13px 14px", textAlign: "center", color: "#9bb6bf" }}>{s._count.dentists}</td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button onClick={() => openEdit(s.id)} style={{ fontSize: 13, color: "#0c8aa6", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>ویرایش</button>
                    <button onClick={() => del(s)} style={{ fontSize: 13, color: "#dc2626", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} style={{ padding: "28px", textAlign: "center", color: "#9bb6bf" }}>هنوز خدمتی ثبت نشده</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
