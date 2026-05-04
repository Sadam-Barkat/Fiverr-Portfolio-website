import { motion } from "framer-motion";
import { ArrowRight, Briefcase, LayoutGrid } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute top-24 left-[8%] w-64 h-64 rounded-full bg-primary/[0.06] blur-3xl" />
      <div
        className="absolute bottom-24 right-[8%] w-80 h-80 rounded-full bg-accent/[0.05] blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      <div className="container relative z-10 text-center max-w-3xl py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/70 bg-card/90 backdrop-blur-sm text-sm text-muted-foreground mb-8 shadow-card">
            <Briefcase size={15} className="text-primary shrink-0" />
            Freelance work samples · Safe to share with buyers
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.12] mb-6 text-foreground"
        >
          A portfolio page for clients—
          <span className="gradient-text"> focused on deliverables</span>
          <span className="text-foreground">, not personal details</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Browse representative projects (problem, approach, stack, and outcome) in one place.
          Descriptions stay high level so you can show quality of work without exposing private or
          off-platform contact information.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl gradient-accent-bg text-primary-foreground font-semibold text-sm hover:opacity-92 transition-opacity shadow-lg"
          >
            View project samples
            <ArrowRight size={16} />
          </a>
          <a
            href="#expertise"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:bg-secondary/80 transition-colors shadow-card"
          >
            <LayoutGrid size={16} className="text-primary" />
            What I build
          </a>
        </motion.div>
      </div>
    </section>
  );
}
