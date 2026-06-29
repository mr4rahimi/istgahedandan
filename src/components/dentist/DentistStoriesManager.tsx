"use client";

import { useState, useEffect, useRef } from "react";

interface Story { id: number; imageUrl: string; title: string; createdAt: string; order: number }

export default function DentistStoriesManager() {
  const [stories, setStories] = useState<Story[]>([]);
  const [ttlDays, setTtlDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ imageUrl: "", title: "" });
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStories = async () => {
    const res = await fetch("/api/dentist/stories");
    const data = await res.json();
    setStories(data.stories || []);
    setTtlDays(data.ttlDays || 7);
    setLoading(false);
  };

  useEffect(() => { fetchStories(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setForm(f => ({ ...f, imageUrl: data.url }));
  };

  const handleAdd = async () => {
    if (!form.imageUrl || !form.title) { setError("تصویر و عنوان الزامی است"); return; }
    setError("");
    const res = await fetch("/api/dentist/stories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ imageUrl: "", title: "" });
      fetchStories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این استوری حذف شود؟")) return;
    await fetch(`/api/dentist/stories/${id}`, { method: "DELETE" });
    setStories(s => s.filter(x => x.id !== id));
  };

  const expiresAt = (createdAt: string) => {
    const d = new Date(new Date(createdAt).getTime() + ttlDays * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString("fa-IR");
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#133b48" }}>استوری‌ها</h1>
        <p style={{ margin: 0, color: "#6c8b95", fontSize: 14 }}>استوری‌ها بعد از {ttlDays} روز به‌طور خودکار پنهان می‌شوند</p>
      </div>

      {/* Add new */}
      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "24px", marginBottom: 28, boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700, color: "#133b48" }}>افزودن استوری جدید</h2>
        {error && <div style={{ background: "#fff1f1", border: "1px solid #fcc", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13.5, color: "#c0392b" }}>{error}</div>}

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Image upload area */}
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ width: 120, height: 200, borderRadius: 16, border: "2px dashed #c5d8e0", background: "#f8fbfc", cursor: "pointer", display: "grid", placeItems: "center", overflow: "hidden", position: "relative" }}
              onClick={() => fileRef.current?.click()}>
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : uploading ? (
                <div style={{ color: "#8aabb5", fontSize: 13, textAlign: "center" }}>در حال آپلود…</div>
              ) : (
                <div style={{ textAlign: "center", color: "#8aabb5" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ display: "block", margin: "0 auto 6px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <div style={{ fontSize: 12 }}>آپلود تصویر</div>
                  <div style={{ fontSize: 11, marginTop: 3 }}>9:16</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2a4f5b", marginBottom: 6 }}>یا URL تصویر</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." style={{ width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: "ltr", marginBottom: 12 }} />
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2a4f5b", marginBottom: 6 }}>عنوان استوری</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="مثلاً: ایمپلنت با کمترین درد" style={{ width: "100%", border: "1.5px solid #dceaef", borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
            <button onClick={handleAdd} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              افزودن استوری
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#9bb6bf", padding: 40 }}>در حال بارگذاری…</div>
      ) : stories.length === 0 ? (
        <div style={{ textAlign: "center", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "48px 24px", color: "#9bb6bf" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" style={{ margin: "0 auto 12px", display: "block" }}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></svg>
          هنوز استوری ندارید
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 14 }}>
          {stories.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px -4px rgba(13,75,107,.12)" }}>
              <div style={{ height: 200, position: "relative", background: "#f0f6f8", overflow: "hidden" }}>
                <img src={s.imageUrl} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => handleDelete(s.id)} style={{ position: "absolute", top: 6, left: 6, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.55)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#133b48", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "#f59e0b" }}>انقضا: {expiresAt(s.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
