"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Item { id: number; url: string; title: string }

interface Props {
  type: "gallery" | "videos";
  initialItems: Item[];
  titleLabel: string; urlLabel: string; addLabel: string;
  noTitle?: boolean;
  saveEndpoint: string;
  saveBody: (items: Item[]) => unknown;
  uploadEndpoint: string;
  accept?: string;
}

export default function DentistMediaManager({
  type, initialItems, titleLabel, urlLabel, addLabel, noTitle,
  saveEndpoint, saveBody, uploadEndpoint, accept = "image/*",
}: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

  const add = () => {
    if (!urlInput.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), url: urlInput.trim(), title: titleInput.trim() }]);
    setUrlInput(""); setTitleInput("");
  };

  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) {
      setItems(prev => [...prev, { id: Date.now(), url: data.url, title: file.name.replace(/\.[^.]+$/, "") }]);
    } else {
      setMsg(data.error || "خطا در آپلود");
    }
  };

  const save = async () => {
    setSaving(true); setMsg("");
    const res = await fetch(saveEndpoint, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveBody(items)),
    });
    setSaving(false);
    setMsg(res.ok ? "ذخیره شد ✓" : "خطا در ذخیره‌سازی");
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div>
      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px -8px rgba(13,75,107,.25)" }}>
            <span style={{ color: "#9bb6bf", fontSize: 13, width: 20, flexShrink: 0 }}>{i + 1}</span>
            {isImage(item.url) ? (
              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#eef4f6" }}>
                <Image src={item.url} alt={item.title || "تصویر"} width={52} height={52} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 10, background: "linear-gradient(135deg,#0c5e7c,#0a3f54)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!noTitle && <div style={{ fontWeight: 600, fontSize: 14, color: "#143945", marginBottom: 2 }}>{item.title || "بدون عنوان"}</div>}
              <div style={{ fontSize: 12, color: "#9bb6bf", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "ltr" }}>{item.url}</div>
            </div>
            <button onClick={() => remove(item.id)} style={{ width: 32, height: 32, border: "none", background: "#fef2f2", borderRadius: 8, cursor: "pointer", display: "grid", placeItems: "center", color: "#dc2626", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "36px 0", color: "#9bb6bf", fontSize: 14, background: "#fff", borderRadius: 14, border: "1px dashed #dceaef" }}>موردی اضافه نشده</div>
        )}
      </div>

      {/* Add form */}
      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#133b48" }}>افزودن مورد جدید</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!noTitle && (
            <input value={titleInput} onChange={e => setTitleInput(e.target.value)} placeholder={titleLabel} style={{ padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none" }} />
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder={urlLabel} style={{ flex: 1, padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", direction: "ltr" }} />
            <button onClick={add} style={{ background: "#0c8aa6", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{addLabel}</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#9bb6bf" }}>یا</span>
            <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "9px 16px", border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "#2a4f5b", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              {uploading ? "در حال آپلود…" : "آپلود از رایانه"}
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={save} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: msg.includes("خطا") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
      </div>
    </div>
  );
}
