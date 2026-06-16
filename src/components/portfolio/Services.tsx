"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { Code, Server, Palette, Cloud, Smartphone, Database, Globe, Shield, Lightbulb } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  order: number;
}

interface ServicesProps {
  services: Service[];
  sectionTitle: string;
}

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  server: Server,
  palette: Palette,
  cloud: Cloud,
  smartphone: Smartphone,
  database: Database,
  globe: Globe,
  shield: Shield,
  lightbulb: Lightbulb,
};

export default function Services({ services, sectionTitle }: ServicesProps) {
  return (
    <section id="services" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={sectionTitle || "What I Offer"} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const IconComponent = iconMap[service.icon] || Code;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
