"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { Department, Doctor, DoctorInput } from "@/lib/types";
import { getInitials, isValidEmail, isValidPhone } from "@/lib/validation";

const empty: DoctorInput = {
  name: "",
  specialty: "",
  departmentId: "",
  qualification: "",
  experienceYears: 1,
  phone: "",
  email: "",
  consultationFee: "",
  bio: "",
  availabilityStatus: "available",
  availability: "Mon–Fri",
  imagePreview: "",
};

export function DoctorForm({
  initial,
  departments,
  submitLabel = "Save doctor",
  onSubmit,
  onCancel,
}: {
  initial?: Doctor | null;
  departments: Department[];
  submitLabel?: string;
  onSubmit: (input: DoctorInput) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<DoctorInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) {
      setForm(empty);
      return;
    }
    setForm({
      name: initial.name,
      specialty: initial.specialty,
      departmentId: initial.departmentId,
      qualification: initial.qualification || initial.education,
      experienceYears: initial.experienceYears,
      phone: initial.phone,
      email: initial.email,
      consultationFee: initial.consultationFee,
      bio: initial.bio,
      availabilityStatus: initial.availabilityStatus,
      availability: initial.availability,
      imagePreview: initial.imagePreview || "",
    });
  }, [initial]);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.specialty.trim()) next.specialty = "Specialty is required.";
    if (!form.departmentId) next.departmentId = "Department is required.";
    if (!form.qualification.trim()) {
      next.qualification = "Qualification is required.";
    }
    if (!form.experienceYears || form.experienceYears < 0) {
      next.experienceYears = "Enter experience in years.";
    }
    if (!isValidPhone(form.phone)) next.phone = "Enter a valid phone number.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email.";
    if (!form.consultationFee.trim()) {
      next.consultationFee = "Consultation fee is required.";
    }
    if (!form.bio.trim()) next.bio = "Short biography is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  const preview = form.imagePreview?.trim();
  const initials = getInitials(form.name || "Doctor");

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Doctor preview"
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-light-blue text-sm font-semibold text-primary">
            {initials}
          </div>
        )}
        <p className="text-sm text-muted">
          Profile image preview uses initials or an optional image URL.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dr. Jane Doe"
          />
        </Field>
        <Field label="Profile image URL (optional)">
          <Input
            value={form.imagePreview}
            onChange={(e) => setForm({ ...form, imagePreview: e.target.value })}
            placeholder="https://…"
          />
        </Field>
        <Field label="Specialty" error={errors.specialty}>
          <Input
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
        </Field>
        <Field label="Department" error={errors.departmentId}>
          <Select
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Qualification" error={errors.qualification}>
          <Input
            value={form.qualification}
            onChange={(e) =>
              setForm({ ...form, qualification: e.target.value })
            }
          />
        </Field>
        <Field label="Experience (years)" error={errors.experienceYears}>
          <Input
            type="number"
            min={0}
            value={form.experienceYears}
            onChange={(e) =>
              setForm({
                ...form,
                experienceYears: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Consultation fee" error={errors.consultationFee}>
          <Input
            value={form.consultationFee}
            onChange={(e) =>
              setForm({ ...form, consultationFee: e.target.value })
            }
            placeholder="$120"
          />
        </Field>
        <Field label="Availability status">
          <Select
            value={form.availabilityStatus}
            onChange={(e) =>
              setForm({
                ...form,
                availabilityStatus: e.target.value as
                  | "available"
                  | "unavailable",
              })
            }
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </Field>
        <Field label="Availability schedule">
          <Input
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            placeholder="Mon, Wed, Fri"
          />
        </Field>
      </div>
      <Field label="Short biography" error={errors.bio}>
        <Textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
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
