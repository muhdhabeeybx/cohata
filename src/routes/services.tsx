import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero.jpg";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Brain,
  Flower2,
  Sparkle,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  component: Services,
  head: () => ({
    meta: [
      { title: "Services — Coaching, Counseling & Faith-Based Learning | COHATA" },
      { name: "description", content: "Explore COHATA's coaching, therapy, mentorship, training, faith-based learning, and wellness services for Muslim women and families." },
      { property: "og:title", content: "COHATA Services" },
      { property: "og:description", content: "Coaching, counseling, training, and faith-based learning rooted in Islam." },
    ],
  }),
});

const groups = [
  {
    n: "01",
    icon: MessageCircle,
    title: "Coaching, Therapy & Counseling",
    blurb: "One-to-one and family-centered support for the moments that matter most.",
    items: [
      "One-on-One Therapy & Counseling",
      "Marriage Counseling",
      "Family Counseling",
      "Pre-Marital Guidance",
      "Marriage Support Programme",
      "Life Coaching",
      "Results Coaching",
      "Identity & Self-Development Coaching",
    ],
  },
  {
    n: "02",
    icon: GraduationCap,
    title: "Training, Workshops & Capacity Building",
    blurb: "Practical skills for everyday life — communication, parenting, and beyond.",
    items: [
      "Emotional Intelligence & Anger Management",
      "Communication & Akhlaq Training",
      "Parenting & Marriage Workshops",
      "Public Speaking & Presentation",
      "Financial & Life Skills Training",
    ],
  },
  {
    n: "03",
    icon: BookOpen,
    title: "Faith-Based Learning & Spiritual Development",
    blurb: "Drawing closer to Allah through study, reflection, and remembrance.",
    items: ["Qur'an Study & Tafsir Sessions", "Du'a Workshops", "Dhikr & Spiritual Development Sessions"],
  },
  {
    n: "04",
    icon: Brain,
    title: "Personal Growth & Inner Development",
    blurb: "Slowing down to reconnect with yourself, your mind, and your purpose.",
    items: ["Mind-Body Connection Sessions", "Book Reviews & Guided Reflections"],
  },
  {
    n: "05",
    icon: Flower2,
    title: "Wellness & Complementary Support",
    blurb: "Holistic care for the body alongside the heart and mind.",
    items: ["Hijama (Cupping Therapy)"],
  },
];

function Services() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Our Services</p>
            <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
              A guided system for healing, clarity, and growth.
            </h1>
            <p className="mt-8 text-lg text-foreground/70 max-w-xl text-pretty">
              Each offering is structured, intentional, and rooted in Islamic principles — designed to
              meet you where you are and walk with you toward where Allah is calling you to be.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/book" className="w-full sm:w-auto justify-center bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                Book a Session
              </Link>
              <Link to="/programs" className="w-full sm:w-auto justify-center border-2 border-primary text-primary px-7 py-4 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition inline-flex items-center gap-2">
                See Our Programs
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src={heroImg} alt="A coaching session in progress" className="w-full h-full object-cover" width={1536} height={1280} />
            </div>
          </div>
        </div>
      </section>

      {/* Service categories — clean editorial list, alternating sides & background tone */}
      <section>
        {groups.map((g, i) => (
          <div key={g.n} className={i % 2 === 0 ? "bg-background" : "bg-secondary/40"}>
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
              <div className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-start ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                {/* Text side */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <g.icon size={20} />
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="text-2xl text-gold">{g.n}</span>
                      <h2 className="font-display text-3xl md:text-4xl text-primary text-balance">{g.title}</h2>
                    </div>
                  </div>
                  <p className="text-foreground/60 max-w-lg mb-8">{g.blurb}</p>
                  <ul className="space-y-3">
                    {g.items.map((it) => (
                      <li key={it} className="group flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                        <span className="inline-flex items-center gap-3 text-foreground/80">
                          <Sparkle className="text-gold shrink-0" size={14} />
                          {it}
                        </span>
                        <Link to="/book" className="text-sm text-gold inline-flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                          Book <ArrowRight size={13} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image side */}
                <div className="lg:col-span-5">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                    <img src={heroImg} alt={g.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="pb-20 pt-4 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-neutral-950 text-white rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden border border-gold/20">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,white,transparent_35%),radial-gradient(circle_at_75%_80%,var(--gold),transparent_45%)]" />
            <div className="relative">
              <Sparkles className="text-gold mx-auto mb-6" size={32} />
              <h2 className="font-display text-3xl md:text-5xl text-balance max-w-2xl mx-auto mb-6">
                Not sure where to begin?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-10 text-pretty">
                Book a discovery session and we'll guide you to the path that fits your season — no guesswork, just clarity.
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4">
                <Link to="/book" className="w-full sm:w-auto justify-center bg-gold text-gold-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                  <Calendar size={18} /> Book a Discovery Session
                </Link>
                <Link to="/programs" className="w-full sm:w-auto justify-center border-2 border-white/25 text-white px-7 py-4 rounded-full font-medium hover:bg-white/10 transition inline-flex items-center gap-2">
                  Browse Programs <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
