import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

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

function About() {
  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-20 pb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">About COHATA</p>
        <h1 className="font-display text-5xl md:text-6xl text-primary text-balance leading-tight">
          Where faith is not an addition — it is the foundation.
        </h1>
        <p className="mt-8 text-lg text-foreground/70 max-w-3xl text-pretty">
          COHATA (Coach Halima Transformational Academy) is a faith-based transformation and
          development platform dedicated to helping Muslim women and families build lives rooted in
          clarity, structure, and intentional living.
        </p>
      </section>

      <section className="bg-gradient-soft py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-10">
          <div className="bg-card p-10 rounded-3xl shadow-soft">
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Vision</p>
            <p className="font-display text-2xl text-primary leading-relaxed">
              To become a leading global platform for faith-based transformation, raising Muslim
              women and families who are grounded in their identity, aligned in their lives, and
              impactful in their communities.
            </p>
          </div>
          <div className="bg-primary text-primary-foreground p-10 rounded-3xl shadow-elegant">
            <p className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Mission</p>
            <p className="font-display text-2xl leading-relaxed">
              To guide Muslim women and families through structured coaching, counseling, and
              development programs that foster spiritual growth, emotional stability, and
              intentional living rooted in Islamic principles.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">Our Philosophy</p>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-12 text-balance">
            We believe...
          </h2>
          <ul className="space-y-6">
            {[
              "Transformation begins from within.",
              "Faith is the foundation of true change.",
              "Awareness must be followed by structure.",
              "Growth must be intentional, not accidental.",
              "A woman's transformation extends to her home and the Ummah.",
            ].map((p, i) => (
              <li key={i} className="flex gap-6 items-start border-b border-border pb-6">
                <span className="font-display text-3xl text-gold">0{i + 1}</span>
                <p className="font-display text-2xl text-primary/90 leading-snug pt-1">{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-6">What Makes Us Different</p>
          <h2 className="font-display text-3xl md:text-4xl mb-10 text-balance">
            Structured transformation, not just motivation.
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Rooted in Islam, yet practical and applicable",
              "Focus on both individual and family systems",
              "Deep, reflective, and intentional approach",
              "Long-term growth, not temporary change",
            ].map((t) => (
              <div key={t} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-6">
                <p className="text-primary-foreground/90">{t}</p>
              </div>
            ))}
          </div>
          <Link to="/book" className="inline-block mt-12 bg-gradient-gold text-gold-foreground px-8 py-4 rounded-full font-medium shadow-gold">
            Begin your journey
          </Link>
        </div>
      </section>
    </Layout>
  );
}
