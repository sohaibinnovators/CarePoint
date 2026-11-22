"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  calculateInvoiceTotals,
  DEMO_BILLING_NOTICE,
  formatMoney,
  validateInvoiceInput,
} from "@/lib/billing";
import { clinicTodayIso } from "@/lib/time";
import type {
  Appointment,
  Doctor,
  Invoice,
  InvoiceInput,
  Patient,
  Service,
} from "@/lib/types";

type LineRow = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyLine = (): LineRow => ({
  description: "",
  quantity: "1",
  unitPrice: "",
});

export function InvoiceForm({
  patients,
  doctors,
  appointments,
  services,
  initial,
  defaultPatientId,
  onSave,
}: {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  services: Service[];
  initial?: Invoice | null;
  defaultPatientId?: string;
  onSave: (input: InvoiceInput, existingId?: string) => void;
}) {
  const [patientId, setPatientId] = useState(
    initial?.patientId || defaultPatientId || "",
  );
  const [appointmentId, setAppointmentId] = useState(
    initial?.appointmentId || "",
  );
  const [doctorId, setDoctorId] = useState(initial?.doctorId || "");
  const [date, setDate] = useState(initial?.date || clinicTodayIso());
  const [dueDate, setDueDate] = useState(initial?.dueDate || clinicTodayIso());
  const [discount, setDiscount] = useState(String(initial?.discount ?? 0));
  const [taxRate, setTaxRate] = useState(String(initial?.taxRate ?? 5));
  const [notes, setNotes] = useState(initial?.notes || "");
  const [status, setStatus] = useState<"draft" | "unpaid">(
    initial?.status === "unpaid" ? "unpaid" : "draft",
  );
  const [items, setItems] = useState<LineRow[]>(
    initial?.items.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })) || [emptyLine()],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initial) return;
    setPatientId(initial.patientId);
    setAppointmentId(initial.appointmentId || "");
    setDoctorId(initial.doctorId || "");
    setDate(initial.date);
    setDueDate(initial.dueDate);
    setDiscount(String(initial.discount));
    setTaxRate(String(initial.taxRate));
    setNotes(initial.notes);
    setStatus(initial.status === "unpaid" ? "unpaid" : "draft");
    setItems(
      initial.items.map((item) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    );
  }, [initial]);

  const patientAppointments = useMemo(
    () => appointments.filter((item) => item.patientId === patientId),
    [appointments, patientId],
  );

  const parsedItems = items.map((item) => ({
    description: item.description,
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
  }));

  const totals = calculateInvoiceTotals({
    items: parsedItems,
    discount: Number(discount) || 0,
    taxRate: Number(taxRate) || 0,
  });

  function updateItem(index: number, patch: Partial<LineRow>) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function submit() {
    const input: InvoiceInput = {
      patientId,
      appointmentId: appointmentId || undefined,
      doctorId: doctorId || undefined,
      date,
      dueDate,
      items: parsedItems,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
      notes,
      status,
    };
    const nextErrors = validateInvoiceInput(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(input, initial?.id);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient" error={errors.patientId}>
          <Select
            value={patientId}
            disabled={Boolean(defaultPatientId)}
            onChange={(e) => {
              setPatientId(e.target.value);
              setAppointmentId("");
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
        <Field label="Linked appointment">
          <Select
            value={appointmentId}
            disabled={!patientId}
            onChange={(e) => {
              const next = e.target.value;
              setAppointmentId(next);
              const apt = appointments.find((item) => item.id === next);
              if (apt?.doctorId) setDoctorId(apt.doctorId);
            }}
          >
            <option value="">None</option>
            {patientAppointments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.date} {apt.time} · {apt.type}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Doctor">
          <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">None</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Save as">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "unpaid")}
          >
            <option value="draft">Draft</option>
            <option value="unpaid">Unpaid (issued)</option>
          </Select>
        </Field>
        <Field label="Invoice date" error={errors.date}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Due date" error={errors.dueDate}>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Line items</h3>
          <div className="flex flex-wrap gap-2">
            <Select
              className="sm:w-56"
              value=""
              onChange={(e) => {
                const service = services.find((item) => item.id === e.target.value);
                if (!service) return;
                const price = Number(service.price.replace(/[^0-9.]/g, "")) || 0;
                setItems((prev) => [
                  ...prev,
                  {
                    description: `${service.name} (demo)`,
                    quantity: "1",
                    unitPrice: String(price),
                  },
                ]);
              }}
            >
              <option value="">Add from services…</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.price}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setItems((prev) => [...prev, emptyLine()])}
            >
              Add line
            </Button>
          </div>
        </div>
        {errors.items ? <p className="text-sm text-danger">{errors.items}</p> : null}
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-4"
          >
            <div className="sm:col-span-2">
              <Field
                label="Description"
                error={errors[`item-${index}-description`]}
              >
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Qty" error={errors[`item-${index}-quantity`]}>
              <Input
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: e.target.value })}
              />
            </Field>
            <Field label="Unit price" error={errors[`item-${index}-unitPrice`]}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
              />
            </Field>
            {items.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Discount ($)" error={errors.discount}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </Field>
        <Field label="Tax rate (%)" error={errors.taxRate}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
        </Field>
        <div className="rounded-xl border border-border bg-slate-50 p-3 text-sm">
          <p>Subtotal: {formatMoney(totals.subtotal)}</p>
          <p>Tax: {formatMoney(totals.taxAmount)}</p>
          <p className="font-semibold">Total: {formatMoney(totals.total)}</p>
        </div>
      </div>

      <Field label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <Button type="button" onClick={submit}>
        {initial ? "Update invoice" : "Save invoice"}
      </Button>
    </div>
  );
}
