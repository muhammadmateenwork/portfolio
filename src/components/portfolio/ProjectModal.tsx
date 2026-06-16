"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  gallery: string[];
  liveUrl: string;
  githubUrl: string;
  techStack: string[];
  features: string[];
  category: string;
  featured: boolean;
}

interface ProjectModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, open, onClose }: ProjectModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryLoaded, setGalleryLoaded] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const allImages = project
    ? [project.thumbnail, ...(project.gallery || [])].filter(Boolean)
    : [];

  const handleGalleryImageLoad = useCallback((index: number) => {
    setGalleryLoaded((prev) => new Set(prev).add(index));
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null && prev < allImages.length - 1 ? prev + 1 : prev
    );
  }, [allImages.length]);

  // Keyboard navigation for the lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    // Lock body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  // Touch swipe navigation for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    // Require a swipe of at least 50px to trigger navigation
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }, [goNext, goPrev]);

  if (!project) return null;

  const hasMultiple = allImages.length > 1;

  return (
    <>
      {/* Project Detail Modal — showCloseButton={false} because we render a
          custom close button on the header image (prevents two X buttons) */}
      <Dialog open={open && lightboxIndex === null} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 p-0"
        >
          <DialogTitle className="sr-only">{project.title}</DialogTitle>

          {/* Header Image — shown completely with object-contain */}
          <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-contain"
              />
            ) : project.gallery?.[0] ? (
              <img
                src={project.gallery[0]}
                alt={project.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-zinc-900 flex items-center justify-center">
                <span className="text-6xl font-bold text-emerald-500/20">{project.title.charAt(0)}</span>
              </div>
            )}
            {/* Single close button (replaces the old double-X) */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {project.category}
                </Badge>
                {project.featured && (
                  <Badge className="bg-emerald-500 text-zinc-950 border-0">Featured</Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            </div>

            {/* Description */}
            <p className="text-zinc-400 leading-relaxed">
              {project.longDescription || project.description}
            </p>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-400">
                      <span className="text-emerald-400 mt-1">▸</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery — no nested scroll; the modal itself scrolls.
                Tapping any screenshot opens the full-screen lightbox where
                users can swipe (mobile) or use arrows (desktop) to navigate. */}
            {project.gallery && project.gallery.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Screenshots
                    <span className="text-sm text-zinc-500 font-normal ml-2">({project.gallery.length})</span>
                  </h3>
                  <span className="text-xs text-zinc-500 hidden sm:block">Tap to enlarge · ← → to navigate</span>
                  <span className="text-xs text-zinc-500 sm:hidden">Tap to enlarge · swipe to navigate</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.gallery.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => openLightbox(i + (project.thumbnail ? 1 : 0))}
                      className="relative group aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:border-emerald-500/40 transition-all"
                    >
                      {!galleryLoaded.has(i) && (
                        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                      )}
                      <img
                        src={img}
                        alt={`${project.title} screenshot ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => handleGalleryImageLoad(i)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="absolute bottom-1 right-1 text-[10px] text-zinc-400 bg-black/50 px-1 rounded">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-3 pt-2">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </Button>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white rounded-xl">
                    <Github className="mr-2 h-4 w-4" />
                    Source Code
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal — full-screen image viewer with swipe + keyboard nav */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center touch-none"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              aria-label="Close"
              className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-20"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/70 text-sm font-medium z-20 bg-black/40 px-3 py-1.5 rounded-full">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {/* Previous button — always rendered (disabled at first) so the
                tap target stays stable on mobile. Positioned with margin from
                the edge so it's reachable and doesn't conflict with OS edge
                gestures. */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={lightboxIndex === 0}
              aria-label="Previous image"
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all z-20 ${
                lightboxIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[88vw] max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[lightboxIndex]}
                alt={`Screenshot ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </motion.div>

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={lightboxIndex === allImages.length - 1}
              aria-label="Next image"
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all z-20 ${
                lightboxIndex === allImages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Navigation hint */}
            {hasMultiple && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs z-20 pointer-events-none sm:hidden">
                ← Swipe to navigate →
              </div>
            )}

            {/* Thumbnail strip at bottom for quick navigation (5+ images) */}
            {allImages.length > 5 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto px-2 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl custom-scrollbar z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`shrink-0 w-12 h-8 rounded overflow-hidden border transition-all ${
                      i === lightboxIndex
                        ? "border-emerald-500 ring-1 ring-emerald-500/50"
                        : "border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}