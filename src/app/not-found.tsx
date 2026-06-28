import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function NotFound() {
  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 120, fontWeight: 900, color: "#d4eaf0", lineHeight: 1 }}>۴۰۴</div>
        <h1 style={{ margin: "16px 0 12px", fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "#133b48" }}>صفحه پیدا نشد</h1>
        <p style={{ margin: "0 0 32px", fontSize: 16, color: "#6c8b95", maxWidth: 420, lineHeight: 1.9 }}>صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا منتقل شده است.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "14px 28px", borderRadius: 14 }}>بازگشت به خانه</Link>
          <Link href="/دندانپزشکان" style={{ background: "#fff", border: "1px solid #d2e8ee", color: "#0c8aa6", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "14px 28px", borderRadius: 14 }}>لیست دندانپزشکان</Link>
        </div>
      </section>
      <Footer />
      <MobileNav />
    </div>
  );
}
