import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

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
    title: "Coaching, Therapy & Counseling",
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
    title: "Training, Workshops & Capacity Building",
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
    title: "Faith-Based Learning & Spiritual Development",
    items: [
      "Qur'an Study & Tafsir Sessions",
      "Du'a Workshops",
      "Dhikr & Spiritual Development Sessions",
    ],
  },
  {
    n: "04",
    title: "Personal Growth & Inner Development",
    items: ["Mind-Body Connection Sessions", "Book Reviews & Guided Reflections"],
  },
  {
    n: "05",
    title: "Wellness & Complementary Support",
    items: ["Hijama (Cupping Therapy)"],
  },
];

function Services() {
  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Our Services</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          A guided system for healing, clarity, and growth.
        </h1>
        <p className="mt-8 text-lg text-foreground/70 max-w-3xl">
          Each offering is structured, intentional, and rooted in Islamic principles — designed to
          meet you where you are and walk with you toward where Allah is calling you to be.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24 space-y-6">
        {groups.map((g) => (
          <div key={g.n} className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-soft">
            <div className="flex items-baseline gap-6 mb-8">
              <span className="font-display text-4xl text-gold">{g.n}</span>
              <h2 className="font-display text-2xl md:text-3xl text-primary">{g.title}</h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {g.items.map((it) => (
                <li key={it} className="text-foreground/80 border-b border-border/60 pb-3 flex justify-between items-center group">
                  <span>{it}</span>
                  <Link to="/book" className="text-xs text-gold opacity-0 group-hover:opacity-100 transition">Book →</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl mb-6 text-balance">Not sure where to begin?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Book a discovery session and we'll guide you to the path that fits your season.
          </p>
          <Link to="/book" className="bg-gradient-gold text-gold-foreground px-8 py-4 rounded-full font-medium shadow-gold inline-block">
            Book a Discovery Session
          </Link>
        </div>
      </section>
    </Layout>
  );
}
