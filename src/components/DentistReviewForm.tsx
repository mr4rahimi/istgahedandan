"use client";

import { useState } from "react";

export default function DentistReviewForm({ dentistId }: { dentistId: number }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !text.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dentistId, rating, name, body: text }),
      });
      if (res.ok) { setStatus("done"); setRating(0); setName(""); setText(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", borderRadius: 18, padding: 24, color: "#fff" }}>
      <h4 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 700 }}>دیدگاه خود را ثبت کنید</h4>
      {status === "done" ? (
        <p style={{ margin: 0, color: "#9fc2cc", fontSize: 15 }}>نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود. ممنون!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={s <= (hover || rating) ? "#f5a623" : "transparent"} stroke="#7fd4e6" strokeWidth="1.5">
                  <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" />
                </svg>
              </button>
            ))}
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="نام شما (اختیاری)" style={{ width: "100%", marginBottom: 10, border: "none", borderRadius: 12, padding: "12px 14px", fontFamily: "inherit", fontSize: 14, color: "#143945", background: "#fff", outline: "none", boxSizing: "border-box" }} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="نظر شما درباره این مرکز…" style={{ width: "100%", minHeight: 90, resize: "vertical", border: "none", borderRadius: 13, padding: "14px 16px", fontFamily: "inherit", fontSize: 14, color: "#143945", background: "#fff", outline: "none", boxSizing: "border-box" }} required />
          {status === "error" && <p style={{ margin: "8px 0 0", color: "#fca5a5", fontSize: 13 }}>خطا در ثبت نظر. لطفاً دوباره تلاش کنید.</p>}
          <button type="submit" disabled={status === "loading"} style={{ marginTop: 14, background: "#fff", color: "#0b5e7a", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 13, cursor: "pointer", opacity: status === "loading" ? .7 : 1 }}>
            {status === "loading" ? "در حال ثبت…" : "ثبت دیدگاه"}
          </button>
        </form>
      )}
    </div>
  );
}
