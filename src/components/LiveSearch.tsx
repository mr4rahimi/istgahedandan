"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  dentists: {
    slug: string; title: string; address: string | null;
    featuredImage: string | null; avgRating: number | null; reviewCount: number;
  }[];
  services: { slug: string; title: string }[];
  articles: { slug: string; title: string; categoryName: string | null }[];
}

export default function LiveSearch({
  placeholder = "جستجوی دندانپزشک، خدمات یا منطقه…",
  autoFocus = false,
  onNavigate,
}: {
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: abortRef.current.signal,
      });
      const data: SearchResult = await res.json();
      setResults(data);
    } catch {
      // aborted
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQ(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.length < 2) {
      setResults(null);
      setOpen(false);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }
    setOpen(true);
    setLoading(true);
    timerRef.current = setTimeout(() => fetchResults(value), 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
      onNavigate?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); onNavigate?.(); }
  };

  const clearQ = () => {
    setQ(""); setResults(null); setOpen(false);
    if (abortRef.current) abortRef.current.abort();
    inputRef.current?.focus();
  };

  const goTo = () => { setOpen(false); onNavigate?.(); };

  const total = (results?.dentists.length ?? 0) + (results?.services.length ?? 0) + (results?.articles.length ?? 0);
  const hasDentists = (results?.dentists.length ?? 0) > 0;
  const hasServices = (results?.services.length ?? 0) > 0;
  const hasArticles = (results?.articles.length ?? 0) > 0;

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: focused ? "#fff" : "#f1f8fa",
          border: `1.5px solid ${focused ? "#0c8aa6" : "#dceaef"}`,
          borderRadius: 14, padding: "11px 15px",
          transition: "border-color .2s, background .2s",
          boxShadow: focused ? "0 0 0 3px rgba(12,138,166,.12)" : "none",
        }}>
          {loading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, animation: "ls-spin .7s linear infinite" }}>
              <path d="M21 12a9 9 0 11-2.636-6.364" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={focused ? "#0c8aa6" : "#8aabb5"} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, transition: "stroke .2s" }}>
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          <input
            ref={inputRef}
            value={q}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => { setFocused(true); if (q.length >= 2) setOpen(true); }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "#133b48", minWidth: 0 }}
          />
          {q && (
            <button type="button" onClick={clearQ} style={{ border: "none", background: "#e8f2f5", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "grid", placeItems: "center", color: "#6c8b95", flexShrink: 0, padding: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          {q && (
            <button type="submit" style={{ border: "none", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", borderRadius: 10, padding: "6px 14px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>جستجو</button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, left: 0, zIndex: 2000,
          background: "#fff", borderRadius: 20,
          boxShadow: "0 24px 64px -12px rgba(10,50,70,.22), 0 4px 16px -4px rgba(10,50,70,.1)",
          border: "1px solid #e4eef2", overflow: "hidden",
          animation: "ih-fade-up .16s ease",
        }}>
          {/* Progress bar */}
          {loading && (
            <div style={{ height: 3, background: "#f0f6f8", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#0c8aa6,#15b8d1,#0c8aa6)", backgroundSize: "200% 100%", animation: "ls-progress 1.2s ease infinite" }} />
            </div>
          )}

          {/* Empty state */}
          {!loading && results && total === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f1f8fa", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c5d8df" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#133b48", fontSize: 15 }}>نتیجه‌ای یافت نشد</p>
              <p style={{ margin: 0, color: "#9bb6bf", fontSize: 13 }}>«{q}» در دندانپزشکان، خدمات یا مقالات پیدا نشد</p>
            </div>
          )}

          {/* Skeleton while loading first time */}
          {loading && !results && (
            <div style={{ padding: "8px 0" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f1f4", flexShrink: 0, animation: "ls-pulse 1.4s ease-in-out infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 13, background: "#e8f1f4", borderRadius: 6, marginBottom: 7, width: `${50 + i * 10}%`, animation: "ls-pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ height: 11, background: "#e8f1f4", borderRadius: 6, width: `${30 + i * 5}%`, animation: "ls-pulse 1.4s ease-in-out infinite" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ maxHeight: 440, overflowY: "auto" }}>
            {/* Dentists */}
            {hasDentists && (
              <div>
                <div style={{ padding: "12px 18px 5px", fontSize: 11, fontWeight: 800, color: "#b0c8d0", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" /></svg>
                  دندانپزشکان
                </div>
                {results!.dentists.map(d => (
                  <Link
                    key={d.slug} href={`/${d.slug}`} onClick={goTo}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {d.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.featuredImage} alt={d.title} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid #e4eef2" }} />
                    ) : (
                      <span style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{d.title[0]}</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: "#133b48", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                      {d.address && <div style={{ fontSize: 12.5, color: "#8aabb5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.address}</div>}
                    </div>
                    {d.avgRating && d.avgRating > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#fffbee", border: "1px solid #fde68a", borderRadius: 8, padding: "4px 9px", flexShrink: 0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b45309" }}>{d.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0e2e8" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  </Link>
                ))}
              </div>
            )}

            {/* Services */}
            {hasServices && (
              <div style={{ borderTop: hasDentists ? "1px solid #f0f6f8" : undefined }}>
                <div style={{ padding: "12px 18px 5px", fontSize: 11, fontWeight: 800, color: "#b0c8d0", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  خدمات
                </div>
                {results!.services.map(s => (
                  <Link
                    key={s.slug} href={`/${s.slug}`} onClick={goTo}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0a8f86,#0a3f54)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#133b48", flex: 1 }}>{s.title}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0e2e8" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  </Link>
                ))}
              </div>
            )}

            {/* Articles */}
            {hasArticles && (
              <div style={{ borderTop: (hasDentists || hasServices) ? "1px solid #f0f6f8" : undefined }}>
                <div style={{ padding: "12px 18px 5px", fontSize: 11, fontWeight: 800, color: "#b0c8d0", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                  مقالات
                </div>
                {results!.articles.map(a => (
                  <Link
                    key={a.slug} href={`/${a.slug}`} onClick={goTo}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f3fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#0c5e7c)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#133b48", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                      {a.categoryName && <span style={{ fontSize: 11.5, color: "#7c4fcf" }}>{a.categoryName}</span>}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d0e2e8" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results && total > 0 && (
            <div style={{ borderTop: "1px solid #f0f6f8", padding: "10px 16px" }}>
              <Link
                href={`/search?q=${encodeURIComponent(q)}`} onClick={goTo}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", borderRadius: 13, textDecoration: "none", fontWeight: 700, fontSize: 14 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                مشاهده همه نتایج «{q}»
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
