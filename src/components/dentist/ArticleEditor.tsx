"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/admin/RichEditor";
import Image from "next/image";

interface Category { id: number; name: string }
interface PostData { id: number; title: string; content: string; excerpt: string; categoryId: number | null; featuredImage: string; metaTitle: string; metaDescription: string }

export default function ArticleEditor({ categories, post }: { categories: Category[]; post?: PostData }) {
  const isEdit = !!post;
  const router = useRouter();

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [categoryId, setCategoryId] = useState<number | "">(post?.categoryId || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/dentist/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setFeaturedImage(data.url);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("عنوان الزامی است"); return; }
    if (!content || content === "<p></p>") { setError("محتوا الزامی است"); return; }

    setSaving(true); setError("");
    const url = isEdit ? `/api/dentist/articles/${post!.id}` : "/api/dentist/articles";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, excerpt, categoryId: categoryId || null, featuredImage, metaTitle, metaDescription }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "خطا"); return; }
    router.push("/dentist/articles");
  };

  const handleDelete = async () => {
    if (!post || !confirm("این مقاله حذف شود؟")) return;
    await fetch(`/api/dentist/articles/${post.id}`, { method: "DELETE" });
    router.push("/dentist/articles");
  };

  const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #dceaef", borderRadius: 10, padding: "10px 12px", fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13.5, fontWeight: 600, color: "#133b48", marginBottom: 7 };

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, boxShadow: "0 4px 20px -8px rgba(13,75,107,.1)", marginBottom: 16 }}>
      {title && <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{title}</h3>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 880 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>{isEdit ? "ویرایش مقاله" : "مقاله جدید"}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {isEdit && (
            <button onClick={handleDelete} style={{ border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 18px", fontSize: 14, fontFamily: "inherit", cursor: "pointer", background: "#fef2f2", color: "#c0392b", fontWeight: 600 }}>حذف مقاله</button>
          )}
          <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 26px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 6px 16px -4px rgba(12,138,166,.5)", opacity: saving ? .7 : 1 }}>
            {saving ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "انتشار مقاله"}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#c0392b", lineHeight: 1.7 }}>{error}</div>}

      {/* Title */}
      {section("", <>
        <div>
          <label style={labelStyle}>عنوان مقاله <span style={{ color: "#c0392b" }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان جذاب و توصیفی بنویسید…" style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} />
        </div>
        <div>
          <label style={labelStyle}>خلاصه مقاله</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="یک جمله خلاصه از مقاله…" style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </>)}

      {/* Content */}
      {section("محتوای مقاله", <>
        <RichEditor value={content} onChange={setContent} placeholder="محتوای مقاله را اینجا بنویسید…" minHeight={380} />
        <p style={{ margin: 0, fontSize: 12, color: "#9bb6bf" }}>توجه: لینک‌های خارج از سایت مجاز نیستند.</p>
      </>)}

      {/* Side info */}
      {section("اطلاعات تکمیلی", <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>دسته‌بندی</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value) : "")} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">بدون دسته‌بندی</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>تصویر شاخص</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://…" style={{ ...inputStyle, direction: "ltr", flex: 1 }} />
              <label style={{ padding: "0 12px", border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#2a4f5b", cursor: "pointer", display: "grid", placeItems: "center", whiteSpace: "nowrap" }}>
                {uploading ? "…" : "آپلود"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
              </label>
            </div>
            {featuredImage && (
              <div style={{ marginTop: 8, width: "100%", height: 90, borderRadius: 10, overflow: "hidden", position: "relative", background: "#eef4f6" }}>
                <Image src={featuredImage} alt="" fill style={{ objectFit: "cover" }} />
              </div>
            )}
          </div>
        </div>
        <div>
          <label style={labelStyle}>عنوان متا (SEO)</label>
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} style={{ ...inputStyle, direction: "ltr" }} />
        </div>
        <div>
          <label style={labelStyle}>توضیحات متا (SEO)</label>
          <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} style={{ ...inputStyle, direction: "ltr", resize: "vertical" }} />
        </div>
      </>)}
    </div>
  );
}
