import { motion } from "framer-motion";
import { Search, Layers, Code2, Rocket, MessageCircle } from "lucide-react";

const steps = [
  { icon: Search, title: "Understand Requirements", desc: "Deep-dive into your business context, goals, and constraints before writing a single line of code." },
  { icon: Layers, title: "Scalable Architecture", desc: "Design systems that grow with your business — modular, maintainable, and built for the long term." },
  { icon: Code2, title: "Clean, Maintainable Code", desc: "Well-structured, documented code with proper testing that your team can confidently work with." },
  { icon: Rocket, title: "Production-Ready Delivery", desc: "Solutions deployed with monitoring, error handling, and documentation — ready for real users." },
  { icon: MessageCircle, title: "Clear Communication", desc: "Regular updates, transparent progress tracking, and proactive problem-solving throughout the project." },
];

export default function ApproachSection() {
  return (
    <section id="approach" className="py-24 md:py-32">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How we work together</h2>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-5 p-6 rounded-xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <step.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
