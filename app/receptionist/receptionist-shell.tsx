"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { receptionistNav } from "@/lib/dashboard-nav";

export function ReceptionistShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="Receptionist Dashboard"
      roleLabel="Receptionist"
      navItems={receptionistNav}
      basePath="/receptionist"
    >
      {children}
    </DashboardShell>
  );
}
