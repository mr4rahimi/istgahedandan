"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Story { id: number; imageUrl: string; title: string; order: number }

const RINGS = [
  "linear-gradient(135deg,#16b8d1,#0a6f9e)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#f43f5e,#f59e0b)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#f5a623,#ec4899)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
];

export default function DentistStories({ stories, initial }: { stories: Story[]; initial: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const startTimer = () => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setIdx(i => {
            if (i >= stories.length - 1) { clearTimer(); setOpen(false); return i; }
            return i + 1;
          });
          return 0;
        }
        return p + 2.2;
      });
    }, 90);
  };

  const openStory = (i: number) => { setIdx(i); setProgress(0); setOpen(true); };
  useEffect(() => { if (open) startTimer(); else clearTimer(); return clearTimer; }, [open]);
  useEffect(() => { if (open) { setProgress(0); startTimer(); } }, [idx]);

  const next = () => { if (idx >= stories.length - 1) { clearTimer(); setOpen(false); } else setIdx(i => i + 1); };
  const prev = () => { if (idx > 0) setIdx(i => i - 1); };

  if (!stories.length) return null;

  return (
    <>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 16px 4px" }}>
        <div style={{ fontSize: 13, color: "#6c8b95", fontWeight: 600, marginBottom: 10 }}>استوری‌های مرکز</div>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {stories.map((st, i) => (
            <button key={st.id} onClick={() => openStory(i)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", width: 72, fontFamily: "inherit" }}>
              <span style={{ width: 68, height: 68, borderRadius: "50%", padding: 3, background: RINGS[i % RINGS.length], display: "grid", placeItems: "center" }}>
                <span style={{ width: "100%", height: "100%", borderRadius: "50%", border: "3px solid #f4f9fb", overflow: "hidden", display: "grid", placeItems: "center", background: "#dceaef" }}>
                  <Image src={st.imageUrl} alt={st.title} width={62} height={62} style={{ objectFit: "cover", borderRadius: "50%", width: "100%", height: "100%" }} />
                </span>
              </span>
              <span style={{ fontSize: 11.5, color: "#3a5b66", fontWeight: 600 }}>{st.title}</span>
            </button>
          ))}
        </div>
      </section>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2100, background: "#06181f", display: "grid", placeItems: "center", direction: "rtl", fontFamily: "inherit", animation: "fade .2s ease" }}>
          <div style={{ position: "relative", width: "min(440px,100%)", height: "min(92vh,860px)", background: "#0c2630", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Image src={stories[idx].imageUrl} alt={stories[idx].title} fill style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,.4) 100%)" }} />

            {/* Bars */}
            <div style={{ position: "relative", zIndex: 3, padding: "12px 12px 0" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {stories.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: "rgba(255,255,255,.3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: i < idx ? "100%" : i === idx ? progress + "%" : "0%", background: "#fff", transition: "none" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#16b8d1,#0a6f9e)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, border: "2px solid rgba(255,255,255,.5)", fontSize: 16 }}>{initial}</span>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{stories[idx].title}</span>
                </div>
                <button onClick={() => { clearTimer(); setOpen(false); }} style={{ width: 36, height: 36, border: "none", background: "rgba(0,0,0,.3)", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                </button>
              </div>
            </div>

            {/* Tap zones */}
            <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex" }}>
              <div onClick={prev} style={{ flex: 1, cursor: "pointer" }} />
              <div onClick={next} style={{ flex: 2, cursor: "pointer" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
