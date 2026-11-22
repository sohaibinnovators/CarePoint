/** Demo clock — avoids prerender `new Date()` while keeping scheduling deterministic. */
export const DEMO_CLINIC_TODAY = "2026-11-22";
export const DEMO_CURRENT_TIME_LABEL = "08:00 AM";

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function weekdayLabel(day: Weekday) {
  return WEEKDAY_LABELS[day];
}

export function parseIsoDateParts(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Weekday for an ISO date using UTC calendar math (stable / no local TZ drift). */
export function weekdayFromIso(iso: string): Weekday | null {
  const parts = parseIsoDateParts(iso);
  if (!parts) return null;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return date.getUTCDay() as Weekday;
}

export function addDaysIso(iso: string, days: number): string {
  const parts = parseIsoDateParts(iso);
  if (!parts) return iso;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfWeekIso(iso: string): string {
  const weekday = weekdayFromIso(iso);
  if (weekday === null) return iso;
  // Week starts Monday
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDaysIso(iso, offset);
}

export function startOfMonthIso(iso: string): string {
  const parts = parseIsoDateParts(iso);
  if (!parts) return iso;
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-01`;
}

export function daysInMonth(iso: string): number {
  const parts = parseIsoDateParts(iso);
  if (!parts) return 30;
  const date = new Date(Date.UTC(parts.year, parts.month, 0));
  return date.getUTCDate();
}

export function compareIsoDates(a: string, b: string) {
  return a.localeCompare(b);
}

/** Accepts "09:00 AM", "9:00 am", or "09:00" (24h). */
export function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();
  const ampm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = Number(ampm[2]);
    const period = ampm[3].toUpperCase();
    if (hours < 1 || hours > 12 || minutes > 59) return null;
    if (period === "AM") {
      if (hours === 12) hours = 0;
    } else if (hours !== 12) {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  const twentyFour = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (twentyFour) {
    const hours = Number(twentyFour[1]);
    const minutes = Number(twentyFour[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
}

export function formatMinutesToLabel(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatMinutesToHhMm(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
) {
  return startA < endB && startB < endA;
}

export function clinicTodayIso() {
  return DEMO_CLINIC_TODAY;
}

export function clinicNowMinutes() {
  return parseTimeToMinutes(DEMO_CURRENT_TIME_LABEL) ?? 8 * 60;
}

export function isPastSlot(dateIso: string, timeLabel: string) {
  const minutes = parseTimeToMinutes(timeLabel);
  if (minutes === null) return true;
  const today = clinicTodayIso();
  if (compareIsoDates(dateIso, today) < 0) return true;
  if (compareIsoDates(dateIso, today) > 0) return false;
  return minutes < clinicNowMinutes();
}
