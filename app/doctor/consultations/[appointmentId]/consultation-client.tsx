"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConsultationForm } from "@/components/clinical/consultation-form";
import {
  MedicalRecordPanel,
  MedicalRecordSummaryCards,
} from "@/components/clinical/medical-record-panel";
import { PrescriptionForm } from "@/components/clinical/prescription-form";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE, isConsultationEligible } from "@/lib/clinical";
import type { ConsultationInput, PrescriptionInput } from "@/lib/types";

const DOCTOR_ID = "dr-elena-hayes";

export function DoctorConsultationClient({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const {
    ready,
    appointments,
    patients,
    consultations,
    prescriptions,
    getMedicalRecord,
    getConsultationByAppointment,
    saveConsultationDraft,
    finalizeConsultation,
    savePrescription,
    upsertMedicalRecord,
  } = useCarePointStore();
  const [toast, setToast] = useState<string | null>(null);
  const [showRx, setShowRx] = useState(false);

  const appointment = useMemo(
    () => appointments.find((item) => item.id === appointmentId) ?? null,
    [appointments, appointmentId],
  );

  if (!ready) return <StoreLoading />;

  if (!appointment) {
    return (
      <EmptyState
        title="Appointment not found"
        description="This demo appointment ID is not in the local store."
      />
    );
  }

  const eligible = isConsultationEligible(appointment);
  const consultation = getConsultationByAppointment(appointment.id);
  const record = getMedicalRecord(appointment.patientId);
  const previous = consultations
    .filter(
      (item) =>
        item.patientId === appointment.patientId &&
        item.appointmentId !== appointment.id,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const patientRx = prescriptions.filter(
    (item) => item.patientId === appointment.patientId,
  );

  function handleDraft(input: ConsultationInput) {
    const result = saveConsultationDraft(input);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast("Draft consultation saved.");
  }

  function handleFinalize(input: ConsultationInput) {
    const result = finalizeConsultation(input);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast("Consultation finalized.");
  }

  function handlePrescription(input: PrescriptionInput, existingId?: string) {
    const result = savePrescription(input, existingId);
    if ("error" in result) {
      setToast(result.error);
      return;
    }
    setToast(
      result.status === "issued"
        ? `Prescription ${result.id} issued.`
        : `Prescription ${result.id} draft saved.`,
    );
    setShowRx(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation workspace"
        description={`${appointment.patientName} · ${appointment.date} ${appointment.time}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/doctor/patients/${appointment.patientId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Patient chart
            </Link>
            <Link
              href="/doctor/appointments"
              className="text-sm font-medium text-primary hover:underline"
            >
              Appointments
            </Link>
          </div>
        }
      />

      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="text-sm">
            <p className="text-muted">Patient</p>
            <p className="font-semibold">{appointment.patientName}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-sm">
            <p className="text-muted">Doctor</p>
            <p className="font-semibold">{appointment.doctorName}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-sm">
            <p className="text-muted">Visit</p>
            <p className="font-semibold">
              {appointment.type} · {appointment.visitType}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-sm">
            <p className="text-muted">Status</p>
            <Badge variant={statusBadgeVariant(appointment.status)}>
              {appointment.status}
            </Badge>
          </CardBody>
        </Card>
      </div>

      <MedicalRecordSummaryCards record={record} />

      {!eligible ? (
        <EmptyState
          title="Consultation not available"
          description="Demo consultations can only be opened for confirmed, checked-in, or completed appointments."
        />
      ) : (
        <Card>
          <CardHeader
            title="Consultation notes"
            description={
              consultation
                ? `Existing ${consultation.status} record · ${consultation.id}`
                : "No consultation yet for this appointment."
            }
          />
          <CardBody>
            <ConsultationForm
              appointmentId={appointment.id}
              initial={consultation}
              onSaveDraft={handleDraft}
              onFinalize={handleFinalize}
            />
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MedicalRecordPanel
          record={record}
          editable={appointment.doctorId === DOCTOR_ID}
          onSave={(input) => {
            const result = upsertMedicalRecord(
              appointment.patientId,
              input,
              DOCTOR_ID,
            );
            if ("error" in result) setToast(result.error);
            else setToast("Medical record updated.");
          }}
        />

        <Card>
          <CardHeader
            title="Previous consultations"
            description="Other visits for this patient."
          />
          <CardBody className="space-y-3">
            {previous.length === 0 ? (
              <p className="text-sm text-muted">No prior consultations on file.</p>
            ) : (
              previous.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">{item.chiefComplaint || item.id}</p>
                    <Badge variant={item.status === "finalized" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {item.doctorName} · {item.updatedAt.slice(0, 10)}
                  </p>
                  <p className="mt-1 text-muted">{item.diagnosis || "No diagnosis yet"}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Prescriptions for this patient"
          description="Create a demo prescription linked to this visit."
          action={
            eligible ? (
              <Button size="sm" variant="outline" onClick={() => setShowRx((v) => !v)}>
                {showRx ? "Hide form" : "New prescription"}
              </Button>
            ) : null
          }
        />
        <CardBody className="space-y-4">
          {showRx ? (
            <PrescriptionForm
              patients={patients.filter((p) => p.id === appointment.patientId)}
              doctorId={appointment.doctorId}
              consultations={consultations}
              defaultPatientId={appointment.patientId}
              defaultConsultationId={consultation?.id}
              defaultAppointmentId={appointment.id}
              onSave={handlePrescription}
            />
          ) : null}
          {patientRx.length === 0 ? (
            <p className="text-sm text-muted">No prescriptions yet.</p>
          ) : (
            patientRx.map((rx) => (
              <div
                key={rx.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {rx.id} · {rx.date}
                  </p>
                  <p className="text-xs text-muted">
                    {rx.medications.length} medication(s) · {rx.status}
                  </p>
                </div>
                <Link
                  href={`/doctor/prescriptions/${rx.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  View / print
                </Link>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
