import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero.jpg";
import { Heart, Compass, Sparkles, Users, BookOpen, Flower2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "COHATA — Faith. Growth. Transformation." },
      { name: "description", content: "A faith-based transformation academy guiding Muslim women and families toward clarity, structure, and purposeful living." },
    ],
  }),
});

const pillars = [
  { icon: Heart, title: "Healing", text: "Emotional and spiritual restoration." },
  { icon: Compass, title: "Clarity", text: "Identity, direction, and purpose." },
  { icon: Sparkles, title: "Growth", text: "Structured, intentional development." },
  { icon: Flower2, title: "Integration", text: "Living it in home and family." },
];

const services = [
  { title: "Coaching & Counseling", desc: "Personal, marriage, family, and identity coaching rooted in faith.", to: "/services" },
  { title: "Signature Programs", desc: "The SIRAJ Method™, Strategic Woman, Marriage Not the Wedding.", to: "/programs" },
  { title: "Mentorship", desc: "Project 20, Ahlul Jannah Summer Mentorship for kids & teens.", to: "/programs" },
  { title: "Faith & Spiritual Learning", desc: "Qur'an, Tafsir, Du'a workshops, Dhikr sessions.", to: "/services" },
  { title: "Workshops & Training", desc: "Emotional intelligence, communication, parenting, life skills.", to: "/services" },
  { title: "Sisterhood Community", desc: "WhatsApp learning circles and reflection community.", to: "/community" },
];

function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            {/* <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-6 ornament inline-block">
              Coach Halima Transformational Academy
            </p> */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance text-primary">
              A guided journey toward <em className="text-gold not-italic font-display">clarity</em>, structure, and intentional living.
            </h1>
            <p className="mt-8 text-lg text-foreground/70 max-w-xl text-pretty">
              COHATA guides Muslim women and families through coaching, mentorship, and structured programs —
              where Islam is not an addition, but the foundation.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/book" className="bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium shadow-elegant hover:opacity-95 transition inline-flex items-center gap-2">
                Book a Session <ArrowRight size={18} />
              </Link>
              <Link to="/programs" className="border border-primary/25 text-primary px-7 py-4 rounded-full font-medium hover:bg-primary/5 transition">
                Explore Programs
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              {[
                ["1000+", "Women guided"],
                ["12+", "Signature programs"],
                ["7yrs", "Of transformation"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl text-primary">{n}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant relative">
              <img src={heroImg} alt="Two women sitting on a beach facing the ocean" className="w-full h-full object-cover" width={1536} height={1280} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-primary-foreground">
                {/* <p className="font-display italic text-2xl text-balance">
                  "Indeed, Allah will not change the condition of a people until they change what is in themselves."
                </p>
                <p className="text-sm mt-3 opacity-80">— Qur'an 13:11</p> */}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gradient-gold rounded-2xl p-5 shadow-gold hidden md:block">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-foreground/70">Qur'an 13:11</p>
              <p className="font-display text-xl text-gold-foreground">Faith. Growth. Transformation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / Pillars */}
      <section className="bg-gradient-soft py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
              Transformation begins from within — and never stops at the self.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card p-8 rounded-2xl shadow-soft border border-border/60 hover:shadow-elegant transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-2xl text-primary mb-2">{title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">What We Offer</p>
              <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
                A structured ecosystem of transformation.
              </h2>
            </div>
            <Link to="/services" className="text-primary inline-flex items-center gap-2 font-medium hover:gap-3 transition-all">
              View all services <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden border border-border">
            {services.map((s) => (
              <Link key={s.title} to={s.to} className="bg-card p-10 group hover:bg-accent transition">
                <h3 className="font-display text-2xl text-primary mb-3">{s.title}</h3>
                <p className="text-foreground/70 mb-6">{s.desc}</p>
                <span className="text-sm text-gold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Our Approach</p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              The COHATA guided transformation model.
            </h2>
          </div>

          <ol className="grid md:grid-cols-5 gap-px">
            {[
              ["01", "Awareness", "Understanding self and reality"],
              ["02", "Alignment", "Emotional & spiritual grounding"],
              ["03", "Guidance", "Structured learning & coaching"],
              ["04", "Application", "Real-life implementation"],
              ["05", "Transformation", "Sustained growth & impact"],
            ].map(([n, t, d]) => (
              <li key={n} className="border-l border-primary-foreground/15 pl-6 py-4 first:border-l-0 first:pl-0 md:first:pl-6 md:first:border-l">
                <p className="text-gold font-display text-3xl mb-3">{n}</p>
                <h3 className="font-display text-xl mb-2">{t}</h3>
                <p className="text-sm text-primary-foreground/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: "Enroll in a Program", desc: "Long-term, guided journeys.", to: "/programs", cta: "Browse programs" },
            { icon: Users, title: "Join the Community", desc: "Sisterhood, reflection & accountability.", to: "/community", cta: "Join sisterhood" },
            { icon: Heart, title: "Book a Session", desc: "One-on-one coaching & counseling.", to: "/book", cta: "Schedule now" },
          ].map(({ icon: Icon, title, desc, to, cta }) => (
            <div key={title} className="bg-gradient-soft border border-border rounded-3xl p-10 flex flex-col">
              <Icon className="text-gold mb-6" size={32} />
              <h3 className="font-display text-2xl text-primary mb-2">{title}</h3>
              <p className="text-foreground/70 mb-6 flex-1">{desc}</p>
              <Link to={to} className="text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
                {cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
