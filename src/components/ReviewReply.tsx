"use client";

import { useState } from "react";

interface Props {
  dentistId: number;
  parentId: number;
}

export default function ReviewReply({ dentistId, parentId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dentistId, parentId, name, body: text }),
      });
      if (res.ok) { setStatus("done"); setName(""); setText(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  if (status === "done") {
    return <p style={{ margin: "8px 0 0", fontSize: 13, color: "#16a34a" }}>پاسخ شما ثبت شد و پس از تأیید نمایش داده می‌شود.</p>;
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "#0c8aa6", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>
          ↩ پاسخ دادن
        </button>
      ) : (
        <div style={{ marginTop: 12, background: "#f1f8fa", borderRadius: 14, padding: 16 }}>
          <form onSubmit={submit}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="نام شما (اختیاری)"
              style={{ width: "100%", marginBottom: 8, border: "1px solid #dceaef", borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="پاسخ شما…"
              required
              rows={3}
              style={{ width: "100%", border: "1px solid #dceaef", borderRadius: 10, padding: "10px 12px", fontFamily: "inherit", fontSize: 13.5, outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            {status === "error" && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#dc2626" }}>خطا در ثبت. دوباره تلاش کنید.</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="submit" disabled={status === "loading"} style={{ background: "#0c8aa6", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontFamily: "inherit", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                {status === "loading" ? "…" : "ثبت پاسخ"}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={{ background: "transparent", border: "1px solid #d7e6ea", borderRadius: 10, padding: "9px 16px", fontFamily: "inherit", fontSize: 13.5, color: "#6c8b95", cursor: "pointer" }}>
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
