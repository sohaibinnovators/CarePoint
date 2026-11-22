import type {
  Appointment,
  DoctorSchedule,
  DoctorScheduleInput,
  ScheduleTimeRange,
  SlotDurationMinutes,
  Weekday,
} from "./types";
import {
  formatMinutesToLabel,
  isPastSlot,
  parseTimeToMinutes,
  rangesOverlap,
  weekdayFromIso,
} from "./time";

export const SLOT_DURATION_OPTIONS: SlotDurationMinutes[] = [15, 30, 45, 60];

export const DEFAULT_WORKING_DAYS: Weekday[] = [1, 2, 3, 4, 5];

export function createDefaultSchedule(doctorId: string): DoctorSchedule {
  return {
    doctorId,
    workingDays: [...DEFAULT_WORKING_DAYS],
    startTime: "09:00",
    endTime: "17:00",
    slotDurationMinutes: 30,
    breaks: [
      {
        id: `brk-${doctorId}-lunch`,
        start: "12:00",
        end: "13:00",
        label: "Lunch",
      },
    ],
    unavailableDates: [],
    maxAppointmentsPerDay: 12,
  };
}

export function isActiveBooking(appointment: Appointment) {
  return (
    appointment.status !== "cancelled" && appointment.status !== "completed"
  );
}

export function appointmentEndMinutes(appointment: Appointment) {
  const start = parseTimeToMinutes(appointment.time);
  if (start === null) return null;
  return start + (appointment.durationMinutes || 30);
}

export function validateScheduleInput(
  input: DoctorScheduleInput,
): string | null {
  const start = parseTimeToMinutes(input.startTime);
  const end = parseTimeToMinutes(input.endTime);
  if (start === null || end === null) {
    return "Working hours must use valid HH:MM times.";
  }
  if (start >= end) {
    return "End time must be after start time.";
  }
  if (!input.workingDays.length) {
    return "Select at least one working day.";
  }
  if (!SLOT_DURATION_OPTIONS.includes(input.slotDurationMinutes)) {
    return "Consultation duration must be 15, 30, 45, or 60 minutes.";
  }
  if (input.maxAppointmentsPerDay < 1) {
    return "Maximum appointments per day must be at least 1.";
  }

  const normalizedBreaks: Array<{ start: number; end: number; label: string }> =
    [];
  for (const item of input.breaks) {
    const bStart = parseTimeToMinutes(item.start);
    const bEnd = parseTimeToMinutes(item.end);
    if (bStart === null || bEnd === null) {
      return `Break "${item.label || item.id}" has invalid times.`;
    }
    if (bStart >= bEnd) {
      return `Break "${item.label || item.id}" end must be after start.`;
    }
    if (bStart < start || bEnd > end) {
      return `Break "${item.label || item.id}" must fall within working hours.`;
    }
    for (const existing of normalizedBreaks) {
      if (rangesOverlap(bStart, bEnd, existing.start, existing.end)) {
        return `Break "${item.label || item.id}" overlaps another break.`;
      }
    }
    normalizedBreaks.push({
      start: bStart,
      end: bEnd,
      label: item.label || item.id,
    });
  }

  for (const date of input.unavailableDates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return `Unavailable date "${date}" is invalid.`;
    }
  }

  return null;
}

function breakBlocksSlot(
  slotStart: number,
  slotEnd: number,
  breaks: ScheduleTimeRange[],
) {
  return breaks.some((item) => {
    const bStart = parseTimeToMinutes(item.start);
    const bEnd = parseTimeToMinutes(item.end);
    if (bStart === null || bEnd === null) return false;
    return rangesOverlap(slotStart, slotEnd, bStart, bEnd);
  });
}

export type SlotOption = {
  time: string;
  minutes: number;
  available: boolean;
  reason?: string;
};

export function getScheduleForDoctor(
  schedules: DoctorSchedule[],
  doctorId: string,
) {
  return (
    schedules.find((schedule) => schedule.doctorId === doctorId) ??
    createDefaultSchedule(doctorId)
  );
}

export function generateDaySlots(options: {
  schedule: DoctorSchedule;
  date: string;
  appointments: Appointment[];
  doctorId: string;
  excludeAppointmentId?: string;
}): SlotOption[] {
  const { schedule, date, appointments, doctorId, excludeAppointmentId } =
    options;
  const weekday = weekdayFromIso(date);
  if (weekday === null) return [];

  if (schedule.unavailableDates.includes(date)) {
    return [];
  }
  if (!schedule.workingDays.includes(weekday)) {
    return [];
  }

  const dayStart = parseTimeToMinutes(schedule.startTime);
  const dayEnd = parseTimeToMinutes(schedule.endTime);
  if (dayStart === null || dayEnd === null || dayStart >= dayEnd) return [];

  const duration = schedule.slotDurationMinutes;
  const dayAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.date === date &&
      isActiveBooking(apt) &&
      apt.id !== excludeAppointmentId,
  );

  if (dayAppointments.length >= schedule.maxAppointmentsPerDay) {
    return [];
  }

  const slots: SlotOption[] = [];
  for (let cursor = dayStart; cursor + duration <= dayEnd; cursor += duration) {
    const slotEnd = cursor + duration;
    const label = formatMinutesToLabel(cursor);
    let available = true;
    let reason: string | undefined;

    if (breakBlocksSlot(cursor, slotEnd, schedule.breaks)) {
      available = false;
      reason = "Break";
    } else if (isPastSlot(date, label)) {
      available = false;
      reason = "Past";
    } else {
      const overlaps = dayAppointments.some((apt) => {
        const aptStart = parseTimeToMinutes(apt.time);
        const aptEnd = appointmentEndMinutes(apt);
        if (aptStart === null || aptEnd === null) return false;
        return rangesOverlap(cursor, slotEnd, aptStart, aptEnd);
      });
      if (overlaps) {
        available = false;
        reason = "Booked";
      }
    }

    slots.push({ time: label, minutes: cursor, available, reason });
  }

  return slots;
}

export function getAvailableSlotLabels(options: {
  schedule: DoctorSchedule;
  date: string;
  appointments: Appointment[];
  doctorId: string;
  excludeAppointmentId?: string;
}) {
  return generateDaySlots(options)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
}

export function validateAppointmentSlot(options: {
  schedule: DoctorSchedule;
  appointments: Appointment[];
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  durationMinutes?: number;
  excludeAppointmentId?: string;
}): { ok: true; durationMinutes: number } | { ok: false; error: string } {
  const {
    schedule,
    appointments,
    doctorId,
    patientId,
    date,
    time,
    excludeAppointmentId,
  } = options;

  const scheduleError = validateScheduleInput(schedule);
  if (scheduleError) return { ok: false, error: scheduleError };

  if (schedule.unavailableDates.includes(date)) {
    return { ok: false, error: "Doctor is unavailable on this date." };
  }

  const weekday = weekdayFromIso(date);
  if (weekday === null) {
    return { ok: false, error: "Invalid appointment date." };
  }
  if (!schedule.workingDays.includes(weekday)) {
    return { ok: false, error: "Selected date is outside the doctor's working days." };
  }

  const start = parseTimeToMinutes(time);
  if (start === null) {
    return { ok: false, error: "Invalid appointment time." };
  }

  const duration =
    options.durationMinutes ?? schedule.slotDurationMinutes;
  const end = start + duration;
  const dayStart = parseTimeToMinutes(schedule.startTime);
  const dayEnd = parseTimeToMinutes(schedule.endTime);
  if (dayStart === null || dayEnd === null) {
    return { ok: false, error: "Doctor working hours are invalid." };
  }
  if (start < dayStart || end > dayEnd) {
    return { ok: false, error: "Appointment is outside doctor working hours." };
  }
  if (breakBlocksSlot(start, end, schedule.breaks)) {
    return { ok: false, error: "Appointment overlaps a break period." };
  }
  if (isPastSlot(date, time)) {
    return { ok: false, error: "Cannot book a past appointment time." };
  }

  const active = appointments.filter(
    (apt) => apt.id !== excludeAppointmentId && isActiveBooking(apt),
  );

  const doctorDayCount = active.filter(
    (apt) => apt.doctorId === doctorId && apt.date === date,
  ).length;
  if (doctorDayCount >= schedule.maxAppointmentsPerDay) {
    return {
      ok: false,
      error: "Doctor has reached the maximum appointments for this day.",
    };
  }

  const doctorOverlap = active.some((apt) => {
    if (apt.doctorId !== doctorId || apt.date !== date) return false;
    const aptStart = parseTimeToMinutes(apt.time);
    const aptEnd = appointmentEndMinutes(apt);
    if (aptStart === null || aptEnd === null) return false;
    return rangesOverlap(start, end, aptStart, aptEnd);
  });
  if (doctorOverlap) {
    return {
      ok: false,
      error: "This doctor already has an overlapping active appointment.",
    };
  }

  const patientOverlap = active.some((apt) => {
    if (apt.patientId !== patientId || apt.date !== date) return false;
    const aptStart = parseTimeToMinutes(apt.time);
    const aptEnd = appointmentEndMinutes(apt);
    if (aptStart === null || aptEnd === null) return false;
    return rangesOverlap(start, end, aptStart, aptEnd);
  });
  if (patientOverlap) {
    return {
      ok: false,
      error: "This patient already has an overlapping appointment.",
    };
  }

  return { ok: true, durationMinutes: duration };
}

export function describeSchedule(schedule: DoctorSchedule) {
  const days = [...schedule.workingDays]
    .sort((a, b) => a - b)
    .map((day) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day])
    .join(", ");
  return `${days || "No working days"} · ${schedule.startTime}–${schedule.endTime} · ${schedule.slotDurationMinutes} min slots · max ${schedule.maxAppointmentsPerDay}/day`;
}
