import { DEMO_CLINIC_TODAY, parseIsoDateParts } from "./time";

export { DEMO_CLINIC_TODAY, clinicTodayIso } from "./time";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function calculateAge(dateOfBirth: string, onDateIso = DEMO_CLINIC_TODAY) {
  const dob = parseIsoDateParts(dateOfBirth);
  const onDate = parseIsoDateParts(onDateIso);
  if (!dob || !onDate) return 0;
  const dobUtc = Date.UTC(dob.year, dob.month - 1, dob.day);
  const onUtc = Date.UTC(onDate.year, onDate.month - 1, onDate.day);
  const dobDate = new Date(dobUtc);
  const onDateObj = new Date(onUtc);
  let age = onDateObj.getUTCFullYear() - dobDate.getUTCFullYear();
  const monthDiff = onDateObj.getUTCMonth() - dobDate.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && onDateObj.getUTCDate() < dobDate.getUTCDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function parseExperienceYears(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function getInitials(name: string) {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** @deprecated Phase 3 uses dynamic slots from doctor schedules. Kept for legacy forms. */
export const DEMO_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:15 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
] as const;
