import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import services from "@/assets/WhatsApp Image 2026-06-17 at 11.02.03 (2).jpeg";
import coachingImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.52.jpeg";
import trainingImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.43.jpeg";
import faithImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.55.jpeg";
import growthImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.45.jpeg";
import wellnessImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.59.jpeg";
import mentorshipImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.42.jpeg";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Brain,
  Flower2,
  Users,
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
  description: "Life brings seasons of joy, uncertainty, and change. Through coaching, therapy, and family centered counseling, we provide compassionate guidance that helps you heal, grow, and move forward with confidence and clarity.",
  img: coachingImg,
},
{
  n: "02",
  icon: GraduationCap,
  title: "Training, Workshops & Capacity Building",
  description: "Growth begins with learning. Our practical workshops help you strengthen communication, leadership, parenting, emotional wellbeing, and life skills that empower you to thrive in everyday situations.",
  img: trainingImg,
},
{
  n: "03",
  icon: BookOpen,
  title: "Faith-Based Learning & Spiritual Development",
  description: "Deepen your connection with Allah through meaningful learning, reflection, and worship. From Qur'an study to guided remembrance, every session is designed to nurture faith and strengthen the heart.",
  img: faithImg,
},
{
  n: "04",
  icon: Brain,
  title: "Personal Growth & Inner Development",
  description: "True transformation begins within. Through guided reflections, thoughtful discussions, and personal development sessions, we help you build self awareness, purpose, and lasting inner strength.",
  img: growthImg,
},
{
  n: "05",
  icon: Flower2,
  title: "Wellness & Complementary Support",
  description: "Caring for yourself is part of the journey. Through Sunnah inspired wellness practices and holistic support, we encourage balance, renewal, and healthy living for both body and mind.",
  img: wellnessImg,
},
{
  n: "06",
  icon: Users,
  title: "Mentorship & Sisterhood Community",
  description: "No one is meant to walk alone. Our mentorship programs and sisterhood circles create a supportive space where women and families can learn, connect, and grow together in faith.",
  img: mentorshipImg,
},
];

function Services() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={services} alt="A coaching session in progress" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/40" />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-16">
          <div className="grid lg:grid-cols-12 gap-8 w-full items-end">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Our Services</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground text-balance leading-tight">
                A guided system for <em className="text-gold italic font-display">healing</em>, clarity, and growth.
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-white text-pretty lg:text-right">
                Each offering is structured, intentional, and rooted in Islamic principles — designed to
                meet you where you are and walk with you toward where Allah is calling you to be.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service categories — equal-length card grid */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-12 lg:px-10">
          <div className="grid md:grid-cols-2 gap-8">
            {groups.map((g) => (
              <div key={g.n} className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
                <div className="relative h-64">
                  <img src={g.img} alt={g.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0" />
                  <div className="absolute -bottom-5 left-12 z-10 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center">
                    <g.icon size={18} />
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-12">
                  <p className="text-2xl font-semibold mb-2 text-primary">{g.title}</p>
                  <p className="text-black text-lg leading-relaxed mb-5">{g.description}</p>
                  <Link to="/book" className="mt-auto text-lg font-medium text-primary inline-flex items-center gap-1.5 w-fit border-b border-primary/30 pb-0.5 hover:border-primary transition-colors">
                    Book a session <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
