import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getFooterData() {
  const [services, dentists, settings] = await Promise.all([
    prisma.service.findMany({ take: 6, select: { slug: true, title: true } }),
    prisma.dentist.findMany({ take: 5, select: { slug: true, title: true }, orderBy: { createdAt: "desc" } }),
    prisma.setting.findMany({ where: { key: { in: ["contact_phone", "contact_address", "social_instagram", "social_telegram"] } } }),
  ]);
  const s: Record<string, string> = {};
  settings.forEach(st => { s[st.key] = st.value; });
  return { services, dentists, settings: s };
}

export default async function Footer() {
  const { services, dentists, settings } = await getFooterData();

  return (
    <footer style={{ direction: "rtl", fontFamily: "inherit", background: "linear-gradient(180deg,#0e4151,#0a2c39)", color: "#cfe4ea", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -120, left: -80, width: 360, height: 360, background: "radial-gradient(circle, rgba(21,184,209,.18), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 28px", position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "flex-start" }}>

          <div style={{ flex: "2 1 300px", minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={48} height={48} style={{ objectFit: "contain", background: "#fff", borderRadius: 12, padding: 4 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>ایستگاه دندان</div>
                <div style={{ fontSize: 12, color: "#79a8b5", letterSpacing: 1 }}>ISTGAHE DANDAN</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 2, color: "#9fc2cc", margin: "0 0 20px", maxWidth: 380 }}>بزرگ‌ترین مرجع معرفی دندانپزشکان و کلینیک‌های دندانپزشکی کشور. با ایستگاه دندان بهترین متخصص نزدیک خود را پیدا کنید و آنلاین نوبت بگیرید.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
              {settings.contact_address && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#bdd9e0" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15b8d1" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {settings.contact_address}
                </div>
              )}
              {settings.contact_phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#bdd9e0" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15b8d1" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  {settings.contact_phone}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {settings.social_instagram && (
                <a href={settings.social_instagram} aria-label="اینستاگرام" target="_blank" rel="noopener noreferrer" style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.07)", display: "grid", placeItems: "center", color: "#cfe4ea" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" /></svg>
                </a>
              )}
              {settings.social_telegram && (
                <a href={settings.social_telegram} aria-label="تلگرام" target="_blank" rel="noopener noreferrer" style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.07)", display: "grid", placeItems: "center", color: "#cfe4ea" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.95 4.6l-3.32 15.66c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.4 6.9c.4-.36-.09-.56-.63-.2L6.18 13.4l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 3.1c.9-.34 1.69.2 1.4 1.5z" /></svg>
                </a>
              )}
            </div>
          </div>

          <div style={{ flex: "1 1 160px", minWidth: 150 }}>
            <h4 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 18px" }}>خدمات</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {services.map(svc => (
                <li key={svc.slug}>
                  <Link href={`/${svc.slug}`} style={{ color: "#a6cad3", textDecoration: "none", fontSize: 14 }}>{svc.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: "1 1 180px", minWidth: 170 }}>
            <h4 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 18px" }}>آخرین دندانپزشکی‌ها</h4>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {dentists.map(d => (
                <li key={d.slug}>
                  <Link href={`/${d.slug}`} style={{ color: "#a6cad3", textDecoration: "none", fontSize: 14 }}>{d.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/dentists-list" style={{ color: "#15b8d1", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>مشاهده همه ←</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#82a8b3" }}>کلیه حقوق این وب‌سایت متعلق به <strong style={{ color: "#cfe4ea", fontWeight: 600 }}>ایستگاه دندان</strong> می‌باشد. © ۱۴۰۴</p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/قوانین-و-مقررات" style={{ color: "#82a8b3", textDecoration: "none", fontSize: 13 }}>قوانین و مقررات</Link>
            <Link href="/حریم-خصوصی" style={{ color: "#82a8b3", textDecoration: "none", fontSize: 13 }}>حریم خصوصی</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
