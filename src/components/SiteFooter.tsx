import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-4">Stay Connected</p>
            <h3 className="text-3xl md:text-4xl mb-4 text-balance">
              Reflections, reminders & program updates — delivered with intention.
            </h3>
            <p className="text-primary-foreground/70 mb-6 text-pretty">
              Join thousands of Muslim women receiving guidance, structured reflections, and early
              access to COHATA programs.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
              className="flex flex-col sm:flex-row gap-2 max-w-md"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="bg-gradient-gold text-gold-foreground px-6 py-3 rounded-full font-medium hover:opacity-95 transition shadow-gold"
              >
                {sent ? "Subscribed ✓" : "Subscribe"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Explore</p>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/community">Community</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Engage</p>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/book">Book a Session</Link></li>
              <li><Link to="/programs">Enroll</Link></li>
              <li><Link to="/community">Join Community</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Brand Essence</p>
            <p className="text-xl text-primary-foreground/90">
              Faith. Growth. Transformation.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 pt-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-primary-foreground/60">
          <p suppressHydrationWarning>© {new Date().getFullYear()} COHATA — Coach Halima Transformational Academy.</p>
          <p className="italic">In every reflection, an invitation to return.</p>
        </div>
      </div>
    </footer>
  );
}
