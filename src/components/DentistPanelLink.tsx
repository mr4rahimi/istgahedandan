"use client";

import Link from "next/link";
import { useDentistSession } from "@/lib/use-dentist-session";

/**
 * Link to the dentist area, shown in the site header, mobile drawer and footer.
 *
 * The href resolves on the client from the session probe. Before the answer
 * arrives it points at the login page, which is right for the large majority of
 * visitors — and harmless for the rest, because /dentist/login sends an already
 * signed-in dentist on to the dashboard.
 *
 * An earlier version pointed at a /dentist/panel route handler that decided
 * server-side. That broke behind nginx: a route handler builds its redirect
 * Location from the origin that reached the Node process, so visitors were sent
 * to https://localhost:3004/… The page at /dentist/panel still works as a direct
 * URL — page-level redirect() emits a host-relative Location — but the header and
 * footer no longer depend on that distinction.
 */
export default function DentistPanelLink({
  variant,
  onNavigate,
}: {
  variant: "header" | "drawer" | "footer";
  onNavigate?: () => void;
}) {
  const session = useDentistSession();
  const loggedIn = session?.loggedIn ?? false;
  const label = loggedIn ? "پنل دندانپزشک من" : "ورود دندانپزشکان";
  const href = loggedIn ? "/dentist/dashboard" : "/dentist/login";

  const icon = (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M6 3v6a6 6 0 0 0 12 0V3" />
      <path d="M4 3h4M16 3h4" />
      <path d="M12 15v2a4 4 0 0 0 8 0v-1" />
      <circle cx="20" cy="12" r="2" />
    </svg>
  );

  if (variant === "header") {
    return (
      <Link
        href={href}
        title={label}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #c5e2eb", background: "#fff", color: "#0b6e8a", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "9px 14px", borderRadius: 12, whiteSpace: "nowrap" }}
      >
        {icon(16)}
        {loggedIn ? "پنل من" : "دندانپزشکان"}
      </Link>
    );
  }

  if (variant === "drawer") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1.5px solid #c5e2eb", background: "#f5fbfd", color: "#0b6e8a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 14, marginBottom: 10 }}
      >
        {icon(17)}
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(21,184,209,.35)", color: "#7fdcec", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "11px 16px", borderRadius: 12 }}
    >
      {icon(16)}
      {label}
    </Link>
  );
}
