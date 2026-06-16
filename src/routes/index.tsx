import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import heroImg from "@/assets/hero.jpg";
import {
  Heart,
  Compass,
  Sparkles,
  Users,
  BookOpen,
  Flower2,
  ArrowRight,
  MessageCircle,
  Calendar,
  GraduationCap,
  Sun,
  Smile,
  Star,
  Feather,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "COHATA — Faith. Growth. Transformation." },
      { name: "description", content: "A warm, faith-based space for Muslim women and families to heal, grow, and live with intention — coaching, programs, and a sisterhood community." },
    ],
  }),
});

const moods = [
  { icon: Smile, title: "I need to talk to someone", desc: "Book a 1:1 coaching or counseling session.", to: "/book", cta: "Book a session" },
  { icon: Compass, title: "I want more direction", desc: "Find a structured program built for your season of life.", to: "/programs", cta: "Explore programs" },
  { icon: Users, title: "I want to belong somewhere", desc: "Join a warm sisterhood of women growing together.", to: "/community", cta: "Join the community" },
  { icon: BookOpen, title: "I want to learn & grow", desc: "Browse workshops, faith learning, and skill-building.", to: "/services", cta: "See what's on offer" },
];

const pillars = [
  { icon: Heart, title: "Healing", text: "Emotional and spiritual restoration, gently paced." },
  { icon: Compass, title: "Clarity", text: "Discover your identity, direction, and purpose." },
  { icon: Sparkles, title: "Growth", text: "Structured, intentional development that sticks." },
  { icon: Flower2, title: "Integration", text: "Living it out — at home, at work, in your heart." },
];

const services = [
  { icon: MessageCircle, title: "Coaching & Counseling", desc: "Personal, marriage, family, and identity coaching rooted in faith.", to: "/services" },
  { icon: Star, title: "Signature Programs", desc: "The SIRAJ Method™, Strategic Woman, Marriage Not the Wedding.", to: "/programs" },
  { icon: GraduationCap, title: "Mentorship", desc: "Project 20, Ahlul Jannah Summer Mentorship for kids & teens.", to: "/programs" },
  { icon: Feather, title: "Faith & Spiritual Learning", desc: "Qur'an, Tafsir, Du'a workshops, Dhikr sessions.", to: "/services" },
  { icon: Sun, title: "Workshops & Training", desc: "Emotional intelligence, communication, parenting, life skills.", to: "/services" },
  { icon: Heart, title: "Sisterhood Community", desc: "WhatsApp learning circles and reflection community.", to: "/community" },
];

const steps = [
  { n: "01", title: "Awareness", desc: "Understanding self and reality", icon: Sun },
  { n: "02", title: "Alignment", desc: "Emotional & spiritual grounding", icon: Compass },
  { n: "03", title: "Guidance", desc: "Structured learning & coaching", icon: BookOpen },
  { n: "04", title: "Application", desc: "Real-life implementation", icon: Sparkles },
  { n: "05", title: "Transformation", desc: "Sustained growth & impact", icon: Flower2 },
];

function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            {/* <p className="inline-flex items-center gap-2 text-xs uppercase letter-height text-gold mb-6 bg-gold/15 px-4 py-2 rounded-full">
              <Sparkles size={12} /> Welcome, you're in the right place
            </p> */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance text-primary">
              A warm <em className="text-gold italic font-display">space</em> for <em className="text-gold italic font-display">healing</em>, clarity & intentional living.
            </h1>
            <p className="mt-5 text-lg text-foreground/70 max-w-xl leading-snug text-pretty">
              COHATA guides Muslim women and families through coaching, mentorship, and structured programs —
              where faith isn't an add-on, it's the foundation. Wherever you're starting from, there's a place for you here.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/book" className="w-full sm:w-auto justify-center bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                <Heart size={16} /> Book a Session
              </Link>
              <Link to="/programs" className="w-full sm:w-auto justify-center border border-grey-600 text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition inline-flex items-center gap-2">
                Explore Programs <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative self-stretch">
            <div className="aspect-[4/5] lg:aspect-auto lg:h-full rounded-3xl overflow-hidden relative">
              <img src={heroImg} alt="Two women sitting on a beach facing the ocean" className="w-full h-full object-cover" width={1536} height={1000} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/5 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-gradient-gold rounded-2xl p-5 hidden md:flex items-center gap-3">
              <Sparkles className="text-gold-foreground" size={22} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-foreground/70">Qur'an 13:11</p>
                <p className="text-xl font-semibold text-gold-foreground">Faith. Growth. Transformation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      {/* <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
            {[
              { icon: Users, n: "1000+", label: "Women & families guided" },
              { icon: GraduationCap, n: "12+", label: "Signature programs" },
              { icon: Calendar, n: "7+", label: "Years of transformation" },
              { icon: Sparkles, n: "5", label: "Stages in the COHATA model" },
            ].map(({ icon: Icon, n, label }) => (
              <div key={label} className="flex flex-col gap-3">
                <Icon className="text-gold" size={22} />
                <p className="text-2xl md:text-4xl font-semibold text-primary tracking-tight leading-none">{n}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-foreground/55 leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* "What brings you here today?" — bold dark mood-nav block for contrast against hero */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4 inline-flex items-center gap-2">
              <Smile size={14} /> Start Here
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              What brings you here <em className="text-gold italic font-display">today?</em>
            </h2>
            <p className="mt-4 text-primary-foreground/70 text-lg">
              No pressure to know exactly what you need; just pick what feels closest, and we'll meet you there.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moods.map(({ icon: Icon, title, desc, to, cta }) => (
              <Link key={title} to={to} className="group bg-primary-foreground/[0.06] hover:bg-primary-foreground/[0.12] p-7 rounded-2xl  transition flex flex-col">
                <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-5 group-hover:bg-gold group-hover:text-gold-foreground transition">
                  <Icon size={22} />
                </div>
                <p className="text-xl font-semibold mb-2 text-balance">{title}</p>
                <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6 flex-1">{desc}</p>
                <span className="text-sm text-gold inline-flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                  {cta} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Pillars */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
              Transformation begins from <em className="text-gold italic font-display">within</em> and never stops at the <em className="text-gold italic font-display">self.</em>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card p-8 rounded-2xl border-1 border-gold/10 hover:border-gold/40 transition">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <p className="text-xl font-semibold mb-2 text-primary">{title}</p>
                <p className="text-foreground/70 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image break / quote band */}
      <section className="relative h-[80vh] min-h-[460px] overflow-hidden">
        <img src={heroImg} alt="Women reflecting together by the ocean" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/55 to-gold/30" />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-center">
          <div className="max-w-xl">
            <Feather className="text-gold mb-6" size={32} />
            <h3 className="italic text-3xl md:text-5xl text-primary-foreground text-balance leading-snug">
              "Indeed, Allah will not change the condition of a people until they change what is in themselves."
            </h3>
            <p className="text-primary-foreground/70 uppercase mt-4 mb-8">— Qur'an 13:11</p>
            <Link to="/about" className="bg-gold text-gold-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2 w-fit">
              Discover Our Story <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">What We Offer</p>
              <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
                A structured ecosystem of <em className="text-gold italic font-display">transformation.</em>
              </h2>
            </div>
            <Link to="/services" className="text-primary inline-flex items-center gap-2 font-medium hover:gap-3 transition-all">
              View all services <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, to }) => (
              <Link key={title} to={to} className="group bg-card p-8 rounded-2xl border-1 border-gold/10 hover:border-gold transition flex flex-col">
                <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>
                <p className="text-xl font-semibold mb-2 text-primary">{title}</p>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6 flex-1">{desc}</p>
                <span className="text-sm text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                  Learn more <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Approach — bold dark band again for rhythm */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_80%_30%,white,transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Our Approach</p>
            <h2 className="font-display text-4xl md:text-5xl text-balance">
              The COHATA guided <em className="text-gold italic font-display">transformation</em> model.
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/70 text-pretty">
              A gentle, five-stage rhythm that meets you where you are and walks with you toward where you're going.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
            {steps.map(({ n, title, desc, icon: Icon }) => (
              <li key={n} className="bg-primary-foreground/[0.06] rounded-2xl p-6 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gold text-sm">{n}</span>
                  <Icon className="text-gold" size={20} />
                </div>
                <p className="text-xl font-semibold mb-2 text-white">{title}</p>
                <p className="text-sm text-primary-foreground/70">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Community / sisterhood — image forward */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden relative">
              <img src={heroImg} alt="Sisterhood and community" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/40 via-transparent to-primary/30" />
            </div>
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-2xl p-3 hidden md:flex items-center gap-3">
              <Users className="text-gold" size={16} />
              <p className="text-sm font-medium">Over 100+ women, one sisterhood</p>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4 inline-flex items-center gap-2">
              <Users size={14} /> Sisterhood
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance mb-6">
              You don't have to <em className="text-gold italic font-display">grow</em> alone. 
            </h2>
            <p className="text-foreground/70 text-lg max-w-xl text-pretty mb-8">
              Step into a community of women who show up for each other — through reflection circles,
              accountability spaces, and conversations that hold both faith and real life with care.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: MessageCircle, title: "Reflection Circles" },
                { icon: Heart, title: "Accountability Spaces" },
                { icon: BookOpen, title: "Learning Together" },
                { icon: Star, title: "Celebrating Wins" },
              ].map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-3 bg-secondary/50 border border-border rounded-xl px-4 py-3">
                  <Icon className="text-gold shrink-0" size={18} />
                  <p className="font-medium text-primary text-sm">{title}</p>
                </div>
              ))}
            </div>
            <Link to="/community" className="bg-primary text-primary-foreground px-7 py-4 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2 w-fit">
              <Users size={18} /> Join the Sisterhood
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-24 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Ready When You Are</p>
            <h2 className="font-display text-4xl md:text-5xl text-primary text-balance">
              Whatever step you're ready for, take it <em className="text-gold italic font-display">today</em>!
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Enroll in a Program", desc: "Long-term, guided journeys built around you.", to: "/programs", cta: "Browse programs" },
              { icon: Users, title: "Join the Community", desc: "Sisterhood, reflection & accountability.", to: "/community", cta: "Join sisterhood" },
              { icon: Heart, title: "Book a Session", desc: "One-on-one coaching & counseling, at your pace.", to: "/book", cta: "Schedule now" },
            ].map(({ icon: Icon, title, desc, to, cta }) => (
              <div key={title} className="bg-card border-1 border-gold/10 hover:border-gold/30 rounded-3xl p-10 flex flex-col transition">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-6">
                  <Icon size={20} />
                </div>
                <p className="text-xl font-semibold mb-2 text-primary">{title}</p>
                <p className="text-foreground/70 mb-6 flex-1">{desc}</p>
                <Link to={to} className="text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
                  {cta} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final banner CTA — black/near-black for punch */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-neutral-950 text-white rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden border border-gold/20">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,white,transparent_35%),radial-gradient(circle_at_75%_80%,var(--gold),transparent_45%)]" />
            <div className="relative">
              <Sparkles className="text-gold mx-auto mb-6" size={32} />
              <h2 className="font-display text-3xl md:text-5xl text-balance max-w-2xl mx-auto mb-6">
                Your next chapter of <em className="text-gold italic font-display">clarity and growth</em> starts with one small step.
              </h2>
              <p className="text-white/60 max-w-xl text-lg mx-auto mb-10 text-pretty">
                Book a free intro chat, explore a program, or simply join the community — however you begin, we're glad you're here.
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4">
                <Link to="/book" className="w-full sm:w-auto justify-center bg-gold text-gold-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition inline-flex items-center gap-2">
                  <Calendar size={18} /> Book a Session
                </Link>
                <Link to="/about" className="w-full sm:w-auto justify-center bg-white text-neutral-900 px-6 py-3 rounded-full font-medium hover:bg-white/90 transition inline-flex items-center gap-2">
                  Learn About COHATA <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
