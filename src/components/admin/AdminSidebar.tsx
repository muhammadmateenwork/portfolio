"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Layers,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Database,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/custom-sections", label: "Custom Sections", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Check DB status
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setDbConnected(data.connected);
        }
      } catch {
        setDbConnected(false);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md shrink-0"
            />
            {!collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent truncate">
                Admin CMS
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* DB Status + Footer */}
        <div className="p-2 border-t border-zinc-800 space-y-1">
          {/* Database Status Indicator */}
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
              dbConnected
                ? "text-emerald-400/70"
                : dbConnected === false
                ? "text-red-400 bg-red-500/5"
                : "text-zinc-600"
            }`}
            title={dbConnected ? "MongoDB Connected" : dbConnected === false ? "MongoDB Disconnected — Data NOT saving!" : "Checking DB..."}
          >
            <Database className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="truncate">
                {dbConnected ? "DB Connected" : dbConnected === false ? "DB Offline — Not Saving!" : "Checking DB..."}
              </span>
            )}
            <span className={`ml-auto h-2 w-2 rounded-full shrink-0 ${
              dbConnected ? "bg-emerald-400" : dbConnected === false ? "bg-red-400 animate-pulse" : "bg-zinc-600"
            }`} />
          </div>

          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors`}
          >
            <span className="text-base shrink-0">👁</span>
            {!collapsed && <span>View Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
