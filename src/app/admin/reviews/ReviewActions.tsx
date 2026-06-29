"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewActions({ reviewId, approved, content }: { reviewId: number; approved: boolean; content: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);

  const act = async (action: "approve" | "reject" | "delete") => {
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    router.refresh();
    setLoading(false);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: editText }) });
    setEditing(false);
    router.refresh();
    setLoading(false);
  };

  return (
    <div>
      {editing && (
        <div style={{ marginBottom: 12 }}>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #dceaef", borderRadius: 10, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={saveEdit} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#0c8aa6", color: "#fff", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>ذخیره</button>
            <button onClick={() => { setEditing(false); setEditText(content); }} style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid #e7f0f3", background: "transparent", color: "#6c8b95", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>انصراف</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {!approved && (
          <button onClick={() => act("approve")} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#dcfce7", color: "#16a34a", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>تأیید</button>
        )}
        {approved && (
          <button onClick={() => act("reject")} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#fef2f2", color: "#dc2626", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>لغو تأیید</button>
        )}
        <button onClick={() => setEditing(e => !e)} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid #e2eef2", background: "#f1f8fa", color: "#2a4f5b", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>ویرایش</button>
        <button onClick={() => { if (confirm("حذف شود؟")) act("delete"); }} disabled={loading} style={{ padding: "7px 16px", borderRadius: 9, border: "1px solid #f1f8fa", background: "transparent", color: "#9bb6bf", fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>حذف</button>
      </div>
    </div>
  );
}
