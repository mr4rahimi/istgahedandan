"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

const NAV = [
  { href: "/dentist/dashboard", label: "داشبورد", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dentist/profile", label: "ویرایش پروفایل", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/dentist/stories", label: "استوری‌ها", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/dentist/articles", label: "مقالات", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function DentistSidebar({ user }: { user: { name: string; email: string; dentistId: number | null; dentistSlug?: string | null } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/dentist/logout", { method: "POST" });
    router.push("/dentist/login");
  };

  return (
    <aside style={{ width: collapsed ? 70 : 240, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e7f0f3", display: "flex", flexDirection: "column", transition: "width .25s", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #eef4f6", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={34} height={34} style={{ objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#133b48" }}>ایستگاه دندان</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(v => !v)} style={{ border: "none", background: "#f1f6f8", borderRadius: 8, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a6b7a" strokeWidth="2.2" strokeLinecap="round">
            {collapsed ? <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
          </svg>
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef4f6", background: "#f8fbfc" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#133b48", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "#8aabb5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          {!user.dentistId && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: "#c97800", background: "#fff9ed", border: "1px solid #fde68a", borderRadius: 8, padding: "5px 8px", lineHeight: 1.5 }}>
              پروفایل هنوز توسط ادمین تخصیص نیافته
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "12px 0" : "11px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 12, marginBottom: 4, textDecoration: "none",
              background: active ? "linear-gradient(135deg,#0c8aa6,#0a4f63)" : "transparent",
              color: active ? "#fff" : "#2a4f5b", fontWeight: active ? 700 : 500, fontSize: 14,
              transition: "background .15s",
            }}
              title={collapsed ? item.label : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d={item.icon} />
              </svg>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Links + Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid #eef4f6" }}>
        {!collapsed && user.dentistId && (
          <Link href={user.dentistSlug ? `/${user.dentistSlug}` : "#"} target={user.dentistSlug ? "_blank" : undefined} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: "#0c8aa6", fontSize: 13, fontWeight: 600, marginBottom: 6, background: "#eef7fa" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            مشاهده پروفایل عمومی
          </Link>
        )}
        <button onClick={handleLogout} disabled={loggingOut} style={{
          width: "100%", border: "none", background: collapsed ? "transparent" : "#fff1f1",
          color: "#c0392b", borderRadius: 10, padding: collapsed ? "12px 0" : "10px 12px",
          fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          {!collapsed && (loggingOut ? "در حال خروج…" : "خروج")}
        </button>
      </div>
    </aside>
  );
}
