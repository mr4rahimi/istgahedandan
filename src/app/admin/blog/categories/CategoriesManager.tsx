"use client";

import { useState, useCallback } from "react";

interface Cat { id: number; slug: string; name: string; parentId: number | null; _count: { posts: number } }
interface Props { initialCats: Cat[] }

export default function CategoriesManager({ initialCats }: Props) {
  const [cats, setCats] = useState<Cat[]>(initialCats);
  const [editId, setEditId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const reload = useCallback(async () => {
    const res = await fetch("/api/admin/blog/categories");
    const data = await res.json() as Cat[];
    setCats(data);
  }, []);

  const openNew = () => {
    setForm({ name: "", slug: "", parentId: "" });
    setEditId("new");
  };

  const openEdit = (c: Cat) => {
    setForm({ name: c.name, slug: c.slug, parentId: c.parentId?.toString() ?? "" });
    setEditId(c.id);
  };

  const autoSlug = (name: string) => {
    // Simple slug from Persian name — lowercase, spaces to dash
    const s = name.trim().replace(/\s+/g, "-").toLowerCase();
    setForm(f => ({ ...f, name, slug: f.slug || s }));
  };

  const save = async () => {
    if (!form.name || !form.slug) { flash("نام و اسلاگ الزامی است"); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, slug: form.slug, parentId: form.parentId ? parseInt(form.parentId) : null };
      if (editId === "new") {
        await fetch("/api/admin/blog/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`/api/admin/blog/categories/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      await reload();
      setEditId(null);
      flash("ذخیره شد ✓");
    } catch { flash("خطا"); }
    setSaving(false);
  };

  const del = async (c: Cat) => {
    if (!confirm(`حذف دسته «${c.name}»؟\n${c._count.posts} مقاله بدون دسته می‌شود.`)) return;
    await fetch(`/api/admin/blog/categories/${c.id}`, { method: "DELETE" });
    await reload();
    flash("حذف شد");
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "#6c8b95" }}>{cats.length} دسته‌بندی</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {msg && <span style={{ fontSize: 14, fontWeight: 600, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
          <button onClick={openNew} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 11, padding: "10px 20px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + دسته جدید
          </button>
        </div>
      </div>

      {/* Edit Panel */}
      {editId !== null && (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, marginBottom: 20, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{editId === "new" ? "دسته‌بندی جدید" : "ویرایش دسته‌بندی"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>نام</label>
              <input value={form.name} onChange={e => autoSlug(e.target.value)} style={inputStyle} placeholder="مثال: ایمپلنت" />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>اسلاگ (URL)</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ ...inputStyle, direction: "ltr" }} placeholder="implant" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#133b48", marginBottom: 5 }}>والد (اختیاری)</label>
            <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
              style={{ ...inputStyle, background: "#fff" }}>
              <option value="">— بدون والد —</option>
              {cats.filter(c => c.id !== editId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {saving ? "…" : "ذخیره"}
            </button>
            <button onClick={() => setEditId(null)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #d7e6ea", background: "transparent", color: "#6c8b95", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}>انصراف</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f8fbfc", borderBottom: "1px solid #e7f0f3" }}>
              <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95" }}>نام</th>
              <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95" }}>اسلاگ</th>
              <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95" }}>مقالات</th>
              <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95" }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c, i) => {
              const parent = c.parentId ? cats.find(x => x.id === c.parentId) : null;
              return (
                <tr key={c.id} style={{ borderBottom: i < cats.length - 1 ? "1px solid #f1f8fa" : "none" }}>
                  <td style={{ padding: "13px 18px", fontWeight: 600, color: "#143945" }}>
                    {parent && <span style={{ color: "#9bb6bf", fontSize: 12, marginLeft: 6 }}>{parent.name} ›</span>}
                    {c.name}
                  </td>
                  <td style={{ padding: "13px 18px", color: "#6c8b95", fontFamily: "monospace", fontSize: 13 }}>/{c.slug}</td>
                  <td style={{ padding: "13px 18px", textAlign: "center", color: "#9bb6bf" }}>{c._count.posts}</td>
                  <td style={{ padding: "13px 18px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <button onClick={() => openEdit(c)} style={{ fontSize: 13, color: "#0c8aa6", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>ویرایش</button>
                      <button onClick={() => del(c)} style={{ fontSize: 13, color: "#dc2626", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: 0 }}>حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
