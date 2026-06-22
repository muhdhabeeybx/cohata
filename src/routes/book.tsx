import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useMemo, useState } from "react";
import {
  Check, Calendar, Clock, CalendarOff, Minus, Plus, AlertCircle,
  User, Mail, Phone, MessageSquare, Lock, Sparkles, Heart, RefreshCw,
  ArrowRight,
} from "lucide-react";
import type { Availability } from "@/components/BookingsDashboard";
import { api } from "@/lib/api";
import bookHeroImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.46.jpeg";

export const Route = createFileRoute("/book")({
  component: Book,
  head: () => ({
    meta: [
      { title: "Book a Session — Coaching & Counseling | COHATA" },
      { name: "description", content: "Book a one-on-one coaching, counseling, or discovery session with the COHATA team." },
      { property: "og:title", content: "Book a Session with COHATA" },
      { property: "og:description", content: "Faith-based coaching, counseling, and guidance — book your session." },
    ],
  }),
});

export interface SessionTypeData {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  minHours: number;
  maxHours: number;
  isActive: boolean;
  order: number;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS: Record<string, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };

const DEFAULT_AVAILABILITY: Availability = {
  days: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 60,
  blockedDates: [],
};

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minsToTime(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
function dayKeyOf(dateStr: string) {
  return DAY_KEYS[new Date(`${dateStr}T00:00:00`).getDay()];
}
function generateSlots(av: Availability) {
  const slots: string[] = [];
  let cur = timeToMins(av.startTime);
  const end = timeToMins(av.endTime);
  while (cur + av.slotMinutes <= end) { slots.push(minsToTime(cur)); cur += av.slotMinutes; }
  return slots;
}
function fmtNaira(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const ACTIVE_STATUSES = ["Pending", "Approved", "Scheduled", "In Progress"];

interface BookedSlot { sessionDate?: string; sessionTime?: string; status: string; hours?: number; }

function isSlotOccupied(slotTime: string, date: string, bookings: BookedSlot[]): boolean {
  const t = timeToMins(slotTime);
  return bookings.some((b) => {
    if (b.sessionDate !== date || !ACTIVE_STATUSES.includes(b.status) || !b.sessionTime) return false;
    const bStart = timeToMins(b.sessionTime);
    const bEnd = bStart + (b.hours ?? 1) * 60;
    return t >= bStart && t < bEnd;
  });
}
function isRangeClear(startTime: string, hours: number, date: string, bookings: BookedSlot[]): boolean {
  const rangeStart = timeToMins(startTime);
  const rangeEnd = rangeStart + hours * 60;
  return !bookings.some((b) => {
    if (b.sessionDate !== date || !ACTIVE_STATUSES.includes(b.status) || !b.sessionTime) return false;
    const bStart = timeToMins(b.sessionTime);
    const bEnd = bStart + (b.hours ?? 1) * 60;
    return rangeStart < bEnd && rangeEnd > bStart;
  });
}

const TRUST = [
  { Icon: Lock,       label: "Private & Confidential",   sub: "Everything shared stays between us" },
  { Icon: Heart,      label: "Faith-centred Approach",   sub: "Guided by Islamic values & wisdom" },
  { Icon: Sparkles,   label: "Personalised Sessions",    sub: "No two sessions are the same" },
  { Icon: RefreshCw,  label: "Flexible Scheduling",      sub: "Reschedule anytime with notice" },
];

const STEPS = [
  { n: 1, label: "Session type" },
  { n: 2, label: "Date & time" },
  { n: 3, label: "Your details" },
];

const NEXT_STEPS = [
  { n: "01", title: "We confirm your booking", body: "Our team reviews your request and sends a confirmation to your email within a few hours." },
  { n: "02", title: "You receive the meeting instructions", body: "A private, secure link/address is sent to you before your session date." },
  { n: "03", title: "Join at your chosen time", body: "Show up as yourself. The space is safe, private, and prepared for you." },
];

function IconInput({
  icon: Icon, type = "text", placeholder, value, onChange, required, rows,
}: {
  icon: React.ElementType; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean; rows?: number;
}) {
  const cls = "w-full pl-11 pr-5 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm text-foreground placeholder:text-muted-foreground";
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={rows ? { top: "1.1rem", transform: "none" } : {}} />
      {rows ? (
        <textarea rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} py-3.5 resize-none`} />
      ) : (
        <input required={required} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} py-3.5`} />
      )}
    </div>
  );
}

function Book() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [info, setInfo] = useState({ name: "", email: "", phone: "", note: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [bookings, setBookings] = useState<BookedSlot[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionTypeData[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Availability>("/api/availability").then((a) => setAvailability({ ...DEFAULT_AVAILABILITY, ...a })),
      api.get<BookedSlot[]>("/api/booked-slots").then(setBookings),
      api.get<SessionTypeData[]>("/api/session-types").then(setSessionTypes),
    ]).catch(console.error);
  }, []);

  const selectedType = sessionTypes.find((s) => s.id === type);
  const amountDue = selectedType ? selectedType.pricePerHour * hours : 0;
  const minDate = new Date().toISOString().split("T")[0];

  const dayKey = date ? dayKeyOf(date) : null;
  const isWorkingDay = dayKey ? availability.days.includes(dayKey) : false;
  const isBlocked = date ? availability.blockedDates.includes(date) : false;
  const dayUnavailable = !!date && (!isWorkingDay || isBlocked);

  const availableTimes = useMemo(() => {
    if (!date || dayUnavailable) return [];
    return generateSlots(availability).filter((t) => !isSlotOccupied(t, date, bookings));
  }, [date, dayUnavailable, bookings, availability]);

  const maxAvailableHours = useMemo(() => {
    if (!time || !selectedType) return selectedType?.maxHours ?? 4;
    const startMins = timeToMins(time);
    const endMins = timeToMins(availability.endTime);
    const roomHours = Math.floor((endMins - startMins) / 60);
    return Math.min(selectedType.maxHours, Math.max(roomHours, selectedType.minHours));
  }, [time, selectedType, availability.endTime]);

  const endTime = time ? minsToTime(timeToMins(time) + hours * 60) : null;
  const rangeClear = useMemo(() => {
    if (!time || !date) return true;
    return isRangeClear(time, hours, date, bookings);
  }, [time, hours, date, bookings]);

  function selectType(id: string) {
    const st = sessionTypes.find((s) => s.id === id);
    setType(id);
    setHours(st?.minHours ?? 1);
  }
  function selectTime(t: string) {
    setTime(t);
    if (selectedType) setHours(selectedType.minHours);
  }
  function changeHours(delta: number) {
    if (!selectedType) return;
    setHours((h) => Math.min(maxAvailableHours, Math.max(selectedType.minHours, h + delta)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType) return;
    setSubmitting(true);
    try {
      if (amountDue > 0) {
        const { authorization_url } = await api.post<{ authorization_url: string }>("/api/payments/initialize-session", {
          sessionTypeId: type, name: info.name, email: info.email, phone: info.phone,
          notes: info.note, sessionDate: date, sessionTime: time, hours,
        });
        window.location.href = authorization_url;
      } else {
        await api.post("/api/bookings", {
          name: info.name, phone: info.phone, email: info.email,
          program: selectedType.name, hours, amountDue: 0, status: "Pending",
          enrollmentDate: date, sessionDate: date, sessionTime: time ?? "", notes: info.note,
        });
        setDone(true);
      }
    } catch {
      alert("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={bookHeroImg} alt="Two women in a private coaching conversation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/40" />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-16">
          <div className="grid lg:grid-cols-12 gap-8 w-full items-end">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Book a Session</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground text-balance leading-tight">
                Begin where you are. <em className="text-gold italic font-display">Be guided</em> forward.
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-white text-pretty lg:text-right">
                Every session is a private, intentional space — designed around where you are right now and where you're heading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="bg-black">
        <div className="max-w-7xl mx-auto px-12 lg:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map(({ Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gold">{label}</p>
                <p className="text-sm text-white mt-1 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Booking form ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">

        {/* Step indicators */}
        {!done && (
          <div className="flex items-center mb-10 max-w-lg">
            {STEPS.map(({ n, label }, i) => (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step > n ? "bg-primary text-primary-foreground" :
                    step === n ? "bg-primary text-primary-foreground ring-4 ring-primary/15" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step > n ? <Check size={13} /> : n}
                  </div>
                  <span className={`text-sm hidden sm:block transition-colors ${step === n ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-3 transition-colors ${step > n ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 3: two-column layout ── */}
        {!done && step === 3 ? (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Form card */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
              <p className="text-2xl font-semibold text-primary mb-1">Your details</p>
              <p className="text-lg text-black mb-7">We'll use these to confirm your booking and send the meeting link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <IconInput icon={User}          placeholder="Full name"                   value={info.name}  onChange={(v) => setInfo({ ...info, name: v })}  required />
                <IconInput icon={Mail}  type="email" placeholder="Email address"          value={info.email} onChange={(v) => setInfo({ ...info, email: v })} required />
                <IconInput icon={Phone}          placeholder="Phone number" value={info.phone} onChange={(v) => setInfo({ ...info, phone: v })} required />
                <IconInput icon={MessageSquare} placeholder="What would you like to focus on?" value={info.note}  onChange={(v) => setInfo({ ...info, note: v })}  rows={2} />

                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Lock size={11} /> Your information is private and will never be shared.
                </p>

                <div className="flex justify-between items-center pt-3">
                  <button type="button" onClick={() => setStep(2)} className="text-sm text-foreground/60 hover:text-foreground transition flex items-center gap-1.5">
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-gold text-gold-foreground px-8 py-3 rounded-full font-medium shadow-gold disabled:opacity-60 transition flex items-center gap-2"
                  >
                    {submitting
                      ? "Please wait…"
                      : amountDue > 0
                      ? <><span>Pay {fmtNaira(amountDue)}</span><ArrowRight size={15} /></>
                      : <><span>Confirm Booking</span><Check size={15} /></>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Booking summary sidebar */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Your Booking</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Session</p>
                    <p className="font-semibold text-black text-sm">{selectedType?.name}</p>
                    {selectedType?.pricePerHour === 0 && (
                      <span className="text-xs text-emerald-600 font-medium">Free</span>
                    )}
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                    <p className="font-semibold text-black text-sm">{fmtDate(date)}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                    <p className="font-semibold text-black text-sm">{time && fmt12(time)} – {endTime && fmt12(endTime)}</p>
                    <p className="text-xs text-muted-foreground">{hours} {hours === 1 ? "hour" : "hours"}</p>
                  </div>
                  {amountDue > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-gold text-lg">{fmtNaira(amountDue)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {amountDue > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <Lock size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    You'll be redirected to <strong>Paystack</strong> to complete payment securely. Your booking is only confirmed after payment.
                  </p>
                </div>
              )}

              <div className="bg-secondary/40 border border-border rounded-2xl p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Need to make changes? <button type="button" onClick={() => setStep(1)} className="text-primary underline underline-offset-2">Start over</button> or <button type="button" onClick={() => setStep(2)} className="text-primary underline underline-offset-2">change your time</button>.
                </p>
              </div>
            </div>
          </div>

        ) : (
          /* ── Steps 1, 2 + success (single column) ── */
          <div className="w-full">

            {/* ── Success ── */}
            {done ? (
              <div className="bg-card border border-border rounded-3xl p-10 shadow-soft text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-6 shadow-gold">
                  <Check className="text-gold-foreground" size={28} />
                </div>
                <h2 className="font-display text-3xl text-primary mb-3">Your session is booked.</h2>
                <p className="text-foreground/70 max-w-md mx-auto mb-8">
                  A confirmation has been sent to <strong>{info.email}</strong>. We'll follow up with your meeting link before your session, in shā' Allāh.
                </p>
                <div className="inline-block bg-gradient-soft border border-border rounded-2xl px-7 py-5 text-left mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Session details</p>
                  <p className="text-xl text-primary font-medium mb-1">{selectedType?.name}</p>
                  <p className="text-sm text-foreground/70">{fmtDate(date)}</p>
                  <p className="text-sm text-foreground/70">{time && fmt12(time)} – {endTime && fmt12(endTime)} · {hours} {hours === 1 ? "hour" : "hours"}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                    Back to Home
                  </Link>
                  <Link to="/services" className="border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition inline-flex items-center gap-2">
                    View all services
                  </Link>
                </div>
              </div>

            /* ── Step 1 ── */
            ) : step === 1 ? (
              <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
                <p className="text-2xl font-semibold mb-2 text-primary">Choose a session</p>
                <p className="text-lg text-black mb-7">Select the type of session that fits where you are right now.</p>
                {sessionTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Loading session types…</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-8">
                    {sessionTypes.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => selectType(s.id)}
                        className={`text-left p-5 rounded-2xl border-1 transition-all ${type === s.id ? "border-primary bg-primary/4 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xl font-semibold text-primary pr-2">{s.name}</p>
                          {s.pricePerHour > 0
                            ? <span className="text-sm text-gold font-semibold whitespace-nowrap">{fmtNaira(s.pricePerHour)}/hr</span>
                            : <span className="text-sm text-emerald-600 font-semibold whitespace-nowrap">Free</span>
                          }
                        </div>
                        <p className="text-sm text-black leading-relaxed">{s.description}</p>
                        {type === s.id && (
                          <div className="flex items-center gap-1.5 mt-3 text-primary text-sm font-medium">
                            <Check size={12} /> Selected
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    disabled={!type}
                    onClick={() => setStep(2)}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40 flex items-center gap-2 transition"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>

            /* ── Step 2 ── */
            ) : (
              <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
                <p className="text-xl font-semibold text-primary mb-1">Pick a date & time</p>
                <p className="text-lg text-black mb-7">
                  We're available everyday 11:00 AM – 5:00 PM.
                </p>
                {/* <p className="text-lg text-black mb-7">
                  We're available {availability.days.map((d) => DAY_LABELS[d]).join(", ")}, {fmt12(availability.startTime)}–{fmt12(availability.endTime)}.
                </p> */}

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Date */}
                  <div>
                    <label htmlFor="pick-date" className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Calendar size={12} /> Date
                    </label>
                    <input
                      id="pick-date"
                      type="date"
                      min={minDate}
                      value={date}
                      onChange={(e) => { setDate(e.target.value); setTime(null); }}
                      className="w-full px-5 py-3.5 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-lg"
                    />
                    {dayUnavailable && (
                      <p className="mt-3 text-sm text-destructive flex items-center gap-2">
                        <CalendarOff size={13} /> Not available on this date — please choose another.
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clock size={12} /> Start time
                    </p>
                    {!date ? (
                      <p className="text-sm text-muted-foreground py-3">Choose a date first.</p>
                    ) : dayUnavailable ? (
                      <p className="text-sm text-muted-foreground py-3">No sessions on this day.</p>
                    ) : availableTimes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">Fully booked — try another date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => selectTime(t)}
                            className={`py-2.5 rounded-xl border text-lg transition ${time === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
                          >
                            {fmt12(t)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration picker — after time selected */}
                {time && selectedType && (
                  <div className="mt-6 p-5 rounded-2xl border border-border bg-secondary/30">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">Session duration</p>
                    <div className="flex items-center gap-4">
                      <button type="button" aria-label="Decrease hours" onClick={() => changeHours(-1)}
                        disabled={hours <= selectedType.minHours}
                        className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:border-primary disabled:opacity-30 transition">
                        <Minus size={14} />
                      </button>
                      <span className="text-3xl font-display text-primary w-8 text-center tabular-nums">{hours}</span>
                      <button type="button" aria-label="Increase hours" onClick={() => changeHours(1)}
                        disabled={hours >= maxAvailableHours}
                        className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:border-primary disabled:opacity-30 transition">
                        <Plus size={14} />
                      </button>
                      <div className="ml-1 flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {fmt12(time)} → {endTime && fmt12(endTime)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hours} {hours === 1 ? "hour" : "hours"}
                          {amountDue > 0 && <span className="ml-2 text-gold font-semibold">· {fmtNaira(amountDue)}</span>}
                        </p>
                      </div>
                    </div>
                    {!rangeClear && (
                      <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>This range overlaps an existing booking. Try fewer hours or a different start time.</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-8">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-foreground/60 hover:text-foreground transition">← Back</button>
                  <button
                    type="button"
                    disabled={!date || !time || dayUnavailable || !rangeClear}
                    onClick={() => setStep(3)}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40 flex items-center gap-2 transition"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── What happens next ── */}
      {/* {!done && (
        <section className="border-t border-border bg-card/40 py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">After you book</p>
            <h2 className="font-display text-3xl text-primary mb-10">What happens next</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {NEXT_STEPS.map(({ n, title, body }) => (
                <div key={n} className="flex gap-5">
                  <span className="font-display text-4xl text-primary/10 leading-none flex-shrink-0 select-none">{n}</span>
                  <div>
                    <p className="font-medium text-foreground mb-1.5">{title}</p>
                    <p className="text-sm text-foreground/60 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )} */}

    </Layout>
  );
}
