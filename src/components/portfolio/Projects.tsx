"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Images } from "lucide-react";

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
  visible: boolean;
  order: number;
}

interface ProjectsProps {
  projects: Project[];
  sectionTitle: string;
  onSelectProject: (project: Project) => void;
}

export default function Projects({ projects, sectionTitle, onSelectProject }: ProjectsProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const filtered = activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory);

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <section id="projects" className="py-20 sm:py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={sectionTitle || "Featured Projects"} />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => onSelectProject(project)}
                className="group cursor-pointer bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                {/* Thumbnail — shown completely with object-contain */}
                <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden flex items-center justify-center">
                  {project.thumbnail ? (
                    <>
                      {/* Skeleton while loading */}
                      {!loadedImages.has(project.id) && (
                        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                      )}
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => handleImageLoad(project.id)}
                      />
                    </>
                  ) : project.gallery?.[0] ? (
                    /* Fallback to first gallery image if no thumbnail */
                    <>
                      {!loadedImages.has(project.id) && (
                        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                      )}
                      <img
                        src={project.gallery[0]}
                        alt={project.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => handleImageLoad(project.id)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-zinc-900 flex items-center justify-center">
                      <span className="text-3xl font-bold text-emerald-500/30">
                        {project.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {project.featured && (
                    <Badge className="absolute top-3 right-3 bg-emerald-500 text-zinc-950 font-semibold border-0">
                      Featured
                    </Badge>
                  )}
                  {/* Gallery count badge */}
                  {(project.gallery?.length || 0) > 0 && (
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0 text-xs flex items-center gap-1">
                      <Images className="h-3 w-3" />
                      {project.gallery.length}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-white" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <Github className="h-4 w-4 text-white" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-500 rounded-md">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}