"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { label: "داشبورد", href: "/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "دندانپزشکان", href: "/admin/dentists", icon: "M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" },
  { label: "مقالات", href: "/admin/blog", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
  { label: "نظرات", href: "/admin/reviews", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { label: "مناطق", href: "/admin/locations", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "لیست دندانپزشکان", href: "/admin/dentists-list", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { label: "تنظیمات", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside style={{ width: 240, flexShrink: 0, background: "linear-gradient(180deg,#0e4151,#0a2c39)", display: "flex", flexDirection: "column", minHeight: "100vh", boxShadow: "4px 0 20px rgba(0,0,0,.2)" }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={38} height={38} style={{ objectFit: "contain", background: "#fff", borderRadius: 10, padding: 3 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>ایستگاه دندان</div>
            <div style={{ fontSize: 11, color: "#6fa0ac" }}>پنل مدیریت</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map(item => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "11px 14px", borderRadius: 12, background: isActive ? "rgba(255,255,255,.12)" : "transparent", color: isActive ? "#fff" : "#8ab6c0", fontWeight: isActive ? 700 : 500, fontSize: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "#6fa0ac", marginBottom: 14 }}>{user.email}</div>
        <button onClick={handleLogout} disabled={loggingOut} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(255,255,255,.08)", border: "none", borderRadius: 10, padding: "10px", color: "#f87171", fontFamily: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" /></svg>
          {loggingOut ? "در حال خروج…" : "خروج"}
        </button>
      </div>
    </aside>
  );
}
