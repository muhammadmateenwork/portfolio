"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutProps {
  about: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  resumeUrl: string;
}

export default function About({ about, resumeUrl }: AboutProps) {
  const hasContent = about.description || about.image || (about.stats && about.stats.length > 0);

  return (
    <section id="about" className="py-20 sm:py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={about.title || "About Me"} subtitle={about.subtitle} />

        {!hasContent ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Configure your about section from the admin settings panel.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-400/5 rounded-2xl rotate-3 scale-105" />
                <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 h-full flex items-center justify-center">
                  {about.image ? (
                    <img
                      src={about.image}
                      alt="About"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <div className="text-zinc-600 text-center px-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-2xl text-zinc-500">?</span>
                        </div>
                        <p className="text-sm">Upload your photo in settings</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              {about.description && (
                <div className="space-y-6">
                  {about.description.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-zinc-400 leading-relaxed text-base sm:text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Stats */}
              {about.stats && about.stats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                  {about.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                        {stat.value}
                      </div>
                      <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target={resumeUrl.startsWith("/api/file/") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  download={resumeUrl.startsWith("/api/file/") ? undefined : "resume.pdf"}
                  className="inline-block mt-8"
                >
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl">
                    <Download className="mr-2 h-4 w-4" />
                    Download Resume
                  </Button>
                </a>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
