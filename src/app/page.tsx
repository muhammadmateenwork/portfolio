"use client";

import { useState, useEffect } from "react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import Navbar from "@/components/portfolio/Navbar";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Skills from "@/components/portfolio/Skills";
import Projects from "@/components/portfolio/Projects";
import Services from "@/components/portfolio/Services";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import CustomSections from "@/components/portfolio/CustomSections";
import ProjectModal from "@/components/portfolio/ProjectModal";
import { Skeleton } from "@/components/ui/skeleton";

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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
        <Skeleton className="h-8 w-64 mx-auto bg-zinc-800" />
        <Skeleton className="h-4 w-96 mx-auto bg-zinc-800" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video rounded-xl bg-zinc-800" />
              <Skeleton className="h-5 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { settings, projects, skills, services, customSections, loading } = usePortfolioData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Update browser tab title dynamically from CMS
  useEffect(() => {
    if (settings?.seo?.title) {
      document.title = settings.seo.title;
    } else if (settings?.owner?.name) {
      document.title = `${settings.owner.name} | Portfolio`;
    }
  }, [settings?.seo?.title, settings?.owner?.name]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  if (loading || !settings) {
    return <LoadingSkeleton />;
  }

  const visibility = settings.sectionVisibility || {};

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 overflow-x-hidden">
      <Navbar
        links={settings.navbar?.links || []}
        ownerName={settings.owner?.name || ""}
        ownerAvatar={settings.owner?.avatar || ""}
      />

      <main className="flex-1">
        {visibility.hero !== false && (
          <Hero
            hero={settings.hero}
            ownerAvatar={settings.owner?.avatar || ""}
            resumeUrl={settings.owner?.resumeUrl || ""}
            socialLinks={settings.socialLinks || []}
          />
        )}
        {visibility.about !== false && (
          <About about={settings.about} resumeUrl={settings.owner?.resumeUrl || ""} />
        )}
        {visibility.skills !== false && skills.length > 0 && (
          <Skills skills={skills} sectionTitle={settings.sectionTitles?.skills || "Skills"} />
        )}
        {visibility.projects !== false && projects.length > 0 && (
          <Projects
            projects={projects}
            sectionTitle={settings.sectionTitles?.projects || "Projects"}
            onSelectProject={handleSelectProject}
          />
        )}
        {visibility.services !== false && services.length > 0 && (
          <Services services={services} sectionTitle={settings.sectionTitles?.services || "Services"} />
        )}
        <CustomSections sections={customSections} />
        {visibility.contact !== false && (
          <Contact
            contact={settings.contact}
            socialLinks={settings.socialLinks || []}
            sectionTitle={settings.sectionTitles?.contact || "Contact"}
          />
        )}
      </main>

      <Footer footer={settings.footer} socialLinks={settings.socialLinks || []} />

      <ProjectModal
        project={selectedProject}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}