"use client";

import { useState, useCallback } from "react";
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

  const allImages = project
    ? [project.thumbnail, ...(project.gallery || [])].filter(Boolean)
    : [];

  const handleGalleryImageLoad = useCallback((index: number) => {
    setGalleryLoaded((prev) => new Set(prev).add(index));
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  if (!project) return null;

  return (
    <>
      {/* Project Detail Modal */}
      <Dialog open={open && lightboxIndex === null} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 p-0">
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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
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

            {/* Gallery — Grid with lightbox support for 30+ images */}
            {project.gallery && project.gallery.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    Screenshots
                    <span className="text-sm text-zinc-500 font-normal ml-2">({project.gallery.length})</span>
                  </h3>
                </div>

                {/* Scrollable gallery grid — shows max 9 initially with "view all" in lightbox */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
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

      {/* Lightbox Modal — full-screen image viewer */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/60 text-sm font-medium z-10">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {/* Previous button */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[lightboxIndex]}
                alt={`Screenshot ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </motion.div>

            {/* Next button */}
            {lightboxIndex < allImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Thumbnail strip at bottom for quick navigation (30+ images) */}
            {allImages.length > 5 && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[90vw] overflow-x-auto px-2 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl custom-scrollbar"
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
