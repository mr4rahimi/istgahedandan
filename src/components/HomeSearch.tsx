"use client";

import { useRouter } from "next/navigation";
import LiveSearch from "@/components/LiveSearch";

interface Location {
  slug: string;
  title: string;
}

export default function HomeSearch({ locations }: { locations: Location[] }) {
  const router = useRouter();

  return (
    <div style={{ background: "#fff", border: "1px solid #e4eef2", borderRadius: 22, padding: "26px 28px", boxShadow: "0 16px 40px -24px rgba(13,75,107,.3)" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#133b48" }}>جستجوی دندانپزشک</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <LiveSearch placeholder="نام دندانپزشک، کلینیک یا خدمت…" />
        <select
          defaultValue=""
          style={{ flex: "0 0 auto", border: "1px solid #dceaef", borderRadius: 14, padding: "11px 14px", fontSize: 14, background: "#f2f8fa", color: "#133b48", fontFamily: "inherit", outline: "none", cursor: "pointer", minWidth: 140 }}
          onChange={e => { if (e.target.value) router.push(`/${e.target.value}`); }}
        >
          <option value="" disabled>انتخاب منطقه</option>
          {locations.map(loc => (
            <option key={loc.slug} value={loc.slug}>{loc.title}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6c8b95" }}>جستجوهای پرتکرار:</span>
        {["ایمپلنت", "لمینت", "ارتودنسی", "دندانپزشک اطفال"].map(tag => (
          <button
            key={tag}
            onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
            style={{ border: "1px solid #d2e8ee", background: "#f5fbfc", borderRadius: 30, padding: "5px 13px", fontSize: 13, color: "#0c8aa6", fontFamily: "inherit", cursor: "pointer", fontWeight: 600 }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
