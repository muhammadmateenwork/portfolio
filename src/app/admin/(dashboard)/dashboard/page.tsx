"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/admin/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Wrench, Layers, Settings, Eye, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ projects: 0, skills: 0, services: 0, sections: 0 });
  const fetchRef = useRef(false);

  useEffect(() => {
    if (fetchRef.current || !token) return;
    fetchRef.current = true;

    async function fetchStats() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, sRes, svRes, csRes] = await Promise.all([
          fetch("/api/projects?admin=true", { headers }),
          fetch("/api/skills?admin=true", { headers }),
          fetch("/api/services?admin=true", { headers }),
          fetch("/api/custom-sections?admin=true", { headers }),
        ]);
        const [p, s, sv, cs] = await Promise.all([pRes.json(), sRes.json(), svRes.json(), csRes.json()]);
        setStats({
          projects: Array.isArray(p) ? p.length : 0,
          skills: Array.isArray(s) ? s.length : 0,
          services: Array.isArray(sv) ? sv.length : 0,
          sections: Array.isArray(cs) ? cs.length : 0,
        });
      } catch {}
    }
    fetchStats();
  }, [token]);

  const cards = [
    { label: "Projects", value: stats.projects, icon: FolderKanban, href: "/admin/projects" },
    { label: "Skills", value: stats.skills, icon: Wrench, href: "/admin/skills" },
    { label: "Services", value: stats.services, icon: Layers, href: "/admin/services" },
    { label: "Custom Sections", value: stats.sections, icon: Settings, href: "/admin/custom-sections" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Welcome back! Here&apos;s an overview of your portfolio.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <a key={card.label} href={card.href}>
            <Card className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{card.label}</CardTitle>
                <card.icon className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="mt-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/settings" className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <Settings className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">Update Site Settings</p>
                <p className="text-xs text-zinc-500">Edit hero, about, contact info, and more</p>
              </div>
            </a>
            <a href="/admin/projects" className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <FolderKanban className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">Manage Projects</p>
                <p className="text-xs text-zinc-500">Add, edit, or reorder your projects</p>
              </div>
            </a>
            <a href="/" target="_blank" className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
              <Eye className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">View Portfolio</p>
                <p className="text-xs text-zinc-500">See how your portfolio looks to visitors</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
