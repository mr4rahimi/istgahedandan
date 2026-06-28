"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Slide {
  badge: string;
  title: string;
  text: string;
  cta: string;
  overlay: string;
  bg: string;
}

export default function HomeSlider({ slides }: { slides: Slide[] }) {
  const [cur, setCur] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const onMq = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onMq);
    onMq();
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  const heroHeight = isMobile ? "380px" : "440px";

  return (
    <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 24px 50px -26px rgba(13,75,107,.5)" }}>
      <div style={{ position: "relative", height: heroHeight }}>
        {slides.map((sl, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, background: sl.bg, opacity: i === cur ? 1 : 0, transition: "opacity .8s ease", pointerEvents: i === cur ? "auto" : "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,#0e5f7a 0 16px,#0c5570 16px 32px)", opacity: .25 }} />
            <div style={{ position: "absolute", inset: 0, background: sl.overlay }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(24px,6vw,72px)", maxWidth: 640 }}>
              <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "6px 13px", borderRadius: 30, marginBottom: 16 }}>{sl.badge}</span>
              <h2 style={{ margin: "0 0 14px", color: "#fff", fontSize: "clamp(26px,4.4vw,46px)", fontWeight: 800, lineHeight: 1.25, textShadow: "0 2px 18px rgba(0,0,0,.25)" }}>{sl.title}</h2>
              <p style={{ margin: "0 0 26px", color: "rgba(255,255,255,.92)", fontSize: "clamp(14px,1.8vw,18px)", lineHeight: 1.9, maxWidth: 480 }}>{sl.text}</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="#reserve" style={{ background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 13, boxShadow: "0 10px 24px -10px rgba(0,0,0,.4)" }}>{sl.cta}</Link>
                <Link href="/خدمات" style={{ background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.4)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 24px", borderRadius: 13, backdropFilter: "blur(6px)" }}>مشاهده خدمات</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setCur(c => (c - 1 + slides.length) % slides.length)} aria-label="قبلی" style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", cursor: "pointer", color: "#0b5e7a", boxShadow: "0 6px 16px rgba(0,0,0,.18)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
      <button onClick={() => setCur(c => (c + 1) % slides.length)} aria-label="بعدی" style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", cursor: "pointer", color: "#0b5e7a", boxShadow: "0 6px 16px rgba(0,0,0,.18)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18" /></svg>
      </button>

      <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} aria-label="اسلاید" style={{ width: i === cur ? 26 : 9, height: 9, borderRadius: 20, border: "none", cursor: "pointer", padding: 0, background: i === cur ? "#fff" : "rgba(255,255,255,.5)", transition: "all .3s" }} />
        ))}
      </div>
    </div>
  );
}
