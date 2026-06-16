"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";
import DbStatusBanner from "@/components/admin/DbStatusBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-950">
        <AdminSidebar />
        <main className="lg:ml-64 min-h-screen">
          <DbStatusBanner />
          <div className="p-4 lg:p-8 pt-4 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
