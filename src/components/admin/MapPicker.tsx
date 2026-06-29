"use client";

import { useEffect, useRef } from "react";

interface Props {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}

const IRAN_CENTER: [number, number] = [32.4279, 53.688];
const IRAN_ZOOM = 5;

export default function MapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let L: typeof import("leaflet");
    import("leaflet").then(mod => {
      L = mod.default ?? mod;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initLat = parseFloat(lat) || IRAN_CENTER[0];
      const initLng = parseFloat(lng) || IRAN_CENTER[1];
      const initZoom = lat && lng ? 14 : IRAN_ZOOM;

      const map = L.map(containerRef.current!, { zoomControl: true, attributionControl: false }).setView([initLat, initLng], initZoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      if (lat && lng) {
        markerRef.current = L.marker([initLat, initLng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onChange(pos.lat.toFixed(7), pos.lng.toFixed(7));
        });
      }

      map.on("click", (e) => {
        const { lat: la, lng: lo } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([la, lo]);
        } else {
          markerRef.current = L.marker([la, lo], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onChange(pos.lat.toFixed(7), pos.lng.toFixed(7));
          });
        }
        onChange(la.toFixed(7), lo.toFixed(7));
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when lat/lng change externally (input field)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (isNaN(la) || isNaN(lo)) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([la, lo]);
    }
    mapRef.current.setView([la, lo], Math.max(mapRef.current.getZoom(), 14));
  }, [lat, lng]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: "100%", height: 320, borderRadius: 14, overflow: "hidden", border: "1px solid #dceaef", cursor: "crosshair" }} />
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9bb6bf" }}>روی نقشه کلیک کنید تا موقعیت انتخاب شود. مارکر قابل drag کردن است.</p>
    </>
  );
}
