"use client";

import { AuthProvider } from "@/components/admin/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
