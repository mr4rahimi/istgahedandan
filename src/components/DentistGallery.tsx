"use client";

import { useState } from "react";
import Image from "next/image";

export default function DentistGallery({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!images.length) return null;

  return (
    <>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>تصاویر مرکز</h2>
          <span style={{ color: "#8aa6af", fontSize: 14 }}>{images.length} عکس</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setLightbox(img)} style={{ border: "none", padding: 0, cursor: "pointer", aspectRatio: "1", borderRadius: 16, overflow: "hidden", position: "relative", background: "#dceaef" }}>
              <Image src={img} alt={`تصویر ${i + 1}`} fill style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      </section>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(6,24,31,.92)", display: "grid", placeItems: "center", padding: 24, animation: "fade .2s ease" }}>
          <button onClick={() => setLightbox(null)} aria-label="بستن" style={{ position: "absolute", top: 20, left: 20, width: 46, height: 46, border: "none", background: "rgba(255,255,255,.15)", borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: "#fff" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </button>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(860px,100%)", maxHeight: "85vh", borderRadius: 18, overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
            <Image src={lightbox} alt="تصویر" fill style={{ objectFit: "contain" }} />
          </div>
        </div>
      )}
    </>
  );
}
