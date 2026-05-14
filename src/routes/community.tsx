import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { MessageCircle, Heart, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/community")({
  component: Community,
  head: () => ({
    meta: [
      { title: "Sisterhood Community — Join COHATA" },
      { name: "description", content: "Join the COHATA sisterhood — a structured WhatsApp learning and reflection community for Muslim women." },
      { property: "og:title", content: "COHATA Sisterhood Community" },
      { property: "og:description", content: "Reflection, accountability, and shared growth." },
    ],
  }),
});

function Community() {
  const [form, setForm] = useState({ name: "", email: "", country: "" });
  const [done, setDone] = useState(false);

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Sisterhood</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          A community of women walking the path together.
        </h1>
        <p className="mt-8 text-lg text-foreground/70 max-w-2xl mx-auto">
          Structured reflections, weekly prompts, accountability circles, and the warmth of a
          sisterhood rooted in faith.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: MessageCircle, t: "WhatsApp Circles", d: "Daily reminders and weekly reflection prompts." },
          { icon: Heart, t: "Accountability", d: "Pair-ups and small groups for sustained growth." },
          { icon: Sparkles, t: "Live Sessions", d: "Monthly gatherings, Q&A, and guided du'a sessions." },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="bg-card border border-border rounded-3xl p-8 text-center">
            <I className="text-gold mx-auto mb-4" />
            <h3 className="font-display text-xl text-primary mb-2">{t}</h3>
            <p className="text-sm text-foreground/70">{d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-2xl mx-auto px-6 lg:px-10 pb-24">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 shadow-elegant">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-4">
                <Check className="text-gold-foreground" />
              </div>
              <h3 className="font-display text-3xl mb-2">Welcome, sister.</h3>
              <p className="text-primary-foreground/80">You'll receive your invitation link by email very soon, in shā' Allāh.</p>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Join the Sisterhood</p>
              <h2 className="font-display text-3xl md:text-4xl mb-8">Reserve your seat in the circle.</h2>
              <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-4">
                <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold" />
                <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold" />
                <input required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold" />
                <button type="submit" className="w-full bg-gradient-gold text-gold-foreground py-4 rounded-full font-medium shadow-gold mt-2">
                  Join the Community
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
