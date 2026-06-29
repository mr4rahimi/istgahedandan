"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { key: "home", label: "ایستگاه دندان", href: "/" },
  { key: "services", label: "خدمات", href: "/services" },
  { key: "dentists", label: "لیست دندانپزشکی‌ها", href: "/dentists-list" },
  { key: "blog", label: "مقالات", href: "/mag" },
  { key: "about", label: "درباره ما", href: "/درباره-ما" },
  { key: "contact", label: "تماس با ما", href: "/تماس-با-ما" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const onMq = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onMq);
    onMq();
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const barStyle: React.CSSProperties = scrolled
    ? { background: "rgba(255,255,255,.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 8px 30px -12px rgba(17,75,107,.28)", borderBottom: "1px solid rgba(255,255,255,.4)", transition: "all .28s ease" }
    : { background: "#ffffff", boxShadow: "0 1px 0 #e9f1f4", transition: "all .28s ease" };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/جستجو?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1200, direction: "rtl", fontFamily: "inherit" }}>
      <div style={barStyle}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: scrolled ? 64 : 72, display: "flex", alignItems: "center", gap: 18, transition: "height .28s ease" }}>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0, order: 1 }}>
            <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={42} height={42} style={{ objectFit: "contain" }} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontWeight: 800, fontSize: 19, color: "#133b48", letterSpacing: -0.3 }}>ایستگاه دندان</span>
              <span style={{ fontWeight: 500, fontSize: 11, color: "#5e8b97", letterSpacing: 1 }}>ISTGAHE DANDAN</span>
            </span>
          </Link>

          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: 4, order: 2, margin: "0 auto" }}>
              {NAV_LINKS.map(link => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link key={link.key} href={link.href} style={{ position: "relative", textDecoration: "none", color: "#2a4f5b", fontWeight: 600, fontSize: 15, padding: "9px 14px", borderRadius: 10, whiteSpace: "nowrap" }}>
                    {link.label}
                    {isActive && <span style={{ position: "absolute", bottom: 2, right: 14, left: 14, height: 3, borderRadius: 3, background: "linear-gradient(90deg,#13b5ce,#0b78a8)" }} />}
                  </Link>
                );
              })}
            </nav>
          )}

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, order: 3, flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(v => !v)} aria-label="جستجو" style={{ width: 42, height: 42, border: "1px solid #dceaef", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", color: "#2a4f5b" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
              <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #c5e2eb", background: pathname.startsWith("/map") ? "#e8f6fa" : "#fff", color: "#0b6e8a", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "9px 16px", borderRadius: 12, transition: "background .18s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
                نقشه
              </Link>
              <Link href="#reserve" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "11px 20px", borderRadius: 12, boxShadow: "0 8px 20px -8px rgba(13,120,168,.7)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><line x1="3" y1="9.5" x2="21" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /></svg>
                رزرو نوبت
              </Link>
            </div>
          )}

          {isMobile && (
            <button onClick={() => setMenuOpen(v => !v)} aria-label="منو" style={{ order: 3, width: 44, height: 44, border: "1px solid #dceaef", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", color: "#133b48", marginRight: "auto" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          )}
        </div>

        {searchOpen && (
          <div style={{ borderTop: "1px solid #e9f1f4", background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)", animation: "ih-search-in .2s ease" }}>
            <form onSubmit={handleSearch} style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f1f8fa", border: "1px solid #dceaef", borderRadius: 14, padding: "12px 16px" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input ref={searchRef} value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="جستجوی دندانپزشک، خدمات یا منطقه…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "#133b48" }} />
              </div>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ border: "none", background: "#133b48", color: "#fff", fontFamily: "inherit", fontWeight: 600, fontSize: 14, padding: "0 18px", borderRadius: 14, cursor: "pointer" }}>بستن</button>
            </form>
          </div>
        )}
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, direction: "rtl", fontFamily: "inherit" }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,45,55,.5)", backdropFilter: "blur(2px)", animation: "ih-fade .2s ease" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "84%", maxWidth: 340, background: "#fff", boxShadow: "8px 0 40px rgba(0,0,0,.2)", display: "flex", flexDirection: "column", animation: "ih-drawer-in .26s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #eef4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={38} height={38} style={{ objectFit: "contain" }} />
                <span style={{ fontWeight: 800, fontSize: 17, color: "#133b48" }}>ایستگاه دندان</span>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="بستن" style={{ width: 40, height: 40, border: "none", background: "#f1f6f8", borderRadius: 11, display: "grid", placeItems: "center", cursor: "pointer", color: "#2a4f5b" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
              </button>
            </div>
            <nav style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {NAV_LINKS.map(link => (
                <Link key={link.key} href={link.href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "#1f4654", fontWeight: 600, fontSize: 16, padding: "15px 16px", borderRadius: 13, marginBottom: 4 }}>
                  {link.label}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a9c2cb" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                </Link>
              ))}
            </nav>
            <div style={{ padding: "16px 18px 22px", borderTop: "1px solid #eef4f6" }}>
              <Link href="#reserve" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16, padding: 15, borderRadius: 14, boxShadow: "0 10px 22px -8px rgba(13,120,168,.7)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><line x1="3" y1="9.5" x2="21" y2="9.5" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /></svg>
                رزرو نوبت
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
