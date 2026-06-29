"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface Story {
  id: number;
  imageUrl: string;
  title: string;
  dentistTitle: string;
  dentistSlug: string;
}

const RINGS = [
  "linear-gradient(135deg,#f5a623,#ec4899)",
  "linear-gradient(135deg,#16b8d1,#0a6f9e)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#f43f5e,#f59e0b)",
  "linear-gradient(135deg,#16b8d1,#6366f1)",
  "linear-gradient(135deg,#ec4899,#8b5cf6)",
  "linear-gradient(135deg,#22c55e,#16b8d1)",
];

export default function HomeStories({ stories }: { stories: Story[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef = useRef(0);
  const progressRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startTimer = (currentIdx: number) => {
    clearTimer();
    idxRef.current = currentIdx;
    progressRef.current = 0;
    timerRef.current = setInterval(() => {
      progressRef.current += 2;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        if (idxRef.current >= stories.length - 1) {
          clearTimer();
          setOpen(false);
        } else {
          idxRef.current += 1;
          setIdx(idxRef.current);
          setProgress(0);
          startTimer(idxRef.current);
        }
      }
    }, 90);
  };

  const openStory = (i: number) => {
    setIdx(i);
    setProgress(0);
    setOpen(true);
    startTimer(i);
  };

  const next = () => {
    clearTimer();
    if (idxRef.current >= stories.length - 1) { setOpen(false); return; }
    const ni = idxRef.current + 1;
    setIdx(ni);
    setProgress(0);
    startTimer(ni);
  };

  const prev = () => {
    clearTimer();
    const ni = Math.max(0, idxRef.current - 1);
    setIdx(ni);
    setProgress(0);
    startTimer(ni);
  };

  const close = () => { clearTimer(); setOpen(false); };

  useEffect(() => () => clearTimer(), []);

  if (stories.length === 0) return null;

  const cur = stories[idx];

  return (
    <>
      <div className="ih-hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "6px 4px 10px" }}>
        {stories.map((s, i) => (
          <button key={s.id} onClick={() => openStory(i)}
            style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", width: 78, fontFamily: "inherit", padding: 0 }}>
            <span style={{ width: 74, height: 74, borderRadius: "50%", padding: 3, background: RINGS[i % RINGS.length], display: "grid", placeItems: "center" }}>
              <span style={{ width: "100%", height: "100%", borderRadius: "50%", border: "3px solid #f4f9fb", overflow: "hidden", position: "relative", display: "block" }}>
                <Image src={s.imageUrl} alt={s.dentistTitle} fill sizes="68px" style={{ objectFit: "cover" }} />
              </span>
            </span>
            <span style={{ fontSize: 11.5, color: "#3a5b66", fontWeight: 600, whiteSpace: "nowrap", maxWidth: 74, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
              {s.dentistTitle.replace(/^(کلینیک|دندانپزشکی|مرکز|دکتر)\s*/i, "").slice(0, 12)}
            </span>
          </button>
        ))}
      </div>

      {open && cur && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#06181f", direction: "rtl", fontFamily: "inherit", display: "grid", placeItems: "center" }}>
          <div style={{ position: "relative", width: "min(440px, 100vw)", height: "min(92vh, 860px)", background: "#0c2630", overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Background image */}
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src={cur.imageUrl} alt={cur.title} fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.55) 0,transparent 28%,transparent 58%,rgba(0,0,0,.75) 100%)" }} />
            </div>

            {/* Progress bars + header */}
            <div style={{ position: "relative", zIndex: 3, padding: "14px 14px 0" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {stories.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: "rgba(255,255,255,.28)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: "#fff", width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%", transition: "none" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: RINGS[idx % RINGS.length], display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 15, border: "2px solid rgba(255,255,255,.5)", flexShrink: 0 }}>
                    {cur.dentistTitle[0]}
                  </span>
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{cur.dentistTitle}</span>
                </div>
                <button onClick={close} style={{ width: 36, height: 36, border: "none", background: "rgba(0,0,0,.35)", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                </button>
              </div>
            </div>

            {/* Tap areas */}
            <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex" }}>
              <div onClick={prev} style={{ flex: 1, cursor: "pointer" }} />
              <div onClick={next} style={{ flex: 2, cursor: "pointer" }} />
            </div>

            {/* Caption + CTA */}
            <div style={{ position: "relative", zIndex: 3, padding: "18px 16px 28px" }}>
              <p style={{ margin: "0 0 14px", color: "#fff", fontSize: 15, lineHeight: 1.9, textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>{cur.title}</p>
              <Link href={`/${cur.dentistSlug}`} onClick={close}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,.95)", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: 13, borderRadius: 13 }}>
                مشاهده پروفایل دندانپزشکی
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
