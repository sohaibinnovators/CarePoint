"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/input";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";
import type { MedicalRecord, MedicalRecordInput } from "@/lib/types";

function listToText(values: string[]) {
  return values.join("\n");
}

function textToList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MedicalRecordPanel({
  record,
  editable = false,
  onSave,
}: {
  record: MedicalRecord;
  editable?: boolean;
  onSave?: (input: MedicalRecordInput) => void;
}) {
  const [form, setForm] = useState({
    allergies: listToText(record.allergies),
    conditions: listToText(record.conditions),
    pastHistory: record.pastHistory,
    currentMedications: listToText(record.currentMedications),
    familyHistory: record.familyHistory,
    clinicalNotes: record.clinicalNotes,
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      allergies: listToText(record.allergies),
      conditions: listToText(record.conditions),
      pastHistory: record.pastHistory,
      currentMedications: listToText(record.currentMedications),
      familyHistory: record.familyHistory,
      clinicalNotes: record.clinicalNotes,
    });
  }, [record]);

  function handleSave() {
    onSave?.({
      allergies: textToList(form.allergies),
      conditions: textToList(form.conditions),
      pastHistory: form.pastHistory,
      currentMedications: textToList(form.currentMedications),
      familyHistory: form.familyHistory,
      clinicalNotes: form.clinicalNotes,
    });
    setToast("Medical record saved (demo).");
  }

  return (
    <Card>
      <CardHeader
        title="Medical record"
        description={`${DEMO_CLINICAL_NOTICE} Updated ${record.updatedAt}.`}
      />
      <CardBody className="space-y-4">
        {editable ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Known allergies (one per line)">
                <Textarea
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                />
              </Field>
              <Field label="Medical conditions (one per line)">
                <Textarea
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                />
              </Field>
              <Field label="Current medications (one per line)">
                <Textarea
                  value={form.currentMedications}
                  onChange={(e) =>
                    setForm({ ...form, currentMedications: e.target.value })
                  }
                />
              </Field>
              <Field label="Family medical history">
                <Textarea
                  value={form.familyHistory}
                  onChange={(e) =>
                    setForm({ ...form, familyHistory: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Past medical history">
              <Textarea
                value={form.pastHistory}
                onChange={(e) => setForm({ ...form, pastHistory: e.target.value })}
              />
            </Field>
            <Field label="Relevant clinical notes">
              <Textarea
                value={form.clinicalNotes}
                onChange={(e) =>
                  setForm({ ...form, clinicalNotes: e.target.value })
                }
              />
            </Field>
            <Button type="button" onClick={handleSave}>
              Save medical record
            </Button>
            {toast ? (
              <p className="text-sm text-success">{toast}</p>
            ) : null}
          </>
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Allergies</dt>
              <dd className="font-medium">
                {record.allergies.join(", ") || "None recorded (demo)"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Conditions</dt>
              <dd className="font-medium">
                {record.conditions.join(", ") || "None recorded (demo)"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Current medications</dt>
              <dd className="font-medium">
                {record.currentMedications.join(", ") || "None recorded (demo)"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Family history</dt>
              <dd className="font-medium">
                {record.familyHistory || "None recorded (demo)"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Past history</dt>
              <dd className="font-medium">
                {record.pastHistory || "None recorded (demo)"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Clinical notes</dt>
              <dd className="font-medium">
                {record.clinicalNotes || "None recorded (demo)"}
              </dd>
            </div>
          </dl>
        )}
      </CardBody>
    </Card>
  );
}

export function MedicalRecordSummaryCards({ record }: { record: MedicalRecord }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ["Allergies", record.allergies.join(", ") || "None"],
        ["Conditions", record.conditions.join(", ") || "None"],
        ["Medications", record.currentMedications.join(", ") || "None"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-border bg-white p-4 text-sm">
          <p className="text-muted">{label}</p>
          <p className="mt-1 font-medium">{value}</p>
        </div>
      ))}
    </div>
  );
}
