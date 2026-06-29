import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "خدمات دندانپزشکی | ایستگاه دندان",
  description: "مجموعه کامل خدمات تخصصی دندانپزشکی که توسط بهترین متخصصان ایستگاه دندان ارائه می‌شود.",
};

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg,#0c5e7c,#0a3f54)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#f43f5e,#a21caf)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#f59e0b,#ec4899)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
];

const DEFAULT_ICON = "M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortDesc: true, bgGradient: true, iconSvgPath: true },
  });

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 20px 48px", position: "relative" }}>
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 16 }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link>
            {" › "}خدمات
          </nav>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800 }}>خدمات دندانپزشکی</h1>
          <p style={{ margin: 0, maxWidth: 620, fontSize: 16, lineHeight: 2, color: "#c4dde4" }}>مجموعه کامل خدمات تخصصی دندانپزشکی که توسط بهترین متخصصان ایستگاه دندان ارائه می‌شود.</p>
        </div>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22 }}>
          {services.map((svc, i) => {
            const bg = svc.bgGradient || FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];
            const iconPath = svc.iconSvgPath || DEFAULT_ICON;
            return (
              <div key={svc.slug} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 36px -28px rgba(13,75,107,.5)", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 168, position: "relative", background: bg }}>
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.14) 0 12px,rgba(255,255,255,.04) 12px 24px)" }} />
                  <span style={{ position: "absolute", bottom: -26, right: 20, width: 56, height: 56, borderRadius: 16, background: "#fff", boxShadow: "0 8px 18px -8px rgba(13,75,107,.4)", display: "grid", placeItems: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath} />
                    </svg>
                  </span>
                </div>
                <div style={{ padding: "34px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#143945" }}>{svc.title}</h3>
                  {svc.shortDesc && <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.95, color: "#6c8b95", flex: 1 }}>{svc.shortDesc}</p>}
                  <Link href={`/${svc.slug}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#eef7fa", color: "#0c8aa6", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 12 }}>
                    مشاهده
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="reserve" style={{ maxWidth: 1280, margin: "10px auto 50px", padding: "0 16px" }}>
        <div style={{ background: "linear-gradient(120deg,#15b8d1,#0a6f9e)", borderRadius: 24, padding: "clamp(28px,4vw,44px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", color: "#fff" }}>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800 }}>نمی‌دانید کدام خدمت مناسب شماست؟</h3>
            <p style={{ margin: 0, fontSize: 15, color: "rgba(255,255,255,.9)" }}>با متخصصان ما مشاوره رایگان بگیرید و بهترین درمان را انتخاب کنید.</p>
          </div>
          <Link href="/contact" style={{ background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "14px 30px", borderRadius: 13, whiteSpace: "nowrap" }}>دریافت مشاوره رایگان</Link>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
