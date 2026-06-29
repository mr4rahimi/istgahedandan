import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { getInitial, gradientFromId, toJalali, estimateReadTime } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جستجو | ایستگاه دندان",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";

  if (!q) {
    return (
      <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", minHeight: "100vh", paddingBottom: 80 }}>
        <Header />
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#133b48", margin: "0 0 16px" }}>جستجو</h1>
          <p style={{ color: "#6c8b95", fontSize: 16 }}>عبارتی را در نوار جستجوی بالا وارد کنید.</p>
        </section>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const [dentists, services, articles] = await Promise.all([
    prisma.dentist.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
    }),
    prisma.service.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
    }),
    prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const total = dentists.length + services.length + articles.length;

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 34px", position: "relative" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(22px,3.4vw,32px)", fontWeight: 800 }}>نتایج جستجو برای "{q}"</h1>
          <p style={{ margin: 0, color: "#9fc2cc", fontSize: 15 }}>{total} نتیجه پیدا شد</p>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>

        {/* Dentists */}
        {dentists.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800, color: "#133b48", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2" strokeLinecap="round"><path d="M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" /></svg>
              دندانپزشکان ({dentists.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
              {dentists.map((d, i) => (
                <Link key={d.slug} href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: 16, boxShadow: "0 10px 28px -24px rgba(13,75,107,.5)", display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>{getInitial(d.title)}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#143945", fontSize: 15.5, marginBottom: 4 }}>{d.title}</div>
                    {d.address && <div style={{ fontSize: 13, color: "#6c8b95" }}>{d.address.slice(0, 40)}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {services.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800, color: "#133b48", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              خدمات ({services.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {services.map((s, i) => (
                <Link key={s.slug} href={`/${s.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "16px 18px", boxShadow: "0 10px 28px -24px rgba(13,75,107,.5)", display: "block" }}>
                  <div style={{ fontWeight: 700, color: "#143945", fontSize: 15.5, marginBottom: 6 }}>{s.title}</div>
                  {s.shortDesc && <div style={{ fontSize: 13.5, color: "#6c8b95", lineHeight: 1.8 }}>{s.shortDesc.slice(0, 80)}</div>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 22, fontWeight: 800, color: "#133b48", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              مقالات ({articles.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {articles.map(a => (
                <Link key={a.slug} href={`/${a.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "16px 18px", boxShadow: "0 10px 28px -24px rgba(13,75,107,.5)", display: "block" }}>
                  {a.category && <span style={{ display: "inline-block", background: "#eef7fa", color: "#0c8aa6", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 12, marginBottom: 8 }}>{a.category.name}</span>}
                  <div style={{ fontWeight: 700, color: "#143945", fontSize: 15.5, marginBottom: 6, lineHeight: 1.6 }}>{a.title}</div>
                  <div style={{ display: "flex", gap: 12, color: "#9bb6bf", fontSize: 12.5 }}>
                    <span>{estimateReadTime(a.content || "")} دقیقه</span>
                    {a.publishedAt && <span>{toJalali(a.publishedAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🔍</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#133b48", margin: "0 0 12px" }}>نتیجه‌ای پیدا نشد</h2>
            <p style={{ color: "#6c8b95", fontSize: 16, margin: "0 0 28px" }}>عبارت دیگری را امتحان کنید.</p>
            <Link href="/دندانپزشکان" style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 13 }}>لیست دندانپزشکان</Link>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
