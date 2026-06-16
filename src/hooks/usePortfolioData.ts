"use client";

import { useEffect, useState, useRef } from "react";

interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

interface SiteSettings {
  owner: { name: string; title: string; email: string; phone: string; location: string; avatar: string; resumeUrl: string };
  hero: { greeting: string; name: string; title: string; subtitle: string; description: string; ctaText: string; ctaLink: string; secondaryCtaText: string; secondaryCtaLink: string; backgroundImage: string };
  about: { title: string; subtitle: string; description: string; image: string; stats: { label: string; value: string }[] };
  socialLinks: SocialLink[];
  contact: { title: string; subtitle: string; email: string; phone: string; location: string; availability: string; projectTypes: string[]; budgetRanges: string[] };
  navbar: { links: { label: string; href: string }[] };
  footer: { text: string; copyright: string };
  seo: { title: string; description: string; keywords: string; ogImage: string };
  sectionVisibility: { hero: boolean; about: boolean; skills: boolean; projects: boolean; services: boolean; contact: boolean };
  sectionTitles: { skills: string; projects: string; services: string; contact: string };
}

interface Project {
  id: string; title: string; description: string; longDescription: string; thumbnail: string; gallery: string[]; liveUrl: string; githubUrl: string; techStack: string[]; features: string[]; category: string; featured: boolean; visible: boolean; order: number;
}

interface Skill {
  id: string; name: string; icon: string; category: string; proficiency: number; visible: boolean; order: number;
}

interface Service {
  id: string; title: string; description: string; icon: string; visible: boolean; order: number;
}

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
  id: string; sectionKey: string; title: string; subtitle: string; content: string; type: string; cards: CardItem[]; timelines: TimelineItem[]; visible: boolean; order: number;
}

export function usePortfolioData() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(false);

  useEffect(() => {
    if (fetchRef.current) return;
    fetchRef.current = true;

    async function fetchData() {
      try {
        const [settingsRes, projectsRes, skillsRes, servicesRes, sectionsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/projects"),
          fetch("/api/skills"),
          fetch("/api/services"),
          fetch("/api/custom-sections"),
        ]);

        const results = await Promise.all([
          settingsRes.ok ? settingsRes.json() : Promise.resolve(null),
          projectsRes.ok ? projectsRes.json() : Promise.resolve([]),
          skillsRes.ok ? skillsRes.json() : Promise.resolve([]),
          servicesRes.ok ? servicesRes.json() : Promise.resolve([]),
          sectionsRes.ok ? sectionsRes.json() : Promise.resolve([]),
        ]);

        if (results[0]) setSettings(results[0]);
        if (Array.isArray(results[1])) setProjects(results[1]);
        if (Array.isArray(results[2])) setSkills(results[2]);
        if (Array.isArray(results[3])) setServices(results[3]);
        if (Array.isArray(results[4])) setCustomSections(results[4]);
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return { settings, projects, skills, services, customSections, loading };
}
