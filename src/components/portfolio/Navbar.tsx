"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  links: { label: string; href: string }[];
  ownerName: string;
  ownerAvatar?: string;
}

export default function Navbar({ links, ownerName, ownerAvatar }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = links.map((l) => l.href.replace("#", "")).filter(Boolean);
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [links]);

  // Lock body scroll when the mobile menu is open so the page behind doesn't move
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleClick = useCallback(
    (href: string) => {
      const id = href.replace("#", "");
      const el = id ? document.getElementById(id) : null;

      // Close the menu first. The AnimatePresence exit animation would interfere
      // with a synchronous scrollIntoView({ behavior: "smooth" }) on mobile, so we
      // close the menu and then defer the scroll a tick until after the close
      // animation has started and body overflow is restored.
      setIsOpen(false);

      if (el) {
        // Restore overflow immediately so the page can scroll, then defer the
        // actual scroll to the next frame to avoid the smooth-scroll being
        // cancelled by the layout shift from the collapsing menu.
        document.body.style.overflow = "";

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const navbarHeight = 80; // h-20 on desktop / h-16 on mobile — use the larger offset
            const targetTop =
              el.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({
              top: Math.max(0, targetTop),
              behavior: "smooth",
            });
          });
        });
      } else if (href.startsWith("http") || href.startsWith("/")) {
        // External or internal route link
        window.location.href = href;
      }
    },
    []
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => handleClick("#hero")}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            aria-label="Go to top"
          >
            {ownerAvatar ? (
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-zinc-950 shadow-lg shadow-emerald-500/10">
                <img
                  src={ownerAvatar}
                  alt={ownerName || "Logo"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Image
                src="/logo.svg"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
            )}
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              {ownerName || "Portfolio"}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <button
                  key={link.href}
                  onClick={() => handleClick(link.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — taps here also close the menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-xl shadow-black/40"
            >
              <div className="px-4 py-4 space-y-1">
                {links.map((link, idx) => {
                  const sectionId = link.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      onClick={() => handleClick(link.href)}
                      className={`flex items-center w-full text-left px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "text-emerald-400 bg-emerald-400/10"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                      }`}
                    >
                      {link.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}