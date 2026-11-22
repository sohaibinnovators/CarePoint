import type {
  Appointment,
  Consultation,
  MedicalRecord,
  Patient,
  Prescription,
  TimelineEvent,
} from "./types";

export const DEMO_CLINICAL_NOTICE =
  "Fictional demo clinical data only — not a real EHR, diagnosis engine, or prescribing system.";

export function emptyMedicalRecord(patientId: string): MedicalRecord {
  return {
    patientId,
    allergies: [],
    conditions: [],
    pastHistory: "",
    currentMedications: [],
    familyHistory: "",
    clinicalNotes: "",
    updatedAt: "2026-11-01T09:00:00",
  };
}

export function getMedicalRecordForPatient(
  records: MedicalRecord[],
  patientId: string,
) {
  return records.find((record) => record.patientId === patientId);
}

export function isConsultationEligible(appointment: Appointment) {
  return (
    appointment.status === "checked-in" ||
    appointment.status === "completed" ||
    appointment.status === "confirmed"
  );
}

export function buildPatientTimeline(options: {
  patient: Patient;
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: Prescription[];
}): TimelineEvent[] {
  const { patient, appointments, consultations, prescriptions } = options;
  const events: TimelineEvent[] = [];

  events.push({
    id: `reg-${patient.id}`,
    patientId: patient.id,
    type: "registration",
    date: patient.registrationDate,
    title: "Patient registered",
    detail: "Demo patient profile created in CarePoint.",
  });

  for (const apt of appointments.filter((a) => a.patientId === patient.id)) {
    events.push({
      id: `apt-event-${apt.id}`,
      patientId: patient.id,
      type: "appointment",
      date: apt.date,
      title: `Appointment ${apt.status}`,
      detail: `${apt.type} with ${apt.doctorName} at ${apt.time}`,
      doctorName: apt.doctorName,
      appointmentId: apt.id,
    });
  }

  for (const consultation of consultations.filter(
    (item) => item.patientId === patient.id,
  )) {
    events.push({
      id: `con-event-${consultation.id}`,
      patientId: patient.id,
      type: "consultation",
      date: (consultation.finalizedAt || consultation.updatedAt).slice(0, 10),
      title:
        consultation.status === "finalized"
          ? "Consultation finalized"
          : "Consultation draft saved",
      detail: consultation.chiefComplaint || "Demo consultation notes",
      doctorName: consultation.doctorName,
      appointmentId: consultation.appointmentId,
      consultationId: consultation.id,
    });

    if (consultation.status === "finalized" && consultation.followUp.trim()) {
      events.push({
        id: `fu-${consultation.id}`,
        patientId: patient.id,
        type: "follow-up",
        date: (consultation.finalizedAt || consultation.updatedAt).slice(0, 10),
        title: "Follow-up recommendation",
        detail: consultation.followUp,
        doctorName: consultation.doctorName,
        consultationId: consultation.id,
        appointmentId: consultation.appointmentId,
      });
    }
  }

  for (const rx of prescriptions.filter((item) => item.patientId === patient.id)) {
    if (rx.status === "cancelled") continue;
    events.push({
      id: `rx-event-${rx.id}`,
      patientId: patient.id,
      type: "prescription",
      date: rx.date,
      title:
        rx.status === "issued"
          ? "Prescription issued"
          : "Prescription draft saved",
      detail: `${rx.medications.length} medication(s) · ${rx.doctorName}`,
      doctorName: rx.doctorName,
      prescriptionId: rx.id,
      consultationId: rx.consultationId,
      appointmentId: rx.appointmentId,
    });
  }

  const seen = new Set<string>();
  return events
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function validateConsultationInput(input: {
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
}) {
  const errors: Record<string, string> = {};
  if (!input.chiefComplaint.trim()) {
    errors.chiefComplaint = "Chief complaint is required.";
  }
  if (!input.diagnosis.trim()) {
    errors.diagnosis = "Demo diagnosis entry is required to finalize.";
  }
  if (!input.treatmentPlan.trim()) {
    errors.treatmentPlan = "Treatment plan is required to finalize.";
  }
  return errors;
}

export function validatePrescriptionMedications(
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>,
) {
  if (!medications.length) {
    return "Add at least one medication.";
  }
  for (const [index, med] of medications.entries()) {
    if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()) {
      return `Medication row ${index + 1} needs name, dosage, frequency, and duration.`;
    }
  }
  return null;
}
