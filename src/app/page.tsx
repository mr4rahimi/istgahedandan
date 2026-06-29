import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import HomeSlider from "@/components/HomeSlider";
import HomeStories from "@/components/HomeStories";
import HomeSearch from "@/components/HomeSearch";
import { toJalali, estimateReadTime, getInitial, gradientFromId } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ایستگاه دندان | معرفی بهترین دندانپزشکی‌های ایران",
  description: "ایستگاه دندان - معرفی بهترین دندانپزشکی‌ها در سراسر ایران. جستجو بر اساس منطقه، تخصص و امتیاز کاربران.",
};

async function getHomeData() {
  const [dentists, locations, articles] = await Promise.all([
    prisma.dentist.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { reviews: { select: { approved: true } } },
    }),
    prisma.location.findMany({ take: 8, select: { slug: true, title: true } }),
    prisma.blogPost.findMany({
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
  ]);
  return { dentists, locations, articles };
}

export default async function HomePage() {
  const { dentists, locations, articles } = await getHomeData();

  const slides = [
    { badge: "★ مرجع رسمی دندانپزشکان", title: "بهترین دندانپزشک نزدیک خود را پیدا کنید", text: "جستجو بر اساس منطقه، تخصص و امتیاز کاربران.", cta: "رزرو نوبت آنلاین", overlay: "linear-gradient(100deg,rgba(8,58,77,.92),rgba(10,80,110,.45))", bg: "linear-gradient(120deg,#0c5e7c,#0a3f54)" },
    { badge: "✦ خدمات تخصصی", title: "ایمپلنت، لمینت و طراحی لبخند حرفه‌ای", text: "خدمات تخصصی توسط بهترین متخصصان ایستگاه دندان ارائه می‌شود.", cta: "مشاهده خدمات", overlay: "linear-gradient(100deg,rgba(91,33,113,.9),rgba(12,90,120,.4))", bg: "linear-gradient(120deg,#0a6f9e,#5b2171)" },
    { badge: "◆ نوبت‌دهی هوشمند", title: "رزرو نوبت آنلاین در کمتر از یک دقیقه", text: "بدون تماس تلفنی و در هر ساعت از شبانه‌روز.", cta: "شروع کنید", overlay: "linear-gradient(100deg,rgba(8,77,71,.9),rgba(12,110,120,.4))", bg: "linear-gradient(120deg,#0a8f86,#0a3f54)" },
  ];

  const stories = [
    { name: "تخفیف‌ها", ring: "linear-gradient(135deg,#f5a623,#ec4899)" },
    { name: "ایمپلنت", ring: "linear-gradient(135deg,#16b8d1,#0a6f9e)" },
    { name: "لمینت", ring: "linear-gradient(135deg,#8b5cf6,#16b8d1)" },
    { name: "ارتودنسی", ring: "linear-gradient(135deg,#0ea5e9,#22c55e)" },
    ...locations.slice(0, 4).map((loc, i) => ({ name: loc.title, ring: gradientFromId(i + 4), slug: loc.slug })),
  ];

  const articleBgs = [
    "linear-gradient(135deg,#0c5e7c,#0a3f54)",
    "linear-gradient(135deg,#0a8f86,#0a3f54)",
    "linear-gradient(135deg,#0ea5e9,#22c55e)",
    "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  ];

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Stories */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 16px 6px" }}>
        <HomeStories stories={stories} />
      </section>

      {/* Hero Slider */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 16px 8px" }}>
        <HomeSlider slides={slides} />
      </section>

      {/* Quick Search */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px" }}>
        <HomeSearch locations={locations} />
      </section>

      {/* Latest Dentists */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
          <div>
            <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 14 }}>جدیدترین‌ها</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "#133b48" }}>آخرین دندانپزشکی‌ها</h2>
          </div>
          <Link href="/dentists-list" style={{ color: "#0c8aa6", textDecoration: "none", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>مشاهده همه ←</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {dentists.map((d, i) => {
            const initial = getInitial(d.title);
            const reviewCount = d.reviews.filter(r => r.approved).length;
            return (
              <Link key={d.slug} href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 34px -26px rgba(13,75,107,.5)", display: "block" }}>
                <div style={{ height: 130, position: "relative", background: "repeating-linear-gradient(135deg,#e3eff3 0 13px,#edf5f8 13px 26px)" }}>
                  {d.featuredImage && (
                    <Image src={d.featuredImage} alt={d.title} fill style={{ objectFit: "cover" }} />
                  )}
                  <span style={{ position: "absolute", bottom: -28, right: 18, width: 64, height: 64, borderRadius: 18, border: "3px solid #fff", background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 22, boxShadow: "0 8px 18px -8px rgba(13,120,168,.6)" }}>{initial}</span>
                </div>
                <div style={{ padding: "36px 18px 18px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
                  <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6c8b95" }}>{d.shortDesc?.slice(0, 60) || "دندانپزشکی"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    {reviewCount > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff6e6", color: "#d98a00", fontSize: 12, fontWeight: 700, padding: "4px 9px", borderRadius: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5a623" stroke="none"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                        {reviewCount} نظر
                      </span>
                    )}
                    {d.address && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#6c8b95", fontSize: 13 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {d.address.slice(0, 20)}
                      </span>
                    )}
                  </div>
                  <span style={{ display: "block", textAlign: "center", background: "#eef7fa", color: "#0c8aa6", fontWeight: 700, fontSize: 14, padding: 11, borderRadius: 12 }}>مشاهده پروفایل</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ maxWidth: 1280, margin: "14px auto", padding: "0 16px" }}>
        <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", borderRadius: 28, overflow: "hidden", position: "relative", padding: "clamp(30px,5vw,56px)", color: "#fff" }}>
          <div style={{ position: "absolute", top: -80, left: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(21,184,209,.3), transparent 70%)" }} />
          <div style={{ position: "relative", display: "flex", gap: 44, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 320px" }}>
              <span style={{ color: "#5fdcf0", fontWeight: 700, fontSize: 14 }}>درباره ما</span>
              <h2 style={{ margin: "8px 0 16px", fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 800, lineHeight: 1.4 }}>ایستگاه دندان، مسیر مطمئن رسیدن به لبخند سالم</h2>
              <p style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 2.1, color: "#c4dde4" }}>ایستگاه دندان با هدف ساده‌سازی دسترسی بیماران به بهترین دندانپزشکان کشور ساخته شده است. در این پلتفرم می‌توانید بر اساس منطقه، تخصص و امتیاز کاربران، بهترین دندانپزشک نزدیک خود را پیدا کرده و آنلاین نوبت رزرو کنید.</p>
              <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 26 }}>
                <div><div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>+۲۶۹</div><div style={{ fontSize: 13, color: "#9fc2cc" }}>دندانپزشک ثبت‌شده</div></div>
                <div><div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>+۴۹</div><div style={{ fontSize: 13, color: "#9fc2cc" }}>منطقه پوشش</div></div>
                <div><div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>۲۴ساعته</div><div style={{ fontSize: 13, color: "#9fc2cc" }}>رزرو آنلاین نوبت</div></div>
              </div>
              <Link href="/درباره-ما" style={{ display: "inline-block", marginTop: 28, background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 13 }}>بیشتر بدانید</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "38px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
            <div>
              <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 14 }}>بلاگ سلامت دهان</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "#133b48" }}>آخرین مقالات</h2>
            </div>
            <Link href="/mag" style={{ color: "#0c8aa6", textDecoration: "none", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>همه مقالات ←</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/${a.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 34px -26px rgba(13,75,107,.5)", display: "block" }}>
                <div style={{ height: 160, position: "relative", background: a.featuredImage ? undefined : articleBgs[i % 4] }}>
                  {a.featuredImage && <Image src={a.featuredImage} alt={a.title} fill style={{ objectFit: "cover" }} />}
                  {a.category && (
                    <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(13,75,107,.85)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20 }}>{a.category.name}</span>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#143945", lineHeight: 1.7 }}>{a.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#8aa6af", fontSize: 12.5 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" /></svg>
                      {estimateReadTime(a.content || "")} دقیقه
                    </span>
                    {a.publishedAt && <span>{toJalali(a.publishedAt)}</span>}
                  </div>
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
