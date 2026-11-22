"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { doctors, services } from "@/lib/mock-data";

export function AppointmentForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    doctor: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim() || !form.email.includes("@"))
      next.email = "Enter a valid email.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.doctor) next.doctor = "Select a doctor.";
    if (!form.service) next.service = "Select a service.";
    if (!form.date) next.date = "Select a preferred date.";
    if (!form.time) next.time = "Select a preferred time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Request received (Demo)
        </h3>
        <p className="mt-2 text-sm text-muted">
          This is a UI-only confirmation. No appointment was stored or sent.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              doctor: "",
              service: "",
              date: "",
              time: "",
              notes: "",
            });
          }}
        >
          Book another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Full name" error={errors.name}>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@example.com"
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
        <Field label="Service" error={errors.service}>
          <Select
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
          >
            <option value="">Select service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Doctor" error={errors.doctor}>
          <Select
            value={form.doctor}
            onChange={(e) => update("doctor", e.target.value)}
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.specialty}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred date" error={errors.date}>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Field>
        <Field label="Preferred time" error={errors.time}>
          <Select
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
          >
            <option value="">Select time</option>
            <option>09:00 AM</option>
            <option>10:30 AM</option>
            <option>01:00 PM</option>
            <option>02:30 PM</option>
            <option>04:00 PM</option>
          </Select>
        </Field>
      </div>
      <Field label="Notes (optional)">
        <Textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Share any symptoms or preferences…"
        />
      </Field>
      <Button type="submit" className="w-full sm:w-auto">
        Submit booking request
      </Button>
      <p className="text-xs text-muted">
        Demo form only — validation runs in the browser and nothing is saved.
      </p>
    </form>
  );
}
