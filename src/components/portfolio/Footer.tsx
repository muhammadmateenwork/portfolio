"use client";

import Image from "next/image";
import { ArrowUp, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Globe } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

interface FooterProps {
  footer: { text: string; copyright: string };
  socialLinks: SocialLink[];
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
  github: "hover:text-white",
  linkedin: "hover:text-[#0A66C2]",
  twitter: "hover:text-[#1DA1F2]",
  instagram: "hover:text-[#E4405F]",
  facebook: "hover:text-[#1877F2]",
  youtube: "hover:text-[#FF0000]",
};

export default function Footer({ footer, socialLinks }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only show social links that are visible AND have a URL
  const visibleSocials = (socialLinks || []).filter((sl) => sl.visible && sl.url);

  return (
    <footer className="bg-[#050505] border-t border-zinc-800/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className="text-center sm:text-left">
              {footer.text && <p className="text-zinc-400 text-sm mb-1">{footer.text}</p>}
              {footer.copyright && <p className="text-zinc-600 text-xs">{footer.copyright}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {visibleSocials.map((sl) => {
              const IconComponent = platformIcons[sl.platform] || Globe;
              return (
                <a
                  key={sl.platform}
                  href={sl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-zinc-500 transition-colors ${platformColors[sl.platform.toLowerCase()] || "hover:text-emerald-400"}`}
                  title={sl.platform}
                >
                  <IconComponent className="h-5 w-5" />
                </a>
              );
            })}

            <button
              onClick={scrollToTop}
              className="ml-4 w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
