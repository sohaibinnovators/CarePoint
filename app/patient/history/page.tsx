"use client";

import { ClinicalTimeline } from "@/components/clinical/clinical-timeline";
import { MedicalRecordPanel } from "@/components/clinical/medical-record-panel";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { buildPatientTimeline, DEMO_CLINICAL_NOTICE } from "@/lib/clinical";

const PATIENT_ID = "pt-1001";

export default function PatientHistoryPage() {
  const {
    ready,
    patients,
    appointments,
    consultations,
    prescriptions,
    getMedicalRecord,
  } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  const patient = patients.find((item) => item.id === PATIENT_ID);
  if (!patient) {
    return (
      <p className="text-sm text-muted">Demo patient profile is unavailable.</p>
    );
  }

  const record = getMedicalRecord(patient.id);
  const myConsultations = consultations
    .filter((item) => item.patientId === patient.id && item.status === "finalized")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const timeline = buildPatientTimeline({
    patient,
    appointments,
    consultations,
    prescriptions,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical History"
        description="Your demo medical record, consultations, and clinical timeline."
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      <MedicalRecordPanel record={record} editable={false} />

      <Card>
        <CardHeader
          title="Consultation history"
          description="Finalized demo consultations for your profile only."
        />
        <CardBody className="space-y-3">
          {myConsultations.length === 0 ? (
            <p className="text-sm text-muted">
              No finalized consultations on your demo chart yet.
            </p>
          ) : (
            myConsultations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.chiefComplaint}</p>
                  <Badge variant="success">finalized</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {item.doctorName} · {item.updatedAt.slice(0, 10)}
                </p>
                <p className="mt-2 text-muted">
                  Diagnosis (demo): {item.diagnosis}
                </p>
                <p className="mt-1 text-muted">Plan: {item.treatmentPlan}</p>
                {item.followUp ? (
                  <p className="mt-1 text-xs text-secondary">
                    Follow-up: {item.followUp}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Medical timeline" />
        <CardBody>
          <ClinicalTimeline events={timeline} />
        </CardBody>
      </Card>
    </div>
  );
}
