"use client";

import { useMemo } from "react";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";

const PATIENT_ID = "pt-1001";

export default function PatientPrescriptionsPage() {
  const { ready, prescriptions, doctors } = useCarePointStore();

  const mine = useMemo(
    () =>
      prescriptions
        .filter(
          (rx) =>
            rx.patientId === PATIENT_ID &&
            (rx.status === "issued" || rx.status === "cancelled"),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [prescriptions],
  );

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="Issued demo prescriptions linked to your patient profile only."
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      {mine.length === 0 ? (
        <EmptyState
          title="No prescriptions on file"
          description="When a doctor issues a demo prescription for Ava Thompson, it will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((rx) => {
            const doctor = doctors.find((d) => d.id === rx.doctorId);
            return (
              <Card key={rx.id}>
                <CardHeader
                  title="Your prescription"
                  description={`${rx.date} · ${rx.doctorName}`}
                  action={
                    <Badge variant={statusBadgeVariant(rx.status)}>{rx.status}</Badge>
                  }
                />
                <CardBody className="space-y-2">
                  <ul className="list-inside list-disc text-sm text-muted">
                    {rx.medications.map((med) => (
                      <li key={med.id}>
                        {med.name} — {med.dosage}, {med.frequency} for {med.duration}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted">{rx.notes}</p>
                  {doctor ? (
                    <p className="text-xs text-muted">
                      Prescriber specialty: {doctor.specialty}
                    </p>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
