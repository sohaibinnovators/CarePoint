"use client";

import { AppointmentCalendar } from "@/components/scheduling/appointment-calendar";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";

export default function ReceptionistCalendarPage() {
  const { ready, appointments, doctors, departments } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Calendar"
        description="Day, week, and month views with doctor, department, and status filters."
      />
      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      <AppointmentCalendar
        appointments={appointments}
        doctors={doctors}
        departments={departments}
      />
    </div>
  );
}
