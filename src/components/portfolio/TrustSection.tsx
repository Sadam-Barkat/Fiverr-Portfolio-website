import { motion } from "framer-motion";
import { Server, Bot, Plug, Cog, Database, Layout } from "lucide-react";

const cards = [
  { icon: Server, title: "Backend Systems", desc: "Scalable server architectures, microservices, and high-performance APIs built for production workloads.", color: "from-teal-600 to-cyan-700" },
  { icon: Bot, title: "AI Agents", desc: "Intelligent conversational agents and autonomous systems powered by modern language models and RAG pipelines.", color: "from-slate-600 to-slate-800" },
  { icon: Plug, title: "APIs & Integrations", desc: "RESTful APIs and third-party integrations that connect your business tools into seamless workflows.", color: "from-teal-700 to-teal-900" },
  { icon: Cog, title: "Automation Tools", desc: "Custom automation solutions that eliminate manual processes and reduce operational overhead.", color: "from-amber-600 to-orange-700" },
  { icon: Database, title: "Database Design", desc: "Optimized database architectures with proper indexing, migrations, and data integrity patterns.", color: "from-cyan-700 to-teal-800" },
  { icon: Layout, title: "Full Stack Apps", desc: "End-to-end web applications with modern frontends, robust backends, and reliable deployment pipelines.", color: "from-slate-700 to-slate-900" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function TrustSection() {
  return (
    <section id="expertise" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-bold text-primary tracking-wide uppercase mb-3">Services</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">What I deliver for clients</h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group p-6 rounded-2xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
