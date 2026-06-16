"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import {
  Code, Server, Palette, Cloud, Smartphone, Database,
  Globe, Shield, Lightbulb, RefreshCw, MessageSquare,
} from "lucide-react";

interface CardItem {
  icon: string;
  title: string;
  description: string;
}

interface TimelineItem {
  step: number;
  title: string;
  description: string;
}

interface CustomSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  content: string;
  type: string;
  cards: CardItem[];
  timelines: TimelineItem[];
  visible: boolean;
  order: number;
}

interface CustomSectionsProps {
  sections: CustomSection[];
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

function IconRenderer({ icon, className }: { icon: string; className?: string }) {
  const LucideIcon = lucideIconMap[icon?.toLowerCase()];
  if (LucideIcon) {
    return <LucideIcon className={className || "h-6 w-6 text-emerald-400"} />;
  }
  if (icon && (icon.startsWith("http") || icon.startsWith("/"))) {
    return (
      <img
        src={icon}
        alt=""
        className="h-6 w-6 object-contain"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
        }}
      />
    );
  }
  return <Code className={className || "h-6 w-6 text-emerald-400"} />;
}

function CardsSection({ section }: { section: CustomSection }) {
  const cards = section.cards || [];
  if (cards.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <IconRenderer icon={card.icon} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TimelinesSection({ section }: { section: CustomSection }) {
  const timelines = section.timelines || [];
  if (timelines.length === 0) return null;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-800 hidden sm:block" />

      <div className="space-y-8">
        {timelines.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative flex items-start gap-6 sm:pl-0"
          >
            {/* Step circle */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-sm">
                  {item.step || i + 1}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300 group">
              <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function CustomSections({ sections }: CustomSectionsProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.sectionKey}
          className="py-20 sm:py-28 bg-zinc-950"
        >
          <div className={section.type === "cards" ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
            <SectionHeading title={section.title} subtitle={section.subtitle} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {section.type === "cards" ? (
                <CardsSection section={section} />
              ) : section.type === "timelines" ? (
                <TimelinesSection section={section} />
              ) : section.type === "markdown" || section.type === "text" ? (
                <div className="prose prose-invert prose-emerald max-w-none space-y-4">
                  {section.content.split("\n\n").map((block, i) => {
                    if (block.startsWith("## ")) {
                      return (
                        <h3 key={i} className="text-xl font-semibold text-emerald-400 mt-8 mb-3">
                          {block.replace("## ", "")}
                        </h3>
                      );
                    }
                    return (
                      <p key={i} className="text-zinc-400 leading-relaxed">
                        {block}
                      </p>
                    );
                  })}
                </div>
              ) : section.type === "html" ? (
                <div className="prose prose-invert prose-emerald max-w-none text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content }} />
              ) : (
                <div className="prose prose-invert prose-emerald max-w-none space-y-4">
                  {section.content.split("\n\n").map((block, i) => {
                    if (block.startsWith("## ")) {
                      return (
                        <h3 key={i} className="text-xl font-semibold text-emerald-400 mt-8 mb-3">
                          {block.replace("## ", "")}
                        </h3>
                      );
                    }
                    return (
                      <p key={i} className="text-zinc-400 leading-relaxed">
                        {block}
                      </p>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      ))}
    </>
  );
}
