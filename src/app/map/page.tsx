import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "نقشه دندانپزشکان",
  description: "نقشه تعاملی دندانپزشکان ایستگاه دندان — موقعیت مطب‌ها را روی نقشه ببینید.",
};

const DentistMap = dynamic(() => import("@/components/pages/DentistMap"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: "grid", placeItems: "center", background: "#eef4f6", color: "#9bb6bf", fontSize: 15 }}>
      در حال بارگذاری نقشه…
    </div>
  ),
});

export default function MapPage() {
  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", display: "flex", flexDirection: "column", height: "100dvh", background: "#f4f9fb" }}>
      <Header />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <DentistMap />
      </div>
      <MobileNav />
    </div>
  );
}
