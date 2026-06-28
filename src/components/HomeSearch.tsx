"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Location {
  slug: string;
  title: string;
}

export default function HomeSearch({ locations }: { locations: Location[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/جستجو?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e4eef2", borderRadius: 22, padding: "26px 28px", boxShadow: "0 16px 40px -24px rgba(13,75,107,.3)" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#133b48" }}>جستجوی دندانپزشک</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "3 1 200px", display: "flex", alignItems: "center", gap: 10, background: "#f2f8fa", border: "1px solid #dceaef", borderRadius: 14, padding: "13px 15px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="نام دندانپزشک یا کلینیک…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: "#133b48" }} />
        </div>
        <select defaultValue="" style={{ flex: "2 1 140px", border: "1px solid #dceaef", borderRadius: 14, padding: "13px 14px", fontSize: 14, background: "#f2f8fa", color: "#133b48", fontFamily: "inherit", outline: "none", cursor: "pointer" }} onChange={e => { if (e.target.value) router.push(`/${e.target.value}`); }}>
          <option value="" disabled>انتخاب منطقه</option>
          {locations.map(loc => (
            <option key={loc.slug} value={loc.slug}>{loc.title}</option>
          ))}
        </select>
        <button type="submit" style={{ flex: "0 0 auto", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 14, padding: "0 26px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", height: 52 }}>جستجو</button>
      </form>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: "#6c8b95" }}>جستجوهای پرتکرار:</span>
        {["ایمپلنت", "لمینت", "ارتودنسی", "دندانپزشک اطفال"].map(tag => (
          <button key={tag} onClick={() => { setQ(tag); router.push(`/جستجو?q=${encodeURIComponent(tag)}`); }} style={{ border: "1px solid #d2e8ee", background: "#f5fbfc", borderRadius: 30, padding: "5px 13px", fontSize: 13, color: "#0c8aa6", fontFamily: "inherit", cursor: "pointer", fontWeight: 600 }}>{tag}</button>
        ))}
      </div>
    </div>
  );
}
