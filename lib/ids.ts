function nextNumericSuffix(ids: string[], prefix: string) {
  let max = 1000;
  for (const id of ids) {
    if (!id.startsWith(prefix)) continue;
    const num = Number(id.slice(prefix.length).replace(/-/g, ""));
    if (!Number.isNaN(num)) max = Math.max(max, num);
  }
  return max + 1;
}

export function createPatientId(existingIds: string[]) {
  return `pt-${nextNumericSuffix(existingIds, "pt-")}`;
}

export function createDoctorId(name: string, existingIds: string[]) {
  const slug = name
    .toLowerCase()
    .replace(/^dr\.?\s+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let candidate = `dr-${slug || "doctor"}`;
  let i = 2;
  while (existingIds.includes(candidate)) {
    candidate = `dr-${slug || "doctor"}-${i}`;
    i += 1;
  }
  return candidate;
}

export function createDepartmentId(name: string, existingIds: string[]) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let candidate = slug || `dept-${Date.now()}`;
  let i = 2;
  while (existingIds.includes(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}

export function createServiceId(name: string, existingIds: string[]) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let candidate = slug || `service-${Date.now()}`;
  let i = 2;
  while (existingIds.includes(candidate)) {
    candidate = `${slug}-${i}`;
    i += 1;
  }
  return candidate;
}

export function createAppointmentId(existingIds: string[]) {
  return `apt-${nextNumericSuffix(existingIds, "apt-")}`;
}

export function createConsultationId(existingIds: string[]) {
  return `con-${nextNumericSuffix(existingIds, "con-")}`;
}

export function createPrescriptionId(existingIds: string[]) {
  return `rx-${nextNumericSuffix(existingIds, "rx-")}`;
}

export function createMedicationId(existingIds: string[]) {
  return `med-${nextNumericSuffix(existingIds, "med-")}`;
}

export function createInvoiceId(existingIds: string[]) {
  return `inv-${nextNumericSuffix(existingIds, "inv-")}`;
}

export function createInvoiceLineId(existingIds: string[]) {
  return `ili-${nextNumericSuffix(existingIds, "ili-")}`;
}

export function createPaymentId(existingIds: string[]) {
  return `pay-${nextNumericSuffix(existingIds, "pay-")}`;
}

export function createExpenseId(existingIds: string[]) {
  return `exp-${nextNumericSuffix(existingIds, "exp-")}`;
}
