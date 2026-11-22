"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { doctorNav } from "@/lib/dashboard-nav";

export function DoctorShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      title="Doctor Dashboard"
      roleLabel="Dr. Elena Hayes"
      navItems={doctorNav}
      basePath="/doctor"
    >
      {children}
    </DashboardShell>
  );
}
