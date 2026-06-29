"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Jalali helpers ─────────────────────────────────────────────────────────
const J_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const J_MONTHS_SHORT = ["فرو","ارد","خرد","تیر","مرد","شهر","مهر","آبان","آذر","دی","بهم","اسف"];
const J_WEEKDAYS_FULL = ["شنبه","یک‌شنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه"];
function toFa(n: number | string) { return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]); }

function gregToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const j_days = [31,31,31,31,31,31,30,30,30,30,30,29];
  gy -= 1600; gm -= 1;
  let gdn = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400);
  [31,28,31,30,31,30,31,31,30,31,30,31].forEach((d,i) => { if(i<gm) gdn+=d; });
  if (gm>1 && ((gy+1600)%4===0 && ((gy+1600)%100!==0||(gy+1600)%400===0))) ++gdn;
  gdn += gd - 1;
  let jdn = gdn - 79;
  const jnp = Math.floor(jdn/12053); jdn %= 12053;
  let jy = 979 + 33*jnp + 4*Math.floor(jdn/1461);
  jdn %= 1461;
  if (jdn >= 366) { jy += Math.floor((jdn-1)/365); jdn = (jdn-1)%365; }
  let ii=0; for(;ii<11&&jdn>=j_days[ii];++ii) jdn -= j_days[ii];
  return [jy, ii+1, jdn+1];
}

function jalaliToGreg(jy: number, jm: number, jd: number): [number, number, number] {
  const jdays = [31,31,31,31,31,31,30,30,30,30,30,29];
  jy -= 979; jm -= 1;
  let jdn2 = 365*jy + Math.floor(jy/33)*8 + Math.floor(((jy%33)+3)/4);
  for(let i=0;i<jm;++i) jdn2 += jdays[i];
  jdn2 += jd - 1;
  let gdn = jdn2 + 79;
  let gy = 1600 + 400*Math.floor(gdn/146097); gdn %= 146097;
  let leap = true;
  if (gdn >= 36525) { gdn--; gy += 100*Math.floor(gdn/36524); gdn %= 36524; if(gdn>=365) gdn++; else leap=false; }
  gy += 4*Math.floor(gdn/1461); gdn %= 1461;
  if (gdn >= 366) { leap=false; gdn--; gy += Math.floor(gdn/365); gdn %= 365; }
  const gdays = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  let gm2=0; for(;gm2<12&&gdn>=gdays[gm2];gm2++) gdn -= gdays[gm2];
  return [gy, gm2+1, gdn+1];
}

function gregStr(gy:number,gm:number,gd:number) {
  return `${gy}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`;
}
function jDaysInMonth(jy:number,jm:number) {
  if(jm<=6) return 31; if(jm<=11) return 30;
  const r=jy%33; const leap=[1,5,9,13,17,22,26,30].includes(r);
  return leap?30:29;
}
function jalaliWeekday(jy:number,jm:number,jd:number) {
  const [gy,gm,gd]=jalaliToGreg(jy,jm,jd);
  return (new Date(gy,gm-1,gd).getDay()+1)%7; // 0=شنبه, 6=جمعه
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface SlotInfo { time: string; booked: boolean }
interface DayData { date: string; slots: SlotInfo[]; slotDuration: number }
interface DentistInfo {
  id: number; slug: string; title: string;
  address: string | null; phones: string[];
  featuredImage: string | null; workingHours: string | null;
}

// ─── Inner component ─────────────────────────────────────────────────────────
function ReserveInner() {
  const searchParams = useSearchParams();
  const paramDentistId = searchParams.get("dentistId");
  const paramSlug = searchParams.get("slug");

  const nowDate = new Date();
  const todayGreg = gregStr(nowDate.getFullYear(), nowDate.getMonth()+1, nowDate.getDate());
  const todayJ = gregToJalali(nowDate.getFullYear(), nowDate.getMonth()+1, nowDate.getDate());

  // Dentist
  const [dentistId, setDentistId] = useState<number | null>(paramDentistId ? parseInt(paramDentistId) : null);
  const [dentist, setDentist] = useState<DentistInfo | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DentistInfo[]>([]);
  const [defaultResults, setDefaultResults] = useState<DentistInfo[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Calendar
  const [jYear, setJYear] = useState(todayJ[0]);
  const [jMonth, setJMonth] = useState(todayJ[1]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<Record<string, SlotInfo[]>>({});
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);

  // Booking
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  // Modals
  const [success, setSuccess] = useState<{ trackCode: string; date: string; time: string } | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelCode, setCancelCode] = useState("");
  const [cancelResult, setCancelResult] = useState<"ok"|"err"|null>(null);
  const [cancelMsg, setCancelMsg] = useState("");

  const sliderRef = useRef<HTMLDivElement>(null);

  // ── Resolve dentist ───────────────────────────────────────────────────────
  useEffect(() => {
    if (paramSlug && !paramDentistId) {
      fetch(`/api/reserve/dentist-by-slug/${encodeURIComponent(paramSlug)}`).then(r=>r.json()).then(d => {
        if (d.id) { setDentistId(d.id); setDentist(d); }
        else setShowSearch(true);
      });
    } else if (!paramDentistId) {
      setShowSearch(true);
    }
  }, [paramSlug, paramDentistId]);

  useEffect(() => {
    if (!dentistId) return;
    fetch(`/api/reserve/dentist/${dentistId}`).then(r=>r.json()).then(d => {
      if (!d.error) setDentist(d);
    });
  }, [dentistId]);

  // ── Load default results when search opens ────────────────────────────────
  useEffect(() => {
    if (!showSearch || defaultResults.length > 0) return;
    fetch("/api/reserve/search-dentist?q=").then(r=>r.json()).then(d => {
      setDefaultResults(d.results || []);
    });
  }, [showSearch, defaultResults.length]);

  // ── Dentist search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    setLoadingSearch(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/reserve/search-dentist?q=${encodeURIComponent(searchQuery)}`);
      const d = await res.json();
      setSearchResults(d.results || []);
      setLoadingSearch(false);
    }, 280);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Date range for current Jalali month (may span 2 Gregorian months) ────
  const jMonthRange = useCallback(() => {
    const [fy,fm,fd] = jalaliToGreg(jYear, jMonth, 1);
    const last = jDaysInMonth(jYear, jMonth);
    const [ly,lm,ld] = jalaliToGreg(jYear, jMonth, last);
    return { from: gregStr(fy,fm,fd), to: gregStr(ly,lm,ld) };
  }, [jYear, jMonth]);

  // ── Load month data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!dentistId) return;
    const { from, to } = jMonthRange();
    fetch(`/api/reserve/slots?dentistId=${dentistId}&from=${from}&to=${to}`)
      .then(r=>r.json())
      .then((data: DayData[]) => {
        const map: Record<string,SlotInfo[]> = {};
        if (Array.isArray(data)) data.forEach(d => { map[d.date] = d.slots; });
        setMonthData(map);
      });
  }, [dentistId, jMonthRange]);

  // ── Load day slots ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dentistId || !selectedDate) return;
    setLoadingDay(true); setSelectedSlot(null); setDayData(null);
    fetch(`/api/reserve/slots?dentistId=${dentistId}&date=${selectedDate}`)
      .then(r=>r.json())
      .then(d => { setDayData(d); setLoadingDay(false); });
  }, [dentistId, selectedDate]);

  // ── Auto-scroll slider to today (or first available day) ─────────────────
  useEffect(() => {
    if (!sliderRef.current || !dentistId) return;
    const el = sliderRef.current;
    // Scroll to today if it's in this month
    if (jYear === todayJ[0] && jMonth === todayJ[1]) {
      const dayCard = el.children[todayJ[2] - 1] as HTMLElement;
      if (dayCard) dayCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    } else {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [jYear, jMonth, dentistId, todayJ]);

  // ── Clinic select ─────────────────────────────────────────────────────────
  const selectDentist = (d: DentistInfo) => {
    setDentistId(d.id); setDentist(d); setShowSearch(false);
    setSearchQuery(""); setSearchResults([]);
    setSelectedDate(null); setDayData(null); setSelectedSlot(null);
    setMonthData({});
  };

  // ── Month navigation ──────────────────────────────────────────────────────
  const prevMonth = () => {
    setSelectedDate(null); setDayData(null); setSelectedSlot(null);
    if (jMonth===1) { setJYear(y=>y-1); setJMonth(12); }
    else setJMonth(m=>m-1);
  };
  const nextMonth = () => {
    setSelectedDate(null); setDayData(null); setSelectedSlot(null);
    if (jMonth===12) { setJYear(y=>y+1); setJMonth(1); }
    else setJMonth(m=>m+1);
  };

  const canPrevMonth = !(jYear===todayJ[0] && jMonth===todayJ[1]);

  // ── Day helpers ───────────────────────────────────────────────────────────
  const getDayGreg = (jd: number) => {
    const [gy,gm,gd] = jalaliToGreg(jYear, jMonth, jd);
    return gregStr(gy,gm,gd);
  };
  const dayHasSlots = (jd: number) => {
    const ds = getDayGreg(jd);
    return (monthData[ds]?.some(s => !s.booked)) ?? false;
  };
  const isDayPast = (jd: number) => getDayGreg(jd) < todayGreg;
  const isDayFriday = (jd: number) => jalaliWeekday(jYear, jMonth, jd) === 6;
  const isDayDisabled = (jd: number) => isDayPast(jd) || isDayFriday(jd) || !dayHasSlots(jd);

  const selectDay = (jd: number) => {
    if (isDayDisabled(jd)) return;
    setSelectedDate(getDayGreg(jd));
    setSelectedSlot(null);
  };

  // ── Time slots ────────────────────────────────────────────────────────────
  const availableSlots = dayData?.slots ?? [];
  const morningSlots = availableSlots.filter(s => parseInt(s.time) < 13);
  const eveningSlots = availableSlots.filter(s => parseInt(s.time) >= 13);

  // ── Booking ───────────────────────────────────────────────────────────────
  const submitBooking = async () => {
    if (!selectedSlot || !patientName.trim() || !patientPhone.trim()) {
      setBookError("لطفاً نام و شماره موبایل را پر کنید"); return;
    }
    setBooking(true); setBookError("");
    const res = await fetch("/api/reserve/book", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dentistId, date: selectedDate, time: selectedSlot, patientName: patientName.trim(), patientPhone: patientPhone.trim(), notes: notes.trim() || null }),
    });
    const data = await res.json();
    setBooking(false);
    if (!res.ok) { setBookError(data.error || "خطا در ثبت نوبت"); return; }
    setSuccess({ trackCode: data.trackCode, date: selectedDate!, time: selectedSlot });
    setPatientName(""); setPatientPhone(""); setNotes(""); setSelectedSlot(null);
    // Refresh day slots
    const r2 = await fetch(`/api/reserve/slots?dentistId=${dentistId}&date=${selectedDate}`);
    setDayData(await r2.json());
    // Refresh month data
    const { from, to } = jMonthRange();
    const r3 = await fetch(`/api/reserve/slots?dentistId=${dentistId}&from=${from}&to=${to}`);
    const md: DayData[] = await r3.json();
    const map: Record<string,SlotInfo[]> = {};
    if (Array.isArray(md)) md.forEach(d => { map[d.date] = d.slots; });
    setMonthData(map);
  };

  const submitCancel = async () => {
    if (!cancelCode.trim()) return;
    const res = await fetch(`/api/reserve/cancel/${cancelCode.trim()}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { setCancelResult("ok"); setCancelMsg("نوبت شما با موفقیت لغو شد."); }
    else { setCancelResult("err"); setCancelMsg(data.error || "کد پیگیری اشتباه است"); }
  };

  // ── Derived display ───────────────────────────────────────────────────────
  const selJalali = selectedDate ? gregToJalali(...(selectedDate.split("-").map(Number) as [number,number,number])) : null;
  const selLabel = selJalali ? `${J_WEEKDAYS_FULL[jalaliWeekday(...selJalali)]} ${toFa(selJalali[2])} ${J_MONTHS[selJalali[1]-1]}` : "—";
  const step1Done = !!selectedDate;
  const step2Done = !!selectedSlot;
  const daysInMonth = jDaysInMonth(jYear, jMonth);
  const firstLetter = dentist ? dentist.title.trim()[0] : "?";

  const displayResults = searchQuery.trim().length >= 2 ? searchResults : defaultResults;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ direction:"rtl", fontFamily:"inherit", minHeight:"100vh", background:"#f4f9fb", paddingBottom:90 }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ background:"linear-gradient(135deg,#0e4d63,#0a2f3e)", color:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-90, left:-60, width:320, height:320, background:"radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1080, margin:"0 auto", padding:"40px 20px 36px", position:"relative" }}>
          <nav style={{ fontSize:13, color:"#8fb6c0", marginBottom:14 }}>
            <Link href="/" style={{ color:"#8fb6c0", textDecoration:"none" }}>خانه</Link> › رزرو نوبت
          </nav>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <h1 style={{ margin:"0 0 10px", fontSize:"clamp(26px,4vw,40px)", fontWeight:800 }}>رزرو آنلاین نوبت</h1>
              <p style={{ margin:0, maxWidth:560, fontSize:15.5, lineHeight:1.95, color:"#c4dde4" }}>روز و ساعت مناسب خود را انتخاب کنید و در کمتر از یک دقیقه نوبت ثبت کنید.</p>
            </div>
            <button onClick={() => { setShowCancel(true); setCancelResult(null); setCancelCode(""); setCancelMsg(""); }} style={{ marginTop:8, border:"1px solid rgba(255,255,255,.25)", borderRadius:12, padding:"10px 18px", fontSize:13.5, fontFamily:"inherit", cursor:"pointer", background:"rgba(255,255,255,.1)", color:"#c4dde4", fontWeight:600, backdropFilter:"blur(4px)", flexShrink:0 }}>
              لغو نوبت با کد پیگیری
            </button>
          </div>
        </div>
      </section>

      {/* ── Step progress ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"22px 20px 4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {[
            { n:"۱", title:"انتخاب روز", done:step1Done, active:true },
            { n:"۲", title:"انتخاب ساعت", done:step2Done, active:step1Done },
            { n:"۳", title:"تأیید", done:false, active:step2Done },
          ].map((s,i,arr) => {
            const dotStyle: React.CSSProperties = {
              width:30, height:30, borderRadius:"50%", display:"grid", placeItems:"center",
              fontSize:14, fontWeight:700, flexShrink:0,
              background: s.done ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : s.active ? "#eef7fa" : "#eef1f3",
              color: s.done ? "#fff" : s.active ? "#0c8aa6" : "#9bb6bf",
              border: (!s.done && s.active) ? "2px solid #15b8d1" : "none",
            };
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, flex: i<arr.length-1 ? "1 1 auto" : "0 0 auto" }}>
                <span style={dotStyle}>
                  {s.done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : s.n}
                </span>
                <span style={{ fontSize:13.5, fontWeight:700, color:s.active?"#143945":"#9bb6bf", whiteSpace:"nowrap" }}>{s.title}</span>
                {i < arr.length-1 && <span style={{ flex:1, height:2, background:s.done?"#15b8d1":"#e1e7ea", borderRadius:2, minWidth:14 }} />}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <section style={{ maxWidth:1080, margin:"0 auto", padding:"18px 20px" }}>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>

          {/* LEFT column */}
          <div style={{ flex:"1 1 460px", minWidth:300, display:"flex", flexDirection:"column", gap:18 }}>

            {/* ── Clinic card / Search ─────────────────────────────────── */}
            {showSearch ? (
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"20px", boxShadow:"0 14px 34px -30px rgba(13,75,107,.5)" }}>
                <div style={{ fontWeight:700, fontSize:16, color:"#143945", marginBottom:12 }}>انتخاب کلینیک یا دندانپزشک</div>
                <input
                  type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  placeholder="نام کلینیک یا دندانپزشک را بنویسید…"
                  autoFocus
                  style={{ width:"100%", border:"1.5px solid #dceaef", borderRadius:13, padding:"12px 15px", fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"#f7fbfc" }}
                />
                {loadingSearch && <div style={{ textAlign:"center", color:"#9bb6bf", padding:"16px 0", fontSize:13 }}>در حال جستجو…</div>}
                {displayResults.length > 0 && (
                  <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                    {displayResults.map(d => (
                      <button key={d.id} onClick={() => selectDentist(d)} style={{ border:"1px solid #e7f0f3", borderRadius:14, padding:"13px 15px", textAlign:"right", fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", display:"flex", alignItems:"center", gap:12, transition:"background .15s" }}>
                        <span style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#16b8d1,#0a6f9e)", display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:18, flexShrink:0 }}>
                          {d.title.trim()[0]}
                        </span>
                        <div style={{ flex:1, minWidth:0, textAlign:"right" }}>
                          <div style={{ fontWeight:700, fontSize:15, color:"#133b48" }}>{d.title}</div>
                          {d.address && <div style={{ fontSize:13, color:"#8aabb5", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.address}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !loadingSearch && searchResults.length === 0 && (
                  <div style={{ textAlign:"center", color:"#9bb6bf", padding:"20px 0", fontSize:14 }}>کلینیکی با نوبت‌دهی فعال یافت نشد</div>
                )}
                {dentist && (
                  <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} style={{ marginTop:12, border:"1px solid #dceaef", borderRadius:11, padding:"9px 16px", fontSize:13, fontFamily:"inherit", cursor:"pointer", background:"#f4f9fb", color:"#6c8b95" }}>
                    بازگشت به {dentist.title}
                  </button>
                )}
              </div>
            ) : dentist ? (
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:16, boxShadow:"0 14px 34px -30px rgba(13,75,107,.5)", display:"flex", alignItems:"center", gap:14 }}>
                <span style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#16b8d1,#0a6f9e)", display:"grid", placeItems:"center", color:"#fff", fontWeight:800, fontSize:22, flexShrink:0 }}>
                  {firstLetter}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:"#143945" }}>{dentist.title}</div>
                  {dentist.address && <div style={{ fontSize:13, color:"#6c8b95", marginTop:2 }}>{dentist.address}</div>}
                </div>
                <button onClick={() => setShowSearch(true)} style={{ fontSize:13, color:"#0c8aa6", fontWeight:600, background:"none", border:"none", cursor:"pointer", flexShrink:0, padding:"4px 0" }}>
                  تغییر
                </button>
              </div>
            ) : (
              <div style={{ background:"#fff", border:"2px dashed #dceaef", borderRadius:20, padding:"40px 24px", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🏥</div>
                <div style={{ fontWeight:700, fontSize:16, color:"#133b48", marginBottom:6 }}>کلینیک یا دندانپزشک را انتخاب کنید</div>
                <button onClick={() => setShowSearch(true)} style={{ marginTop:8, background:"linear-gradient(135deg,#15b8d1,#0a6f9e)", color:"#fff", border:"none", borderRadius:12, padding:"11px 24px", fontSize:14, fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>
                  جستجو و انتخاب
                </button>
              </div>
            )}

            {/* ── Calendar (day slider) ───────────────────────────────── */}
            {dentist && (
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:22, padding:20, boxShadow:"0 14px 34px -30px rgba(13,75,107,.5)" }}>
                {/* Month nav */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                  <button onClick={prevMonth} disabled={!canPrevMonth} style={{ width:42, height:42, border:`1px solid ${canPrevMonth?"#d7e6ea":"#eef1f3"}`, background:"#fff", borderRadius:13, display:"grid", placeItems:"center", cursor:canPrevMonth?"pointer":"not-allowed", color:canPrevMonth?"#0c8aa6":"#cdd5d8" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18"/></svg>
                  </button>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:17, fontWeight:800, color:"#133b48" }}>{J_MONTHS[jMonth-1]} {toFa(jYear)}</div>
                    <div style={{ fontSize:12, color:"#8aa6af", marginTop:1 }}>یک روز را انتخاب کنید</div>
                  </div>
                  <button onClick={nextMonth} style={{ width:42, height:42, border:"1px solid #d7e6ea", background:"#fff", borderRadius:13, display:"grid", placeItems:"center", cursor:"pointer", color:"#0c8aa6" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>
                  </button>
                </div>

                {/* Day slider */}
                <div ref={sliderRef} className="ih-hide-scroll" style={{ display:"flex", gap:10, overflowX:"auto", padding:"2px 2px 8px", scrollSnapType:"x proximity" }}>
                  {Array.from({length:daysInMonth},(_,i)=>i+1).map(jd => {
                    const ds = getDayGreg(jd);
                    const isSelected = ds === selectedDate;
                    const past = isDayPast(jd);
                    const friday = isDayFriday(jd);
                    const hasSlots = dayHasSlots(jd);
                    const disabled = past || friday || !hasSlots;
                    const weekdayName = J_WEEKDAYS_FULL[jalaliWeekday(jYear, jMonth, jd)];
                    const weekShort = weekdayName.slice(0,2);

                    let bg = "#fff", border = "1px solid #e2eef2", weekCol = "#8aa6af", numCol = "#143945", monCol = "#9bb6bf", shadow = "none", transform = "none";
                    if (isSelected) {
                      bg = "linear-gradient(160deg,#16b8d1,#0a6f9e)";
                      border = "1px solid transparent";
                      weekCol = "rgba(255,255,255,.85)"; numCol = "#fff"; monCol = "rgba(255,255,255,.8)";
                      shadow = "0 12px 24px -12px rgba(13,120,168,.7)"; transform = "translateY(-2px)";
                    } else if (disabled) {
                      bg = "#f4f6f7"; border = "1px solid #eef1f3";
                      weekCol = "#c4cdd1"; numCol = "#c4cdd1"; monCol = "#cdd5d8";
                    }

                    return (
                      <button key={jd} onClick={() => selectDay(jd)} disabled={disabled}
                        style={{ scrollSnapAlign:"center", flexShrink:0, width:74, minHeight:92, border, background:bg, borderRadius:16, padding:"12px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:5, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", transition:"all .2s", boxShadow:shadow, transform, position:"relative" }}>
                        <span style={{ fontSize:12, fontWeight:600, color:weekCol }}>{weekShort}</span>
                        <span style={{ fontSize:22, fontWeight:800, color:numCol, lineHeight:1 }}>{toFa(jd)}</span>
                        <span style={{ fontSize:11, color:monCol }}>{J_MONTHS_SHORT[jMonth-1]}</span>
                        {isSelected && <span style={{ width:5, height:5, borderRadius:"50%", background:"#fff", marginTop:1 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Time slots ─────────────────────────────────────────── */}
            {dentist && selectedDate && (
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:22, padding:22, boxShadow:"0 14px 34px -30px rgba(13,75,107,.5)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:"#133b48" }}>انتخاب ساعت</div>
                  <div style={{ fontSize:13, color:"#0c8aa6", fontWeight:600 }}>{selLabel}</div>
                </div>

                {/* Legend */}
                <div style={{ display:"flex", gap:16, margin:"12px 0 18px", flexWrap:"wrap" }}>
                  {[
                    { label:"آزاد", style:{ background:"#fff", border:"1px solid #cfe0e5" } },
                    { label:"انتخاب شده", style:{ background:"linear-gradient(135deg,#15b8d1,#0a6f9e)" } },
                    { label:"رزرو شده", style:{ background:"#eef1f3", border:"1px solid #e1e7ea" } },
                  ].map(l => (
                    <span key={l.label} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"#6c8b95" }}>
                      <span style={{ width:13, height:13, borderRadius:5, flexShrink:0, ...l.style }} />{l.label}
                    </span>
                  ))}
                </div>

                {loadingDay ? (
                  <div style={{ textAlign:"center", color:"#9bb6bf", padding:"32px 0" }}>در حال بارگذاری…</div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ textAlign:"center", color:"#9bb6bf", padding:"32px 0", fontSize:14 }}>نوبت آزادی برای این روز وجود ندارد</div>
                ) : (
                  <>
                    {morningSlots.length > 0 && (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
                          <span style={{ width:34, height:34, borderRadius:11, background:"#fff6e6", display:"grid", placeItems:"center", color:"#f5a623" }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
                          </span>
                          <span style={{ fontSize:15, fontWeight:700, color:"#143945" }}>نوبت صبح</span>
                          <span style={{ fontSize:12, color:"#9bb6bf" }}>تا ساعت ۱۳:۰۰</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(92px,1fr))", gap:10, marginBottom:24 }}>
                          {morningSlots.map(s => {
                            const active = selectedSlot === s.time;
                            let slotStyle: React.CSSProperties;
                            if (s.booked) slotStyle = { background:"#eef1f3", border:"1px solid #e1e7ea", color:"#b4c0c4", cursor:"not-allowed", textDecoration:"line-through" };
                            else if (active) slotStyle = { background:"linear-gradient(135deg,#15b8d1,#0a6f9e)", border:"1px solid transparent", color:"#fff", boxShadow:"0 10px 20px -10px rgba(13,120,168,.7)", transform:"translateY(-1px)" };
                            else slotStyle = { background:"#fff", border:"1px solid #d7e6ea", color:"#2a4f5b", cursor:"pointer" };
                            return (
                              <button key={s.time} onClick={() => !s.booked && setSelectedSlot(active?null:s.time)} disabled={s.booked}
                                style={{ padding:"12px 4px", borderRadius:12, fontFamily:"inherit", fontWeight:700, fontSize:14.5, letterSpacing:.5, transition:"all .18s", ...slotStyle }}>
                                {toFa(s.time)}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {eveningSlots.length > 0 && (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}>
                          <span style={{ width:34, height:34, borderRadius:11, background:"#eef0fb", display:"grid", placeItems:"center", color:"#6366f1" }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
                          </span>
                          <span style={{ fontSize:15, fontWeight:700, color:"#143945" }}>نوبت عصر</span>
                          <span style={{ fontSize:12, color:"#9bb6bf" }}>از ساعت ۱۳:۰۰</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(92px,1fr))", gap:10 }}>
                          {eveningSlots.map(s => {
                            const active = selectedSlot === s.time;
                            let slotStyle: React.CSSProperties;
                            if (s.booked) slotStyle = { background:"#eef1f3", border:"1px solid #e1e7ea", color:"#b4c0c4", cursor:"not-allowed", textDecoration:"line-through" };
                            else if (active) slotStyle = { background:"linear-gradient(135deg,#15b8d1,#0a6f9e)", border:"1px solid transparent", color:"#fff", boxShadow:"0 10px 20px -10px rgba(13,120,168,.7)", transform:"translateY(-1px)" };
                            else slotStyle = { background:"#fff", border:"1px solid #d7e6ea", color:"#2a4f5b", cursor:"pointer" };
                            return (
                              <button key={s.time} onClick={() => !s.booked && setSelectedSlot(active?null:s.time)} disabled={s.booked}
                                style={{ padding:"12px 4px", borderRadius:12, fontFamily:"inherit", fontWeight:700, fontSize:14.5, letterSpacing:.5, transition:"all .18s", ...slotStyle }}>
                                {toFa(s.time)}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Patient form ────────────────────────────────────────── */}
            {dentist && selectedDate && (
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:22, padding:22, boxShadow:"0 14px 34px -30px rgba(13,75,107,.5)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#133b48", marginBottom:16 }}>اطلاعات تماس</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:14 }}>
                  <div>
                    <label style={{ display:"block", fontSize:13, color:"#6c8b95", marginBottom:7 }}>نام و نام خانوادگی</label>
                    <input type="text" value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="مثلاً علی محمدی"
                      style={{ width:"100%", border:"1px solid #dceaef", background:"#f7fbfc", borderRadius:13, padding:"13px 15px", fontFamily:"inherit", fontSize:14.5, color:"#143945", outline:"none", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:13, color:"#6c8b95", marginBottom:7 }}>شماره موبایل</label>
                    <input type="tel" value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" dir="ltr"
                      style={{ width:"100%", border:"1px solid #dceaef", background:"#f7fbfc", borderRadius:13, padding:"13px 15px", fontFamily:"inherit", fontSize:14.5, color:"#143945", outline:"none", boxSizing:"border-box", textAlign:"right" }} />
                  </div>
                </div>
                <div style={{ marginTop:14 }}>
                  <label style={{ display:"block", fontSize:13, color:"#6c8b95", marginBottom:7 }}>توضیحات (اختیاری)</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="اگر نکته‌ای درباره نوبت دارید بنویسید…"
                    style={{ width:"100%", minHeight:76, resize:"vertical", border:"1px solid #dceaef", background:"#f7fbfc", borderRadius:13, padding:"13px 15px", fontFamily:"inherit", fontSize:14.5, color:"#143945", outline:"none", boxSizing:"border-box" }} />
                </div>
                {bookError && <div style={{ marginTop:10, color:"#ef4444", fontSize:13.5, fontWeight:600 }}>{bookError}</div>}
              </div>
            )}
          </div>

          {/* RIGHT: summary sidebar */}
          <aside style={{ flex:"1 1 280px", minWidth:270, position:"sticky", top:88, alignSelf:"flex-start" }}>
            <div style={{ background:"linear-gradient(155deg,#0e4d63,#0a2f3e)", borderRadius:22, padding:24, color:"#fff", boxShadow:"0 20px 44px -28px rgba(13,75,107,.7)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-60, left:-40, width:200, height:200, background:"radial-gradient(circle, rgba(21,184,209,.3), transparent 70%)", pointerEvents:"none" }} />
              <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:800, position:"relative" }}>خلاصه نوبت</h3>
              <div style={{ position:"relative", display:"flex", flexDirection:"column", gap:2 }}>
                {[
                  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>, label:"تاریخ", value:step1Done ? selLabel : "—" },
                  { icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 1.5"/></svg>, label:"ساعت", value:step2Done ? toFa(selectedSlot!) : "—" },
                ].map((row,i,arr) => (
                  <div key={row.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 0", borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,.1)":"none" }}>
                    <span style={{ width:38, height:38, borderRadius:11, background:"rgba(255,255,255,.1)", display:"grid", placeItems:"center", color:"#7fd4e6", flexShrink:0 }}>{row.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"#9fc2cc" }}>{row.label}</div>
                      <div style={{ fontSize:14.5, fontWeight:700 }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm button */}
              {(() => {
                const ready = step1Done && step2Done && patientName.trim() && patientPhone.trim();
                return (
                  <button onClick={ready && !booking ? submitBooking : undefined} disabled={!!(!ready || booking)}
                    style={{ width:"100%", marginTop:22, border:"none", fontFamily:"inherit", fontWeight:800, fontSize:15.5, padding:15, borderRadius:15, position:"relative", transition:"all .2s", cursor:ready&&!booking?"pointer":"not-allowed", background:ready?"#fff":"rgba(255,255,255,.15)", color:ready?"#0b5e7a":"rgba(255,255,255,.6)", boxShadow:ready?"0 12px 26px -12px rgba(0,0,0,.5)":"none" }}>
                    {booking ? "در حال ثبت…" : !step1Done ? "یک روز انتخاب کنید" : !step2Done ? "یک ساعت انتخاب کنید" : !patientName.trim()||!patientPhone.trim() ? "اطلاعات تماس را وارد کنید" : "ثبت نهایی نوبت"}
                  </button>
                );
              })()}
              <p style={{ margin:"12px 0 0", fontSize:12, color:"#9fc2cc", textAlign:"center", lineHeight:1.8, position:"relative" }}>با ثبت نوبت، قوانین سایت را می‌پذیرید.</p>
            </div>
          </aside>

        </div>
      </section>

      {/* ── Success modal ─────────────────────────────────────────────────── */}
      {success && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(8,28,36,.6)", backdropFilter:"blur(4px)", display:"grid", placeItems:"center", padding:20, direction:"rtl", fontFamily:"inherit", animation:"ih-fade-up .25s ease" }}>
          <div style={{ background:"#fff", borderRadius:26, padding:"36px 28px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 30px 70px -20px rgba(0,0,0,.4)", animation:"ih-pop .3s cubic-bezier(.22,1,.36,1)" }}>
            <span style={{ width:84, height:84, borderRadius:"50%", background:"linear-gradient(135deg,#16b8d1,#0a6f9e)", display:"grid", placeItems:"center", margin:"0 auto 22px", boxShadow:"0 14px 30px -10px rgba(13,120,168,.6)" }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" style={{ strokeDasharray:36, animation:"ih-check .5s .15s ease forwards" }} />
              </svg>
            </span>
            <h2 style={{ margin:"0 0 10px", fontSize:22, fontWeight:800, color:"#133b48" }}>نوبت شما ثبت شد!</h2>
            <p style={{ margin:"0 0 20px", fontSize:14.5, lineHeight:1.95, color:"#6c8b95" }}>کد پیگیری زیر را برای لغو نوبت نزد خود نگه دارید.</p>
            <div style={{ background:"#f4f9fb", border:"1px solid #e7f0f3", borderRadius:16, padding:16, marginBottom:22, textAlign:"right" }}>
              {[
                { label:"تاریخ", val:selLabel },
                { label:"ساعت", val:toFa(success.time) },
                { label:"کد پیگیری", val:success.trackCode, mono:true },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14 }}>
                  <span style={{ color:"#8aa6af" }}>{r.label}</span>
                  <span style={{ fontWeight:700, color:r.mono?"#0c8aa6":"#143945", fontFamily:r.mono?"ui-monospace,monospace":"inherit" }}>{r.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSuccess(null)} style={{ width:"100%", background:"linear-gradient(135deg,#15b8d1,#0a6f9e)", color:"#fff", border:"none", fontFamily:"inherit", fontWeight:700, fontSize:15, padding:14, borderRadius:14, cursor:"pointer" }}>
              باشه، متوجه شدم
            </button>
          </div>
        </div>
      )}

      {/* ── Cancel modal ──────────────────────────────────────────────────── */}
      {showCancel && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(8,28,36,.6)", backdropFilter:"blur(4px)", display:"grid", placeItems:"center", padding:20, direction:"rtl", fontFamily:"inherit" }}>
          <div style={{ background:"#fff", borderRadius:24, padding:32, maxWidth:400, width:"100%", boxShadow:"0 30px 70px -20px rgba(0,0,0,.3)" }}>
            <div style={{ fontWeight:800, fontSize:20, color:"#133b48", marginBottom:16 }}>لغو نوبت</div>
            {cancelResult === "ok" ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700, color:"#133b48", marginBottom:6 }}>{cancelMsg}</div>
                <button onClick={() => setShowCancel(false)} style={{ marginTop:12, background:"#eef7fa", color:"#0c8aa6", border:"none", borderRadius:12, padding:"10px 24px", fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>
                  بستن
                </button>
              </div>
            ) : (
              <>
                <p style={{ fontSize:14, color:"#6c8b95", marginBottom:16 }}>کد پیگیری را که هنگام رزرو دریافت کردید وارد کنید:</p>
                <input type="text" value={cancelCode} onChange={e=>setCancelCode(e.target.value.toUpperCase())} placeholder="مثلاً: DNABC123" dir="ltr"
                  style={{ width:"100%", border:"2px solid #dceaef", borderRadius:12, padding:"12px 14px", fontSize:16, fontFamily:"inherit", outline:"none", letterSpacing:2, boxSizing:"border-box", textAlign:"center" }} />
                {cancelResult === "err" && <div style={{ color:"#ef4444", fontSize:13, marginTop:8 }}>{cancelMsg}</div>}
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={() => setShowCancel(false)} style={{ flex:1, border:"1px solid #dceaef", borderRadius:12, padding:11, fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", color:"#6c8b95", fontSize:14, fontWeight:600 }}>انصراف</button>
                  <button onClick={submitCancel} style={{ flex:1, background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:11, fontFamily:"inherit", cursor:"pointer", color:"#c0392b", fontSize:14, fontWeight:700 }}>لغو نوبت</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .ih-hide-scroll::-webkit-scrollbar { display: none; }
        .ih-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ih-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ih-pop { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes ih-check { from { stroke-dashoffset: 36; } to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

export default function ReservePage() {
  return (
    <Suspense>
      <ReserveInner />
    </Suspense>
  );
}
