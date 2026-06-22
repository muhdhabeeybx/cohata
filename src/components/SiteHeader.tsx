import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/cohata-logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/programs", label: "Programs" },
  { to: "/community", label: "Community" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-card/90 shadow-soft">
      <div className="h-[2px] bg-gradient-gold" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img src={logo} alt="COHATA — Coach Halima Transformational Academy" className="h-10 md:h-12 w-auto" />
          <span className="sr-only">COHATA</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative py-2 text-sm font-medium text-foreground/65 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex flex-shrink-0 items-center gap-3">
          <Link
            to="/admin/login"
            className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground/70 transition hover:border-primary hover:text-primary"
          >
            Login
          </Link>
          <Link
            to="/book"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Begin Your Journey
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="flex flex-col gap-1 px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/40 py-3 text-sm font-medium text-foreground/70 transition-colors last:border-0 hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Begin Your Journey
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/70"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
