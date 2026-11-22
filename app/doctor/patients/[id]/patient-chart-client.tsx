"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClinicalTimeline } from "@/components/clinical/clinical-timeline";
import { MedicalRecordPanel } from "@/components/clinical/medical-record-panel";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import {
  buildPatientTimeline,
  DEMO_CLINICAL_NOTICE,
  isConsultationEligible,
} from "@/lib/clinical";

const DOCTOR_ID = "dr-elena-hayes";

export function DoctorPatientChartClient({ patientId }: { patientId: string }) {
  const {
    ready,
    patients,
    appointments,
    consultations,
    prescriptions,
    getMedicalRecord,
    upsertMedicalRecord,
  } = useCarePointStore();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const patient = useMemo(
    () => patients.find((item) => item.id === patientId) ?? null,
    [patients, patientId],
  );

  if (!ready) return <StoreLoading />;
  if (!patient) {
    return (
      <EmptyState
        title="Patient not found"
        description="This demo patient is not in the local registry."
      />
    );
  }

  const record = getMedicalRecord(patient.id);
  const patientAppointments = appointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const patientConsultations = consultations
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const patientRx = prescriptions
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredConsultations = patientConsultations.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.chiefComplaint.toLowerCase().includes(q) ||
      item.diagnosis.toLowerCase().includes(q) ||
      item.doctorName.toLowerCase().includes(q)
    );
  });

  const timeline = buildPatientTimeline({
    patient,
    appointments,
    consultations,
    prescriptions,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name}
        description={`Demo chart · ${patient.condition}`}
        actions={
          <Link
            href="/doctor/patients"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to records
          </Link>
        }
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Demographics" description="Sample patient profile." />
          <CardBody className="space-y-3 text-sm">
            {[
              ["Age", String(patient.age)],
              ["Gender", patient.gender],
              ["Blood type", patient.bloodType],
              ["Phone", patient.phone],
              ["Email", patient.email],
              ["Registered", patient.registrationDate],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-muted">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <span className="text-muted">Status</span>
              <Badge variant={statusBadgeVariant(patient.status)}>
                {patient.status}
              </Badge>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <MedicalRecordPanel
            record={record}
            editable
            onSave={(input) => {
              const result = upsertMedicalRecord(patient.id, input, DOCTOR_ID);
              if ("error" in result) setToast(result.error);
              else setToast("Medical record saved.");
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader title="Appointments" description="Visits linked to this patient." />
        <CardBody className="p-0">
          {patientAppointments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">No appointments on file.</p>
          ) : (
            <Table headers={["Date", "Doctor", "Type", "Status", ""]}>
              {patientAppointments.map((apt) => (
                <tr key={apt.id}>
                  <Td>
                    {apt.date} · {apt.time}
                  </Td>
                  <Td>{apt.doctorName}</Td>
                  <Td>{apt.type}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status.replace("-", " ")}
                    </Badge>
                  </Td>
                  <Td>
                    {isConsultationEligible(apt) ? (
                      <Link
                        href={`/doctor/consultations/${apt.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Open consult
                      </Link>
                    ) : (
                      <span className="text-xs text-muted">Not eligible</span>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Consultation history"
          description="Chronological demo notes for this patient."
        />
        <CardBody className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by complaint, diagnosis, or doctor…"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {filteredConsultations.length === 0 ? (
            <p className="text-sm text-muted">No consultations match this filter.</p>
          ) : (
            filteredConsultations.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.chiefComplaint || item.id}</p>
                  <Badge variant={item.status === "finalized" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {item.doctorName} · {item.updatedAt.slice(0, 10)}
                </p>
                <p className="mt-2 text-muted">
                  Diagnosis (demo): {item.diagnosis || "—"}
                </p>
                <Link
                  href={`/doctor/consultations/${item.appointmentId}`}
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  Open consultation
                </Link>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Prescription history" />
        <CardBody className="space-y-3">
          {patientRx.length === 0 ? (
            <p className="text-sm text-muted">No prescriptions for this patient.</p>
          ) : (
            patientRx.map((rx) => (
              <div
                key={rx.id}
                className="rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">
                    {rx.id} · {rx.doctorName}
                  </span>
                  <span className="text-muted">
                    {rx.date} · {rx.status}
                  </span>
                </div>
                <ul className="mt-2 list-inside list-disc text-muted">
                  {rx.medications.map((med) => (
                    <li key={med.id}>
                      {med.name} — {med.dosage}, {med.frequency}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/doctor/prescriptions/${rx.id}`}
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  View / print
                </Link>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Medical timeline" description="Generated from local demo data." />
        <CardBody>
          <ClinicalTimeline events={timeline} doctorLinks />
        </CardBody>
      </Card>
    </div>
  );
}
