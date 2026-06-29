import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

async function getSettings() {
  const KEYS = [
    "dl_short_desc", "dl_long_desc", "dl_popular_count",
    "dl_main_city_ids", "dl_region_ids", "dl_featured_ids",
    "dl_banner_image", "dl_banner_title", "dl_banner_link",
    "dl_faqs", "dl_meta_title", "dl_meta_desc",
  ];
  const rows = await prisma.setting.findMany({ where: { key: { in: KEYS } } });
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;
  return s;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.dl_meta_title || "لیست دندانپزشکان و کلینیک‌های دندانپزشکی در ایران | ایستگاه دندان",
    description: s.dl_meta_desc || s.dl_short_desc || undefined,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fff6e6", color: "#d98a00", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 7 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
      {rating.toFixed(1)}
    </span>
  );
}

interface DentistCard {
  id: number; slug: string; title: string; shortDesc: string | null;
  featuredImage: string | null; address: string | null;
  avgRating: number | null; reviewCount: number;
}

function DentistCardEl({ d }: { d: DentistCard }) {
  const initial = d.title[0] || "د";
  return (
    <Link href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 18, boxShadow: "0 14px 34px -28px rgba(13,75,107,.5)", display: "block", color: "inherit" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {d.featuredImage ? (
          <Image src={d.featuredImage} alt={d.title} width={64} height={64} style={{ borderRadius: 18, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <span style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: "linear-gradient(135deg,#0c8aa6,#0e4d63)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{initial}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16.5, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {d.avgRating && d.avgRating > 0 ? <StarRating rating={d.avgRating} /> : null}
            <span style={{ color: "#6c8b95", fontSize: 12.5 }}>{d.reviewCount} نظر</span>
          </div>
        </div>
      </div>
      {d.shortDesc && <p style={{ margin: "12px 0", fontSize: 13.5, lineHeight: 1.9, color: "#5e7c85" }}>{d.shortDesc.slice(0, 120)}{d.shortDesc.length > 120 ? "…" : ""}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #eef4f6" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#6c8b95", fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          {d.address || "تهران"}
        </span>
        <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13.5 }}>پروفایل ←</span>
      </div>
    </Link>
  );
}

function HorizontalSlider({ dentists, label }: { dentists: DentistCard[]; label: string }) {
  if (!dentists.length) return null;
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 8px" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>{label}</h2>
      <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
        {dentists.map(d => (
          <div key={d.id} style={{ minWidth: "clamp(260px,28vw,320px)", flexShrink: 0 }}>
            <DentistCardEl d={d} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function DentistsListPage() {
  const s = await getSettings();

  const popularCount = parseInt(s.dl_popular_count || "6");
  const mainCityIds: number[] = s.dl_main_city_ids ? JSON.parse(s.dl_main_city_ids) : [];
  const regionIds: number[] = s.dl_region_ids ? JSON.parse(s.dl_region_ids) : [];
  const featuredIds: number[] = s.dl_featured_ids ? JSON.parse(s.dl_featured_ids) : [];
  const faqs: { q: string; a: string }[] = s.dl_faqs ? JSON.parse(s.dl_faqs) : [];

  // fetch all needed dentist data
  const allDentists = await prisma.dentist.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, shortDesc: true, featuredImage: true, address: true },
    orderBy: { order: "asc" },
  });

  // reviews for ratings
  const reviews = await prisma.review.findMany({
    where: { approved: true, rating: { not: null }, parentId: null },
    select: { dentistId: true, rating: true },
  });
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.dentistId || !r.rating) continue;
    const cur = ratingMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating; cur.count++;
    ratingMap.set(r.dentistId, cur);
  }
  const countMap = new Map<number, number>();
  for (const r of reviews) {
    if (!r.dentistId) continue;
    countMap.set(r.dentistId, (countMap.get(r.dentistId) ?? 0) + 1);
  }

  const enrich = (d: { id: number; slug: string; title: string; shortDesc: string | null; featuredImage: string | null; address: string | null }): DentistCard => {
    const rData = ratingMap.get(d.id);
    return { ...d, avgRating: rData ? rData.sum / rData.count : null, reviewCount: countMap.get(d.id) ?? 0 };
  };

  const popularDentists = [...allDentists]
    .map(enrich)
    .filter(d => d.avgRating !== null && d.reviewCount > 0)
    .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
    .slice(0, popularCount);

  const featuredDentists = featuredIds.length
    ? featuredIds.map(id => allDentists.find(d => d.id === id)).filter(Boolean).map(d => enrich(d!))
    : [];

  // main cities locations
  const mainCities = mainCityIds.length
    ? await prisma.location.findMany({ where: { id: { in: mainCityIds } }, orderBy: { order: "asc" }, select: { id: true, slug: true, shortTitle: true, title: true } })
    : [];

  // regional dentists: for each selected region, get dentists in that region
  const regionLocations = regionIds.length
    ? await prisma.location.findMany({ where: { id: { in: regionIds } }, orderBy: { order: "asc" }, select: { id: true, slug: true, shortTitle: true, title: true } })
    : [];

  // DentistLocation join table
  const dentistLocs = regionIds.length
    ? await prisma.dentistLocation.findMany({ where: { locationId: { in: regionIds } }, select: { dentistId: true, locationId: true } })
    : [];

  const regionDentistsMap = new Map<number, DentistCard[]>();
  for (const loc of regionLocations) {
    const ids = dentistLocs.filter(dl => dl.locationId === loc.id).map(dl => dl.dentistId);
    const dList = ids.map(id => allDentists.find(d => d.id === id)).filter(Boolean).map(d => enrich(d!)).slice(0, 8);
    regionDentistsMap.set(loc.id, dList);
  }

  return (
    <div style={{ direction: "rtl", fontFamily: "Vazirmatn, system-ui, sans-serif", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle,rgba(21,184,209,.28),transparent 70%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "50px 20px 42px", position: "relative" }}>
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 14 }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link> › دندانپزشکان
          </nav>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(24px,4vw,40px)", fontWeight: 800 }}>
            لیست دندانپزشکان و کلینیک‌های دندانپزشکی در ایران
          </h1>
          {s.dl_short_desc && (
            <p style={{ margin: 0, maxWidth: 640, fontSize: 15.5, lineHeight: 2, color: "#c4dde4" }}>{s.dl_short_desc}</p>
          )}
        </div>
      </section>

      {/* Main Cities */}
      {mainCities.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 8px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>دندانپزشکان در شهرهای ایران</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {mainCities.map(city => (
              <Link key={city.id} href={`/${city.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "18px 16px", textAlign: "center", boxShadow: "0 10px 24px -20px rgba(13,75,107,.5)", display: "block" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#0c8aa6,#0e4d63)", margin: "0 auto 10px", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>
                  {(city.shortTitle || city.title)[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#143945" }}>{city.shortTitle || city.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular dentists */}
      <HorizontalSlider dentists={popularDentists} label="محبوب‌ترین دندانپزشکی‌ها" />

      {/* Featured dentists */}
      {featuredDentists.length > 0 && (
        <HorizontalSlider dentists={featuredDentists} label="دندانپزشکی‌های نمونه" />
      )}

      {/* Regional dentists */}
      {regionLocations.map(loc => {
        const locDentists = regionDentistsMap.get(loc.id) ?? [];
        if (!locDentists.length) return null;
        return (
          <section key={loc.id} style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 16px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: "clamp(18px,2.3vw,24px)", fontWeight: 800, color: "#133b48" }}>
                دندانپزشکی در {loc.shortTitle || loc.title}
              </h2>
              <Link href={`/${loc.slug}`} style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>مشاهده همه ←</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
              {locDentists.map(d => <DentistCardEl key={d.id} d={d} />)}
            </div>
          </section>
        );
      })}

      {/* Banner */}
      {s.dl_banner_title && (
        <section style={{ maxWidth: 1280, margin: "32px auto", padding: "0 16px" }}>
          <Link href={s.dl_banner_link || "#"} style={{ textDecoration: "none", display: "block", background: "linear-gradient(135deg,#0e4d63,#0c8aa6)", borderRadius: 22, padding: "clamp(28px,4vw,48px)", boxShadow: "0 16px 40px -24px rgba(13,75,107,.7)", overflow: "hidden", position: "relative" }}>
            {s.dl_banner_image && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${s.dl_banner_image})`, backgroundSize: "cover", backgroundPosition: "center", opacity: .18 }} />}
            <div style={{ position: "relative", color: "#fff" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "clamp(20px,3vw,32px)", fontWeight: 800 }}>{s.dl_banner_title}</h3>
              <span style={{ display: "inline-block", marginTop: 8, background: "rgba(255,255,255,.2)", padding: "9px 22px", borderRadius: 30, fontWeight: 700, fontSize: 14 }}>بیشتر بدانید ←</span>
            </div>
          </Link>
        </section>
      )}

      {/* Long description */}
      {s.dl_long_desc && (
        <section style={{ maxWidth: 1280, margin: "18px auto", padding: "0 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}
            dangerouslySetInnerHTML={{ __html: s.dl_long_desc }} />
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "30px 16px 50px" }}>
          <h2 style={{ margin: "0 0 22px", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "#133b48", textAlign: "center" }}>سوالات متداول</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 26px -24px rgba(13,75,107,.5)" }}>
                <summary style={{ cursor: "pointer", padding: "19px 20px", fontSize: 16, fontWeight: 700, color: "#143945", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {faq.q}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.4" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </summary>
                <div style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 2.05, color: "#5e7c85" }}>{faq.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}
      <Footer />
      <MobileNav />
    </div>
  );
}
