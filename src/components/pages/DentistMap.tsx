"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface DentistPin {
  id: number;
  slug: string;
  title: string;
  address: string | null;
  featuredImage: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  avgRating: number | null;
  reviewCount: number;
}

const IRAN_CENTER: [number, number] = [32.4279, 53.688];

export default function DentistMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [selected, setSelected] = useState<DentistPin | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: typeof import("leaflet");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let MC: any;

    Promise.all([import("leaflet"), import("leaflet.markercluster")]).then(([leafletMod]) => {
      L = leafletMod.default ?? leafletMod;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      MC = (window as any).L ?? L;

      // Fix icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, { zoomControl: false }).setView(IRAN_CENTER, 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomleft" }).addTo(map);

      // Custom icon
      const dentistIcon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0c8aa6,#0a4f63);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:grid;place-items:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
      });

      // Cluster group
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 60,
        iconCreateFunction: (cluster: import("leaflet.markercluster").MarkerCluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            className: "",
            html: `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#0c8aa6,#0a4f63);border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.4);display:grid;place-items:center;color:#fff;font-weight:800;font-size:14px;font-family:inherit">${count}</div>`,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });
        },
      });

      fetch("/api/map/dentists")
        .then(r => r.json())
        .then((pins: DentistPin[]) => {
          setTotal(pins.length);
          for (const pin of pins) {
            const marker = L.marker([pin.lat, pin.lng], { icon: dentistIcon });
            marker.on("click", () => setSelected(pin));
            clusterGroup.addLayer(marker);
          }
          map.addLayer(clusterGroup);
        })
        .catch(() => {});

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const closePanel = () => setSelected(null);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Counter badge */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000, background: "rgba(255,255,255,.95)", backdropFilter: "blur(8px)", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#133b48" }}>{total} دندانپزشکی</span>
      </div>

      {/* Selected popup panel */}
      {selected && (
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "min(420px, calc(100vw - 32px))", background: "#fff", borderRadius: 22, boxShadow: "0 8px 40px rgba(0,0,0,.2)", overflow: "hidden" }}>
          {/* Image strip */}
          {selected.featuredImage ? (
            <div style={{ height: 120, position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.featuredImage} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 50%,rgba(8,47,62,.7))" }} />
            </div>
          ) : (
            <div style={{ height: 60, background: "linear-gradient(135deg,#0c5e7c,#0a3f54)" }} />
          )}

          <div style={{ padding: "16px 18px 18px" }}>
            <button onClick={closePanel} style={{ position: "absolute", top: 10, left: 12, width: 32, height: 32, border: "none", background: "rgba(255,255,255,.9)", borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", zIndex: 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a4f5b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#133b48", paddingLeft: 40 }}>{selected.title}</h3>

            {selected.avgRating != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, fontSize: 13 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                <span style={{ fontWeight: 700, color: "#f59e0b" }}>{selected.avgRating.toFixed(1)}</span>
                <span style={{ color: "#9bb6bf" }}>({selected.reviewCount} نظر)</span>
              </div>
            )}

            {selected.address && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6c8b95", lineHeight: 1.7, display: "flex", gap: 6, alignItems: "flex-start" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
                {selected.address}
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/${selected.slug}`} style={{ flex: 1, display: "block", textAlign: "center", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "11px 0", borderRadius: 12 }}>
                مشاهده پروفایل
              </Link>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#f0f9fb", color: "#0c8aa6", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "11px 16px", borderRadius: 12, border: "1px solid #d7eef5" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  تماس
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
