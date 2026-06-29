"use client";

import { useState, useCallback } from "react";

interface Loc {
  id: number; slug: string; title: string; shortTitle: string | null;
  parentId: number | null; order: number; shortDesc: string | null;
  metaTitle: string | null; metaDescription: string | null;
}

interface Props { initialLocations: Loc[] }

const GRADIENTS = [
  "linear-gradient(135deg,#0c5e7c,#0a3f54)",
  "linear-gradient(135deg,#0a6f9e,#16b8d1)",
  "linear-gradient(135deg,#16b8d1,#0a8f86)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
];

export default function LocationTree({ initialLocations }: Props) {
  const [locations, setLocations] = useState<Loc[]>(initialLocations);
  const [editId, setEditId] = useState<number | "new" | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [form, setForm] = useState<Partial<Loc> & { parentId?: number | null }>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const reload = useCallback(async () => {
    const res = await fetch("/api/admin/locations");
    const data = await res.json() as Loc[];
    setLocations(data);
  }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const openEdit = (loc: Loc) => {
    setForm({ ...loc });
    setEditId(loc.id);
  };

  const openNew = (parentId?: number) => {
    setForm({ parentId: parentId ?? null, order: 0, title: "", shortTitle: "", slug: "" });
    setEditId("new");
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editId === "new") {
        await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`/api/admin/locations/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      await reload();
      setEditId(null);
      flash("ذخیره شد ✓");
    } catch { flash("خطا در ذخیره"); }
    setSaving(false);
  };

  const del = async (id: number, title: string) => {
    if (!confirm(`حذف "${title}"؟ زیرمجموعه‌ها بدون والد می‌شوند.`)) return;
    await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
    await reload();
    flash("حذف شد");
  };

  const toggleCollapse = (id: number) => setCollapsed(s => {
    const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n;
  });

  // Build tree
  const roots = locations.filter(l => !l.parentId).sort((a, b) => a.order - b.order);
  const childrenOf = (pid: number) => locations.filter(l => l.parentId === pid).sort((a, b) => a.order - b.order);

  const depth = (l: Loc): number => {
    if (!l.parentId) return 0;
    const p = locations.find(x => x.id === l.parentId);
    return p ? depth(p) + 1 : 0;
  };

  const inp = (label: string, key: keyof typeof form, type: "text" | "number" = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#133b48", marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        value={(form[key] as string | number) ?? ""}
        onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
        style={{ width: "100%", padding: "9px 11px", border: "1px solid #dceaef", borderRadius: 9, fontFamily: "inherit", fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );

  const renderNode = (loc: Loc, level: number) => {
    const children = childrenOf(loc.id);
    const isOpen = !collapsed.has(loc.id);
    const bg = GRADIENTS[level % GRADIENTS.length];
    return (
      <div key={loc.id} style={{ marginRight: level * 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 12, marginBottom: 6, boxShadow: "0 4px 12px -8px rgba(13,75,107,.3)" }}>
          {children.length > 0 && (
            <button onClick={() => toggleCollapse(loc.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6c8b95", padding: "0 2px", lineHeight: 1 }}>
              {isOpen ? "▼" : "▶"}
            </button>
          )}
          <span style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            {(loc.shortTitle || loc.title)[0]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#143945" }}>{loc.shortTitle || loc.title}</div>
            <div style={{ fontSize: 12, color: "#9bb6bf" }}>/{loc.slug} · ترتیب: {loc.order}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => openNew(loc.id)} title="افزودن زیرمنطقه" style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#e7f7ee", color: "#16a34a", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ زیر</button>
            <button onClick={() => openEdit(loc)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#eef7fa", color: "#0c8aa6", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>ویرایش</button>
            <button onClick={() => del(loc.id, loc.shortTitle || loc.title)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#dc2626", fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>حذف</button>
          </div>
        </div>
        {isOpen && children.length > 0 && (
          <div style={{ borderRight: "2px solid #d7eef5", marginRight: 16, paddingRight: 8, marginBottom: 4 }}>
            {children.map(c => renderNode(c, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => openNew()} style={{ padding: "10px 20px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + افزودن منطقه جدید
          </button>
          {msg && <span style={{ fontSize: 14, fontWeight: 600, color: msg.includes("خطا") ? "#dc2626" : "#16a34a", alignSelf: "center" }}>{msg}</span>}
        </div>
        <span style={{ fontSize: 13, color: "#6c8b95" }}>{locations.length} منطقه</span>
      </div>

      {/* Edit panel */}
      {editId !== null && (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, marginBottom: 20, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>
            {editId === "new" ? "افزودن منطقه" : "ویرایش منطقه"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {inp("عنوان کامل (برای صفحه)", "title")}
            {inp("عنوان کوتاه (برای breadcrumb)", "shortTitle")}
            {inp("اسلاگ (URL)", "slug")}
            {inp("ترتیب نمایش", "order", "number")}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#133b48", marginBottom: 5 }}>والد (منطقه بالاتر)</label>
            <select
              value={form.parentId ?? ""}
              onChange={e => setForm(f => ({ ...f, parentId: e.target.value ? parseInt(e.target.value) : null }))}
              style={{ width: "100%", padding: "9px 11px", border: "1px solid #dceaef", borderRadius: 9, fontFamily: "inherit", fontSize: 13.5, outline: "none", background: "#fff" }}
            >
              <option value="">— بدون والد (سطح شهر) —</option>
              {locations.filter(l => l.id !== editId).sort((a,b) => {
                const da = depth(a), db2 = depth(b);
                return da !== db2 ? da - db2 : (a.shortTitle||a.title).localeCompare(b.shortTitle||b.title, "fa");
              }).map(l => (
                <option key={l.id} value={l.id}>{"—".repeat(depth(l))} {l.shortTitle || l.title}</option>
              ))}
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

      {/* Tree */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {roots.map(r => renderNode(r, 0))}
      </div>
    </div>
  );
}
