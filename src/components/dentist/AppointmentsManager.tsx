"use client";

import { useState, useEffect } from "react";

const J_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
function toFa(n: number | string) { return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]); }

function gregToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const j_days_in_month = [31,31,31,31,31,31,30,30,30,30,30,29];
  gy -= 1600; gm -= 1;
  let g_day_no = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400);
  for (let i=0;i<gm;++i) g_day_no += [31,28,31,30,31,30,31,31,30,31,30,31][i];
  if (gm>1 && ((gy+1600)%4===0 && ((gy+1600)%100!==0 || (gy+1600)%400===0))) ++g_day_no;
  g_day_no += gd - 1;
  let j_day_no = g_day_no - 79;
  const j_np = Math.floor(j_day_no/12053); j_day_no %= 12053;
  let jy = 979 + 33*j_np + 4*Math.floor(j_day_no/1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) { jy += Math.floor((j_day_no-1)/365); j_day_no = (j_day_no-1)%365; }
  let i=0; for (;i<11 && j_day_no>=j_days_in_month[i];++i) j_day_no -= j_days_in_month[i];
  return [jy, i+1, j_day_no+1];
}

function jalaliDateStr(dateStr: string): string {
  const [gy, gm, gd] = dateStr.split("-").map(Number);
  const [jy, jm, jd] = gregToJalali(gy, gm, gd);
  return `${toFa(jd)} ${J_MONTHS[jm-1]} ${toFa(jy)}`;
}

interface Appointment {
  id: number; dentistId: number; date: string; time: string;
  patientName: string; patientPhone: string; notes: string | null;
  status: "CONFIRMED" | "CANCELLED"; trackCode: string;
  isRead: boolean; createdAt: string;
}

type FilterTab = "upcoming" | "today" | "all" | "cancelled";

export default function AppointmentsManager({ dentistId }: { dentistId: number }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("upcoming");
  const [expanded, setExpanded] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch("/api/dentist/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []);
    setUnreadCount(data.unreadCount || 0);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/dentist/appointments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const cancelAppt = async (id: number) => {
    if (!confirm("این نوبت لغو شود؟")) return;
    await fetch(`/api/dentist/appointments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
  };

  const filtered = appointments.filter(a => {
    if (filter === "today") return a.date === todayStr && a.status === "CONFIRMED";
    if (filter === "upcoming") return a.date >= todayStr && a.status === "CONFIRMED";
    if (filter === "cancelled") return a.status === "CANCELLED";
    return true;
  });

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "upcoming", label: "آینده" },
    { key: "today", label: "امروز" },
    { key: "all", label: "همه" },
    { key: "cancelled", label: "لغو شده" },
  ];

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>نوبت‌ها</h1>
          {unreadCount > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 800 }}>{toFa(unreadCount)} جدید</span>
          )}
        </div>
        <button onClick={fetchAll} style={{ border: "1px solid #dceaef", borderRadius: 10, padding: "8px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", background: "#fff", color: "#0c8aa6", fontWeight: 600 }}>
          بازخوانی
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e7f0f3" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding: "10px 18px", border: "none", background: "transparent", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", color: filter === t.key ? "#0c8aa6" : "#6c8b95", borderBottom: `2px solid ${filter === t.key ? "#0c8aa6" : "transparent"}`, marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#9bb6bf", padding: 60 }}>در حال بارگذاری…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "60px 24px", textAlign: "center", color: "#9bb6bf", boxShadow: "0 2px 12px -4px rgba(13,75,107,.08)" }}>
          نوبتی یافت نشد
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(appt => {
            const isExpanded = expanded === appt.id;
            const isNew = !appt.isRead && appt.status === "CONFIRMED";
            const isPast = appt.date < todayStr;

            return (
              <div key={appt.id} style={{ background: "#fff", border: `1px solid ${isNew ? "#15b8d1" : "#e7f0f3"}`, borderRadius: 16, boxShadow: `0 2px 12px -4px rgba(13,75,107,${isNew ? ".2" : ".08"})`, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                  onClick={() => {
                    setExpanded(isExpanded ? null : appt.id);
                    if (isNew) markRead(appt.id);
                  }}>
                  {/* Status indicator */}
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", flexShrink: 0, background: appt.status === "CANCELLED" ? "#fef2f2" : isPast ? "#f4f9fb" : "linear-gradient(135deg,#0c8aa6,#0a4f63)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={appt.status === "CANCELLED" ? "#ef4444" : isPast ? "#9bb6bf" : "#fff"} strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="5" width="18" height="16" rx="2.5" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15.5, color: "#133b48" }}>{appt.patientName}</span>
                      {isNew && <span style={{ fontSize: 11, fontWeight: 700, background: "#15b8d1", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>جدید</span>}
                      {appt.status === "CANCELLED" && <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: 20, border: "1px solid #fca5a5" }}>لغو شده</span>}
                    </div>
                    <div style={{ fontSize: 13.5, color: "#6c8b95", marginTop: 3 }}>
                      {jalaliDateStr(appt.date)} ·  ساعت {toFa(appt.time)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#9bb6bf", direction: "ltr" }}>{appt.patientPhone}</div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f0f6f8", padding: "16px 20px", background: "#f8fbfc" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
                      <div><div style={{ fontSize: 12, color: "#9bb6bf", marginBottom: 3 }}>کد پیگیری</div><code style={{ fontSize: 13.5, fontWeight: 700, color: "#0c8aa6" }}>{appt.trackCode}</code></div>
                      <div><div style={{ fontSize: 12, color: "#9bb6bf", marginBottom: 3 }}>موبایل</div><span style={{ fontSize: 14, direction: "ltr" }}>{appt.patientPhone}</span></div>
                      <div><div style={{ fontSize: 12, color: "#9bb6bf", marginBottom: 3 }}>تاریخ ثبت</div><span style={{ fontSize: 14 }}>{new Date(appt.createdAt).toLocaleDateString("fa-IR")}</span></div>
                    </div>
                    {appt.notes && (
                      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#3a5b66", marginBottom: 14, lineHeight: 1.7 }}>
                        {appt.notes}
                      </div>
                    )}
                    {appt.status === "CONFIRMED" && (
                      <button onClick={() => cancelAppt(appt.id)} style={{ border: "1px solid #fca5a5", borderRadius: 10, padding: "8px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", background: "#fef2f2", color: "#c0392b", fontWeight: 600 }}>
                        لغو این نوبت
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
