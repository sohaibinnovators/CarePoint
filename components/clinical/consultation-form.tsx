"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { DEMO_CLINICAL_NOTICE, validateConsultationInput } from "@/lib/clinical";
import type { Consultation, ConsultationInput } from "@/lib/types";

const empty: ConsultationInput = {
  appointmentId: "",
  chiefComplaint: "",
  symptoms: "",
  observations: "",
  diagnosis: "",
  treatmentPlan: "",
  followUp: "",
  additionalNotes: "",
};

export function ConsultationForm({
  appointmentId,
  initial,
  onSaveDraft,
  onFinalize,
}: {
  appointmentId: string;
  initial?: Consultation | null;
  onSaveDraft: (input: ConsultationInput) => void;
  onFinalize: (input: ConsultationInput) => void;
}) {
  const [form, setForm] = useState<ConsultationInput>({
    ...empty,
    appointmentId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) {
      setForm({ ...empty, appointmentId });
      return;
    }
    setForm({
      appointmentId,
      chiefComplaint: initial.chiefComplaint,
      symptoms: initial.symptoms,
      observations: initial.observations,
      diagnosis: initial.diagnosis,
      treatmentPlan: initial.treatmentPlan,
      followUp: initial.followUp,
      additionalNotes: initial.additionalNotes,
    });
  }, [initial, appointmentId]);

  function saveDraft() {
    setErrors({});
    onSaveDraft(form);
  }

  function finalize() {
    const nextErrors = validateConsultationInput(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onFinalize(form);
  }

  const isFinalized = initial?.status === "finalized";

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
      {isFinalized ? (
        <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-secondary">
          Finalized demo consultation. You can update notes; a second consultation for
          the same appointment is not created.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Chief complaint" error={errors.chiefComplaint}>
          <Textarea
            value={form.chiefComplaint}
            onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
          />
        </Field>
        <Field label="Symptoms">
          <Textarea
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
        </Field>
        <Field label="Clinical observations">
          <Textarea
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />
        </Field>
        <Field label="Diagnosis (demo entry)" error={errors.diagnosis}>
          <Textarea
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          />
        </Field>
        <Field label="Treatment plan" error={errors.treatmentPlan}>
          <Textarea
            value={form.treatmentPlan}
            onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })}
          />
        </Field>
        <Field label="Follow-up recommendations">
          <Textarea
            value={form.followUp}
            onChange={(e) => setForm({ ...form, followUp: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Additional notes">
        <Textarea
          value={form.additionalNotes}
          onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        {!isFinalized ? (
          <Button type="button" variant="outline" onClick={saveDraft}>
            Save draft
          </Button>
        ) : null}
        <Button type="button" onClick={finalize}>
          {isFinalized ? "Update finalized notes" : "Finalize consultation"}
        </Button>
      </div>
    </div>
  );
}
