"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface Category { id: number; name: string }
interface PostData { id: number; title: string; content: string; excerpt: string; categoryId: number | null; featuredImage: string; metaTitle: string; metaDescription: string }

export default function ArticleEditor({ categories, post }: { categories: Category[]; post?: PostData }) {
  const isEdit = !!post;
  const router = useRouter();

  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [categoryId, setCategoryId] = useState<number | "">(post?.categoryId || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "محتوای مقاله را اینجا بنویسید…" }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener" } }),
    ],
    content: post?.content || "",
    editorProps: {
      attributes: { style: "min-height:320px;outline:none;font-family:inherit;font-size:15px;line-height:1.9;direction:rtl;text-align:right" },
    },
  });

  const handleSave = async () => {
    if (!title.trim()) { setError("عنوان الزامی است"); return; }
    const content = editor?.getHTML() || "";
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

  const ToolBtn = useCallback(({ action, label, active }: { action: () => void; label: string; active?: boolean }) => (
    <button type="button" onClick={action} style={{ border: "1px solid #dceaef", borderRadius: 8, padding: "6px 11px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", background: active ? "#e0f2f8" : "#fff", color: active ? "#0c8aa6" : "#2a4f5b", fontWeight: active ? 700 : 500 }}>{label}</button>
  ), []);

  if (!editor) return null;

  const inputStyle: React.CSSProperties = { width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "11px 14px", fontSize: 14.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#f8fbfc" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#2a4f5b", marginBottom: 6 };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>{isEdit ? "ویرایش مقاله" : "مقاله جدید"}</h1>
        <div style={{ display: "flex", gap: 10 }}>
          {isEdit && (
            <button onClick={handleDelete} style={{ border: "1px solid #fcc", borderRadius: 12, padding: "10px 18px", fontSize: 14, fontFamily: "inherit", cursor: "pointer", background: "#fff1f1", color: "#c0392b", fontWeight: 600 }}>حذف</button>
          )}
          <button onClick={handleSave} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 6px 16px -4px rgba(12,138,166,.5)" }}>
            {saving ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "انتشار مقاله"}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "#c0392b", lineHeight: 1.7 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "22px", border: "1px solid #e7f0f3", boxShadow: "0 2px 12px -4px rgba(13,75,107,.08)" }}>
          <label style={labelStyle}>عنوان مقاله <span style={{ color: "#c0392b" }}>*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان جذاب و توصیفی بنویسید…" style={{ ...inputStyle, fontSize: 17, fontWeight: 700 }} />
        </div>

        {/* Content editor */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e7f0f3", boxShadow: "0 2px 12px -4px rgba(13,75,107,.08)", overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #eef4f6", padding: "12px 16px", display: "flex", gap: 6, flexWrap: "wrap", background: "#f8fbfc" }}>
            <ToolBtn action={() => editor.chain().focus().toggleBold().run()} label="B" active={editor.isActive("bold")} />
            <ToolBtn action={() => editor.chain().focus().toggleItalic().run()} label="I" active={editor.isActive("italic")} />
            <ToolBtn action={() => editor.chain().focus().toggleUnderline().run()} label="U" active={editor.isActive("underline")} />
            <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" active={editor.isActive("heading", { level: 2 })} />
            <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" active={editor.isActive("heading", { level: 3 })} />
            <ToolBtn action={() => editor.chain().focus().toggleBulletList().run()} label="• لیست" active={editor.isActive("bulletList")} />
            <ToolBtn action={() => editor.chain().focus().toggleOrderedList().run()} label="۱. لیست" active={editor.isActive("orderedList")} />
            <ToolBtn action={() => editor.chain().focus().toggleBlockquote().run()} label='❝' active={editor.isActive("blockquote")} />
          </div>
          <div style={{ padding: "20px 24px" }}>
            <EditorContent editor={editor} />
          </div>
          <div style={{ borderTop: "1px solid #eef4f6", padding: "10px 16px", background: "#f8fbfc", fontSize: 12, color: "#9bb6bf" }}>
            توجه: لینک‌های خارج از سایت مجاز نیستند. فقط لینک‌های داخلی قابل استفاده است.
          </div>
        </div>

        {/* Meta */}
        <div style={{ background: "#fff", borderRadius: 18, padding: "22px", border: "1px solid #e7f0f3", boxShadow: "0 2px 12px -4px rgba(13,75,107,.08)", display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#133b48" }}>اطلاعات تکمیلی</h3>
          <div>
            <label style={labelStyle}>خلاصه مقاله</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="یک جمله خلاصه از مقاله…" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>دسته‌بندی</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value) : "")} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">بدون دسته‌بندی</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>تصویر شاخص (URL)</label>
              <input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://…" style={{ ...inputStyle, direction: "ltr" }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>عنوان متا</label>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} style={{ ...inputStyle, direction: "ltr" }} />
          </div>
          <div>
            <label style={labelStyle}>توضیحات متا</label>
            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={2} style={{ ...inputStyle, direction: "ltr", resize: "vertical" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
