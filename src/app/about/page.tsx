import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "درباره ما | ایستگاه دندان",
  description: "ایستگاه دندان از سال ۱۴۰۰ فعالیت خود را آغاز کرده و هدفش ساده‌سازی دسترسی بیماران به بهترین دندانپزشکان کشور است.",
};

const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "جستجوی هوشمند دندانپزشک",
    desc: "جستجو بر اساس منطقه، تخصص و امتیاز کاربران — پیدا کردن دندانپزشک مناسب در چند ثانیه.",
    color: "#0c8aa6",
    bg: "#e8f6fa",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    title: "نقشه تعاملی مطب‌ها",
    desc: "موقعیت دقیق تمام دندانپزشکی‌های ثبت‌شده روی نقشه — نزدیک‌ترین گزینه را با یک نگاه پیدا کنید.",
    color: "#0a7a6e",
    bg: "#e5f5f3",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "نظرات و امتیازدهی",
    desc: "کاربران پس از مراجعه می‌توانند تجربه خود را ثبت کنند و به دیگران در انتخاب بهتر کمک کنند.",
    color: "#7c3aed",
    bg: "#f0ebff",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
        <line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" />
        <line x1="12" y1="13" x2="12" y2="17" /><line x1="10" y1="15" x2="14" y2="15" />
      </svg>
    ),
    title: "رزرو آنلاین نوبت",
    desc: "رزرو نوبت بدون تماس تلفنی، ۲۴ ساعته و در هر روز هفته از طریق پروفایل هر کلینیک.",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" />
      </svg>
    ),
    title: "پروفایل کامل دندانپزشکی‌ها",
    desc: "آدرس، شماره تماس، تصاویر، خدمات، ساعت کاری و نظرات — همه در یک صفحه.",
    color: "#e11d48",
    bg: "#fde8ef",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="12" y1="7" x2="16" y2="7" /><line x1="12" y1="11" x2="16" y2="11" />
      </svg>
    ),
    title: "مجله دندانپزشکی",
    desc: "مقالات تخصصی و آموزشی درباره بهداشت دهان، خدمات دندانپزشکی و نکات مراقبتی.",
    color: "#059669",
    bg: "#d1fae5",
  },
];

const STATS = [
  { num: "۱۴۰۰", label: "سال شروع فعالیت" },
  { num: "+۲۶۹", label: "دندانپزشکی ثبت‌شده" },
  { num: "+۴۹", label: "منطقه پوشش" },
  { num: "۲۴/۷", label: "دسترسی آنلاین" },
];

export default function AboutPage() {
  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", position: "relative", overflow: "hidden", padding: "clamp(48px,7vw,90px) 20px clamp(40px,6vw,80px)" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 340, height: 340, background: "radial-gradient(circle,rgba(21,184,209,.3),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: 60, width: 260, height: 260, background: "radial-gradient(circle,rgba(10,200,140,.2),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.12)", backdropFilter: "blur(6px)", color: "#7de8f8", fontSize: 13, fontWeight: 700, padding: "7px 18px", borderRadius: 30, marginBottom: 22 }}>
            فعال از سال ۱۴۰۰
          </span>
          <h1 style={{ margin: "0 0 18px", fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>
            ایستگاه دندان،<br />مسیر مطمئن رسیدن به لبخند سالم
          </h1>
          <p style={{ margin: "0 auto 34px", fontSize: "clamp(14px,1.8vw,17px)", color: "#b9d9e4", lineHeight: 2, maxWidth: 560 }}>
            از سال ۱۴۰۰ با هدف ساده‌سازی دسترسی بیماران به بهترین دندانپزشکان کشور فعالیت می‌کنیم. پلتفرمی که پیدا کردن دندانپزشک مناسب را آسان می‌کند.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dentists-list" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 13, boxShadow: "0 10px 24px -10px rgba(0,0,0,.4)" }}>
              جستجوی دندانپزشک
            </Link>
            <Link href="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 24px", borderRadius: 13, backdropFilter: "blur(6px)" }}>
              تماس با ما
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 24, boxShadow: "0 16px 40px -28px rgba(13,75,107,.4)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", marginTop: -32, position: "relative", zIndex: 10 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "26px 20px", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid #f0f7f9" : "none" }}>
              <div style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 800, color: "#133b48", marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#6c8b95", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 760, margin: "52px auto 0", padding: "0 20px", textAlign: "center" }}>
        <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13 }}>ماموریت ما</span>
        <h2 style={{ margin: "10px 0 16px", fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: "#133b48" }}>چرا ایستگاه دندان؟</h2>
        <p style={{ margin: 0, fontSize: 15.5, color: "#4a6570", lineHeight: 2.1, maxWidth: 620, marginInline: "auto" }}>
          پیدا کردن دندانپزشک مناسب همیشه چالش بوده؛ اطلاعات پراکنده، نبود نظرات معتبر، و عدم اطمینان از کیفیت. ایستگاه دندان همه این اطلاعات را در یک پلتفرم شفاف جمع کرده تا بیمار با اطمینان انتخاب کند.
        </p>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "44px auto 0", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "26px 24px", boxShadow: "0 10px 28px -22px rgba(13,75,107,.4)", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: 14, background: f.bg, display: "grid", placeItems: "center", color: f.color }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#133b48" }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "#5e8b97", lineHeight: 1.85 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "48px auto 0", padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", borderRadius: 24, padding: "clamp(28px,4vw,48px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: "radial-gradient(circle,rgba(21,184,209,.25),transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, color: "#fff" }}>همین الان شروع کنید</h2>
            <p style={{ margin: "0 0 26px", fontSize: 15, color: "#b9d9e4", lineHeight: 1.9 }}>دندانپزشک مناسب را پیدا کنید، روی نقشه ببینید و مستقیم تماس بگیرید.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dentists-list" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                جستجوی دندانپزشک
              </Link>
              <Link href="/map" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 24px", borderRadius: 13 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
                مشاهده نقشه
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} />
      <Footer />
      <MobileNav />
    </div>
  );
}
