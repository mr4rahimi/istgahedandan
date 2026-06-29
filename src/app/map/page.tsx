import type { Metadata } from "next";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import MapWrapper from "./MapWrapper";

export const metadata: Metadata = {
  title: "نقشه دندانپزشکان",
  description: "نقشه تعاملی دندانپزشکان ایستگاه دندان — موقعیت مطب‌ها را روی نقشه ببینید.",
};

export default function MapPage() {
  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", display: "flex", flexDirection: "column", height: "100dvh", background: "#f4f9fb" }}>
      <Header />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <MapWrapper />
      </div>
      <MobileNav />
    </div>
  );
}
