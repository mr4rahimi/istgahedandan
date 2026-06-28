"use client";

import Link from "next/link";

interface Story {
  name: string;
  ring: string;
  slug?: string;
}

export default function HomeStories({ stories }: { stories: Story[] }) {
  return (
    <div className="ih-hide-scroll" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
      {stories.map((s, i) => (
        <Link key={i} href={s.slug ? `/${s.slug}` : "#"} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <span style={{ width: 58, height: 58, borderRadius: 18, background: s.ring, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 20, boxShadow: `0 6px 16px -6px rgba(0,0,0,.35)` }}>
            {s.name[0]}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2a4f5b", textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>{s.name}</span>
        </Link>
      ))}
    </div>
  );
}
