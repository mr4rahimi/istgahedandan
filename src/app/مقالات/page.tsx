import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { toJalali, estimateReadTime, gradientFromId } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مقالات دندانپزشکی | ایستگاه دندان",
  description: "جدیدترین مقالات آموزشی درباره مراقبت از دندان، درمان‌ها و زیبایی لبخند.",
};

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; cat?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const catFilter = sp.cat ? parseInt(sp.cat) : undefined;

  const [categories, total, posts, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.blogPost.count({ where: catFilter ? { categoryId: catFilter } : {} }),
    prisma.blogPost.findMany({
      where: catFilter ? { categoryId: catFilter } : {},
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } },
    }),
    page === 1 && !catFilter
      ? prisma.blogPost.findFirst({ orderBy: { publishedAt: "desc" }, include: { category: { select: { name: true } } } })
      : Promise.resolve(null),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const displayPosts = featured ? posts.filter(p => p.id !== featured.id) : posts;

  const articleBgs = [
    "linear-gradient(135deg,#0c5e7c,#0a3f54)",
    "linear-gradient(135deg,#0a6f9e,#5b2171)",
    "linear-gradient(135deg,#8b5cf6,#16b8d1)",
    "linear-gradient(135deg,#0a8f86,#0a3f54)",
    "linear-gradient(135deg,#f43f5e,#a21caf)",
    "linear-gradient(135deg,#0ea5e9,#22c55e)",
  ];

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 20px 44px", position: "relative" }}>
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 14 }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link>
            {" › "}مقالات
          </nav>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800 }}>بلاگ سلامت دهان و دندان</h1>
          <p style={{ margin: 0, maxWidth: 620, fontSize: 16, lineHeight: 2, color: "#c4dde4" }}>جدیدترین مقالات آموزشی درباره مراقبت از دندان، درمان‌ها و زیبایی لبخند.</p>
        </div>
      </section>

      {/* Category Chips */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 16px 6px" }}>
        <div className="ih-hide-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          <Link href="/مقالات" style={{ border: catFilter === undefined ? "none" : "1px solid #d2e8ee", background: catFilter === undefined ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: catFilter === undefined ? "#fff" : "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>همه</Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/مقالات?cat=${cat.id}`} style={{ border: catFilter === cat.id ? "none" : "1px solid #d2e8ee", background: catFilter === cat.id ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: catFilter === cat.id ? "#fff" : "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>{cat.name}</Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px" }}>
          <Link href={`/${featured.slug}`} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 24, overflow: "hidden", boxShadow: "0 18px 44px -30px rgba(13,75,107,.5)" }}>
            <div style={{ minHeight: 280, position: "relative", background: featured.featuredImage ? undefined : "linear-gradient(135deg,#0c5e7c,#0a3f54)" }}>
              {featured.featuredImage && <Image src={featured.featuredImage} alt={featured.title} fill style={{ objectFit: "cover" }} />}
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 15px,rgba(255,255,255,.03) 15px 30px)" }} />
              <span style={{ position: "absolute", top: 14, right: 14, background: "#f5a623", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 20 }}>مقاله ویژه</span>
            </div>
            <div style={{ padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {featured.category && <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{featured.category.name}</span>}
              <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,2.8vw,30px)", fontWeight: 800, color: "#133b48", lineHeight: 1.5 }}>{featured.title}</h2>
              {featured.excerpt && <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 2, color: "#5e7c85" }}>{featured.excerpt.slice(0, 160)}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#8aa6af", fontSize: 13 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" /></svg>
                  {estimateReadTime(featured.content || "")} دقیقه مطالعه
                </span>
                {featured.publishedAt && <span>{toJalali(featured.publishedAt)}</span>}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
          {displayPosts.map((post, i) => (
            <Link key={post.slug} href={`/${post.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 34px -28px rgba(13,75,107,.5)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 170, position: "relative", background: post.featuredImage ? undefined : articleBgs[i % articleBgs.length] }}>
                {post.featuredImage && <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: "cover" }} />}
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 13px,rgba(255,255,255,.03) 13px 26px)" }} />
                {post.category && (
                  <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(13,75,107,.85)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20 }}>{post.category.name}</span>
                )}
              </div>
              <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16.5, fontWeight: 700, color: "#143945", lineHeight: 1.65 }}>{post.title}</h3>
                {post.excerpt && <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.85, color: "#6c8b95", flex: 1 }}>{post.excerpt.slice(0, 100)}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#9bb6bf", fontSize: 12.5, paddingTop: 14, borderTop: "1px solid #eef4f6" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" /></svg>
                    {estimateReadTime(post.content || "")} دقیقه
                  </span>
                  {post.publishedAt && <span>{toJalali(post.publishedAt)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 16px 46px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {page > 1 && (
              <Link href={`/مقالات?page=${page - 1}${catFilter ? `&cat=${catFilter}` : ""}`} style={{ width: 42, height: 42, border: "1px solid #d7e6ea", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", color: "#2a4f5b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const p = idx + 1;
              return (
                <Link key={p} href={`/مقالات?page=${p}${catFilter ? `&cat=${catFilter}` : ""}`} style={{ width: 42, height: 42, border: p === page ? "none" : "1px solid #d7e6ea", background: p === page ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: p === page ? "#fff" : "#2a4f5b", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 700 }}>
                  {p}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={`/مقالات?page=${page + 1}${catFilter ? `&cat=${catFilter}` : ""}`} style={{ width: 42, height: 42, border: "1px solid #d7e6ea", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", color: "#2a4f5b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18" /></svg>
              </Link>
            )}
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
