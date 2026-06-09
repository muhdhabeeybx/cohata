import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Program } from "@/components/BookingsDashboard";
import { Clock, Calendar, X, Check, ChevronRight, Sparkle } from "lucide-react";

export const Route = createFileRoute("/programs")({
  component: Programs,
  head: () => ({
    meta: [
      { title: "Programs & Mentorship — Enroll | COHATA" },
      { name: "description", content: "Enroll in COHATA's signature programs: SIRAJ Method™, Project 20, Strategic Woman, Marriage Not the Wedding, and more." },
      { property: "og:title", content: "COHATA Programs" },
      { property: "og:description", content: "Signature, structured programs for Muslim women and families." },
    ],
  }),
});

function fmt(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function EnrollModal({ program, onClose }: { program: Program; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/bookings", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        program: program.title,
        notes: form.note,
        status: "Pending",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h3 className="font-display text-2xl text-primary mb-2">JazākAllāhu khayran</h3>
            <p className="text-foreground/70 mb-6">
              We've received your enrollment for <strong>{program.title}</strong>. Our team will reach out shortly with next steps.
            </p>
            <button type="button" onClick={onClose} className="text-primary font-medium hover:underline">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                {program.tag && <p className="text-xs uppercase tracking-[0.3em] text-gold mb-1">{program.tag}</p>}
                <h3 className="font-display text-2xl text-primary">{program.title}</h3>
              </div>
              <button type="button" title="Close" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="enroll-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name *</label>
                <input id="enroll-name" required placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label htmlFor="enroll-phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone *</label>
                <input id="enroll-phone" required placeholder="+234 812 345 6789" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label htmlFor="enroll-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email <span className="normal-case font-normal">(optional)</span>
                </label>
                <input id="enroll-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label htmlFor="enroll-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  What are you hoping to gain? <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea id="enroll-note" rows={3} placeholder="Share your intention or goal…" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-full text-sm font-medium hover:bg-muted/40 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                  {submitting ? "Sending…" : "Submit Enrollment"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ProgramModal({ program, onClose, onEnroll }: { program: Program; onClose: () => void; onEnroll: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {program.imageUrl && (
          <div className="aspect-video flex-shrink-0 overflow-hidden">
            <img src={program.imageUrl} alt={program.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              {program.tag && <p className="text-xs uppercase tracking-[0.3em] text-gold mb-1.5 font-medium">{program.tag}</p>}
              <h2 className="font-display text-3xl text-primary leading-tight">{program.title}</h2>
            </div>
            <button type="button" title="Close" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {program.duration && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium">
                <Clock size={11} /> {program.duration}
              </span>
            )}
            {program.startDate && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/60 text-foreground/70 border border-border font-medium">
                <Calendar size={11} /> Starts {fmt(program.startDate)}
              </span>
            )}
            {program.price && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-gold/10 text-foreground border border-gold/30 font-semibold">
                {program.price}
              </span>
            )}
            {program.enrollmentOpen && (
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enrollment Open
              </span>
            )}
          </div>

          {(program.fullDescription || program.description) && (
            <div className="text-foreground/70 leading-relaxed whitespace-pre-line mb-8 text-sm">
              {program.fullDescription || program.description}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {program.enrollmentOpen ? (
              <button type="button" onClick={onEnroll} className="flex-1 sm:flex-initial bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity">
                Enroll Now
              </button>
            ) : (
              <span className="text-sm text-muted-foreground italic">Enrollment is currently closed for this program.</span>
            )}
            <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-full border border-border text-sm font-medium hover:bg-muted/40 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "done" | "error">("loading");
  const [viewingProgram, setViewingProgram] = useState<Program | null>(null);
  const [enrollingProgram, setEnrollingProgram] = useState<Program | null>(null);

  useEffect(() => {
    api.get<Program[]>("/api/programs")
      .then((data) => { setPrograms(data); setLoadState("done"); })
      .catch(() => setLoadState("error"));
  }, []);

  const openEnroll = (p: Program) => {
    setViewingProgram(null);
    setEnrollingProgram(p);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6 font-medium">Programs & Mentorship</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          Long-term journeys.<br />Lasting transformation.
        </h1>
        <p className="mt-8 text-lg text-foreground/70 max-w-2xl">
          Choose a structured program and walk a guided path with COHATA — from clarity to
          alignment, application, and sustained growth.
        </p>
      </section>

      {/* Programs grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">

        {/* Loading skeletons */}
        {loadState === "loading" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-7 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-4">Unable to load programs right now.</p>
            <Link to="/book" className="text-primary font-medium hover:underline">Book a discovery session instead →</Link>
          </div>
        )}

        {loadState === "done" && programs.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto">
            <p className="text-foreground/70 mb-6">Programs are coming soon. In the meantime, book a discovery session to find the right path for you.</p>
            <Link to="/book" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium inline-block hover:opacity-90 transition-opacity">
              Book a Session
            </Link>
          </div>
        )}

        {loadState === "done" && programs.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((p) => (
              <article
                key={p.id}
                onClick={() => setViewingProgram(p)}
                className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col cursor-pointer group hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-muted relative flex-shrink-0">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Sparkle size={20} />
                      </div>
                    </div>
                  )}
                  {p.enrollmentOpen && (
                    <div className="absolute top-3 left-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-primary text-primary-foreground">
                        Enrolling Now
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-7 flex flex-col flex-1">
                  {p.tag && <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-2 font-semibold">{p.tag}</p>}
                  <h2 className="font-display text-xl text-primary mb-3 leading-snug">{p.title}</h2>
                  <p className="text-sm text-foreground/65 flex-1 leading-relaxed line-clamp-3">{p.description}</p>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.duration && <span className="flex items-center gap-1"><Clock size={10} />{p.duration}</span>}
                      {p.price && <span className="font-semibold text-foreground">{p.price}</span>}
                    </div>
                    <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      View details <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Black CTA band */}
      <section className="bg-foreground text-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Prefer one-on-one guidance?</h2>
          <p className="text-background/60 mb-8">Book a private session with the COHATA team and find the right path for you.</p>
          <Link to="/book" className="bg-gold text-foreground px-8 py-4 rounded-full font-semibold inline-block hover:opacity-90 transition-opacity">
            Book a Session
          </Link>
        </div>
      </section>

      {/* Program detail popup */}
      {viewingProgram && (
        <ProgramModal
          program={viewingProgram}
          onClose={() => setViewingProgram(null)}
          onEnroll={() => openEnroll(viewingProgram)}
        />
      )}

      {/* Enrollment form popup */}
      {enrollingProgram && (
        <EnrollModal
          program={enrollingProgram}
          onClose={() => setEnrollingProgram(null)}
        />
      )}
    </Layout>
  );
}
