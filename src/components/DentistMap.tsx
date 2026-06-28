"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function DentistMap({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("leaflet").then(L => {
      import("leaflet/dist/leaflet.css");
      if (!ref.current) return;
      ref.current.innerHTML = "";
      const map = L.map(ref.current).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#15b8d1,#0a6f9e);border:3px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,.35);display:grid;place-items:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/></svg>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        className: "",
      });

      L.marker([lat, lng], { icon }).addTo(map).bindPopup(title).openPopup();
    });
  }, [lat, lng, title]);

  return (
    <div ref={ref} style={{ height: "100%", minHeight: 280, borderRadius: 16 }} />
  );
}
