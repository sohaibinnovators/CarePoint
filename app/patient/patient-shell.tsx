"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { patientNav } from "@/lib/dashboard-nav";

export function PatientShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="Patient Portal"
      roleLabel="Ava Thompson"
      navItems={patientNav}
      basePath="/patient"
    >
      {children}
    </DashboardShell>
  );
}
