"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/admin/RichEditor";

interface BlogPost {
  id: number; slug: string; title: string; content: string | null; excerpt: string | null;
  featuredImage: string | null; categoryId: number | null; metaTitle: string | null; metaDescription: string | null;
  publishedAt: Date | null; isFeatured: boolean; authorName: string | null;
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
    isFeatured: post?.isFeatured ?? false,
    authorName: post?.authorName || "",
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
        isFeatured: form.isFeatured,
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

  const field = (label: string, key: keyof typeof form, type: "text" | "textarea" | "datetime-local" = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>{label}</label>
      {type === "textarea" ? (
        <textarea value={form[key] as string} onChange={e => set(key, e.target.value)} rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type={type} value={form[key] as string} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
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
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#f7fbfc", borderRadius: 12, padding: "14px 16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#133b48" }}>
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: "#0c8aa6", cursor: "pointer" }} />
          مقاله ویژه (نمایش در بالای صفحه مقالات)
        </label>
      </div>
      <div>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>نویسنده</label>
        <input value={form.authorName} onChange={e => set("authorName", e.target.value)} placeholder="تحریریه ایستگاه دندان"
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9bb6bf" }}>خالی = "تحریریه ایستگاه دندان"</p>
      </div>
      {field("خلاصه", "excerpt", "textarea")}
      <div>
        <label style={{ display: "block", fontWeight: 600, fontSize: 13.5, color: "#133b48", marginBottom: 7 }}>محتوا</label>
        <RichEditor value={form.content} onChange={v => set("content", v)} placeholder="محتوای مقاله را وارد کنید..." minHeight={360} />
      </div>
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
