"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, Send, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  hero: {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    backgroundImage: string;
  };
  ownerAvatar?: string;
  resumeUrl: string;
  socialLinks?: { platform: string; url: string; visible: boolean }[];
}

const platformIcons: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

const platformColors: Record<string, string> = {
  github: "hover:text-white hover:border-[#f0f0f0]/30 hover:bg-[#f0f0f0]/5",
  linkedin: "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5",
  twitter: "hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/5",
  instagram: "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5",
  facebook: "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5",
  youtube: "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5",
};

export default function Hero({ hero, ownerAvatar, resumeUrl, socialLinks }: HeroProps) {
  const handleScroll = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const hasContent = hero.name || hero.title || hero.description;
  const visibleLinks = (socialLinks || []).filter((s) => s.visible && s.url);
  const avatarSrc = ownerAvatar || hero.backgroundImage;

  // If no content at all, show a minimal empty state (NO admin button)
  if (!hasContent) {
    return (
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent"
          >
            Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-500 text-lg"
          >
            Coming Soon
          </motion.p>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-zinc-950">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_60%,rgba(16,185,129,0.04),transparent)]" />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/6 w-72 h-72 bg-emerald-500/6 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-emerald-400/4 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            {hero.greeting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-5"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {hero.greeting}
                </span>
              </motion.div>
            )}

            {hero.name && (
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-3 leading-[1.1]"
              >
                <span className="bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  {hero.name}
                </span>
              </motion.h1>
            )}

            {hero.title && (
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4"
              >
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  {hero.title}
                </span>
              </motion.h2>
            )}

            {hero.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-base sm:text-lg text-zinc-500 mb-4 font-medium"
              >
                {hero.subtitle}
              </motion.p>
            )}

            {hero.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                {hero.description}
              </motion.p>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-8"
            >
              {hero.ctaText && (
                <Button
                  onClick={() => handleScroll(hero.ctaLink || "#projects")}
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-8 h-12 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {hero.ctaText}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              )}
              {hero.secondaryCtaText && (
                <Button
                  onClick={() => handleScroll(hero.secondaryCtaLink || "#contact")}
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-900/50 px-8 h-12 rounded-xl transition-all"
                >
                  {hero.secondaryCtaText}
                </Button>
              )}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target={resumeUrl.startsWith("/api/file/") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  download={resumeUrl.startsWith("/api/file/") ? undefined : "resume.pdf"}
                >
                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white px-6 h-12 rounded-xl transition-all"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                </a>
              )}
            </motion.div>

            {/* Social Links */}
            {visibleLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-3 justify-center lg:justify-start"
              >
                {visibleLinks.map((link) => {
                  const IconComponent = platformIcons[link.platform.toLowerCase()];
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 transition-all ${platformColors[link.platform.toLowerCase()] || "hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"}`}
                    >
                      {IconComponent ? (
                        <IconComponent className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                    </a>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Right: Avatar / Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2 flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect behind avatar */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[60px] scale-110" />

              {/* Main avatar container */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={hero.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 flex items-center justify-center">
                    <span className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text text-transparent select-none">
                      {hero.name ? hero.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </span>
                  </div>
                )}
              </div>

              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-full border border-emerald-500/10 pointer-events-none" />

              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-zinc-900 border border-emerald-500/30 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Available</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.button
          onClick={() => handleScroll("#about")}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-zinc-600 hover:text-emerald-400 transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}
