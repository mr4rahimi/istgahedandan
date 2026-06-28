"use client";

import { useState } from "react";

interface Video { id: number; url: string; title: string; order: number }

export default function DentistVideoSection({ videos }: { videos: Video[] }) {
  const [lightbox, setLightbox] = useState<Video | null>(null);
  if (!videos.length) return null;

  const isYoutube = (url: string) => url.includes("youtube") || url.includes("youtu.be");
  const getEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    return url;
  };

  return (
    <>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>ویدئوهای مرکز</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {videos.map(v => (
            <button key={v.id} onClick={() => setLightbox(v)} style={{ border: "none", padding: 0, cursor: "pointer", borderRadius: 18, overflow: "hidden", position: "relative", aspectRatio: "16/10", background: "linear-gradient(135deg,#0c5e7c,#0a3f54)", textAlign: "right" }}>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 14px,rgba(255,255,255,.03) 14px 28px)" }} />
              <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <span style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(0,0,0,.3)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#0b5e7a"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
              <span style={{ position: "absolute", bottom: 12, right: 14, color: "#fff", fontWeight: 600, fontSize: 14, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>{v.title}</span>
            </button>
          ))}
        </div>
      </section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(6,24,31,.92)", display: "grid", placeItems: "center", padding: 24, animation: "fade .2s ease" }}>
          <button onClick={() => setLightbox(null)} aria-label="بستن" style={{ position: "absolute", top: 20, left: 20, width: 46, height: 46, border: "none", background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </button>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(820px,100%)", aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", position: "relative" }}>
            {isYoutube(lightbox.url) ? (
              <iframe src={getEmbedUrl(lightbox.url)} style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen allow="autoplay" />
            ) : (
              <video src={lightbox.url} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
            )}
          </div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginTop: 12 }}>{lightbox.title}</div>
        </div>
      )}
    </>
  );
}
