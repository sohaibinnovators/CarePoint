"use client";

import { useMemo, useState } from "react";
import { PatientForm } from "@/components/management/patient-form";
import { SlotPicker } from "@/components/scheduling/slot-picker";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { useCarePointStore } from "@/lib/carepoint-store";
import { describeSchedule, generateDaySlots } from "@/lib/scheduling";
import { clinicTodayIso } from "@/lib/time";
import type { Appointment, PatientInput } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Patient",
  "Department",
  "Doctor",
  "Date",
  "Time",
  "Details",
  "Review",
] as const;

export function AppointmentBookingForm({
  onBooked,
}: {
  onBooked?: (appointment: Appointment) => void;
}) {
  const {
    patients,
    doctors,
    departments,
    appointments,
    addPatient,
    addAppointment,
    getDoctorSchedule,
  } = useCarePointStore();

  const [step, setStep] = useState(0);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: "",
    departmentId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "Consultation",
    visitType: "in-person" as "in-person" | "online",
    reason: "",
  });

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedDepartment = departments.find((d) => d.id === form.departmentId);
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);
  const schedule = selectedDoctor
    ? getDoctorSchedule(selectedDoctor.id)
    : null;

  const departmentDoctors = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          doctor.departmentId === form.departmentId &&
          doctor.availabilityStatus === "available",
      ),
    [doctors, form.departmentId],
  );

  const slots = useMemo(() => {
    if (!selectedDoctor || !schedule || !form.date) return [];
    return generateDaySlots({
      schedule,
      date: form.date,
      appointments,
      doctorId: selectedDoctor.id,
    });
  }, [selectedDoctor, schedule, form.date, appointments]);

  function goNext() {
    setError(null);
    if (step === 0 && !form.patientId) {
      setError("Select or register a patient.");
      return;
    }
    if (step === 1 && !form.departmentId) {
      setError("Select a department.");
      return;
    }
    if (step === 2 && !form.doctorId) {
      setError("Select a doctor.");
      return;
    }
    if (step === 3 && !form.date) {
      setError("Select an appointment date.");
      return;
    }
    if (step === 3 && schedule?.unavailableDates.includes(form.date)) {
      setError("Doctor is unavailable on this date.");
      return;
    }
    if (step === 4 && !form.time) {
      setError("Select an available time slot.");
      return;
    }
    if (step === 5 && !form.type.trim()) {
      setError("Select an appointment type.");
      return;
    }
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((value) => Math.max(value - 1, 0));
  }

  function handleCreatePatient(input: PatientInput) {
    const patient = addPatient(input);
    setForm((prev) => ({ ...prev, patientId: patient.id }));
    setShowPatientForm(false);
  }

  function confirmBooking() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = addAppointment({
      patientId: form.patientId,
      doctorId: form.doctorId,
      departmentId: form.departmentId,
      date: form.date,
      time: form.time,
      type: form.type,
      visitType: form.visitType,
      reason: form.reason,
      status: "pending",
    });
    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setConfirmed(result);
    onBooked?.(result);
  }

  if (confirmed) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Appointment confirmed (demo)
        </h3>
        <p className="text-sm text-muted">
          {confirmed.id} · {confirmed.patientName} with {confirmed.doctorName}
        </p>
        <p className="text-sm font-medium">
          {confirmed.date} at {confirmed.time} · {confirmed.visitType}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setConfirmed(null);
            setStep(0);
            setForm({
              patientId: "",
              departmentId: "",
              doctorId: "",
              date: "",
              time: "",
              type: "Consultation",
              visitType: "in-person",
              reason: "",
            });
          }}
        >
          Book another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => index < step && setStep(index)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              index === step
                ? "bg-primary text-white"
                : index < step
                  ? "bg-light-blue text-primary"
                  : "bg-slate-100 text-muted",
            )}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={!showPatientForm ? "primary" : "outline"}
              onClick={() => setShowPatientForm(false)}
            >
              Existing patient
            </Button>
            <Button
              type="button"
              size="sm"
              variant={showPatientForm ? "primary" : "outline"}
              onClick={() => setShowPatientForm(true)}
            >
              Register new patient
            </Button>
          </div>
          {showPatientForm ? (
            <div className="rounded-xl border border-border bg-slate-50 p-4">
              <PatientForm
                submitLabel="Register & continue"
                onSubmit={(input) => {
                  handleCreatePatient(input);
                  setStep(1);
                }}
                onCancel={() => setShowPatientForm(false)}
              />
            </div>
          ) : (
            <Field label="Patient">
              <Select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} · {patient.id}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      ) : null}

      {step === 1 ? (
        <Field label="Department">
          <Select
            value={form.departmentId}
            onChange={(e) =>
              setForm({
                ...form,
                departmentId: e.target.value,
                doctorId: "",
                time: "",
              })
            }
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <Field label="Doctor">
            <Select
              value={form.doctorId}
              onChange={(e) =>
                setForm({ ...form, doctorId: e.target.value, time: "" })
              }
            >
              <option value="">Select doctor</option>
              {departmentDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} · {doctor.specialty}
                </option>
              ))}
            </Select>
          </Field>
          {schedule ? (
            <p className="text-xs text-muted">{describeSchedule(schedule)}</p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <Field label="Appointment date">
          <input
            type="date"
            min={clinicTodayIso()}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </Field>
      ) : null}

      {step === 4 ? (
        <SlotPicker
          slots={slots}
          value={form.time}
          onChange={(time) => setForm({ ...form, time })}
          emptyMessage="No slots available for this doctor on the selected date. Try another day or update availability."
        />
      ) : null}

      {step === 5 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Appointment type">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Screening</option>
              <option>Wellness</option>
              <option>Evaluation</option>
            </Select>
          </Field>
          <Field label="Visit type">
            <Select
              value={form.visitType}
              onChange={(e) =>
                setForm({
                  ...form,
                  visitType: e.target.value as "in-person" | "online",
                })
              }
            >
              <option value="in-person">In-person</option>
              <option value="online">Online (demo)</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Reason for visit">
              <Textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="space-y-2 rounded-xl border border-border bg-slate-50 p-4 text-sm">
          <p>
            <span className="text-muted">Patient:</span>{" "}
            <strong>{selectedPatient?.name}</strong>
          </p>
          <p>
            <span className="text-muted">Department:</span>{" "}
            <strong>{selectedDepartment?.name}</strong>
          </p>
          <p>
            <span className="text-muted">Doctor:</span>{" "}
            <strong>{selectedDoctor?.name}</strong>
          </p>
          <p>
            <span className="text-muted">When:</span>{" "}
            <strong>
              {form.date} · {form.time}
            </strong>
          </p>
          <p>
            <span className="text-muted">Type:</span>{" "}
            <strong>
              {form.type} ({form.visitType})
            </strong>
          </p>
          <p>
            <span className="text-muted">Reason:</span>{" "}
            <strong>{form.reason || "—"}</strong>
          </p>
          <p className="text-xs text-muted">
            Duration will use this doctor&apos;s consultation setting (
            {schedule?.slotDurationMinutes ?? 30} min).
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={confirmBooking} disabled={submitting}>
            {submitting ? "Booking…" : "Confirm appointment"}
          </Button>
        )}
      </div>
    </div>
  );
}
