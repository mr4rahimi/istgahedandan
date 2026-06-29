"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const onMq = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onMq);
    onMq();
    return () => mq.removeEventListener("change", onMq);
  }, []);

  if (!isMobile) return null;

  const active = pathname === "/" ? "home"
    : pathname.startsWith("/services") ? "services"
    : pathname.startsWith("/dentists-list") ? "dentists"
    : pathname.startsWith("/map") ? "map"
    : pathname.startsWith("/mag") ? "blog"
    : "";

  const mk = (key: string) => ({
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: 5,
    textDecoration: "none",
    flex: 1,
    padding: "8px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    color: key === active ? "#0c8aa6" : "#6a8895",
  });

  return (
    <>
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1100, direction: "rtl", fontFamily: "inherit", background: "rgba(255,255,255,.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderTop: "1px solid #e6eef1", boxShadow: "0 -8px 28px -14px rgba(17,75,107,.3)", padding: "8px 10px calc(8px + env(safe-area-inset-bottom))", display: "flex", alignItems: "flex-end", justifyContent: "space-around" }}>

        <Link href="/dentists-list" style={mk("dentists")}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3.5" cy="6" r="1.4" fill="currentColor" stroke="none" /><circle cx="3.5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="3.5" cy="18" r="1.4" fill="currentColor" stroke="none" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>لیست</span>
        </Link>

        <Link href="/map" style={mk("map")}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>نقشه</span>
        </Link>

        <Link href="#reserve" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", flex: 1, marginTop: -26 }}>
          <span style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#17bcd6,#0a6f9e)", display: "grid", placeItems: "center", color: "#fff", boxShadow: "0 12px 24px -8px rgba(13,120,168,.75)", border: "4px solid #fff" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><line x1="3" y1="9.5" x2="21" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /><line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" /></svg>
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0c8aa6" }}>رزرو نوبت</span>
        </Link>

        <button onClick={() => setSearchOpen(true)} style={mk("search") as React.CSSProperties}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>جستجو</span>
        </button>

        <Link href="/تماس-با-ما" style={mk("contact")}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>تماس</span>
        </Link>

      </nav>

      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1400, direction: "rtl", fontFamily: "inherit" }}>
          <div onClick={() => setSearchOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,45,55,.55)", backdropFilter: "blur(3px)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#fff", padding: "18px 16px calc(18px + env(safe-area-inset-bottom))", boxShadow: "0 8px 30px rgba(0,0,0,.2)", borderRadius: "0 0 22px 22px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f1f8fa", border: "1px solid #dceaef", borderRadius: 14, padding: "13px 15px" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input autoFocus placeholder="جستجوی دندانپزشک یا خدمات…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "#133b48" }} />
              </div>
              <button onClick={() => setSearchOpen(false)} style={{ border: "none", background: "#133b48", color: "#fff", fontFamily: "inherit", fontWeight: 600, fontSize: 14, padding: "0 16px", borderRadius: 14, cursor: "pointer", height: 48 }}>بستن</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
