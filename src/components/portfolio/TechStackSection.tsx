import { motion } from "framer-motion";
import { technologies } from "@/data/portfolio-data";

export default function TechStackSection() {
  return (
    <section id="technologies" className="py-24 md:py-32 surface-1">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-bold text-primary tracking-wide uppercase mb-3">Tech stack</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Tools and technologies</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">
            Representative stack—exact tooling depends on each gig&apos;s requirements.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {technologies.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="px-4 py-2.5 rounded-lg border border-border/80 bg-card text-foreground text-sm font-semibold font-mono shadow-card hover:border-primary/35 transition-colors"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
