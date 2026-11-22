"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { Patient, PatientInput } from "@/lib/types";
import { calculateAge, isValidEmail, isValidPhone } from "@/lib/validation";

const empty: PatientInput = {
  name: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  emergencyContact: "",
  bloodType: "",
  notes: "",
  status: "active",
  condition: "",
};

function toInput(initial?: Patient | null): PatientInput {
  if (!initial) return { ...empty };
  return {
    name: initial.name,
    dateOfBirth: initial.dateOfBirth,
    gender: initial.gender,
    phone: initial.phone,
    email: initial.email,
    address: initial.address,
    emergencyContact: initial.emergencyContact,
    bloodType: initial.bloodType === "Unknown" ? "" : initial.bloodType,
    notes: initial.notes,
    status: initial.status,
    condition: initial.condition,
  };
}

export function PatientForm({
  initial,
  submitLabel = "Save patient",
  onSubmit,
  onCancel,
  mode = "admin",
}: {
  initial?: Patient | null;
  submitLabel?: string;
  onSubmit: (input: PatientInput) => void;
  onCancel?: () => void;
  /** Front-desk mode hides clinical-leaning fields. */
  mode?: "admin" | "front-desk";
}) {
  const [form, setForm] = useState<PatientInput>(() => toInput(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.dateOfBirth) next.dateOfBirth = "Date of birth is required.";
    if (!form.gender) next.gender = "Gender is required.";
    if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!form.emergencyContact.trim()) {
      next.emergencyContact = "Emergency contact is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  const age = form.dateOfBirth ? calculateAge(form.dateOfBirth) : null;
  const showClinicalFields = mode === "admin";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Date of birth" error={errors.dateOfBirth}>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
          {age !== null ? (
            <p className="mt-1 text-xs text-muted">Calculated age: {age}</p>
          ) : null}
        </Field>
        <Field label="Gender" error={errors.gender}>
          <Select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "active" | "inactive",
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        {showClinicalFields ? (
          <>
            <Field label="Blood group (optional)">
              <Select
                value={form.bloodType}
                onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              >
                <option value="">Unknown</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </Select>
            </Field>
            <Field label="Condition / reason (demo)">
              <Input
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              />
            </Field>
          </>
        ) : null}
        <Field label="Address" error={errors.address}>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
        <Field label="Emergency contact" error={errors.emergencyContact}>
          <Input
            value={form.emergencyContact}
            onChange={(e) =>
              setForm({ ...form, emergencyContact: e.target.value })
            }
            placeholder="Name · phone"
          />
        </Field>
      </div>
      <Field label="Front-desk notes">
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
