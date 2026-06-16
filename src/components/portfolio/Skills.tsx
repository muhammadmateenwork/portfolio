"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import {
  Code, Server, Palette, Cloud, Smartphone, Database,
  Globe, Shield, Lightbulb, RefreshCw, MessageSquare,
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  icon: string;
  category: string;
  proficiency: number;
  visible: boolean;
  order: number;
}

interface SkillsProps {
  skills: Skill[];
  sectionTitle: string;
}

const lucideIconMap: Record<string, React.ElementType> = {
  code: Code,
  server: Server,
  palette: Palette,
  cloud: Cloud,
  smartphone: Smartphone,
  database: Database,
  globe: Globe,
  shield: Shield,
  lightbulb: Lightbulb,
  refresh: RefreshCw,
  chat: MessageSquare,
};

const categoryColors: Record<string, string> = {
  Frontend: "from-emerald-500 to-emerald-400",
  Backend: "from-teal-500 to-teal-400",
  DevOps: "from-cyan-500 to-cyan-400",
  Other: "from-emerald-600 to-emerald-500",
};

function SkillIcon({ icon, name }: { icon: string; name: string }) {
  // Check if it's a Lucide icon name
  const LucideIcon = lucideIconMap[icon?.toLowerCase()];
  if (LucideIcon) {
    return <LucideIcon className="h-8 w-8 text-emerald-400" />;
  }

  // Check if it's a URL (Cloudinary, etc.)
  if (icon && (icon.startsWith("http") || icon.startsWith("/"))) {
    return (
      <img
        src={icon}
        alt={name}
        className="h-10 w-10 object-contain"
        onError={(e) => {
          // Fallback to initials on error
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-lg font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent select-none">${name.slice(0, 2).toUpperCase()}</span>`;
          }
        }}
      />
    );
  }

  // Fallback: initials
  return (
    <span className="text-lg font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent select-none">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function Skills({ skills, sectionTitle }: SkillsProps) {
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <section id="skills" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={sectionTitle || "Skills & Expertise"} />

        <div className="space-y-12">
          {categories.map((category) => {
            const categorySkills = skills.filter((s) => s.category === category);
            const gradientColor = categoryColors[category] || categoryColors.Other;

            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-zinc-300 mb-6 flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradientColor}`} />
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categorySkills.map((skill, i) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                        <SkillIcon icon={skill.icon} name={skill.name} />
                      </div>
                      <span className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors mb-2">
                        {skill.name}
                      </span>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.proficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.05 + 0.3, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${gradientColor} rounded-full`}
                        />
                      </div>
                      <span className="text-xs text-zinc-500 mt-1.5">{skill.proficiency}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
