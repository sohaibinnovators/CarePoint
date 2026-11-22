"use client";

import { useMemo } from "react";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import { clinicTodayIso } from "@/lib/validation";

export default function ReceptionistQueuePage() {
  const { ready, appointments, updateAppointmentStatus } = useCarePointStore();
  const todayIso = clinicTodayIso();

  const queue = useMemo(
    () =>
      appointments
        .filter((a) => a.date === todayIso)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayIso],
  );

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Check-in / Queue"
        description={`Today's lobby queue for ${todayIso}. Check-ins update the shared store (visible to admin).`}
      />

      <Card>
        <CardHeader
          title="Waiting room"
          description="Mark arrivals and completions for today's visits."
        />
        <CardBody className="space-y-3">
          {queue.length === 0 ? (
            <EmptyState
              title="No patients scheduled today"
              description="When appointments exist for today's date, they appear here for check-in."
            />
          ) : (
            queue.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col gap-3 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{apt.patientName}</p>
                  <p className="text-sm text-muted">
                    {apt.time} · {apt.doctorName} · {apt.department}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusBadgeVariant(apt.status)}>
                    {apt.status.replace("-", " ")}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateAppointmentStatus(apt.id, "checked-in")
                    }
                    disabled={
                      apt.status === "checked-in" ||
                      apt.status === "completed" ||
                      apt.status === "cancelled"
                    }
                  >
                    Check in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      updateAppointmentStatus(apt.id, "completed")
                    }
                    disabled={
                      apt.status === "completed" || apt.status === "cancelled"
                    }
                  >
                    Complete
                  </Button>
                </div>
              </div>
            ))
          )}
          <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
        </CardBody>
      </Card>
    </>
  );
}