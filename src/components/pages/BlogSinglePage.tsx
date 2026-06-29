import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { toJalali, estimateReadTime, getInitial, gradientFromId } from "@/lib/utils";
import { articleSchema, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

const articleBgs = [
  "linear-gradient(135deg,#0c5e7c,#0a3f54)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
];

export default async function BlogSinglePage({ slug }: { slug: string }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: { slug: { not: slug }, categoryId: post.categoryId ?? undefined },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  const readTime = estimateReadTime(post.content || "");
  const authorName = post.authorName || "تحریریه ایستگاه دندان";
  const initial = getInitial(authorName);

  const schemas = [
    articleSchema({
      slug: post.slug,
      title: post.title,
      shortDesc: post.metaDescription,
      content: post.content,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      authorName,
      categoryName: post.category?.name,
    }),
    breadcrumbSchema([
      { name: "خانه", url: SITE_URL },
      { name: "مقالات", url: `${SITE_URL}/mag` },
      ...(post.category ? [{ name: post.category.name, url: `${SITE_URL}/mag` }] : []),
      { name: post.title, url: `${SITE_URL}/${post.slug}` },
    ]),
  ];

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <JsonLd data={schemas} />
      <Header />

      {/* Hero */}
      <section style={{ position: "relative", height: 420, background: post.featuredImage ? undefined : "linear-gradient(135deg,#0c5e7c,#0a3f54)", overflow: "hidden" }}>
        {post.featuredImage && <Image src={post.featuredImage} alt={post.title} fill style={{ objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 16px,rgba(255,255,255,.03) 16px 32px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,47,62,.15),rgba(8,47,62,.9))" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, left: 0 }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 40px" }}>
            <nav style={{ fontSize: 13, color: "#b9d4dc", marginBottom: 16 }}>
              <Link href="/" style={{ color: "#b9d4dc", textDecoration: "none" }}>خانه</Link>
              {" › "}
              <Link href="/mag" style={{ color: "#b9d4dc", textDecoration: "none" }}>مقالات</Link>
              {post.category && <>{" › "}{post.category.name}</>}
            </nav>
            {post.category && (
              <span style={{ display: "inline-block", background: "#f5a623", color: "#fff", fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 20, marginBottom: 16 }}>{post.category.name}</span>
            )}
            <h1 style={{ margin: "0 0 18px", color: "#fff", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, lineHeight: 1.45 }}>{post.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#cfe4ea", fontSize: 14, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#16b8d1,#0a6f9e)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, border: "2px solid rgba(255,255,255,.4)", flexShrink: 0 }}>{initial}</span>
                {authorName}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" /></svg>
                {readTime} دقیقه مطالعه
              </span>
              {post.publishedAt && <span>{toJalali(post.publishedAt)}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "36px 16px" }}>
        <article style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,4vw,52px)", boxShadow: "0 16px 44px -34px rgba(13,75,107,.5)" }}>
          {post.excerpt && (
            <p style={{ margin: "0 0 22px", fontSize: 18, fontWeight: 600, color: "#143945", lineHeight: 2.1 }}>{post.excerpt}</p>
          )}
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ fontSize: 16, lineHeight: 2.25, color: "#41616b" }} />
          ) : (
            <p style={{ margin: 0, color: "#6c8b95" }}>محتوای این مقاله در دسترس نیست.</p>
          )}
        </article>

        {/* Author Box */}
        <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", borderRadius: 20, padding: 26, marginTop: 22, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", color: "#fff" }}>
          <span style={{ width: 70, height: 70, borderRadius: 20, background: "linear-gradient(135deg,#16b8d1,#0a6f9e)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 28, flexShrink: 0 }}>{initial}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{authorName}</div>
            <div style={{ fontSize: 13, color: "#9fc2cc", margin: "4px 0 8px" }}>مرجع تخصصی دندانپزشکی</div>
            <p style={{ margin: 0, fontSize: 14, color: "#c4dde4", lineHeight: 1.9 }}>مقالات آموزشی و تخصصی در حوزه دندانپزشکی برای بیماران و علاقمندان.</p>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px 46px" }}>
          <h2 style={{ margin: "0 0 22px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>مقالات مرتبط</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {related.map((r, i) => (
              <Link key={r.slug} href={`/${r.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 30px -26px rgba(13,75,107,.5)", display: "block" }}>
                <div style={{ height: 130, position: "relative", background: r.featuredImage ? undefined : articleBgs[i % articleBgs.length] }}>
                  {r.featuredImage && <Image src={r.featuredImage} alt={r.title} fill style={{ objectFit: "cover" }} />}
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 12px,rgba(255,255,255,.03) 12px 24px)" }} />
                  {r.category && (
                    <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(13,75,107,.85)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 16 }}>{r.category.name}</span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#143945", lineHeight: 1.6 }}>{r.title}</h3>
                  {r.publishedAt && <span style={{ color: "#9bb6bf", fontSize: 12.5 }}>{toJalali(r.publishedAt)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
