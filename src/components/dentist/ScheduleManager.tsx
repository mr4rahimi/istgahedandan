"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Jalali helpers (lightweight, no external deps) ──────────────────────────
const J_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const J_WEEKDAYS = ["ش","ی","د","س","چ","پ","ج"];
const J_WEEKDAYS_FULL = ["شنبه","یک‌شنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه"];
function toFa(n: number | string) { return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]); }

function gregToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g2j = (gy: number, gm: number, gd: number) => {
    let jy: number, jm: number, jd: number;
    let g_d_no: number, j_d_no: number;
    const g_days_in_month = [31,28,31,30,31,30,31,31,30,31,30,31];
    const j_days_in_month = [31,31,31,31,31,31,30,30,30,30,30,29];
    gy -= 1600; gm -= 1;
    let g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
    for (let i = 0; i < gm; ++i) g_day_no += g_days_in_month[i];
    if (gm > 1 && ((gy + 1600) % 4 === 0 && ((gy + 1600) % 100 !== 0 || (gy + 1600) % 400 === 0))) ++g_day_no;
    g_day_no += gd - 1;
    let j_day_no = g_day_no - 79;
    const j_np = Math.floor(j_day_no / 12053); j_day_no %= 12053;
    jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
    j_day_no %= 1461;
    if (j_day_no >= 366) { jy += Math.floor((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365; }
    let ii = 0;
    for (; ii < 11 && j_day_no >= j_days_in_month[ii]; ++ii) { j_day_no -= j_days_in_month[ii]; }
    jm = ii + 1; jd = j_day_no + 1;
    return [jy, jm, jd] as [number, number, number];
  };
  return g2j(gy, gm, gd);
}

function jalaliToGreg(jy: number, jm: number, jd: number): [number, number, number] {
  const j_days_in_month = [31,31,31,31,31,31,30,30,30,30,30,29];
  jy -= 979; jm -= 1;
  let j_day_no = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4);
  for (let i = 0; i < jm; ++i) j_day_no += j_days_in_month[i];
  j_day_no += jd - 1;
  let g_day_no = j_day_no + 79;
  let gy = 1600 + 400 * Math.floor(g_day_no / 146097); g_day_no %= 146097;
  let leap = true;
  if (g_day_no >= 36525) { g_day_no--; gy += 100 * Math.floor(g_day_no / 36524); g_day_no %= 36524; if (g_day_no >= 365) g_day_no++; else leap = false; }
  gy += 4 * Math.floor(g_day_no / 1461); g_day_no %= 1461;
  if (g_day_no >= 366) { leap = false; g_day_no--; gy += Math.floor(g_day_no / 365); g_day_no %= 365; }
  const g_days_in_month = [31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm: number;
  for (gm = 0; g_day_no >= g_days_in_month[gm]; gm++) g_day_no -= g_days_in_month[gm];
  return [gy, gm + 1, g_day_no + 1];
}

function todayGreg(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function gregStr(gy: number, gm: number, gd: number): string {
  return `${gy}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`;
}

function jDaysInMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: check leap
  const isLeap = (jy % 33) === 1 || (jy % 33) === 5 || (jy % 33) === 9 || (jy % 33) === 13 || (jy % 33) === 17 || (jy % 33) === 22 || (jy % 33) === 26 || (jy % 33) === 30;
  return isLeap ? 30 : 29;
}

// weekday: 0=شنبه, 6=جمعه
function jalaliWeekday(jy: number, jm: number, jd: number): number {
  const [gy, gm, gd] = jalaliToGreg(jy, jm, jd);
  const d = new Date(gy, gm - 1, gd);
  const w = d.getDay(); // 0=Sunday
  return (w + 1) % 7; // 0=شنبه
}

// ─── Generate time slots ────────────────────────────────────────────────────
function generateSlots(startH: number, startM: number, endH: number, endM: number, duration: number): string[] {
  const slots: string[] = [];
  let cur = startH * 60 + startM;
  const end = endH * 60 + endM;
  while (cur < end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += duration;
  }
  return slots;
}

const ALL_SLOTS_24 = generateSlots(6, 0, 23, 0, 30); // 6:00..22:30 every 30 min for display

// ─── Types ──────────────────────────────────────────────────────────────────
interface DaySchedule { slots: string[]; slotDuration: number }

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ScheduleManager({ dentistId }: { dentistId: number }) {
  const today = todayGreg();
  const [todayJalali] = useState(() => { const d = new Date(); return gregToJalali(d.getFullYear(), d.getMonth()+1, d.getDate()); });

  const [jYear, setJYear] = useState(todayJalali[0]);
  const [jMonth, setJMonth] = useState(todayJalali[1]);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [schedule, setSchedule] = useState<DaySchedule>({ slots: [], slotDuration: 30 });
  const [monthSchedules, setMonthSchedules] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [slotDuration, setSlotDuration] = useState(30);

  // Quick-fill state
  const [qfStart, setQfStart] = useState("08:00");
  const [qfEnd, setQfEnd] = useState("14:00");
  const [qfDuration, setQfDuration] = useState(30);

  // Jalali month may span two Gregorian months — use date range instead of prefix
  const jMonthRange = useCallback(() => {
    const [fy, fm, fd] = jalaliToGreg(jYear, jMonth, 1);
    const lastDay = jDaysInMonth(jYear, jMonth);
    const [ly, lm, ld] = jalaliToGreg(jYear, jMonth, lastDay);
    return {
      from: `${fy}-${String(fm).padStart(2,"0")}-${String(fd).padStart(2,"0")}`,
      to: `${ly}-${String(lm).padStart(2,"0")}-${String(ld).padStart(2,"0")}`,
    };
  }, [jYear, jMonth]);

  // Load month schedules (for dot indicators)
  useEffect(() => {
    const fetchMonth = async () => {
      const { from, to } = jMonthRange();
      const res = await fetch(`/api/dentist/schedule?from=${from}&to=${to}`);
      const data: Array<{ date: string; slots: string[] }> = await res.json();
      const map: Record<string, string[]> = {};
      data.forEach(s => { map[s.date] = s.slots; });
      setMonthSchedules(map);
    };
    fetchMonth();
  }, [jMonthRange]);

  // Load selected day
  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch(`/api/dentist/schedule?date=${selectedDate}`);
      const data: DaySchedule = await res.json();
      setSchedule(data);
      setSlotDuration(data.slotDuration ?? 30);
    };
    fetch_();
  }, [selectedDate]);

  const toggleSlot = (time: string) => {
    setSchedule(prev => ({
      ...prev,
      slots: prev.slots.includes(time)
        ? prev.slots.filter(s => s !== time)
        : [...prev.slots, time].sort(),
    }));
  };

  const applyQuickFill = () => {
    const [sh, sm] = qfStart.split(":").map(Number);
    const [eh, em] = qfEnd.split(":").map(Number);
    const generated = generateSlots(sh, sm, eh, em, qfDuration);
    setSchedule(prev => ({
      ...prev,
      slots: Array.from(new Set([...prev.slots, ...generated])).sort(),
      slotDuration: qfDuration,
    }));
    setSlotDuration(qfDuration);
  };

  const clearDay = () => setSchedule(prev => ({ ...prev, slots: [] }));

  const save = async () => {
    setSaving(true); setMsg("");
    await fetch("/api/dentist/schedule", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, slots: schedule.slots, slotDuration }),
    });
    setSaving(false);
    setMsg("ذخیره شد ✓");
    setMonthSchedules(prev => ({ ...prev, [selectedDate]: schedule.slots }));
    setTimeout(() => setMsg(""), 2000);
  };

  // ─── Calendar render
  const daysInMonth = jDaysInMonth(jYear, jMonth);
  const firstWeekday = jalaliWeekday(jYear, jMonth, 1); // 0=شنبه
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const prevMonth = () => {
    if (jMonth === 1) { setJYear(y => y - 1); setJMonth(12); }
    else setJMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (jMonth === 12) { setJYear(y => y + 1); setJMonth(1); }
    else setJMonth(m => m + 1);
  };

  const selectDay = (jd: number) => {
    const [gy, gm, gd] = jalaliToGreg(jYear, jMonth, jd);
    setSelectedDate(gregStr(gy, gm, gd));
  };

  const isFriday = (jd: number) => jalaliWeekday(jYear, jMonth, jd) === 6;
  const isPast = (jd: number) => {
    const [gy, gm, gd] = jalaliToGreg(jYear, jMonth, jd);
    return gregStr(gy, gm, gd) < today;
  };

  // Build display slots based on selected slot duration
  const displaySlots = generateSlots(6, 0, 23, 0, slotDuration);
  const morningSlots = displaySlots.filter(t => { const h = parseInt(t); return h >= 6 && h < 13; });
  const afternoonSlots = displaySlots.filter(t => { const h = parseInt(t); return h >= 13 && h < 18; });
  const eveningSlots = displaySlots.filter(t => { const h = parseInt(t); return h >= 18; });

  const slotGroups = [
    { label: "صبح", icon: "☀️", range: "۶:۰۰ تا ۱۳:۰۰", slots: morningSlots },
    { label: "بعدازظهر", icon: "🌤", range: "۱۳:۰۰ تا ۱۸:۰۰", slots: afternoonSlots },
    { label: "شب", icon: "🌙", range: "۱۸:۰۰ تا ۲۳:۰۰", slots: eveningSlots },
  ];

  const [selJY, selJM, selJD] = gregToJalali(...(selectedDate.split("-").map(Number) as [number, number, number]));
  const selWeekday = J_WEEKDAYS_FULL[jalaliWeekday(...[selJY, selJM, selJD] as [number, number, number])];
  const selLabel = `${selWeekday} ${toFa(selJD)} ${J_MONTHS[selJM - 1]} ${toFa(selJY)}`;

  const inp = (v: string, set: (s: string) => void, opts: string[]) => (
    <select value={v} onChange={e => set(e.target.value)} style={{ border: "1px solid #dceaef", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13.5, outline: "none", background: "#f8fbfc" }}>
      {opts.map(o => <option key={o} value={o}>{toFa(o.replace(":", ":"))}</option>)}
    </select>
  );

  const timeOpts = generateSlots(6, 0, 23, 0, 30);
  const durationOpts = ["15", "20", "30", "45", "60"];

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>مدیریت برنامه نوبت‌دهی</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,340px) 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT: Calendar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "20px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)" }}>
            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button onClick={prevMonth} style={{ width: 36, height: 36, border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", cursor: "pointer", display: "grid", placeItems: "center", color: "#0c8aa6" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18" /></svg>
              </button>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#133b48" }}>{J_MONTHS[jMonth - 1]} {toFa(jYear)}</span>
              <button onClick={nextMonth} style={{ width: 36, height: 36, border: "1px solid #dceaef", borderRadius: 10, background: "#f8fbfc", cursor: "pointer", display: "grid", placeItems: "center", color: "#0c8aa6" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
              {J_WEEKDAYS.map((w, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: i === 6 ? "#ef4444" : "#8aabb5", padding: "4px 0" }}>{w}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
              {cells.map((jd, i) => {
                if (!jd) return <div key={i} />;
                const [gy, gm, gd] = jalaliToGreg(jYear, jMonth, jd);
                const dateStr = gregStr(gy, gm, gd);
                const isSelected = dateStr === selectedDate;
                const past = isPast(jd);
                const friday = isFriday(jd);
                const hasSlots = (monthSchedules[dateStr]?.length ?? 0) > 0;

                return (
                  <button key={i} onClick={() => !past && !friday && selectDay(jd)} disabled={past || friday} style={{ position: "relative", width: "100%", aspectRatio: "1", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: past || friday ? "not-allowed" : "pointer", background: isSelected ? "linear-gradient(135deg,#0c8aa6,#0a4f63)" : "transparent", color: isSelected ? "#fff" : past ? "#c5d5da" : friday ? "#ef4444" : "#133b48", opacity: past ? .5 : 1 }}>
                    {toFa(jd)}
                    {hasSlots && !isSelected && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#0c8aa6", display: "block" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Fill */}
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "18px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.1)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#133b48", marginBottom: 14 }}>پر کردن سریع</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#6c8b95", flexShrink: 0 }}>از</span>
                {inp(qfStart, setQfStart, timeOpts)}
                <span style={{ fontSize: 13, color: "#6c8b95", flexShrink: 0 }}>تا</span>
                {inp(qfEnd, setQfEnd, timeOpts)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#6c8b95" }}>هر</span>
                <select value={qfDuration} onChange={e => setQfDuration(parseInt(e.target.value))} style={{ border: "1px solid #dceaef", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13.5, outline: "none", background: "#f8fbfc" }}>
                  {durationOpts.map(d => <option key={d} value={d}>{toFa(d)} دقیقه</option>)}
                </select>
              </div>
              <button onClick={applyQuickFill} style={{ background: "#eef7fa", color: "#0c8aa6", border: "1px solid #bde0eb", borderRadius: 10, padding: "9px 14px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
                + اعمال به روز انتخابی
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Slot picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "22px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#133b48" }}>{selLabel}</div>
                <div style={{ fontSize: 13, color: "#8aabb5", marginTop: 3 }}>{schedule.slots.length > 0 ? `${toFa(schedule.slots.length)} ساعت انتخاب شده` : "هنوز ساعتی انتخاب نشده"}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#6c8b95" }}>مدت اسلات:</span>
                <select value={slotDuration} onChange={e => setSlotDuration(parseInt(e.target.value))} style={{ border: "1px solid #dceaef", borderRadius: 8, padding: "7px 10px", fontFamily: "inherit", fontSize: 13.5, outline: "none", background: "#f8fbfc" }}>
                  {durationOpts.map(d => <option key={d} value={d}>{toFa(d)} دقیقه</option>)}
                </select>
                <button onClick={clearDay} style={{ border: "1px solid #fca5a5", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", background: "#fef2f2", color: "#c0392b", fontWeight: 600 }}>پاک کردن</button>
                <button onClick={save} disabled={saving} style={{ background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 14, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", opacity: saving ? .7 : 1 }}>
                  {saving ? "…" : "ذخیره"}
                </button>
                {msg && <span style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>{msg}</span>}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, margin: "14px 0", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6c8b95" }}><span style={{ width: 12, height: 12, borderRadius: 4, background: "#fff", border: "1px solid #cfe0e5" }} />خالی</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6c8b95" }}><span style={{ width: 12, height: 12, borderRadius: 4, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)" }} />انتخاب شده</span>
            </div>

            {/* Slot groups */}
            {slotGroups.map(g => (
              <div key={g.label} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#133b48" }}>{g.label}</span>
                  <span style={{ fontSize: 12, color: "#9bb6bf" }}>{g.range}</span>
                  <button onClick={() => {
                    const allSel = g.slots.every(s => schedule.slots.includes(s));
                    setSchedule(prev => ({
                      ...prev,
                      slots: allSel
                        ? prev.slots.filter(s => !g.slots.includes(s))
                        : Array.from(new Set([...prev.slots, ...g.slots])).sort(),
                    }));
                  }} style={{ marginRight: "auto", border: "1px solid #dceaef", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", background: "#f8fbfc", color: "#0c8aa6", fontWeight: 600 }}>
                    {g.slots.every(s => schedule.slots.includes(s)) ? "لغو انتخاب" : "همه"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))", gap: 8 }}>
                  {g.slots.map(time => {
                    const active = schedule.slots.includes(time);
                    return (
                      <button key={time} onClick={() => toggleSlot(time)} style={{ padding: "10px 4px", borderRadius: 10, border: active ? "none" : "1px solid #d7e6ea", background: active ? "linear-gradient(135deg,#0c8aa6,#0a4f63)" : "#fff", color: active ? "#fff" : "#2a4f5b", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all .15s", boxShadow: active ? "0 4px 12px -4px rgba(12,138,166,.5)" : "none" }}>
                        {toFa(time)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
