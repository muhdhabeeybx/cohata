import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Check, Calendar, Clock } from "lucide-react";

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

const times = ["09:00", "10:30", "13:00", "15:00", "17:00", "19:00"];

function Book() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [info, setInfo] = useState({ name: "", email: "", phone: "", note: "" });
  const [done, setDone] = useState(false);

  const selectedType = sessionTypes.find((s) => s.id === type);
  const minDate = new Date().toISOString().split("T")[0];

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
                <p className="font-display text-xl text-primary">{selectedType?.name}</p>
                <p className="text-sm text-foreground/70 mt-1">{date} · {time}</p>
              </div>
            </div>
          ) : step === 1 ? (
            <>
              <h2 className="font-display text-2xl text-primary mb-6">Choose a session</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sessionTypes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setType(s.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition ${type === s.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display text-lg text-primary">{s.name}</h3>
                      <span className="text-xs text-gold flex items-center gap-1"><Clock size={12} />{s.duration}</span>
                    </div>
                    <p className="text-sm text-foreground/70">{s.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button disabled={!type} onClick={() => setStep(2)} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40">
                  Continue
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="font-display text-2xl text-primary mb-6">Pick date & time</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Calendar size={14} />Date</label>
                  <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><Clock size={14} />Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map((t) => (
                      <button key={t} onClick={() => setTime(t)} className={`py-3 rounded-xl border text-sm transition ${time === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-foreground/70">Back</button>
                <button disabled={!date || !time} onClick={() => setStep(3)} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium disabled:opacity-40">Continue</button>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => {
            e.preventDefault();
            // Save to admin dashboard
            try {
              const existing = JSON.parse(localStorage.getItem("cohata_bookings") ?? "[]");
              const entry = {
                id: Date.now().toString(),
                name: info.name,
                phone: info.phone,
                program: selectedType?.name ?? type ?? "",
                status: "Pending",
                enrollmentDate: date,
                sessionDate: date,
                sessionTime: time ?? "",
                notes: info.note,
                createdAt: new Date().toISOString(),
              };
              localStorage.setItem("cohata_bookings", JSON.stringify([entry, ...existing]));
            } catch {}
            setDone(true);
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
                <p className="font-display text-lg text-primary">{selectedType?.name}</p>
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
