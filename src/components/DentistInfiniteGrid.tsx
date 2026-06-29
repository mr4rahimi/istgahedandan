"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

interface Dentist {
  id: number; slug: string; title: string; shortDesc: string | null;
  address: string | null; featuredImage: string | null;
  avgRating: number | null; reviewCount: number;
}

interface Props {
  locationId: number;
  initialDentists: Dentist[];
  total: number;
}

const GRADIENTS = [
  "linear-gradient(135deg,#0c8aa6,#0e4d63)",
  "linear-gradient(135deg,#0a6f9e,#16b8d1)",
  "linear-gradient(135deg,#0e5f6e,#0c8aa6)",
  "linear-gradient(135deg,#16b8d1,#0a8f86)",
  "linear-gradient(135deg,#0a4f6e,#0a8f86)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
];

function DentistCard({ d, index }: { d: Dentist; index: number }) {
  const initial = d.title[0] ?? "د";
  const bg = GRADIENTS[index % GRADIENTS.length];
  return (
    <Link href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 18, boxShadow: "0 14px 34px -28px rgba(13,75,107,.5)", display: "block" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {d.featuredImage ? (
          <Image src={d.featuredImage} alt={d.title} width={64} height={64} style={{ borderRadius: 18, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <span style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: bg, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{initial}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
          <p style={{ margin: "3px 0 8px", fontSize: 13, color: "#6c8b95" }}>{d.shortDesc?.slice(0, 40) || "دندانپزشکی"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {d.avgRating && d.avgRating > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff6e6", color: "#d98a00", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 7 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                {d.avgRating.toFixed(1)}
              </span>
            )}
            {d.reviewCount > 0 && <span style={{ color: "#6c8b95", fontSize: 12.5 }}>{d.reviewCount} نظر</span>}
          </div>
        </div>
      </div>
      {d.shortDesc && (
        <p style={{ margin: "12px 0 12px", fontSize: 13.5, lineHeight: 1.9, color: "#5e7c85" }}>
          {d.shortDesc.slice(0, 80)}{d.shortDesc.length > 80 ? "…" : ""}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #eef4f6" }}>
        {d.address && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#6c8b95", fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {d.address.slice(0, 28)}
          </span>
        )}
        <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13.5, marginRight: "auto" }}>پروفایل ←</span>
      </div>
    </Link>
  );
}

export default function DentistInfiniteGrid({ locationId, initialDentists, total }: Props) {
  const [dentists, setDentists] = useState<Dentist[]>(initialDentists);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialDentists.length < total);
  const skipRef = useRef(initialDentists.length);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dentists?locationId=${locationId}&skip=${skipRef.current}&take=12`);
      const data = await res.json() as { dentists: Dentist[]; total: number; hasMore: boolean };
      skipRef.current += data.dentists.length;
      setDentists(prev => [...prev, ...data.dentists]);
      setHasMore(data.hasMore);
    } catch { /* ignore */ }
    setLoading(false);
  }, [locationId, loading, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (dentists.length === 0 && !loading) {
    return <p style={{ textAlign: "center", color: "#6c8b95", fontSize: 16, padding: "40px 0" }}>هنوز دندانپزشکی در این منطقه ثبت نشده است.</p>;
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {dentists.map((d, i) => <DentistCard key={d.id} d={d} index={i} />)}
      </div>

      {/* Sentinel + loader */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && (
        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #d7eef5", borderTopColor: "#0c8aa6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {!hasMore && dentists.length > 0 && (
        <p style={{ textAlign: "center", fontSize: 14, color: "#9bb6bf", padding: "24px 0" }}>
          همه {total} دندانپزشکی نمایش داده شدند
        </p>
      )}
    </div>
  );
}
