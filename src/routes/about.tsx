import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero.jpg";
import {
  Heart,
  Compass,
  Sparkles,
  Flower2,
  ArrowRight,
  Quote,
  Target,
  Eye,
  ShieldCheck,
  Users,
  BookOpen,
  Calendar,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About COHATA — Faith-Based Transformation Academy" },
      { name: "description", content: "Learn about COHATA's vision, mission, and philosophy of guiding Muslim women and families through structured transformation." },
      { property: "og:title", content: "About COHATA" },
      { property: "og:description", content: "Faith-based transformation rooted in Islam — vision, mission, and philosophy." },
    ],
  }),
});

const beliefs = [
  { icon: Sparkles, text: "Transformation begins from within." },
  { icon: Heart, text: "Faith is the foundation of true change." },
  { icon: Compass, text: "Awareness must be followed by structure." },
  { icon: Target, text: "Growth must be intentional, not accidental." },
  { icon: Flower2, text: "A woman's transformation extends to her home and the Ummah." },
];

const different = [
  { icon: ShieldCheck, title: "Rooted in faith", text: "Practical and applicable, drawn from Islamic principles." },
  { icon: Users, title: "Whole-family focus", text: "We work with both the individual and the family system." },
  { icon: BookOpen, title: "Deep & reflective", text: "An intentional approach, not a quick-fix mindset." },
  { icon: Star, title: "Built to last", text: "Long-term growth, not temporary motivation." },
];

const milestones = [
  ["7+", "Years guiding transformation"],
  ["1000+", "Women & families supported"],
  ["12+", "Signature programs & workshops"],
  ["5", "Stages in the COHATA model"],
];

function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold mb-6 bg-gold/15 px-4 py-2 rounded-full">
              <Sparkles size={14} /> About COHATA
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
              Where faith is not an addition — it is the foundation.
            </h1>
            <p className="mt-8 text-lg text-foreground/70 max-w-xl text-pretty">
              COHATA (Coach Halima Transformational Academy) is a faith-based transformation and
              development platform dedicated to helping Muslim women and families build lives rooted in
              clarity, structure, and intentional living.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/book" className="bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                <Heart size={18} /> Book a Session
              </Link>
              <Link to="/programs" className="border-2 border-primary text-primary px-7 py-4 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition inline-flex items-center gap-2">
                Explore Programs <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden relative border-4 border-gold/30">
              <img src={heroImg} alt="Coach Halima with women from the COHATA community" className="w-full h-full object-cover" width={1536} height={1280} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/5 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gradient-gold rounded-2xl p-5 hidden md:flex items-center gap-3">
              <Quote className="text-gold-foreground" size={22} />
              <p className="font-display text-lg text-gold-foreground max-w-[12rem] leading-snug">
                "Every transformation begins with a single, honest step."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission — bold dark band */}
      <section className="py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_15%_25%,white,transparent_42%),radial-gradient(circle_at_85%_75%,var(--gold),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-6 relative">
          <div className="bg-primary-foreground/[0.06] border border-primary-foreground/15 p-10 rounded-3xl">
            <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold flex items-center justify-center mb-6">
              <Eye size={22} />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Vision</p>
            <p className="font-display text-2xl leading-relaxed text-balance">
              To become a leading global platform for faith-based transformation, raising Muslim
              women and families who are grounded in their identity, aligned in their lives, and
              impactful in their communities.
            </p>
          </div>
          <div className="bg-gold/15 border border-gold/30 p-10 rounded-3xl">
            <div className="w-12 h-12 rounded-xl bg-gold text-gold-foreground flex items-center justify-center mb-6">
              <Target size={22} />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Mission</p>
            <p className="font-display text-2xl leading-relaxed text-balance">
              To guide Muslim women and families through structured coaching, counseling, and
              development programs that foster spiritual growth, emotional stability, and
              intentional living rooted in Islamic principles.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones strip */}
      <section className="py-16 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {milestones.map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-4xl md:text-5xl text-primary">{n}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder spotlight — image forward */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-square rounded-3xl overflow-hidden relative border-4 border-primary/15">
              <img src={heroImg} alt="Coach Halima, founder of COHATA" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/35 via-transparent to-primary/30" />
            </div>
            <div className="absolute -top-6 -right-6 bg-primary text-primary-foreground rounded-2xl p-5 hidden md:flex items-center gap-3">
              <Sparkles className="text-gold" size={22} />
              <p className="font-display text-lg">Meet Coach Halima</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4 inline-flex items-center gap-2">
              <Heart size={14} /> The Heart Behind COHATA
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance mb-6">
              A guide who has walked the journey herself.
            </h2>
            <p className="text-foreground/70 text-lg max-w-xl text-pretty mb-4">
              Coach Halima founded COHATA from a simple conviction: that real transformation happens
              when faith, structure, and genuine care come together. Every program, every session, and
              every community circle carries that same intention — to walk alongside you, not just point
              you in a direction.
            </p>
            <p className="text-foreground/70 text-lg max-w-xl text-pretty mb-8">
              Over the years, that conviction has grown into a full academy — coaching, mentorship,
              workshops, and a sisterhood — all rooted in Islamic principles and built for real life.
            </p>
            <Link to="/book" className="bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2 w-fit">
              <Calendar size={18} /> Book Time With Coach Halima
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy — We believe */}
      <section className="py-24 bg-secondary/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Our Philosophy</p>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-12 text-balance">
            We believe...
          </h2>
          <ul className="space-y-4">
            {beliefs.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex gap-6 items-center bg-card border-2 border-border hover:border-gold/50 rounded-2xl p-6 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={22} />
                </div>
                <p className="font-display text-xl md:text-2xl text-primary/90 leading-snug">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-14 text-center mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">What Makes Us Different</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
              Structured transformation, not just motivation.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {different.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card border-2 border-primary/10 hover:border-gold/40 rounded-2xl p-7 transition">
                <div className="w-12 h-12 rounded-xl bg-gold text-gold-foreground flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl text-primary mb-2">{title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — black band to match brand rhythm */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-neutral-950 text-white rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden border border-gold/20">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,white,transparent_35%),radial-gradient(circle_at_75%_80%,var(--gold),transparent_45%)]" />
            <div className="relative">
              <Sparkles className="text-gold mx-auto mb-6" size={32} />
              <h2 className="font-display text-3xl md:text-5xl text-balance max-w-2xl mx-auto mb-6">
                Ready to begin your own story of transformation?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-10 text-pretty">
                Whether it's a conversation, a program, or a community — your first step starts here.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/book" className="bg-gold text-gold-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                  <Heart size={18} /> Begin Your Journey
                </Link>
                <Link to="/programs" className="border-2 border-white/25 text-white px-7 py-4 rounded-full font-medium hover:bg-white/10 transition inline-flex items-center gap-2">
                  Explore Programs <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
