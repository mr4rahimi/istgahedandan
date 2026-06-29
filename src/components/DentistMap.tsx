"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function DentistMap({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    import("leaflet").then(L => {
      if (!ref.current) return;

      // Destroy previous instance (Strict Mode / hot reload guard)
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Also clear any stale _leaflet_id left on the DOM node
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ref.current as any)._leaflet_id;

      delete (L.Icon.Default.prototype as any)._getIconUrl; // eslint-disable-line @typescript-eslint/no-explicit-any
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(ref.current, { zoomControl: true }).setView([lat, lng], 15);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
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

      // Leaflet reads container size at init time — wait one frame for layout to settle
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, title]);

  return (
    <>
      {/* Leaflet CSS must be present before the map renders */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={ref} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
