"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";
import { clinicTodayIso } from "@/lib/time";
import type {
  Consultation,
  Patient,
  Prescription,
  PrescriptionInput,
} from "@/lib/types";

type MedRow = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

const emptyMed = (): MedRow => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export function PrescriptionForm({
  patients,
  doctorId,
  consultations,
  initial,
  defaultPatientId,
  defaultConsultationId,
  defaultAppointmentId,
  onSave,
}: {
  patients: Patient[];
  doctorId: string;
  consultations: Consultation[];
  initial?: Prescription | null;
  defaultPatientId?: string;
  defaultConsultationId?: string;
  defaultAppointmentId?: string;
  onSave: (input: PrescriptionInput, existingId?: string) => void;
}) {
  const [patientId, setPatientId] = useState(
    initial?.patientId || defaultPatientId || "",
  );
  const [consultationId, setConsultationId] = useState(
    initial?.consultationId || defaultConsultationId || "",
  );
  const [date, setDate] = useState(initial?.date || clinicTodayIso());
  const [notes, setNotes] = useState(initial?.notes || "");
  const [medications, setMedications] = useState<MedRow[]>(
    initial?.medications.map((med) => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
    })) || [emptyMed()],
  );
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    setPatientId(initial.patientId);
    setConsultationId(initial.consultationId || "");
    setDate(initial.date);
    setNotes(initial.notes);
    setMedications(
      initial.medications.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
      })),
    );
  }, [initial]);

  const patientConsultations = consultations.filter(
    (item) => item.patientId === patientId && item.status === "finalized",
  );

  function updateMed(index: number, patch: Partial<MedRow>) {
    setMedications((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function submit(status: "draft" | "issued") {
    setError(null);
    setToast(null);
    if (!patientId) {
      setError("Select a patient.");
      return;
    }
    onSave(
      {
        patientId,
        doctorId,
        consultationId: consultationId || undefined,
        appointmentId:
          initial?.appointmentId ||
          defaultAppointmentId ||
          patientConsultations.find((item) => item.id === consultationId)
            ?.appointmentId,
        medications,
        date,
        notes,
        status,
      },
      initial?.id,
    );
    setToast(
      status === "issued"
        ? "Prescription issued (demo)."
        : "Prescription draft saved (demo).",
    );
  }

  const locked = initial?.status === "issued" || initial?.status === "cancelled";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient">
          <Select
            value={patientId}
            disabled={locked || Boolean(defaultPatientId)}
            onChange={(e) => {
              setPatientId(e.target.value);
              setConsultationId("");
            }}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prescription date">
          <Input
            type="date"
            value={date}
            disabled={locked}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Linked consultation (optional)">
          <Select
            value={consultationId}
            disabled={locked || !patientId}
            onChange={(e) => setConsultationId(e.target.value)}
          >
            <option value="">None</option>
            {patientConsultations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.chiefComplaint.slice(0, 40)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Medications</h3>
          {!locked ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMedications((prev) => [...prev, emptyMed()])}
            >
              Add medication
            </Button>
          ) : null}
        </div>
        {medications.map((med, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2"
          >
            <Field label="Medication name">
              <Input
                value={med.name}
                disabled={locked}
                onChange={(e) => updateMed(index, { name: e.target.value })}
                placeholder="e.g. Lisinopril (demo)"
              />
            </Field>
            <Field label="Dosage">
              <Input
                value={med.dosage}
                disabled={locked}
                onChange={(e) => updateMed(index, { dosage: e.target.value })}
              />
            </Field>
            <Field label="Frequency">
              <Input
                value={med.frequency}
                disabled={locked}
                onChange={(e) => updateMed(index, { frequency: e.target.value })}
              />
            </Field>
            <Field label="Duration">
              <Input
                value={med.duration}
                disabled={locked}
                onChange={(e) => updateMed(index, { duration: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Instructions">
                <Textarea
                  value={med.instructions}
                  disabled={locked}
                  onChange={(e) =>
                    updateMed(index, { instructions: e.target.value })
                  }
                />
              </Field>
            </div>
            {!locked && medications.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setMedications((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove row
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Field label="Notes">
        <Textarea
          value={notes}
          disabled={locked}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {toast ? <p className="text-sm text-success">{toast}</p> : null}

      {!locked ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => submit("draft")}>
            Save draft
          </Button>
          <Button type="button" onClick={() => submit("issued")}>
            Save & issue
          </Button>
        </div>
      ) : null}
    </div>
  );
}
