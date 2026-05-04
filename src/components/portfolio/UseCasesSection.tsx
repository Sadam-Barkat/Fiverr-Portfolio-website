import { motion } from "framer-motion";
import { UseCase } from "@/data/portfolio-data";
import { Zap, Bot, Globe, Link, BarChart3, Wrench } from "lucide-react";

const icons = [Zap, Bot, Globe, Link, BarChart3, Wrench];

interface Props {
  useCases: UseCase[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function UseCasesSection({ useCases }: Props) {
  return (
    <section id="use-cases" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Typical engagements</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kinds of projects I take on</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {useCases.map((uc, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={uc.id}
                variants={item}
                className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={uc.thumbnailUrl || `https://placehold.co/1200x800?text=${encodeURIComponent(uc.title)}`}
                    alt={uc.title}
                    className="w-full aspect-[16/10] object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute left-5 top-5 w-11 h-11 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
