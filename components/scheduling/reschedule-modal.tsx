"use client";

import { useEffect, useMemo, useState } from "react";
import { SlotPicker } from "@/components/scheduling/slot-picker";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useCarePointStore } from "@/lib/carepoint-store";
import { generateDaySlots } from "@/lib/scheduling";
import { clinicTodayIso } from "@/lib/time";
import type { Appointment } from "@/lib/types";

export function RescheduleModal({
  appointment,
  open,
  onClose,
  onDone,
}: {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onDone?: (appointment: Appointment) => void;
}) {
  const { appointments, getDoctorSchedule, updateAppointment } =
    useCarePointStore();
  const [date, setDate] = useState(appointment?.date ?? "");
  const [time, setTime] = useState(appointment?.time ?? "");
  const [error, setError] = useState<string | null>(null);

  const schedule = appointment
    ? getDoctorSchedule(appointment.doctorId)
    : null;

  const slots = useMemo(() => {
    if (!appointment || !schedule || !date) return [];
    return generateDaySlots({
      schedule,
      date,
      appointments,
      doctorId: appointment.doctorId,
      excludeAppointmentId: appointment.id,
    });
  }, [appointment, schedule, date, appointments]);

  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTime(appointment.time);
      setError(null);
    }
  }, [appointment]);

  function submit() {
    if (!appointment) return;
    setError(null);
    const result = updateAppointment(appointment.id, { date, time });
    if (!result) {
      setError("Appointment not found.");
      return;
    }
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onDone?.(result);
    onClose();
  }

  return (
    <Modal
      open={open && appointment !== null}
      onClose={onClose}
      title="Reschedule appointment"
      description="Choose a valid available slot for this doctor."
      className="max-w-2xl"
    >
      {appointment ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {appointment.patientName} with {appointment.doctorName}
          </p>
          <Field label="New date">
            <input
              type="date"
              min={clinicTodayIso()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </Field>
          <SlotPicker
            slots={slots}
            value={time}
            onChange={setTime}
            emptyMessage="No open slots on this date for rescheduling."
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!date || !time}>
              Save new time
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
