import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useMemo, useState } from "react";
import { Check, Calendar, Clock, CalendarOff } from "lucide-react";
import type { Availability } from "@/components/BookingsDashboard";
import { api } from "@/lib/api";

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

const sessionTypes = [
  { id: "discovery", name: "Discovery Session", duration: "30 min", desc: "Find the right path for your season." },
  { id: "coaching", name: "Life / Identity Coaching", duration: "60 min", desc: "Personal coaching rooted in faith." },
  { id: "marriage", name: "Marriage Counseling", duration: "75 min", desc: "For couples or pre-marriage guidance." },
  { id: "family", name: "Family Counseling", duration: "75 min", desc: "Support for the whole family system." },
  { id: "spiritual", name: "Spiritual Development", duration: "60 min", desc: "Du'a, dhikr, and spiritual coaching." },
  { id: "hijama", name: "Hijama Therapy", duration: "45 min", desc: "Traditional cupping wellness session." },
];

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS: Record<string, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };

const DEFAULT_AVAILABILITY: Availability = {
  days: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 60,
  blockedDates: [],
};

function dayKeyOf(dateStr: string) {
  return DAY_KEYS[new Date(`${dateStr}T00:00:00`).getDay()];
}

function generateSlots(av: Availability) {
  const [sh, sm] = av.startTime.split(":").map(Number);
  const [eh, em] = av.endTime.split(":").map(Number);
  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + av.slotMinutes <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cur += av.slotMinutes;
  }
  return slots;
}

const ACTIVE_STATUSES = ["Pending", "Approved", "Scheduled", "In Progress"];

interface BookedSlot {
  sessionDate?: string;
  sessionTime?: string;
  status: string;
}

function Book() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [info, setInfo] = useState({ name: "", email: "", phone: "", note: "" });
  const [done, setDone] = useState(false);
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [bookings, setBookings] = useState<BookedSlot[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Availability>("/api/availability").then((a) => setAvailability({ ...DEFAULT_AVAILABILITY, ...a })),
      api.get<BookedSlot[]>("/api/booked-slots").then(setBookings),
    ]).catch(console.error);
  }, []);

  const selectedType = sessionTypes.find((s) => s.id === type);
  const minDate = new Date().toISOString().split("T")[0];

  const dayKey = date ? dayKeyOf(date) : null;
  const isWorkingDay = dayKey ? availability.days.includes(dayKey) : false;
  const isBlocked = date ? availability.blockedDates.includes(date) : false;
  const dayUnavailable = !!date && (!isWorkingDay || isBlocked);

  const availableTimes = useMemo(() => {
    if (!date || dayUnavailable) return [];
    const taken = new Set(
      bookings.filter((b) => b.sessionDate === date && ACTIVE_STATUSES.includes(b.status)).map((b) => b.sessionTime)
    );
    return generateSlots(availability).filter((t) => !taken.has(t));
  }, [date, dayUnavailable, bookings, availability]);

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Book a Session</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          Begin where you are. Be guided forward.
        </h1>
      </section>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24">
        {!done && (
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                <div className={`h-0.5 flex-1 ${step > s ? "bg-primary" : "bg-border"} ${s === 3 ? "hidden" : ""}`} />
              </div>
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-soft">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-6 shadow-gold">
                <Check className="text-gold-foreground" size={28} />
              </div>
              <h2 className="font-display text-3xl text-primary mb-3">Your session is booked.</h2>
              <p className="text-foreground/70 max-w-md mx-auto mb-6">
                A confirmation has been sent to <strong>{info.email}</strong>. We'll reach out shortly with the meeting link, in shā' Allāh.
              </p>
              <div className="inline-block bg-gradient-soft border border-border rounded-2xl px-6 py-4 text-left">
                <p className="text-xl text-primary">{selectedType?.name}</p>
                <p className="text-sm text-foreground/70 mt-1">{date} · {time}</p>
              </div>
            </div>
          ) : step === 1 ? (
            <>
              <h2 className="font-display text-2xl text-primary mb-6">Choose a session</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sessionTypes.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setType(s.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition ${type === s.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg text-primary">{s.name}</h3>
                      <span className="text-xs text-gold flex items-center gap-1"><Clock size={12} />{s.duration}</span>
                    </div>
                    <p className="text-sm text-foreground/70">{s.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button type="button" disabled={!type} onClick={() => setStep(2)} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40">
                  Continue
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="font-display text-2xl text-primary mb-2">Pick date & time</h2>
              <p className="text-sm text-foreground/60 mb-6">
                We're available {availability.days.map((d) => DAY_LABELS[d]).join(", ")}, {availability.startTime}–{availability.endTime}.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="pick-date" className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Calendar size={14} />Date</label>
                  <input
                    id="pick-date"
                    type="date"
                    min={minDate}
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setTime(null); }}
                    className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary"
                  />
                  {dayUnavailable && (
                    <p className="mt-3 text-sm text-destructive flex items-center gap-2">
                      <CalendarOff size={14} /> We're not available on this date — please pick another day.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Clock size={14} />Time</label>
                  {!date ? (
                    <p className="text-sm text-muted-foreground py-3">Choose a date to see available times.</p>
                  ) : dayUnavailable ? (
                    <p className="text-sm text-muted-foreground py-3">No sessions run on this day.</p>
                  ) : availableTimes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-3">This day is fully booked — try another date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((t) => (
                        <button type="button" key={t} onClick={() => setTime(t)} className={`py-3 rounded-xl border text-sm transition ${time === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 text-foreground/70">Back</button>
                <button type="button" disabled={!date || !time || dayUnavailable} onClick={() => setStep(3)} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40">Continue</button>
              </div>
            </>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post("/api/bookings", {
                  name: info.name,
                  phone: info.phone,
                  email: info.email,
                  program: selectedType?.name ?? type ?? "",
                  status: "Pending",
                  enrollmentDate: date,
                  sessionDate: date,
                  sessionTime: time ?? "",
                  notes: info.note,
                });
                setDone(true);
              } catch {
                alert("Something went wrong — please try again.");
              }
            }}>
              <h2 className="font-display text-2xl text-primary mb-6">Your details</h2>
              <div className="space-y-4">
                <input required placeholder="Full name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                <input required type="email" placeholder="Email address" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                <input required placeholder="Phone (with country code)" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                <textarea rows={4} placeholder="Briefly share what you'd like to focus on (optional)" value={info.note} onChange={(e) => setInfo({ ...info, note: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="bg-gradient-soft border border-border rounded-2xl p-5 mt-6 text-sm">
                <p className="text-muted-foreground">You're booking:</p>
                <p className="text-lg text-primary">{selectedType?.name}</p>
                <p className="text-foreground/70">{date} · {time}</p>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 text-foreground/70">Back</button>
                <button type="submit" className="bg-gradient-gold text-gold-foreground px-8 py-3 rounded-full font-medium shadow-gold">Confirm Booking</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
