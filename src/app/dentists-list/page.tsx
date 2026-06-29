import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { breadcrumbSchema, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

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

interface DentistCard {
  id: number; slug: string; title: string; shortDesc: string | null;
  featuredImage: string | null; address: string | null;
  avgRating: number | null; reviewCount: number;
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg,#0c8aa6,#0a4f63)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#8b5cf6,#0c5e7c)",
  "linear-gradient(135deg,#0ea5e9,#0a3f54)",
];

function DentistCardEl({ d, idx = 0 }: { d: DentistCard; idx?: number }) {
  const initial = d.title[0] || "د";
  const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  return (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 24px -8px rgba(13,75,107,.18)", display: "flex", flexDirection: "column", transition: "box-shadow .2s" }}>
      {/* Image */}
      <div style={{ position: "relative", height: 172, flexShrink: 0, background: gradient, overflow: "hidden" }}>
        {d.featuredImage ? (
          <Image src={d.featuredImage} alt={d.title} fill style={{ objectFit: "cover" }} sizes="(max-width:640px) 100vw, 320px" />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
            <span style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 30 }}>{initial}</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(10,40,55,.65))" }} />
        {d.avgRating && d.avgRating > 0 && (
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", color: "#fbbf24", fontSize: 13, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
            {d.avgRating.toFixed(1)}
          </div>
        )}
        {d.reviewCount > 0 && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)", color: "#e2f4f8", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
            {d.reviewCount} نظر
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#143945", lineHeight: 1.5 }}>{d.title}</h3>

        {d.address && (
          <p style={{ margin: 0, display: "flex", alignItems: "flex-start", gap: 5, color: "#7a9faa", fontSize: 12.5, lineHeight: 1.7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {d.address.slice(0, 60)}{d.address.length > 60 ? "…" : ""}
          </p>
        )}

        {d.shortDesc && (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.85, color: "#6c8b95", flex: 1 }}>
            {d.shortDesc.slice(0, 90)}{d.shortDesc.length > 90 ? "…" : ""}
          </p>
        )}

        <Link href={`/${d.slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6, padding: "11px 18px", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 14.5, textDecoration: "none", boxShadow: "0 4px 16px -6px rgba(12,138,166,.55)" }}>
          مشاهده پروفایل
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </Link>
      </div>
    </div>
  );
}

function HorizontalSlider({ dentists, label }: { dentists: DentistCard[]; label: string }) {
  if (!dentists.length) return null;
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px 8px" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>{label}</h2>
      <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
        {dentists.map((d, i) => (
          <div key={d.id} style={{ minWidth: "clamp(260px,28vw,310px)", flexShrink: 0 }}>
            <DentistCardEl d={d} idx={i} />
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

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "لیست دندانپزشکان و کلینیک‌های دندانپزشکی در ایران",
    "url": `${SITE_URL}/dentists-list`,
    "numberOfItems": allDentists.length,
    "itemListElement": allDentists.slice(0, 50).map((d, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE_URL}/${d.slug}`,
      "name": d.title,
    })),
  };

  const breadcrumb = breadcrumbSchema([
    { name: "خانه", url: SITE_URL },
    { name: "دندانپزشکان", url: `${SITE_URL}/dentists-list` },
  ]);

  return (
    <div style={{ direction: "rtl", fontFamily: "Vazirmatn, system-ui, sans-serif", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <JsonLd data={[itemListSchema, breadcrumb]} />
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {locDentists.map((d, i) => <DentistCardEl key={d.id} d={d} idx={i} />)}
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
