import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Phone, Mail, MapPin, Linkedin, Instagram, MessageCircle, Check, Send } from "lucide-react";
import { api } from "@/lib/api";
import contactHeroImg from "@/assets/WhatsApp Image 2026-06-17 at 11.01.58.jpeg";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Us | COHATA" },
      { name: "description", content: "Get in touch with Coach Halima Transformational Academy — phone, WhatsApp, email, and our office address in Abuja." },
      { property: "og:title", content: "Contact COHATA" },
      { property: "og:description", content: "Reach out to COHATA — we'd love to hear from you." },
    ],
  }),
});

const CONTACT_PHONE = "08029337591";
const CONTACT_PHONE_INTL = "2348029337591";
const CONTACT_EMAIL = "hello@cohatacademy.com";
const CONTACT_ADDRESS = "36 Lord Lugard Street, Area 11, Abuja";

const CONTACT_CARDS = [
  { icon: Phone, label: "Call Us", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
  { icon: MessageCircle, label: "WhatsApp", value: CONTACT_PHONE, href: `https://wa.me/${CONTACT_PHONE_INTL}` },
  { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, label: "Visit Us", value: CONTACT_ADDRESS, href: undefined },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/cohataofficial/" },
  { icon: Linkedin, label: "LinkedIn", href: "https://ng.linkedin.com/company/cohatainstitute" },
];

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/contact", form);
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again or reach us directly via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={contactHeroImg} alt="Coach Halima speaking to the COHATA community" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/40" />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex items-end pb-16">
          <div className="grid lg:grid-cols-12 gap-8 w-full items-end">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Contact Us</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground text-balance leading-tight">
                We'd love to <em className="text-gold italic font-display">hear</em> from you.
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg text-white text-pretty lg:text-right">
                Questions about a program, a session, or just want to say salām — reach us however is easiest for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_CARDS.map(({ icon: Icon, label, value, href }) => {
              const cardClass = "bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/30 transition-colors";
              const inner = (
                <>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={19} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
                  </div>
                </>
              );
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className={cardClass}>
                  {inner}
                </a>
              ) : (
                <div key={label} className={cardClass}>{inner}</div>
              );
            })}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3 mt-8">
            <span className="text-sm text-muted-foreground">Follow us:</span>
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="w-9 h-9 rounded-full border border-border text-foreground/70 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      {/* <section className="pb-24 bg-background">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 shadow-elegant">
            {done ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-4">
                  <Check className="text-gold-foreground" />
                </div>
                <h3 className="text-3xl mb-2">Message sent.</h3>
                <p className="text-primary-foreground/80">JazākAllāhu khayran for reaching out — our team will get back to you shortly, in shā' Allāh.</p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Send a Message</p>
                <h2 className="font-display text-3xl md:text-4xl mb-8">We typically reply within a day.</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold" />
                  <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold" />
                  <textarea required rows={4} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold resize-none" />
                  {error && <p className="text-sm text-red-300">{error}</p>}
                  <button type="submit" disabled={submitting} className="w-full bg-gradient-gold text-gold-foreground py-4 rounded-full font-medium shadow-gold mt-2 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                    {submitting ? "Sending…" : <>Send Message <Send size={16} /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section> */}
    </Layout>
  );
}
