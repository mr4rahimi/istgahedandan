import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "تماس با ما | ایستگاه دندان",
  description: "اطلاعات تماس با مدیریت ایستگاه دندان — جهت امور تبلیغاتی، همکاری و اعلام مشکل.",
};

export default function ContactPage() {
  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "52px 20px 0", textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f6fa", color: "#0c8aa6", fontSize: 13, fontWeight: 700, padding: "7px 16px", borderRadius: 30, marginBottom: 18 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          ارتباط با ما
        </span>
        <h1 style={{ margin: "0 0 14px", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: "#133b48", lineHeight: 1.3 }}>چطور می‌توانیم کمک کنیم؟</h1>
        <p style={{ margin: "0 auto", fontSize: 16, color: "#5e8b97", lineHeight: 2, maxWidth: 520 }}>
          برای ارتباط با مدیریت سایت ایستگاه دندان از اطلاعات زیر استفاده کنید.
        </p>
      </section>

      {/* Cards */}
      <section style={{ maxWidth: 860, margin: "40px auto 0", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

          {/* Management contact */}
          <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", borderRadius: 24, padding: "32px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, left: -50, width: 200, height: 200, background: "radial-gradient(circle,rgba(21,184,209,.3),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "grid", placeItems: "center", marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7de8f8" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#7de8f8", fontWeight: 600 }}>تماس با مدیریت</p>
              <a href="tel:09916352600" style={{ display: "block", fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, color: "#fff", textDecoration: "none", letterSpacing: 1, marginBottom: 16, direction: "ltr", textAlign: "right" }}>
                ۰۹۹۱ ۶۳۵ ۲۶۰۰
              </a>
              <p style={{ margin: 0, fontSize: 13.5, color: "#b9d9e4", lineHeight: 1.9 }}>
                فقط جهت امور مربوط به سایت شامل <strong style={{ color: "#fff" }}>تبلیغات</strong>، <strong style={{ color: "#fff" }}>اعلام مشکل</strong> و <strong style={{ color: "#fff" }}>همکاری</strong> تماس گرفته شود.
              </p>
              <a href="tel:09916352600" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 12, backdropFilter: "blur(6px)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                تماس تلفنی
              </a>
            </div>
          </div>

          {/* Dental appointments notice */}
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 24, padding: "32px 28px", boxShadow: "0 14px 34px -26px rgba(13,75,107,.4)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#e8f6fa", display: "grid", placeItems: "center", marginBottom: 20 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2" strokeLinecap="round"><path d="M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" /></svg>
            </div>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#0c8aa6", fontWeight: 700 }}>رزرو نوبت دندانپزشکی</p>
            <h3 style={{ margin: "0 0 14px", fontSize: 19, fontWeight: 800, color: "#133b48", lineHeight: 1.4 }}>برای تماس با کلینیک‌ها به پروفایلشان مراجعه کنید</h3>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "#5e8b97", lineHeight: 2 }}>
              جهت امور مربوط به دندانپزشکی‌ها، رزرو نوبت یا سوال از کلینیک‌ها، شماره تماس مستقیم هر مرکز در پروفایل آن موجود است.
            </p>
            <Link href="/dentists-list" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 12, boxShadow: "0 8px 20px -8px rgba(13,120,168,.6)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              جستجو دندانپزشک
            </Link>
          </div>
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 28, background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: 14, boxShadow: "0 8px 24px -18px rgba(13,75,107,.4)" }}>
          <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "#fff8e1", display: "grid", placeItems: "center", marginTop: 2 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d98a00" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#4a6570", lineHeight: 1.9 }}>
            ایستگاه دندان یک پلتفرم معرفی و جستجوی دندانپزشک است. ما مستقیماً خدمات دندانپزشکی ارائه نمی‌دهیم و پاسخ‌گوی سوالات پزشکی نخواهیم بود. برای مشاوره پزشکی حتماً با کلینیک مورد نظر تماس بگیرید.
          </p>
        </div>
      </section>

      <div style={{ height: 60 }} />
      <Footer />
      <MobileNav />
    </div>
  );
}
