"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PrescriptionForm } from "@/components/clinical/prescription-form";
import { PrescriptionPrintView } from "@/components/clinical/prescription-print";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import type { PrescriptionInput } from "@/lib/types";

export function DoctorPrescriptionDetailClient({
  prescriptionId,
}: {
  prescriptionId: string;
}) {
  const {
    ready,
    patients,
    consultations,
    prescriptions,
    savePrescription,
    cancelPrescription,
    issuePrescription,
  } = useCarePointStore();
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const prescription = useMemo(
    () => prescriptions.find((item) => item.id === prescriptionId) ?? null,
    [prescriptions, prescriptionId],
  );

  if (!ready) return <StoreLoading />;
  if (!prescription) {
    return (
      <EmptyState
        title="Prescription not found"
        description="This demo prescription ID is not in local storage."
      />
    );
  }

  function handleSave(input: PrescriptionInput, existingId?: string) {
    const result = savePrescription(input, existingId);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(`Saved ${result.id} (${result.status}).`);
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Prescription ${prescription.id}`}
        description={`${prescription.patientName} · ${prescription.doctorName}`}
        actions={
          <Link
            href="/doctor/prescriptions"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← All prescriptions
          </Link>
        }
      />

      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 print:hidden">
        {prescription.status === "draft" ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "Hide editor" : "Edit draft"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const result = issuePrescription(prescription.id);
                if ("error" in result) setToast(result.error);
                else setToast("Prescription issued.");
              }}
            >
              Issue
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const result = cancelPrescription(prescription.id);
                if ("error" in result) setToast(result.error);
                else setToast("Prescription cancelled.");
              }}
            >
              Cancel draft
            </Button>
          </>
        ) : null}
        {prescription.status === "issued" ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const result = cancelPrescription(prescription.id);
              if ("error" in result) setToast(result.error);
              else setToast("Prescription cancelled.");
            }}
          >
            Cancel prescription
          </Button>
        ) : null}
      </div>

      {editing && prescription.status === "draft" ? (
        <Card className="print:hidden">
          <CardHeader title="Edit draft prescription" />
          <CardBody>
            <PrescriptionForm
              patients={patients}
              doctorId={prescription.doctorId}
              consultations={consultations}
              initial={prescription}
              onSave={handleSave}
            />
          </CardBody>
        </Card>
      ) : null}

      <PrescriptionPrintView prescription={prescription} />
    </div>
  );
}
