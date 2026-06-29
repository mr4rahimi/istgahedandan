"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

// ─── Jalali helpers ─────────────────────────────────────────────────────────
const J_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const J_WEEKDAYS_SHORT = ["ش","ی","د","س","چ","پ","ج"];
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
  let i=0; for(;i<11&&jdn>=j_days[i];++i) jdn -= j_days[i];
  return [jy, i+1, jdn+1];
}

function jalaliToGreg(jy: number, jm: number, jd: number): [number, number, number] {
  const jdays = [31,31,31,31,31,31,30,30,30,30,30,29];
  jy -= 979; jm -= 1;
  let jdn = 365*jy + Math.floor(jy/33)*8 + Math.floor(((jy%33)+3)/4);
  for(let i=0;i<jm;++i) jdn += jdays[i];
  jdn += jd - 1;
  let gdn = jdn + 79;
  let gy = 1600 + 400*Math.floor(gdn/146097); gdn %= 146097;
  let leap = true;
  if (gdn >= 36525) { gdn--; gy += 100*Math.floor(gdn/36524); gdn %= 36524; if(gdn>=365) gdn++; else leap=false; }
  gy += 4*Math.floor(gdn/1461); gdn %= 1461;
  if (gdn >= 366) { leap=false; gdn--; gy += Math.floor(gdn/365); gdn %= 365; }
  const gdays = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  let gm=0; for(;gm<12&&gdn>=gdays[gm];gm++) gdn -= gdays[gm];
  return [gy, gm+1, gdn+1];
}

function gregStr(gy:number,gm:number,gd:number) { return `${gy}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`; }
function jDaysInMonth(jy:number,jm:number) {
  if(jm<=6) return 31; if(jm<=11) return 30;
  const leap=(jy%33)===1||(jy%33)===5||(jy%33)===9||(jy%33)===13||(jy%33)===17||(jy%33)===22||(jy%33)===26||(jy%33)===30;
  return leap?30:29;
}
function jalaliWeekday(jy:number,jm:number,jd:number) {
  const [gy,gm,gd]=jalaliToGreg(jy,jm,jd);
  return (new Date(gy,gm-1,gd).getDay()+1)%7; // 0=شنبه
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface SlotInfo { time: string; booked: boolean }
interface DayData { date: string; slots: SlotInfo[]; slotDuration: number }
interface DentistInfo { id: number; slug: string; title: string; address: string | null; phones: string[]; featuredImage: string | null; workingHours: string | null }

// ─── Inner component (uses useSearchParams) ──────────────────────────────────
function ReserveInner() {
  const searchParams = useSearchParams();
  const paramDentistId = searchParams.get("dentistId");
  const paramSlug = searchParams.get("slug");

  const now = new Date();
  const todayGreg = gregStr(now.getFullYear(), now.getMonth()+1, now.getDate());
  const [todayJ] = useState(() => gregToJalali(now.getFullYear(), now.getMonth()+1, now.getDate()));

  // Dentist selector state
  const [dentistId, setDentistId] = useState<number | null>(paramDentistId ? parseInt(paramDentistId) : null);
  const [dentist, setDentist] = useState<DentistInfo | null>(null);
  const [dentistSearch, setDentistSearch] = useState("");
  const [dentistResults, setDentistResults] = useState<DentistInfo[]>([]);
  const [searchOpen, setSearchOpen] = useState(!paramDentistId && !paramSlug);

  // Calendar state
  const [jYear, setJYear] = useState(todayJ[0]);
  const [jMonth, setJMonth] = useState(todayJ[1]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking form
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  // Modals
  const [successModal, setSuccessModal] = useState<{ trackCode: string; date: string; time: string } | null>(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelCode, setCancelCode] = useState("");
  const [cancelResult, setCancelResult] = useState<"ok" | "err" | null>(null);
  const [cancelMsg, setCancelMsg] = useState("");

  // Resolve slug to id
  useEffect(() => {
    if (paramSlug && !paramDentistId) {
      fetch(`/api/reserve/dentist-by-slug/${paramSlug}`).then(r=>r.json()).then(d => {
        if (d.id) { setDentistId(d.id); setDentist(d); setSearchOpen(false); }
      });
    }
  }, [paramSlug, paramDentistId]);

  // Load dentist info
  useEffect(() => {
    if (!dentistId) return;
    fetch(`/api/reserve/dentist/${dentistId}`).then(r=>r.json()).then(d => {
      if (!d.error) setDentist(d);
    });
  }, [dentistId]);

  // Greg month string from current jalali month
  const gregMonthStr = useCallback(() => {
    const [gy,gm] = jalaliToGreg(jYear, jMonth, 1);
    return `${gy}-${String(gm).padStart(2,"0")}`;
  }, [jYear, jMonth]);

  // Load month schedule
  useEffect(() => {
    if (!dentistId) return;
    const mo = gregMonthStr();
    fetch(`/api/reserve/slots?dentistId=${dentistId}&month=${mo}`).then(r=>r.json()).then((data: DayData[]) => {
      setMonthData(Array.isArray(data) ? data : []);
    });
  }, [dentistId, gregMonthStr]);

  // Load day slots
  useEffect(() => {
    if (!dentistId || !selectedDate) return;
    setLoadingSlots(true); setSelectedSlot(null);
    fetch(`/api/reserve/slots?dentistId=${dentistId}&date=${selectedDate}`).then(r=>r.json()).then(d => {
      setDayData(d); setLoadingSlots(false);
    });
  }, [dentistId, selectedDate]);

  // Dentist search
  useEffect(() => {
    if (!dentistSearch.trim() || dentistSearch.length < 2) { setDentistResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/reserve/search-dentist?q=${encodeURIComponent(dentistSearch)}`);
      const d = await res.json();
      setDentistResults(d.results || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [dentistSearch]);

  const prevMonth = () => { if(jMonth===1){setJYear(y=>y-1);setJMonth(12);}else setJMonth(m=>m-1); };
  const nextMonth = () => { if(jMonth===12){setJYear(y=>y+1);setJMonth(1);}else setJMonth(m=>m+1); };

  const daysInMonth = jDaysInMonth(jYear, jMonth);
  const firstWd = jalaliWeekday(jYear, jMonth, 1);

  const dayHasSlots = (jd: number) => {
    const [gy,gm,gd] = jalaliToGreg(jYear, jMonth, jd);
    const ds = gregStr(gy,gm,gd);
    const day = monthData.find(d => d.date === ds);
    return day && day.slots.some(s => !s.booked);
  };

  const selectDay = (jd: number) => {
    const [gy,gm,gd] = jalaliToGreg(jYear, jMonth, jd);
    setSelectedDate(gregStr(gy,gm,gd));
  };

  const submitBooking = async () => {
    if (!selectedSlot || !patientName.trim() || !patientPhone.trim()) {
      setBookError("لطفاً تمام فیلدها را پر کنید"); return;
    }
    setBooking(true); setBookError("");
    const res = await fetch("/api/reserve/book", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dentistId, date: selectedDate, time: selectedSlot, patientName: patientName.trim(), patientPhone: patientPhone.trim(), notes: notes.trim() || null }),
    });
    const data = await res.json();
    setBooking(false);
    if (!res.ok) { setBookError(data.error || "خطا در رزرو"); return; }
    setSuccessModal({ trackCode: data.trackCode, date: selectedDate!, time: selectedSlot });
    setPatientName(""); setPatientPhone(""); setNotes(""); setSelectedSlot(null);
    // Reload day data
    const r2 = await fetch(`/api/reserve/slots?dentistId=${dentistId}&date=${selectedDate}`);
    setDayData(await r2.json());
  };

  const submitCancel = async () => {
    if (!cancelCode.trim()) return;
    const res = await fetch(`/api/reserve/cancel/${cancelCode.trim()}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { setCancelResult("ok"); setCancelMsg("نوبت شما با موفقیت لغو شد."); }
    else { setCancelResult("err"); setCancelMsg(data.error || "خطا در لغو نوبت"); }
  };

  // Day display info
  const selJalali = selectedDate ? gregToJalali(...(selectedDate.split("-").map(Number) as [number,number,number])) : null;
  const selLabel = selJalali ? `${J_WEEKDAYS_FULL[jalaliWeekday(...selJalali)]} ${toFa(selJalali[2])} ${J_MONTHS[selJalali[1]-1]}` : "";

  const availableSlots = dayData?.slots.filter(s => !s.booked) ?? [];
  const morningSlots = availableSlots.filter(s => parseInt(s.time) < 13);
  const afternoonSlots = availableSlots.filter(s => parseInt(s.time) >= 13 && parseInt(s.time) < 18);
  const eveningSlots = availableSlots.filter(s => parseInt(s.time) >= 18);
  const slotGroups = [
    { label: "صبح", icon: "☀️", slots: morningSlots },
    { label: "بعدازظهر", icon: "🌤", slots: afternoonSlots },
    { label: "شب", icon: "🌙", slots: eveningSlots },
  ].filter(g => g.slots.length > 0);

  const cells = [...Array(firstWd).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ direction:"rtl", fontFamily:"inherit", minHeight:"100vh", background:"linear-gradient(160deg,#f0f8fb 0%,#e8f4f8 100%)" }}>
      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e7f0f3", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
            <Image src="/assets/logo.webp" alt="ایستگاه دندان" width={38} height={38} style={{objectFit:"contain"}} />
            <span style={{ fontWeight:800, fontSize:17, color:"#133b48" }}>ایستگاه دندان</span>
          </a>
          <span style={{ fontSize:14, color:"#9bb6bf" }}>·</span>
          <span style={{ fontSize:15, fontWeight:700, color:"#0c8aa6" }}>رزرو آنلاین نوبت</span>
        </div>
        <button onClick={() => { setCancelModal(true); setCancelResult(null); setCancelCode(""); setCancelMsg(""); }} style={{ border:"1px solid #dceaef", borderRadius:10, padding:"9px 18px", fontSize:14, fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", color:"#6c8b95", fontWeight:600 }}>
          لغو نوبت با کد پیگیری
        </button>
      </div>

      <div style={{ maxWidth:1040, margin:"0 auto", padding:"clamp(16px,3vw,32px)" }}>

        {/* Dentist selector */}
        {searchOpen && (
          <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"24px", boxShadow:"0 4px 24px -8px rgba(13,75,107,.15)", marginBottom:24 }}>
            <div style={{ fontWeight:800, fontSize:18, color:"#133b48", marginBottom:16 }}>انتخاب دندانپزشک یا کلینیک</div>
            <input
              type="text" value={dentistSearch} onChange={e=>setDentistSearch(e.target.value)}
              placeholder="نام دندانپزشک یا کلینیک را جستجو کنید…"
              style={{ width:"100%", border:"2px solid #dceaef", borderRadius:14, padding:"13px 16px", fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"#f8fbfc" }}
              autoFocus
            />
            {dentistResults.length > 0 && (
              <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                {dentistResults.map(d => (
                  <button key={d.id} onClick={() => { setDentistId(d.id); setDentist(d); setSearchOpen(false); }} style={{ border:"1px solid #e7f0f3", borderRadius:14, padding:"14px 18px", textAlign:"right", fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", display:"flex", alignItems:"center", gap:12 }}>
                    {d.featuredImage && <img src={d.featuredImage} alt="" style={{ width:44, height:44, borderRadius:12, objectFit:"cover" }} />}
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:"#133b48" }}>{d.title}</div>
                      {d.address && <div style={{ fontSize:13, color:"#8aabb5", marginTop:2 }}>{d.address}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {dentistSearch.length >= 2 && dentistResults.length === 0 && (
              <div style={{ marginTop:12, color:"#9bb6bf", fontSize:14 }}>نتیجه‌ای یافت نشد</div>
            )}
          </div>
        )}

        {dentist && (
          <>
            {/* Dentist card */}
            <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"20px 24px", boxShadow:"0 4px 20px -8px rgba(13,75,107,.12)", marginBottom:24, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              {dentist.featuredImage && <img src={dentist.featuredImage} alt={dentist.title} style={{ width:72, height:72, borderRadius:18, objectFit:"cover", flexShrink:0 }} />}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:18, color:"#133b48" }}>{dentist.title}</div>
                {dentist.address && <div style={{ fontSize:13.5, color:"#6c8b95", marginTop:4 }}>{dentist.address}</div>}
                {dentist.phones?.length > 0 && <div style={{ fontSize:13, color:"#0c8aa6", marginTop:4, direction:"ltr", textAlign:"right" }}>{dentist.phones[0]}</div>}
              </div>
              <button onClick={() => { setSearchOpen(true); setDentistId(null); setDentist(null); setSelectedDate(null); setMonthData([]); setDayData(null); }} style={{ border:"1px solid #dceaef", borderRadius:10, padding:"8px 14px", fontSize:13, fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", color:"#6c8b95" }}>
                تغییر
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"minmax(280px,340px) 1fr", gap:20, alignItems:"start" }}>

              {/* Calendar */}
              <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"20px", boxShadow:"0 4px 20px -8px rgba(13,75,107,.12)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <button onClick={prevMonth} style={{ width:36,height:36,border:"1px solid #dceaef",borderRadius:10,background:"#f8fbfc",cursor:"pointer",display:"grid",placeItems:"center",color:"#0c8aa6" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18"/></svg>
                  </button>
                  <span style={{ fontWeight:800, fontSize:16, color:"#133b48" }}>{J_MONTHS[jMonth-1]} {toFa(jYear)}</span>
                  <button onClick={nextMonth} style={{ width:36,height:36,border:"1px solid #dceaef",borderRadius:10,background:"#f8fbfc",cursor:"pointer",display:"grid",placeItems:"center",color:"#0c8aa6" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:6 }}>
                  {J_WEEKDAYS_SHORT.map((w,i) => <div key={i} style={{ textAlign:"center", fontSize:12, fontWeight:700, color:i===6?"#ef4444":"#8aabb5", padding:"4px 0" }}>{w}</div>)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
                  {cells.map((jd, i) => {
                    if (!jd) return <div key={i} />;
                    const [gy,gm,gd] = jalaliToGreg(jYear, jMonth, jd);
                    const ds = gregStr(gy,gm,gd);
                    const isSel = ds === selectedDate;
                    const isPast = ds < todayGreg;
                    const isFriday = jalaliWeekday(jYear, jMonth, jd) === 6;
                    const hasSlots = !isPast && dayHasSlots(jd);
                    return (
                      <button key={i} onClick={() => !isPast && !isFriday && selectDay(jd)} disabled={isPast || isFriday || !hasSlots}
                        title={!hasSlots && !isPast && !isFriday ? "نوبت آزاد ندارد" : undefined}
                        style={{ position:"relative", width:"100%", aspectRatio:"1", border:"none", borderRadius:10, fontSize:13, fontWeight:700, fontFamily:"inherit", cursor:isPast||isFriday||!hasSlots?"not-allowed":"pointer", background:isSel?"linear-gradient(135deg,#0c8aa6,#0a4f63)":hasSlots?"#eef7fa":"transparent", color:isSel?"#fff":isPast||isFriday?"#c5d5da":!hasSlots?"#c5d5da":"#133b48", opacity:isPast?.5:1 }}>
                        {toFa(jd)}
                        {hasSlots && !isSel && <span style={{ position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:"#0c8aa6" }} />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop:14, display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:"#6c8b95" }}><span style={{ width:10,height:10,borderRadius:3,background:"#eef7fa",border:"1px solid #bde0eb" }} />نوبت دارد</span>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:"#6c8b95" }}><span style={{ width:10,height:10,borderRadius:3,background:"transparent",border:"1px solid #dce8ec" }} />ندارد</span>
                </div>
              </div>

              {/* Right panel */}
              <div>
                {!selectedDate ? (
                  <div style={{ background:"#fff", border:"2px dashed #dceaef", borderRadius:20, padding:"60px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
                    <div style={{ fontWeight:700, fontSize:16, color:"#133b48", marginBottom:6 }}>روز مورد نظر خود را انتخاب کنید</div>
                    <div style={{ fontSize:13.5, color:"#9bb6bf" }}>روزهایی که دارای نوبت آزاد هستند با رنگ مشخص شده‌اند</div>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    {/* Slot picker */}
                    <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"22px", boxShadow:"0 4px 20px -8px rgba(13,75,107,.12)" }}>
                      <div style={{ fontWeight:800, fontSize:17, color:"#133b48", marginBottom:4 }}>{selLabel}</div>
                      {loadingSlots ? (
                        <div style={{ padding:40, textAlign:"center", color:"#9bb6bf" }}>در حال بارگذاری…</div>
                      ) : availableSlots.length === 0 ? (
                        <div style={{ padding:32, textAlign:"center", color:"#9bb6bf", fontSize:14 }}>نوبت آزادی برای این روز وجود ندارد</div>
                      ) : (
                        <>
                          <div style={{ fontSize:13, color:"#6c8b95", marginBottom:16 }}>یک ساعت انتخاب کنید</div>
                          {slotGroups.map(g => (
                            <div key={g.label} style={{ marginBottom:18 }}>
                              <div style={{ fontSize:13, fontWeight:700, color:"#8aabb5", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                                <span>{g.icon}</span>{g.label}
                              </div>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:8 }}>
                                {g.slots.map(s => {
                                  const active = selectedSlot === s.time;
                                  return (
                                    <button key={s.time} onClick={() => setSelectedSlot(active ? null : s.time)} style={{ padding:"10px 4px", borderRadius:10, border:active?"none":"1px solid #d7e6ea", background:active?"linear-gradient(135deg,#0c8aa6,#0a4f63)":"#fff", color:active?"#fff":"#2a4f5b", fontFamily:"inherit", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:active?"0 4px 12px -4px rgba(12,138,166,.5)":"none" }}>
                                      {toFa(s.time)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Booking form */}
                    {selectedSlot && (
                      <div style={{ background:"#fff", border:"1px solid #e7f0f3", borderRadius:20, padding:"22px", boxShadow:"0 4px 20px -8px rgba(13,75,107,.12)" }}>
                        <div style={{ fontWeight:800, fontSize:16, color:"#133b48", marginBottom:16 }}>
                          رزرو ساعت {toFa(selectedSlot)} — {selLabel}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                          <label style={{ fontSize:13.5, fontWeight:600, color:"#133b48" }}>
                            نام و نام خانوادگی
                            <input type="text" value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="مثلاً: علی احمدی"
                              style={{ display:"block", width:"100%", marginTop:6, border:"1.5px solid #dceaef", borderRadius:12, padding:"11px 14px", fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                          </label>
                          <label style={{ fontSize:13.5, fontWeight:600, color:"#133b48" }}>
                            شماره موبایل
                            <input type="tel" value={patientPhone} onChange={e=>setPatientPhone(e.target.value)} placeholder="مثلاً: ۰۹۱۲…" dir="ltr"
                              style={{ display:"block", width:"100%", marginTop:6, border:"1.5px solid #dceaef", borderRadius:12, padding:"11px 14px", fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box", textAlign:"right" }} />
                          </label>
                          <label style={{ fontSize:13.5, fontWeight:600, color:"#133b48" }}>
                            توضیحات (اختیاری)
                            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="مشکل دندان، حساسیت دارویی یا هر توضیح دیگری…" rows={3}
                              style={{ display:"block", width:"100%", marginTop:6, border:"1.5px solid #dceaef", borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }} />
                          </label>
                          {bookError && <div style={{ color:"#ef4444", fontSize:13.5, fontWeight:600 }}>{bookError}</div>}
                          <button onClick={submitBooking} disabled={booking} style={{ background:"linear-gradient(135deg,#0c8aa6,#0a4f63)", color:"#fff", border:"none", borderRadius:14, padding:"14px 24px", fontSize:15, fontFamily:"inherit", fontWeight:800, cursor:"pointer", opacity:booking?.7:1 }}>
                            {booking ? "در حال ثبت…" : "ثبت نوبت"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success modal */}
      {successModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"grid", placeItems:"center", zIndex:9999, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:24, padding:"36px 32px", maxWidth:460, width:"100%", textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:800, fontSize:22, color:"#133b48", marginBottom:8 }}>نوبت شما ثبت شد!</div>
            <div style={{ fontSize:14.5, color:"#6c8b95", marginBottom:24, lineHeight:1.8 }}>
              {selLabel} ساعت {toFa(successModal.time)} — {dentist?.title}
            </div>
            <div style={{ background:"#f4f9fb", border:"2px dashed #b5d8e3", borderRadius:16, padding:"16px 20px", marginBottom:24 }}>
              <div style={{ fontSize:13, color:"#8aabb5", marginBottom:6 }}>کد پیگیری شما</div>
              <div style={{ fontWeight:800, fontSize:26, color:"#0c8aa6", letterSpacing:3, direction:"ltr" }}>{successModal.trackCode}</div>
              <div style={{ fontSize:12, color:"#9bb6bf", marginTop:6 }}>این کد را برای لغو نوبت نگه دارید</div>
            </div>
            <button onClick={() => setSuccessModal(null)} style={{ background:"linear-gradient(135deg,#0c8aa6,#0a4f63)", color:"#fff", border:"none", borderRadius:14, padding:"12px 32px", fontSize:15, fontFamily:"inherit", fontWeight:800, cursor:"pointer" }}>
              باشه، متوجه شدم
            </button>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"grid", placeItems:"center", zIndex:9999, padding:16 }}>
          <div style={{ background:"#fff", borderRadius:24, padding:"32px", maxWidth:420, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,.25)" }}>
            <div style={{ fontWeight:800, fontSize:20, color:"#133b48", marginBottom:16 }}>لغو نوبت</div>
            {cancelResult === "ok" ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700, color:"#133b48", marginBottom:8 }}>{cancelMsg}</div>
                <button onClick={() => { setCancelModal(false); setCancelResult(null); }} style={{ background:"#eef7fa", color:"#0c8aa6", border:"none", borderRadius:12, padding:"10px 24px", fontFamily:"inherit", fontWeight:700, cursor:"pointer" }}>
                  بستن
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:14, color:"#6c8b95", marginBottom:16 }}>کد پیگیری که هنگام رزرو دریافت کردید را وارد کنید:</div>
                <input type="text" value={cancelCode} onChange={e=>setCancelCode(e.target.value.toUpperCase())} placeholder="مثلاً: DNABC123" dir="ltr"
                  style={{ width:"100%", border:"2px solid #dceaef", borderRadius:12, padding:"12px 14px", fontSize:16, fontFamily:"inherit", outline:"none", letterSpacing:2, boxSizing:"border-box", textAlign:"center" }} />
                {cancelResult === "err" && <div style={{ color:"#ef4444", fontSize:13, marginTop:8 }}>{cancelMsg}</div>}
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={() => setCancelModal(false)} style={{ flex:1, border:"1px solid #dceaef", borderRadius:12, padding:"11px", fontFamily:"inherit", cursor:"pointer", background:"#f8fbfc", color:"#6c8b95", fontSize:14, fontWeight:600 }}>انصراف</button>
                  <button onClick={submitCancel} style={{ flex:1, background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"11px", fontFamily:"inherit", cursor:"pointer", color:"#c0392b", fontSize:14, fontWeight:700 }}>لغو نوبت</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
