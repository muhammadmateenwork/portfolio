'use client';

import { useState, useEffect } from 'react';

export interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

export interface SiteSettings {
  id: string;
  owner: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    avatar: string;
    resumeUrl: string;
  };
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
  about: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  socialLinks: SocialLink[];
  contact: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    location: string;
    availability: string;
    projectTypes: string[];
    budgetRanges: string[];
  };
  navbar: {
    links: { label: string; href: string }[];
  };
  footer: {
    text: string;
    copyright: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  sectionVisibility: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    services: boolean;
    contact: boolean;
  };
  sectionTitles: {
    skills: string;
    projects: string;
    services: string;
    contact: string;
  };
}

export interface Project {
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
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  category: string;
  proficiency: number;
  visible: boolean;
  order: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  order: number;
}

export interface CustomSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  content: string;
  type: string;
  visible: boolean;
  order: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return { settings, loading, error };
}

export function useProjects(category?: string, featured?: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (category && category !== 'All') params.set('category', category);
        if (featured) params.set('featured', 'true');
        const res = await fetch(`/api/projects?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [category, featured]);

  return { projects, loading, error };
}

export function useSkills(category?: string) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        const res = await fetch(`/api/skills?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch skills');
        const data = await res.json();
        setSkills(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, [category]);

  return { skills, loading, error };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return { services, loading, error };
}

export function useCustomSections() {
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch('/api/custom-sections');
        if (!res.ok) throw new Error('Failed to fetch custom sections');
        const data = await res.json();
        setSections(data.filter((s: CustomSection) => s.visible));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  return { sections, loading, error };
}
