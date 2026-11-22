"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/dashboard-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="Admin Dashboard"
      roleLabel="Admin"
      navItems={adminNav}
      basePath="/admin"
    >
      {children}
    </DashboardShell>
  );
}
