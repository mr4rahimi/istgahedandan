"use client";

import dynamic from "next/dynamic";

const DentistMap = dynamic(() => import("@/components/pages/DentistMap"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: "grid", placeItems: "center", background: "#eef4f6", color: "#9bb6bf", fontSize: 15 }}>
      در حال بارگذاری نقشه…
    </div>
  ),
});

export default function MapWrapper() {
  return <DentistMap />;
}
