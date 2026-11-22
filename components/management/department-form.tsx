"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { Department, DepartmentInput } from "@/lib/types";

const empty: DepartmentInput = { name: "", description: "" };

export function DepartmentForm({
  initial,
  submitLabel = "Save department",
  onSubmit,
  onCancel,
  error,
}: {
  initial?: Department | null;
  submitLabel?: string;
  onSubmit: (input: DepartmentInput) => void;
  onCancel?: () => void;
  error?: string | null;
}) {
  const [form, setForm] = useState<DepartmentInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) {
      setForm(empty);
      return;
    }
    setForm({ name: initial.name, description: initial.description });
  }, [initial]);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Department name is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <Field label="Department name" error={errors.name}>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Cardiology"
        />
      </Field>
      <Field label="Description" error={errors.description}>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}