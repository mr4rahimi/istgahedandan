import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default async function StaticContentPage({ slug }: { slug: string }) {
  const page = await prisma.staticPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 20px 44px", position: "relative" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800 }}>{page.title}</h1>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "36px 16px 50px" }}>
        <article style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,4vw,52px)", boxShadow: "0 16px 44px -34px rgba(13,75,107,.5)", fontSize: 16, lineHeight: 2.25, color: "#41616b" }}>
          {page.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p style={{ margin: 0, color: "#6c8b95" }}>محتوای این صفحه در دسترس نیست.</p>
          )}
        </article>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
}
