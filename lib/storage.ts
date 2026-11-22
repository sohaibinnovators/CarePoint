import {
  createSeedData,
  DATA_VERSION,
  ensureBillingCollections,
  ensureClinicalCollections,
  ensureSchedules,
  LEGACY_STORAGE_KEYS,
  normalizeAppointments,
  STORAGE_KEY,
} from "./seed-data";
import type { CarePointData } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidData(value: unknown): value is CarePointData {
  if (!isObject(value)) return false;
  return (
    Array.isArray(value.patients) &&
    Array.isArray(value.doctors) &&
    Array.isArray(value.departments) &&
    Array.isArray(value.services) &&
    Array.isArray(value.appointments)
  );
}

function migrateData(parsed: CarePointData): CarePointData {
  const doctors = parsed.doctors;
  const withClinical = ensureClinicalCollections({
    ...parsed,
    version: DATA_VERSION,
    appointments: normalizeAppointments(parsed.appointments),
    schedules: ensureSchedules(doctors, parsed.schedules),
  });
  return ensureBillingCollections(withClinical);
}

export function loadCarePointData(): CarePointData {
  if (typeof window === "undefined") {
    return createSeedData();
  }

  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = window.localStorage.getItem(key);
        if (legacy) {
          raw = legacy;
          break;
        }
      }
    }
    if (!raw) return createSeedData();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidData(parsed)) return createSeedData();
    return migrateData(parsed);
  } catch {
    return createSeedData();
  }
}

export function saveCarePointData(data: CarePointData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, version: DATA_VERSION }),
    );
  } catch {
    // Ignore quota / private-mode failures in this demo.
  }
}

export function clearCarePointData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  for (const key of LEGACY_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}
