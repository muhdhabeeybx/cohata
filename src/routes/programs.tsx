import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Program } from "@/components/BookingsDashboard";
import { Clock, Calendar, X, Check, ChevronRight, Sparkle } from "lucide-react";
import programsHeroImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.40.jpeg";

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

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// Loads Paystack's Inline JS (popup) library once, reusing it on subsequent enrollments.
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { PaystackPop?: unknown }).PaystackPop) {
      resolve();
      return;
    }
    const existing = document.getElementById("paystack-inline-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

type EnrollStage = "form" | "free-success" | "pay-success" | "pay-failed";

function EnrollModal({ program, onClose }: { program: Program; onClose: () => void }) {
  const isPaid = (program.amount ?? 0) > 0;
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [stage, setStage] = useState<EnrollStage>("form");
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isPaid) {
        const result = await api.post<{ access_code: string; reference: string }>("/api/payments/initialize", {
          programId: program.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          notes: form.note,
        });
        await loadPaystackScript();
        const PaystackPop = (window as unknown as { PaystackPop: new () => { resumeTransaction: (accessCode: string, opts: { onSuccess: () => void; onCancel: () => void }) => void } }).PaystackPop;
        const popup = new PaystackPop();
        popup.resumeTransaction(result.access_code, {
          onSuccess: async () => {
            try {
              const verify = await api.get<{ status: string; program?: string; amount?: number }>(`/api/payments/verify/${encodeURIComponent(result.reference)}`);
              if (verify.status === "success") {
                setPaidAmount(verify.amount ?? program.amount);
                setStage("pay-success");
              } else {
                setStage("pay-failed");
              }
            } catch {
              setStage("pay-failed");
            } finally {
              setSubmitting(false);
            }
          },
          onCancel: () => {
            setSubmitting(false);
            setError("Payment window closed. You can try again when you're ready.");
          },
        });
        return;
      }
      await api.post("/api/bookings", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        program: program.title,
        notes: form.note,
        status: "Pending",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
      setStage("free-success");
      setSubmitting(false);
    } catch {
      setError(isPaid ? "Couldn't start the payment. Please try again or contact us directly." : "Something went wrong. Please try again or contact us directly.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {stage === "free-success" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-2xl text-primary mb-2">JazākAllāhu khayran</h3>
            <p className="text-foreground/70 mb-6">
              We've received your enrollment for <strong>{program.title}</strong>. Our team will reach out shortly with next steps.
            </p>
            <button type="button" onClick={onClose} className="text-primary font-medium hover:underline">Close</button>
          </div>
        )}

        {stage === "pay-success" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-2xl text-primary mb-2">JazākAllāhu khayran!</h3>
            <p className="text-foreground/70 mb-6">
              Your payment{paidAmount ? ` of ${formatNaira(paidAmount)}` : ""} was successful and your enrollment for <strong>{program.title}</strong> is confirmed. Our team will reach out shortly with next steps.
            </p>
            <button type="button" onClick={onClose} className="text-primary font-medium hover:underline">Close</button>
          </div>
        )}

        {stage === "pay-failed" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
              <X size={24} />
            </div>
            <h3 className="text-2xl text-primary mb-2">Payment not completed</h3>
            <p className="text-foreground/70 mb-6">
              Your payment could not be confirmed. If you were charged, please contact us and we'll sort it out — otherwise, feel free to try again.
            </p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={onClose} className="border border-border px-6 py-2.5 rounded-full text-sm font-medium hover:bg-muted/40 transition-colors">Close</button>
              <button type="button" onClick={() => { setStage("form"); setError(""); }} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">Try Again</button>
            </div>
          </div>
        )}

        {stage === "form" && (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                {program.tag && <p className="text-xs uppercase tracking-[0.3em] text-gold mb-1">{program.tag}</p>}
                <p className="text-2xl font-semibold mb-2 text-primary">{program.title}</p>
                {/* {isPaid && (
                  <p className="text-sm text-foreground/60 mt-1">Enrollment fee: <strong className="text-foreground">{formatNaira(program.amount)}</strong></p>
                )} */}
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
                  Email {isPaid ? "*" : <span className="normal-case font-normal">(optional)</span>}
                </label>
                <input id="enroll-email" type="email" required={isPaid} placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm" />
                {isPaid && <p className="text-xs text-muted-foreground mt-1">Your payment receipt will be sent here.</p>}
              </div>
              <div>
                <label htmlFor="enroll-note" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  What are you hoping to gain?
                </label>
                <textarea id="enroll-note" rows={3} placeholder="Share your intention or goal…" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full mt-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary text-sm resize-none" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-full text-sm font-medium hover:bg-muted/40 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                  {submitting ? (isPaid ? "Opening payment…" : "Sending…") : isPaid ? `Pay ${formatNaira(program.amount)} & Enroll` : "Submit Enrollment"}
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
              {program.tag && <p className="text-xs uppercase tracking-[0.3em] text-primary mb-1.5 font-medium">{program.tag}</p>}
              <p className="text-2xl font-semibold mb-2 text-gold">{program.title}</p>
            </div>
            <button type="button" title="Close" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {program.duration && (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-medium">
                <Clock size={12} /> {program.duration}
              </span>
            )}
            {program.startDate && (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-muted/60 text-foreground/70 border border-border font-medium">
                <Calendar size={11} /> Starts {fmt(program.startDate)}
              </span>
            )}
            {program.amount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary text-primary-foreground border border-primary/30 font-semibold">
                {formatNaira(program.amount)}
              </span>
            )}
            {program.enrollmentOpen && (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enrollment Open
              </span>
            )}
          </div>

          {(program.fullDescription || program.description) && (
            <div className="text-black leading-relaxed whitespace-pre-line mb-8 text-lg">
              {program.fullDescription || program.description}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {program.enrollmentOpen ? (
              <button type="button" onClick={onEnroll} className="flex-1 sm:flex-initial bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium hover:opacity-90 transition-opacity">
                {program.amount > 0 ? `Enroll Now` : "Enroll Now"}
                {/* {program.amount > 0 ? `Enroll & Pay ${formatNaira(program.amount)}` : "Enroll Now"} */}
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
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={programsHeroImg} alt="Coach Halima leading a COHATA program session" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/40" />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-16">
          <div className="grid lg:grid-cols-12 gap-8 w-full items-end">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Programs & Mentorship</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground text-balance leading-tight">
                Long-term <em className="text-gold italic font-display">journeys</em>. Lasting transformation.
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-white text-pretty lg:text-right">
                Choose a structured program and walk a guided path with COHATA — from clarity to
                alignment, application, and sustained growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-24">

        {/* Loading skeletons */}
        {loadState === "loading" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
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
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-12">
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
                  <p className="text-xl font-semibold mb-2 text-primary">{p.title}</p>
                  <p className="text-lg text-black flex-1 leading-relaxed line-clamp-3">{p.description}</p>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      {p.duration && (
                        <span className="text-lg text-primary bg-primary/8 flex px-6 py-2 rounded-full items-center gap-1.5">
                          <Clock size={16} />{p.duration}
                        </span>
                      )}
                    </div>
                    {p.amount > 0 ? (
                        <span className="text-lg font-semibold text-white bg-primary px-6 py-2 rounded-full">{formatNaira(p.amount)}</span>
                      ) : (
                        <span className="text-lg font-semibold text-white bg-primary px-6 py-2 rounded-full">Free</span>
                    )}
                    {/* <span className="text-lg font-normal text-primary flex items-center gap-1 flex-shrink-0 group-hover:text-gold transition-colors">
                      View details <ChevronRight size={16} />
                    </span> */}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Black CTA band */}
      {/* <section className="bg-foreground text-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-4">Prefer one-on-one guidance?</h2>
          <p className="text-background/60 mb-8">Book a private session with the COHATA team and find the right path for you.</p>
          <Link to="/book" className="bg-gold text-foreground px-8 py-4 rounded-full font-semibold inline-block hover:opacity-90 transition-opacity">
            Book a Session
          </Link>
        </div>
      </section> */}

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
