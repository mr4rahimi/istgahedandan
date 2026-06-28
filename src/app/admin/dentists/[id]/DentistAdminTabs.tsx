"use client";

import { useState } from "react";
import DentistEditForm from "./DentistEditForm";
import MediaManager from "./MediaManager";

interface Dentist {
  id: number; slug: string; title: string; shortDesc: string; longDesc: string;
  address: string; phones: string[]; whatsapp: string; telegram: string; instagram: string;
  workingHours: string; mapLat: string; mapLng: string; centerCode: string;
  featuredImage: string; gallery: string[]; metaTitle: string; metaDescription: string; status: string;
}
interface Story { id: number; imageUrl: string; title: string; order: number }
interface Video { id: number; url: string; title: string; order: number }
interface Location { id: number; title: string }
interface Service { id: number; title: string }

const TABS = [
  { key: "info", label: "اطلاعات" },
  { key: "stories", label: "استوری‌ها" },
  { key: "gallery", label: "گالری" },
  { key: "videos", label: "ویدئوها" },
  { key: "links", label: "خدمات و مناطق" },
];

export default function DentistAdminTabs({
  dentist, stories, videos, allLocations, allServices, linkedLocationIds, linkedServiceIds
}: {
  dentist: Dentist; stories: Story[]; videos: Video[];
  allLocations: Location[]; allServices: Service[];
  linkedLocationIds: number[]; linkedServiceIds: number[];
}) {
  const [tab, setTab] = useState("info");

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid #e7f0f3", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 18px", borderRadius: "10px 10px 0 0", border: "none", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#0c8aa6" : "#6c8b95", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", borderBottom: tab === t.key ? "2px solid #0c8aa6" : "2px solid transparent", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <DentistEditForm dentist={dentist} />}
      {tab === "stories" && (
        <MediaManager
          dentistId={dentist.id} type="stories"
          initial={stories.map(s => ({ id: s.id, url: s.imageUrl, title: s.title }))}
          titleLabel="عنوان استوری" urlLabel="لینک تصویر" addLabel="+ استوری جدید"
        />
      )}
      {tab === "gallery" && (
        <MediaManager
          dentistId={dentist.id} type="gallery"
          initial={dentist.gallery.map((url, i) => ({ id: i, url, title: "" }))}
          titleLabel="" urlLabel="لینک تصویر" addLabel="+ تصویر جدید" noTitle
        />
      )}
      {tab === "videos" && (
        <MediaManager
          dentistId={dentist.id} type="videos"
          initial={videos.map(v => ({ id: v.id, url: v.url, title: v.title }))}
          titleLabel="عنوان ویدئو" urlLabel="لینک ویدئو" addLabel="+ ویدئو جدید"
        />
      )}
      {tab === "links" && (
        <LinksManager
          dentistId={dentist.id}
          allLocations={allLocations} allServices={allServices}
          linkedLocationIds={linkedLocationIds} linkedServiceIds={linkedServiceIds}
        />
      )}
    </div>
  );
}

function LinksManager({
  dentistId, allLocations, allServices, linkedLocationIds, linkedServiceIds
}: {
  dentistId: number; allLocations: Location[]; allServices: Service[];
  linkedLocationIds: number[]; linkedServiceIds: number[];
}) {
  const [locs, setLocs] = useState(linkedLocationIds);
  const [svcs, setSvcs] = useState(linkedServiceIds);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setSaving(true); setMsg("");
    await fetch(`/api/admin/dentists/${dentistId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationIds: locs, serviceIds: svcs }),
    });
    setSaving(false); setMsg("ذخیره شد ✓");
    setTimeout(() => setMsg(""), 2500);
  };

  const card = (label: string, children: React.ReactNode) => (
    <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 22, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)", marginBottom: 20 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 700, color: "#133b48" }}>{label}</h3>
      {children}
    </div>
  );

  const chips = (items: { id: number; title: string }[], selected: number[], toggle: (id: number) => void) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(item => (
        <button key={item.id} type="button" onClick={() => toggle(item.id)} style={{ padding: "8px 16px", borderRadius: 10, border: selected.includes(item.id) ? "none" : "1px solid #dceaef", background: selected.includes(item.id) ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: selected.includes(item.id) ? "#fff" : "#6c8b95", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
          {item.title}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {card("مناطق", chips(allLocations, locs, id => setLocs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])))}
      {card("خدمات", chips(allServices, svcs, id => setSvcs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])))}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={save} disabled={saving} style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 28px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? .7 : 1 }}>
          {saving ? "در حال ذخیره…" : "ذخیره"}
        </button>
        {msg && <span style={{ fontWeight: 600, fontSize: 14, color: "#16a34a" }}>{msg}</span>}
      </div>
    </div>
  );
}
