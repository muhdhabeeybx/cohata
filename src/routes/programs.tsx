import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Check } from "lucide-react";

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

const programs = [
  {
    name: "The SIRAJ Method™ Certification",
    tag: "Signature",
    desc: "COHATA's flagship certification program — a structured framework for faith-based transformation coaches.",
    duration: "12 weeks",
  },
  {
    name: "Project 20",
    tag: "Annual Mentorship",
    desc: "A year-long structured mentorship for women committed to disciplined growth and accountability.",
    duration: "12 months",
  },
  {
    name: "Strategic Woman Program",
    tag: "Signature",
    desc: "For the woman ready to live with vision, structure, and intentional execution.",
    duration: "8 weeks",
  },
  {
    name: "Marriage, Not the Wedding",
    tag: "Initiative",
    desc: "Pre-marital and early-marriage guidance focused on building a lasting union — not just a ceremony.",
    duration: "6 weeks",
  },
  {
    name: "The Thriving Muslim Family Blueprint",
    tag: "Family",
    desc: "A complete framework for raising aligned, intentional Muslim families.",
    duration: "10 weeks",
  },
  {
    name: "Ahlul Jannah Summer Mentorship",
    tag: "Kids & Teens · Cairo",
    desc: "Immersive summer mentorship for kids and teens in Cairo — faith, identity, and growth.",
    duration: "Summer intake",
  },
  {
    name: "The Heart of a Woman Series",
    tag: "Series",
    desc: "Reflective sessions on identity, healing, and the inner life of a believing woman.",
    duration: "Rolling cohorts",
  },
];

function Programs() {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [done, setDone] = useState(false);

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Programs & Mentorship</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          Long-term journeys. Lasting transformation.
        </h1>
        <p className="mt-8 text-lg text-foreground/70 max-w-3xl">
          Choose a structured program and walk a guided path with COHATA — from clarity to
          alignment, application, and sustained growth.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20 grid md:grid-cols-2 gap-6">
        {programs.map((p) => (
          <article key={p.name} className="bg-card border border-border rounded-3xl p-8 md:p-10 flex flex-col shadow-soft hover:shadow-elegant transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gold">{p.tag}</span>
              <span className="text-xs text-muted-foreground">{p.duration}</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-primary mb-3">{p.name}</h2>
            <p className="text-foreground/70 mb-8 flex-1">{p.desc}</p>
            <button
              onClick={() => { setSelected(p.name); setDone(false); }}
              className="self-start bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Enroll
            </button>
          </article>
        ))}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-elegant" onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-4">
                  <Check className="text-gold-foreground" />
                </div>
                <h3 className="font-display text-2xl text-primary mb-2">JazākAllāhu khayran</h3>
                <p className="text-foreground/70 mb-6">We've received your enrollment for <strong>{selected}</strong>. Our team will reach out shortly with next steps.</p>
                <button onClick={() => setSelected(null)} className="text-primary font-medium">Close</button>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Enroll</p>
                <h3 className="font-display text-3xl text-primary mb-6">{selected}</h3>
                <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-4">
                  <input required placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                  <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary" />
                  <textarea placeholder="What are you hoping to gain? (optional)" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full px-5 py-3 rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" />
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setSelected(null)} className="flex-1 border border-border py-3 rounded-full">Cancel</button>
                    <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium">Submit Enrollment</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <section className="bg-gradient-soft py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-4">Prefer one-on-one guidance?</h2>
          <p className="text-foreground/70 mb-8">Book a private session with the COHATA team.</p>
          <Link to="/book" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium inline-block">Book a Session</Link>
        </div>
      </section>
    </Layout>
  );
}
