"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PrescriptionForm } from "@/components/clinical/prescription-form";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";
import type { PrescriptionInput } from "@/lib/types";

const DOCTOR_ID = "dr-elena-hayes";

export default function DoctorPrescriptionsPage() {
  const {
    ready,
    patients,
    consultations,
    prescriptions,
    savePrescription,
  } = useCarePointStore();
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  const mine = useMemo(
    () =>
      prescriptions
        .filter((rx) => rx.doctorId === DOCTOR_ID)
        .filter((rx) => statusFilter === "all" || rx.status === statusFilter)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [prescriptions, statusFilter],
  );

  if (!ready) return <StoreLoading />;

  function handleSave(input: PrescriptionInput, existingId?: string) {
    const result = savePrescription(input, existingId);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(`Saved ${result.id} (${result.status}).`);
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="Create and manage fictional demo prescriptions for your patients."
        actions={
          <Button size="sm" onClick={() => setCreating((v) => !v)}>
            {creating ? "Close form" : "New prescription"}
          </Button>
        }
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      {creating ? (
        <Card>
          <CardHeader title="New demo prescription" />
          <CardBody>
            <PrescriptionForm
              patients={patients}
              doctorId={DOCTOR_ID}
              consultations={consultations}
              onSave={handleSave}
            />
          </CardBody>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["all", "draft", "issued", "cancelled"].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "primary" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {mine.length === 0 ? (
        <EmptyState
          title="No prescriptions"
          description="Create a demo prescription or adjust the status filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((rx) => (
            <Card key={rx.id}>
              <CardHeader
                title={rx.patientName}
                description={`${rx.date} · ${rx.id}`}
                action={
                  <Badge variant={statusBadgeVariant(rx.status)}>{rx.status}</Badge>
                }
              />
              <CardBody className="space-y-3">
                <ul className="space-y-1 text-sm">
                  {rx.medications.map((med) => (
                    <li key={med.id}>
                      {med.name} — {med.dosage}, {med.frequency}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted">{rx.notes}</p>
                <Link
                  href={`/doctor/prescriptions/${rx.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View / print
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
