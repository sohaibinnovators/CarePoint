"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { describeSchedule, SLOT_DURATION_OPTIONS } from "@/lib/scheduling";
import type {
  DoctorSchedule,
  DoctorScheduleInput,
  ScheduleTimeRange,
  SlotDurationMinutes,
  Weekday,
} from "@/lib/types";
import { weekdayLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

function toInput(schedule: DoctorSchedule): DoctorScheduleInput {
  return {
    workingDays: [...schedule.workingDays],
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    slotDurationMinutes: schedule.slotDurationMinutes,
    breaks: schedule.breaks.map((item) => ({ ...item })),
    unavailableDates: [...schedule.unavailableDates],
    maxAppointmentsPerDay: schedule.maxAppointmentsPerDay,
  };
}

export function AvailabilityEditor({
  schedule,
  onSave,
}: {
  schedule: DoctorSchedule;
  onSave: (input: DoctorScheduleInput) => { error?: string } | DoctorSchedule;
}) {
  const [form, setForm] = useState<DoctorScheduleInput>(() => toInput(schedule));
  const [newBreak, setNewBreak] = useState({ start: "12:00", end: "13:00", label: "Lunch" });
  const [newUnavailable, setNewUnavailable] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setForm(toInput(schedule));
  }, [schedule]);

  function toggleDay(day: Weekday) {
    setForm((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day].sort((a, b) => a - b),
      };
    });
  }

  function addBreak() {
    const id = `brk-${Date.now()}`;
    const item: ScheduleTimeRange = {
      id,
      start: newBreak.start,
      end: newBreak.end,
      label: newBreak.label || "Break",
    };
    setForm((prev) => ({ ...prev, breaks: [...prev.breaks, item] }));
  }

  function removeBreak(id: string) {
    setForm((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((item) => item.id !== id),
    }));
  }

  function addUnavailable() {
    if (!newUnavailable) return;
    setForm((prev) => ({
      ...prev,
      unavailableDates: prev.unavailableDates.includes(newUnavailable)
        ? prev.unavailableDates
        : [...prev.unavailableDates, newUnavailable].sort(),
    }));
    setNewUnavailable("");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setToast(null);
    const result = onSave(form);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    setToast("Availability saved for this demo doctor.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm text-muted">
        Current: {describeSchedule({ ...schedule, ...form, doctorId: schedule.doctorId })}
      </p>

      <div>
        <p className="mb-2 text-sm font-medium">Working days</p>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((day) => {
            const active = form.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium",
                  active
                    ? "border-primary bg-light-blue text-primary"
                    : "border-border bg-white text-muted",
                )}
              >
                {weekdayLabel(day).slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Start time (HH:MM)">
          <Input
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            placeholder="09:00"
          />
        </Field>
        <Field label="End time (HH:MM)">
          <Input
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            placeholder="17:00"
          />
        </Field>
        <Field label="Consultation duration">
          <Select
            value={String(form.slotDurationMinutes)}
            onChange={(e) =>
              setForm({
                ...form,
                slotDurationMinutes: Number(e.target.value) as SlotDurationMinutes,
              })
            }
          >
            {SLOT_DURATION_OPTIONS.map((mins) => (
              <option key={mins} value={mins}>
                {mins} minutes
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Max appointments / day">
          <Input
            type="number"
            min={1}
            value={form.maxAppointmentsPerDay}
            onChange={(e) =>
              setForm({
                ...form,
                maxAppointmentsPerDay: Number(e.target.value) || 1,
              })
            }
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">Breaks / lunch</h3>
        <div className="space-y-2">
          {form.breaks.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>
                {item.label || "Break"} · {item.start}–{item.end}
              </span>
              <Button type="button" size="sm" variant="ghost" onClick={() => removeBreak(item.id)}>
                Remove
              </Button>
            </div>
          ))}
          {form.breaks.length === 0 ? (
            <p className="text-sm text-muted">No breaks configured.</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Input
            value={newBreak.label}
            onChange={(e) => setNewBreak({ ...newBreak, label: e.target.value })}
            placeholder="Label"
          />
          <Input
            value={newBreak.start}
            onChange={(e) => setNewBreak({ ...newBreak, start: e.target.value })}
            placeholder="Start HH:MM"
          />
          <Input
            value={newBreak.end}
            onChange={(e) => setNewBreak({ ...newBreak, end: e.target.value })}
            placeholder="End HH:MM"
          />
          <Button type="button" variant="outline" onClick={addBreak}>
            Add break
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">Unavailable dates</h3>
        <div className="flex flex-wrap gap-2">
          {form.unavailableDates.map((date) => (
            <button
              key={date}
              type="button"
              className="rounded-md border border-border bg-white px-2 py-1 text-xs"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  unavailableDates: prev.unavailableDates.filter((d) => d !== date),
                }))
              }
            >
              {date} ×
            </button>
          ))}
          {form.unavailableDates.length === 0 ? (
            <p className="text-sm text-muted">No special unavailable dates.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={newUnavailable}
            onChange={(e) => setNewUnavailable(e.target.value)}
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={addUnavailable}>
            Add date
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <Button type="submit">Save availability</Button>
    </form>
  );
}
