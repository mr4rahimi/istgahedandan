"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: number; slug: string; title: string; content: string | null; excerpt: string | null;
  featuredImage: string | null; categoryId: number | null; metaTitle: string | null; metaDescription: string | null;
  publishedAt: Date | null;
}
interface Category { id: number; name: string }

function toDateInput(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

export default function BlogEditForm({ post, categories }: { post: BlogPost | null; categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featuredImage: post?.featuredImage || "",
    categoryId: post?.categoryId?.toString() || "",
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    publishedAt: toDateInput(post?.publishedAt || null),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const url = post ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
    const method = post ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        publishedAt: form.publishedAt || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json() as { id?: number };
      setMsg("ذخیره شد ✓");
      if (!post && data.id) router.push(`/admin/blog/${data.id}`);
    } else {
      setMsg("خطا در ذخیره‌سازی");
    }
  };

  const field = (label: string, key: string, type: "text" | "textarea" | "datetime-local" = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} rows={key === "content" ? 16 : 4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: key === "content" ? "monospace" : "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", direction: key === "content" ? "ltr" : "rtl" }} />
      ) : (
        <input type={type} value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {field("عنوان", "title")}
        {field("اسلاگ (URL)", "slug")}
        {field("تاریخ انتشار", "publishedAt", "datetime-local")}
        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>دسته‌بندی</label>
          <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", background: "#fff" }}>
            <option value="">بدون دسته</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      {field("تصویر شاخص (URL)", "featuredImage")}
      {field("خلاصه", "excerpt", "textarea")}
      {field("محتوا (HTML)", "content", "textarea")}
      {field("عنوان سئو", "metaTitle")}
      {field("توضیح سئو", "metaDescription", "textarea")}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : post ? "ذخیره تغییرات" : "انتشار مقاله"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </form>
  );
}
