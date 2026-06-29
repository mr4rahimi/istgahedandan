"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Loc { id: number; title: string; slug: string }
interface Dentist { id: number; slug: string; title: string; shortDesc: string | null; address: string | null; featuredImage: string | null; avgRating: number | null; reviewCount: number }

const PAGE = 12;

export default function ServiceDentists({ serviceId, serviceSlug }: { serviceId: number; serviceSlug: string }) {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<number | null>(null);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`/api/services/${encodeURIComponent(serviceSlug)}/locations`)
      .then(r => r.json())
      .then((d: Loc[]) => setLocations(d))
      .catch(() => {});
  }, [serviceSlug]);

  const loadFirst = useCallback((locId: number | null) => {
    setLoading(true);
    setDentists([]);
    skipRef.current = 0;
    const url = locId
      ? `/api/dentists?serviceId=${serviceId}&locationId=${locId}&skip=0&take=${PAGE}`
      : `/api/dentists?serviceId=${serviceId}&skip=0&take=${PAGE}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setDentists(d.dentists || []);
        setTotal(d.total || 0);
        setHasMore(d.hasMore || false);
        skipRef.current = (d.dentists || []).length;
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  useEffect(() => { loadFirst(selectedLoc); }, [selectedLoc, loadFirst]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const url = selectedLoc
      ? `/api/dentists?serviceId=${serviceId}&locationId=${selectedLoc}&skip=${skipRef.current}&take=${PAGE}`
      : `/api/dentists?serviceId=${serviceId}&skip=${skipRef.current}&take=${PAGE}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setDentists(prev => [...prev, ...(d.dentists || [])]);
        setHasMore(d.hasMore || false);
        skipRef.current += (d.dentists || []).length;
      })
      .finally(() => setLoadingMore(false));
  }, [serviceId, selectedLoc, hasMore, loadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "300px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (!loading && total === 0 && locations.length === 0) return null;

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px 50px" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>
          دندانپزشکان ارائه‌دهنده این خدمت
          {total > 0 && <span style={{ fontSize: 15, fontWeight: 500, color: "#6c8b95", marginRight: 8 }}>({total} متخصص)</span>}
        </h2>
      </div>

      {/* Location Filter */}
      {locations.length > 1 && (
        <div className="ih-hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 18 }}>
          <button onClick={() => setSelectedLoc(null)}
            style={{ padding: "9px 18px", borderRadius: 30, border: selectedLoc === null ? "none" : "1px solid #d2e8ee", background: selectedLoc === null ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: selectedLoc === null ? "#fff" : "#2a4f5b", fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            همه مناطق
          </button>
          {locations.map(loc => (
            <button key={loc.id} onClick={() => setSelectedLoc(loc.id)}
              style={{ padding: "9px 18px", borderRadius: 30, border: selectedLoc === loc.id ? "none" : "1px solid #d2e8ee", background: selectedLoc === loc.id ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: selectedLoc === loc.id ? "#fff" : "#2a4f5b", fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {loc.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #d7eef5", borderTopColor: "#0c8aa6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : dentists.length === 0 ? (
        <p style={{ color: "#9bb6bf", fontSize: 15, padding: "20px 0" }}>دندانپزشکی برای این فیلتر یافت نشد.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {dentists.map(d => (
              <Link key={d.id} href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 30px -26px rgba(13,75,107,.5)", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 140, position: "relative", background: "linear-gradient(135deg,#0c5e7c,#0a3f54)" }}>
                  {d.featuredImage && <Image src={d.featuredImage} alt={d.title} fill style={{ objectFit: "cover" }} />}
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 11px,rgba(255,255,255,.03) 11px 22px)" }} />
                </div>
                <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
                  {d.address && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6c8b95", lineHeight: 1.6 }}>{d.address}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
                    {d.avgRating != null && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        {d.avgRating.toFixed(1)}
                        <span style={{ fontWeight: 400, color: "#9bb6bf" }}>({d.reviewCount})</span>
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: "#0c8aa6", fontWeight: 600, marginRight: "auto" }}>مشاهده ←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {loadingMore && (
            <div style={{ display: "flex", justifyContent: "center", padding: 28 }}>
              <div style={{ width: 30, height: 30, border: "3px solid #d7eef5", borderTopColor: "#0c8aa6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          )}
          {!hasMore && dentists.length > 0 && total > PAGE && (
            <p style={{ textAlign: "center", color: "#b0ccd4", fontSize: 14, marginTop: 20 }}>همه {total} دندانپزشک نمایش داده شد</p>
          )}
        </>
      )}
    </section>
  );
}
