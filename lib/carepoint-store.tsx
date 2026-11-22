"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildBillingSummary,
  calculateInvoiceTotals,
  refreshInvoiceFinancials,
  roundMoney,
  validateExpenseInput,
  validateInvoiceInput,
  validatePaymentInput,
} from "./billing";
import {
  emptyMedicalRecord,
  isConsultationEligible,
  validateConsultationInput,
  validatePrescriptionMedications,
} from "./clinical";
import {
  createAppointmentId,
  createConsultationId,
  createDepartmentId,
  createDoctorId,
  createExpenseId,
  createInvoiceId,
  createInvoiceLineId,
  createMedicationId,
  createPatientId,
  createPaymentId,
  createPrescriptionId,
  createServiceId,
} from "./ids";
import { createSeedData } from "./seed-data";
import {
  createDefaultSchedule,
  getScheduleForDoctor,
  validateAppointmentSlot,
  validateScheduleInput,
} from "./scheduling";
import { loadCarePointData, saveCarePointData } from "./storage";
import { DEMO_CLINIC_TODAY } from "./time";
import type {
  Appointment,
  AppointmentInput,
  AppointmentStatus,
  CarePointData,
  Consultation,
  ConsultationInput,
  Department,
  DepartmentInput,
  Doctor,
  DoctorInput,
  DoctorSchedule,
  DoctorScheduleInput,
  Expense,
  ExpenseInput,
  Invoice,
  InvoiceInput,
  MedicalRecord,
  MedicalRecordInput,
  Patient,
  PatientInput,
  Payment,
  PaymentInput,
  Prescription,
  PrescriptionInput,
  Service,
  ServiceInput,
} from "./types";
import {
  calculateAge,
  clinicTodayIso,
  getInitials,
} from "./validation";

function clientStamp() {
  if (typeof window === "undefined") return `${DEMO_CLINIC_TODAY}T12:00:00`;
  return new Date().toISOString().slice(0, 19);
}

type StoreValue = {
  ready: boolean;
  data: CarePointData;
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  services: Service[];
  appointments: Appointment[];
  schedules: DoctorSchedule[];
  medicalRecords: MedicalRecord[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  stats: {
    totalPatients: number;
    totalDoctors: number;
    todaysAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
  };
  billingSummary: ReturnType<typeof buildBillingSummary>;
  getDoctorSchedule: (doctorId: string) => DoctorSchedule;
  upsertDoctorSchedule: (
    doctorId: string,
    input: DoctorScheduleInput,
  ) => DoctorSchedule | { error: string };
  addPatient: (input: PatientInput) => Patient;
  updatePatient: (id: string, input: PatientInput) => Patient | null;
  deletePatient: (id: string) => { ok: boolean; message: string };
  addDoctor: (input: DoctorInput) => Doctor | { error: string };
  updateDoctor: (
    id: string,
    input: DoctorInput,
  ) => Doctor | { error: string } | null;
  deleteDoctor: (id: string) => { ok: boolean; message: string };
  addDepartment: (input: DepartmentInput) => Department | { error: string };
  updateDepartment: (
    id: string,
    input: DepartmentInput,
  ) => Department | { error: string } | null;
  deleteDepartment: (id: string) => { ok: boolean; message: string };
  addService: (input: ServiceInput) => Service;
  updateService: (id: string, input: ServiceInput) => Service | null;
  deleteService: (id: string) => { ok: boolean; message: string };
  addAppointment: (input: AppointmentInput) => Appointment | { error: string };
  updateAppointmentStatus: (
    id: string,
    status: AppointmentStatus,
  ) => Appointment | null;
  updateAppointment: (
    id: string,
    input: Partial<AppointmentInput> & { status?: AppointmentStatus },
  ) => Appointment | { error: string } | null;
  getMedicalRecord: (patientId: string) => MedicalRecord;
  upsertMedicalRecord: (
    patientId: string,
    input: MedicalRecordInput,
    updatedByDoctorId?: string,
  ) => MedicalRecord | { error: string };
  getConsultationByAppointment: (appointmentId: string) => Consultation | null;
  saveConsultationDraft: (
    input: ConsultationInput,
  ) => Consultation | { error: string };
  finalizeConsultation: (
    input: ConsultationInput,
  ) => Consultation | { error: string };
  savePrescription: (
    input: PrescriptionInput,
    existingId?: string,
  ) => Prescription | { error: string };
  issuePrescription: (id: string) => Prescription | { error: string };
  cancelPrescription: (id: string) => Prescription | { error: string };
  saveInvoice: (
    input: InvoiceInput,
    existingId?: string,
  ) => Invoice | { error: string };
  issueInvoice: (id: string) => Invoice | { error: string };
  cancelInvoice: (id: string) => Invoice | { error: string };
  recordPayment: (input: PaymentInput) => Payment | { error: string };
  addExpense: (input: ExpenseInput) => Expense | { error: string };
  updateExpense: (
    id: string,
    input: ExpenseInput,
  ) => Expense | { error: string };
  deleteExpense: (id: string) => { ok: boolean; message: string };
  resetDemoData: () => void;
};

const CarePointContext = createContext<StoreValue | null>(null);

function refreshDepartmentCounts(data: CarePointData): CarePointData {
  return {
    ...data,
    departments: data.departments.map((dept) => ({
      ...dept,
      doctors: data.doctors.filter((d) => d.departmentId === dept.id).length,
    })),
  };
}

function buildPatient(
  input: PatientInput,
  id: string,
  existing?: Patient,
): Patient {
  const age = calculateAge(input.dateOfBirth);
  const today = clinicTodayIso();
  return {
    id,
    name: input.name.trim(),
    dateOfBirth: input.dateOfBirth,
    age,
    gender: input.gender,
    phone: input.phone.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
    emergencyContact: input.emergencyContact.trim(),
    bloodType: input.bloodType?.trim() || "Unknown",
    notes: input.notes?.trim() || "",
    registrationDate: existing?.registrationDate ?? today,
    lastVisit: existing?.lastVisit ?? today,
    status: input.status ?? existing?.status ?? "active",
    condition: input.condition?.trim() || existing?.condition || "General",
  };
}

function buildDoctor(
  input: DoctorInput,
  id: string,
  departmentName: string,
  existing?: Doctor,
): Doctor {
  return {
    id,
    name: input.name.trim(),
    specialty: input.specialty.trim(),
    department: departmentName,
    departmentId: input.departmentId,
    experience: `${input.experienceYears} years`,
    experienceYears: input.experienceYears,
    education: input.qualification.trim(),
    qualification: input.qualification.trim(),
    bio: input.bio.trim(),
    rating: existing?.rating ?? 4.8,
    patients: existing?.patients ?? 0,
    availability:
      input.availability?.trim() || existing?.availability || "Mon–Fri",
    availabilityStatus: input.availabilityStatus,
    consultationFee: input.consultationFee.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    imageInitials: getInitials(input.name),
    imagePreview: input.imagePreview || existing?.imagePreview,
  };
}

export function CarePointProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CarePointData>(() => createSeedData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadCarePointData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCarePointData(data);
  }, [data, ready]);

  const commit = useCallback((next: CarePointData) => {
    setData(refreshDepartmentCounts(next));
  }, []);

  const addPatient = useCallback(
    (input: PatientInput) => {
      const id = createPatientId(data.patients.map((p) => p.id));
      const created = buildPatient(input, id);
      commit({ ...data, patients: [created, ...data.patients] });
      return created;
    },
    [commit, data],
  );

  const updatePatient = useCallback(
    (id: string, input: PatientInput) => {
      const existing = data.patients.find((p) => p.id === id);
      if (!existing) return null;
      const updated = buildPatient(input, id, existing);
      commit({
        ...data,
        patients: data.patients.map((p) => (p.id === id ? updated : p)),
        appointments: data.appointments.map((apt) =>
          apt.patientId === id ? { ...apt, patientName: updated.name } : apt,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const deletePatient = useCallback(
    (id: string) => {
      const related = data.appointments.filter((a) => a.patientId === id).length;
      commit({
        ...data,
        patients: data.patients.filter((p) => p.id !== id),
        appointments: data.appointments.map((apt) =>
          apt.patientId === id
            ? {
                ...apt,
                patientId: "",
                patientName: `${apt.patientName} (deleted patient)`,
              }
            : apt,
        ),
      });
      return {
        ok: true,
        message:
          related > 0
            ? `Patient deleted. ${related} related appointment(s) were kept with a deleted-patient label.`
            : "Patient deleted.",
      };
    },
    [commit, data],
  );

  const addDoctor = useCallback(
    (input: DoctorInput) => {
      const department = data.departments.find((d) => d.id === input.departmentId);
      if (!department) return { error: "Select a valid department." };
      const id = createDoctorId(
        input.name,
        data.doctors.map((d) => d.id),
      );
      const created = buildDoctor(input, id, department.name);
      commit({
        ...data,
        doctors: [created, ...data.doctors],
        schedules: [
          createDefaultSchedule(created.id),
          ...(data.schedules ?? []),
        ],
      });
      return created;
    },
    [commit, data],
  );

  const updateDoctor = useCallback(
    (id: string, input: DoctorInput) => {
      const department = data.departments.find((d) => d.id === input.departmentId);
      if (!department) return { error: "Select a valid department." };
      const existing = data.doctors.find((d) => d.id === id);
      if (!existing) return null;
      const updated = buildDoctor(input, id, department.name, existing);
      commit({
        ...data,
        doctors: data.doctors.map((d) => (d.id === id ? updated : d)),
        appointments: data.appointments.map((apt) =>
          apt.doctorId === id
            ? {
                ...apt,
                doctorName: updated.name,
                department: department.name,
                departmentId: department.id,
              }
            : apt,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const deleteDoctor = useCallback(
    (id: string) => {
      const related = data.appointments.filter((a) => a.doctorId === id).length;
      commit({
        ...data,
        doctors: data.doctors.filter((d) => d.id !== id),
        schedules: (data.schedules ?? []).filter((s) => s.doctorId !== id),
        appointments: data.appointments.map((apt) =>
          apt.doctorId === id
            ? {
                ...apt,
                doctorId: "",
                doctorName: `${apt.doctorName} (deleted doctor)`,
              }
            : apt,
        ),
      });
      return {
        ok: true,
        message:
          related > 0
            ? `Doctor deleted. ${related} related appointment(s) were kept with a deleted-doctor label.`
            : "Doctor deleted.",
      };
    },
    [commit, data],
  );

  const getDoctorSchedule = useCallback(
    (doctorId: string) => getScheduleForDoctor(data.schedules ?? [], doctorId),
    [data.schedules],
  );

  const upsertDoctorSchedule = useCallback(
    (doctorId: string, input: DoctorScheduleInput) => {
      if (!data.doctors.some((d) => d.id === doctorId)) {
        return { error: "Doctor not found." };
      }
      const error = validateScheduleInput(input);
      if (error) return { error };
      const next: DoctorSchedule = {
        doctorId,
        workingDays: [...input.workingDays],
        startTime: input.startTime,
        endTime: input.endTime,
        slotDurationMinutes: input.slotDurationMinutes,
        breaks: input.breaks.map((item) => ({ ...item })),
        unavailableDates: [...input.unavailableDates],
        maxAppointmentsPerDay: input.maxAppointmentsPerDay,
      };
      const others = (data.schedules ?? []).filter((s) => s.doctorId !== doctorId);
      commit({ ...data, schedules: [...others, next] });
      return next;
    },
    [commit, data],
  );

  const addDepartment = useCallback(
    (input: DepartmentInput) => {
      const name = input.name.trim();
      if (
        data.departments.some((d) => d.name.toLowerCase() === name.toLowerCase())
      ) {
        return { error: "A department with this name already exists." };
      }
      const id = createDepartmentId(
        name,
        data.departments.map((d) => d.id),
      );
      const created: Department = {
        id,
        name,
        description: input.description.trim(),
        doctors: 0,
        patients: 0,
      };
      commit({ ...data, departments: [...data.departments, created] });
      return created;
    },
    [commit, data],
  );

  const updateDepartment = useCallback(
    (id: string, input: DepartmentInput) => {
      const name = input.name.trim();
      if (
        data.departments.some(
          (d) => d.id !== id && d.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return { error: "A department with this name already exists." };
      }
      const existing = data.departments.find((d) => d.id === id);
      if (!existing) return null;
      const updated: Department = {
        ...existing,
        name,
        description: input.description.trim(),
      };
      commit({
        ...data,
        departments: data.departments.map((d) => (d.id === id ? updated : d)),
        doctors: data.doctors.map((doc) =>
          doc.departmentId === id ? { ...doc, department: name } : doc,
        ),
        appointments: data.appointments.map((apt) =>
          apt.departmentId === id ? { ...apt, department: name } : apt,
        ),
        services: data.services.map((service) =>
          service.departmentId === id ? { ...service, category: name } : service,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const deleteDepartment = useCallback(
    (id: string) => {
      const linkedDoctors = data.doctors.filter((d) => d.departmentId === id).length;
      if (linkedDoctors > 0) {
        return {
          ok: false,
          message: `Cannot delete this department while ${linkedDoctors} doctor(s) are assigned. Reassign or delete those doctors first.`,
        };
      }
      const relatedAppointments = data.appointments.filter(
        (a) => a.departmentId === id,
      ).length;
      commit({
        ...data,
        departments: data.departments.filter((d) => d.id !== id),
        services: data.services.map((s) =>
          s.departmentId === id ? { ...s, departmentId: undefined } : s,
        ),
        appointments: data.appointments.map((apt) =>
          apt.departmentId === id
            ? {
                ...apt,
                departmentId: "",
                department: `${apt.department} (deleted department)`,
              }
            : apt,
        ),
      });
      return {
        ok: true,
        message:
          relatedAppointments > 0
            ? `Department deleted. ${relatedAppointments} appointment(s) retained with a deleted-department label.`
            : "Department deleted.",
      };
    },
    [commit, data],
  );

  const addService = useCallback(
    (input: ServiceInput) => {
      const id = createServiceId(
        input.name,
        data.services.map((s) => s.id),
      );
      const created: Service = {
        id,
        name: input.name.trim(),
        category: input.category.trim(),
        departmentId: input.departmentId,
        description: input.description.trim(),
        duration: input.duration.trim(),
        price: input.price.trim(),
        features: input.features?.length
          ? input.features
          : ["Demo service feature"],
      };
      commit({ ...data, services: [created, ...data.services] });
      return created;
    },
    [commit, data],
  );

  const updateService = useCallback(
    (id: string, input: ServiceInput) => {
      const existing = data.services.find((s) => s.id === id);
      if (!existing) return null;
      const updated: Service = {
        ...existing,
        name: input.name.trim(),
        category: input.category.trim(),
        departmentId: input.departmentId,
        description: input.description.trim(),
        duration: input.duration.trim(),
        price: input.price.trim(),
        features: input.features?.length ? input.features : existing.features,
      };
      commit({
        ...data,
        services: data.services.map((s) => (s.id === id ? updated : s)),
      });
      return updated;
    },
    [commit, data],
  );

  const deleteService = useCallback(
    (id: string) => {
      commit({
        ...data,
        services: data.services.filter((s) => s.id !== id),
      });
      return { ok: true, message: "Service deleted." };
    },
    [commit, data],
  );

  const addAppointment = useCallback(
    (input: AppointmentInput) => {
      const patient = data.patients.find((p) => p.id === input.patientId);
      const doctor = data.doctors.find((d) => d.id === input.doctorId);
      const department = data.departments.find((d) => d.id === input.departmentId);
      if (!patient) return { error: "Select a valid patient." };
      if (!doctor) return { error: "Select a valid doctor." };
      if (!department) return { error: "Select a valid department." };
      if (doctor.departmentId !== department.id) {
        return { error: "Selected doctor does not belong to that department." };
      }

      const schedule = getScheduleForDoctor(data.schedules ?? [], doctor.id);
      const validation = validateAppointmentSlot({
        schedule,
        appointments: data.appointments,
        doctorId: doctor.id,
        patientId: patient.id,
        date: input.date,
        time: input.time,
        durationMinutes: input.durationMinutes,
      });
      if (!validation.ok) return { error: validation.error };

      const id = createAppointmentId(data.appointments.map((a) => a.id));
      const created: Appointment = {
        id,
        patientId: patient.id,
        doctorId: doctor.id,
        patientName: patient.name,
        doctorName: doctor.name,
        department: department.name,
        departmentId: department.id,
        date: input.date,
        time: input.time,
        status: input.status ?? "pending",
        type: input.type.trim() || "Consultation",
        visitType: input.visitType,
        reason: input.reason?.trim() || "",
        durationMinutes: validation.durationMinutes,
      };
      commit({
        ...data,
        appointments: [created, ...data.appointments],
        patients: data.patients.map((p) =>
          p.id === patient.id
            ? { ...p, lastVisit: input.date, status: "active" }
            : p,
        ),
      });
      return created;
    },
    [commit, data],
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      const existing = data.appointments.find((a) => a.id === id);
      if (!existing) return null;
      const updated = { ...existing, status };
      commit({
        ...data,
        appointments: data.appointments.map((apt) =>
          apt.id === id ? updated : apt,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const updateAppointment = useCallback(
    (
      id: string,
      input: Partial<AppointmentInput> & { status?: AppointmentStatus },
    ) => {
      const existing = data.appointments.find((a) => a.id === id);
      if (!existing) return null;

      const patientId = input.patientId ?? existing.patientId;
      const doctorId = input.doctorId ?? existing.doctorId;
      const departmentId = input.departmentId ?? existing.departmentId;
      const date = input.date ?? existing.date;
      const time = input.time ?? existing.time;

      const patient = data.patients.find((p) => p.id === patientId);
      const doctor = data.doctors.find((d) => d.id === doctorId);
      const department = data.departments.find((d) => d.id === departmentId);

      if (!patient || !doctor || !department) {
        return { error: "Patient, doctor, and department must be valid." };
      }

      const nextStatus = input.status ?? existing.status;
      const needsSlotCheck =
        nextStatus !== "cancelled" && nextStatus !== "completed";

      let durationMinutes =
        input.durationMinutes ??
        existing.durationMinutes ??
        getScheduleForDoctor(data.schedules ?? [], doctorId).slotDurationMinutes;

      if (needsSlotCheck) {
        const schedule = getScheduleForDoctor(data.schedules ?? [], doctorId);
        const validation = validateAppointmentSlot({
          schedule,
          appointments: data.appointments,
          doctorId,
          patientId,
          date,
          time,
          durationMinutes,
          excludeAppointmentId: id,
        });
        if (!validation.ok) return { error: validation.error };
        durationMinutes = validation.durationMinutes;
      }

      const updated: Appointment = {
        ...existing,
        patientId,
        doctorId,
        departmentId,
        patientName: patient.name,
        doctorName: doctor.name,
        department: department.name,
        date,
        time,
        type: input.type?.trim() || existing.type,
        visitType: input.visitType ?? existing.visitType,
        reason:
          input.reason !== undefined ? input.reason.trim() : existing.reason,
        status: nextStatus,
        durationMinutes,
      };
      commit({
        ...data,
        appointments: data.appointments.map((apt) =>
          apt.id === id ? updated : apt,
        ),
      });
      return updated;
    },
    [commit, data],
  );

  const resetDemoData = useCallback(() => {
    commit(createSeedData());
  }, [commit]);

  const getMedicalRecord = useCallback(
    (patientId: string) => {
      return (
        (data.medicalRecords ?? []).find((record) => record.patientId === patientId) ??
        emptyMedicalRecord(patientId)
      );
    },
    [data.medicalRecords],
  );

  const upsertMedicalRecord = useCallback(
    (
      patientId: string,
      input: MedicalRecordInput,
      updatedByDoctorId?: string,
    ) => {
      if (!data.patients.some((patient) => patient.id === patientId)) {
        return { error: "Patient not found." };
      }
      const next: MedicalRecord = {
        patientId,
        allergies: input.allergies.map((item) => item.trim()).filter(Boolean),
        conditions: input.conditions.map((item) => item.trim()).filter(Boolean),
        pastHistory: input.pastHistory.trim(),
        currentMedications: input.currentMedications
          .map((item) => item.trim())
          .filter(Boolean),
        familyHistory: input.familyHistory.trim(),
        clinicalNotes: input.clinicalNotes.trim(),
        updatedAt: clientStamp(),
        updatedByDoctorId,
      };
      const others = (data.medicalRecords ?? []).filter(
        (record) => record.patientId !== patientId,
      );
      commit({ ...data, medicalRecords: [...others, next] });
      return next;
    },
    [commit, data],
  );

  const getConsultationByAppointment = useCallback(
    (appointmentId: string) =>
      (data.consultations ?? []).find(
        (item) => item.appointmentId === appointmentId,
      ) ?? null,
    [data.consultations],
  );

  const upsertConsultation = useCallback(
    (input: ConsultationInput, finalize: boolean) => {
      const appointment = data.appointments.find(
        (item) => item.id === input.appointmentId,
      );
      if (!appointment) return { error: "Appointment not found." };
      if (!appointment.patientId || !appointment.doctorId) {
        return { error: "Appointment is missing patient or doctor references." };
      }
      if (!isConsultationEligible(appointment)) {
        return {
          error:
            "Consultations can only be recorded for confirmed, checked-in, or completed appointments.",
        };
      }

      if (finalize) {
        const errors = validateConsultationInput(input);
        if (Object.keys(errors).length) {
          return {
            error:
              errors.chiefComplaint ||
              errors.diagnosis ||
              errors.treatmentPlan ||
              "Complete required consultation fields.",
          };
        }
      }

      const existing = (data.consultations ?? []).find(
        (item) => item.appointmentId === input.appointmentId,
      );
      if (existing?.status === "finalized" && !finalize) {
        return {
          error:
            "This appointment already has a finalized consultation. Update it instead of creating a draft.",
        };
      }
      const stamp = clientStamp();
      const base: Consultation = {
        id:
          existing?.id ??
          createConsultationId((data.consultations ?? []).map((item) => item.id)),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        chiefComplaint: input.chiefComplaint.trim(),
        symptoms: input.symptoms.trim(),
        observations: input.observations.trim(),
        diagnosis: input.diagnosis.trim(),
        treatmentPlan: input.treatmentPlan.trim(),
        followUp: input.followUp.trim(),
        additionalNotes: input.additionalNotes.trim(),
        status: finalize || existing?.status === "finalized" ? "finalized" : "draft",
        createdAt: existing?.createdAt ?? stamp,
        updatedAt: stamp,
        finalizedAt:
          finalize || existing?.status === "finalized"
            ? existing?.finalizedAt ?? stamp
            : undefined,
      };

      const others = (data.consultations ?? []).filter(
        (item) => item.appointmentId !== input.appointmentId,
      );
      commit({ ...data, consultations: [base, ...others] });
      return base;
    },
    [commit, data],
  );

  const saveConsultationDraft = useCallback(
    (input: ConsultationInput) => upsertConsultation(input, false),
    [upsertConsultation],
  );

  const finalizeConsultation = useCallback(
    (input: ConsultationInput) => upsertConsultation(input, true),
    [upsertConsultation],
  );

  const savePrescription = useCallback(
    (input: PrescriptionInput, existingId?: string) => {
      const patient = data.patients.find((item) => item.id === input.patientId);
      const doctor = data.doctors.find((item) => item.id === input.doctorId);
      if (!patient) return { error: "Select a valid patient." };
      if (!doctor) return { error: "Select a valid doctor." };

      const medError = validatePrescriptionMedications(input.medications);
      if (medError) return { error: medError };

      if (input.consultationId) {
        const consultation = (data.consultations ?? []).find(
          (item) => item.id === input.consultationId,
        );
        if (!consultation) return { error: "Linked consultation not found." };
        if (consultation.patientId !== patient.id) {
          return { error: "Consultation does not belong to this patient." };
        }
      }

      const existing = existingId
        ? (data.prescriptions ?? []).find((item) => item.id === existingId)
        : undefined;
      if (existingId && !existing) return { error: "Prescription not found." };
      if (existing && existing.status === "issued") {
        return { error: "Issued prescriptions cannot be edited in this demo." };
      }

      const stamp = clientStamp();
      const medicationIds = (data.prescriptions ?? []).flatMap((rx) =>
        rx.medications.map((med) => med.id),
      );
      const medications = input.medications.map((med) => {
        const id = createMedicationId(medicationIds);
        medicationIds.push(id);
        return {
          id,
          name: med.name.trim(),
          dosage: med.dosage.trim(),
          frequency: med.frequency.trim(),
          duration: med.duration.trim(),
          instructions: med.instructions.trim(),
        };
      });

      const next: Prescription = {
        id:
          existing?.id ??
          createPrescriptionId((data.prescriptions ?? []).map((item) => item.id)),
        patientId: patient.id,
        doctorId: doctor.id,
        consultationId: input.consultationId,
        appointmentId: input.appointmentId,
        patientName: patient.name,
        doctorName: doctor.name,
        medications,
        date: input.date || clinicTodayIso(),
        status: input.status ?? existing?.status ?? "draft",
        notes: input.notes?.trim() || "",
        createdAt: existing?.createdAt ?? stamp,
        updatedAt: stamp,
      };

      const others = (data.prescriptions ?? []).filter(
        (item) => item.id !== next.id,
      );
      commit({ ...data, prescriptions: [next, ...others] });
      return next;
    },
    [commit, data],
  );

  const issuePrescription = useCallback(
    (id: string) => {
      const existing = (data.prescriptions ?? []).find((item) => item.id === id);
      if (!existing) return { error: "Prescription not found." };
      if (existing.status === "cancelled") {
        return { error: "Cancelled prescriptions cannot be issued." };
      }
      const medError = validatePrescriptionMedications(existing.medications);
      if (medError) return { error: medError };
      const next = {
        ...existing,
        status: "issued" as const,
        updatedAt: clientStamp(),
      };
      commit({
        ...data,
        prescriptions: (data.prescriptions ?? []).map((item) =>
          item.id === id ? next : item,
        ),
      });
      return next;
    },
    [commit, data],
  );

  const cancelPrescription = useCallback(
    (id: string) => {
      const existing = (data.prescriptions ?? []).find((item) => item.id === id);
      if (!existing) return { error: "Prescription not found." };
      const next = {
        ...existing,
        status: "cancelled" as const,
        updatedAt: clientStamp(),
      };
      commit({
        ...data,
        prescriptions: (data.prescriptions ?? []).map((item) =>
          item.id === id ? next : item,
        ),
      });
      return next;
    },
    [commit, data],
  );

  const saveInvoice = useCallback(
    (input: InvoiceInput, existingId?: string) => {
      const errors = validateInvoiceInput(input);
      if (Object.keys(errors).length) {
        return {
          error:
            errors.patientId ||
            errors.date ||
            errors.dueDate ||
            errors.items ||
            errors.discount ||
            errors.taxRate ||
            Object.values(errors)[0] ||
            "Invalid invoice.",
        };
      }

      const patient = data.patients.find((item) => item.id === input.patientId);
      if (!patient) return { error: "Patient not found." };

      const existing = existingId
        ? (data.invoices ?? []).find((item) => item.id === existingId)
        : undefined;
      if (existingId && !existing) return { error: "Invoice not found." };
      if (existing && existing.status !== "draft") {
        return { error: "Only draft invoices can be edited in this demo." };
      }

      if (input.appointmentId) {
        const appointment = data.appointments.find(
          (item) => item.id === input.appointmentId,
        );
        if (!appointment) return { error: "Linked appointment not found." };
        if (appointment.patientId !== patient.id) {
          return { error: "Appointment does not belong to this patient." };
        }
      }

      const doctor = input.doctorId
        ? data.doctors.find((item) => item.id === input.doctorId)
        : undefined;
      if (input.doctorId && !doctor) return { error: "Doctor not found." };

      const lineIds = (data.invoices ?? []).flatMap((invoice) =>
        invoice.items.map((item) => item.id),
      );
      const items = input.items.map((item) => {
        const id = createInvoiceLineId(lineIds);
        lineIds.push(id);
        return {
          id,
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      });

      const totals = calculateInvoiceTotals({
        items,
        discount: input.discount,
        taxRate: input.taxRate,
        amountPaid: existing?.amountPaid || 0,
      });
      const stamp = clientStamp();
      const status = input.status ?? existing?.status ?? "draft";
      const next: Invoice = {
        id:
          existing?.id ??
          createInvoiceId((data.invoices ?? []).map((item) => item.id)),
        patientId: patient.id,
        patientName: patient.name,
        appointmentId: input.appointmentId,
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        date: input.date,
        dueDate: input.dueDate,
        items,
        discount: totals.discount,
        taxRate: totals.taxRate,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        status,
        notes: input.notes?.trim() || "",
        createdAt: existing?.createdAt ?? stamp,
        updatedAt: stamp,
      };

      const refreshed = refreshInvoiceFinancials(
        next,
        (data.payments ?? []).filter((payment) => payment.invoiceId === next.id),
      );

      commit({
        ...data,
        invoices: [
          refreshed,
          ...(data.invoices ?? []).filter((item) => item.id !== refreshed.id),
        ],
      });
      return refreshed;
    },
    [commit, data],
  );

  const issueInvoice = useCallback(
    (id: string) => {
      const existing = (data.invoices ?? []).find((item) => item.id === id);
      if (!existing) return { error: "Invoice not found." };
      if (existing.status === "cancelled") {
        return { error: "Cancelled invoices cannot be issued." };
      }
      if (existing.status !== "draft" && existing.status !== "unpaid") {
        return { error: "Only draft invoices can be issued." };
      }
      const next = refreshInvoiceFinancials(
        {
          ...existing,
          status: "unpaid",
          updatedAt: clientStamp(),
        },
        (data.payments ?? []).filter((payment) => payment.invoiceId === id),
      );
      commit({
        ...data,
        invoices: (data.invoices ?? []).map((item) =>
          item.id === id ? next : item,
        ),
      });
      return next;
    },
    [commit, data],
  );

  const cancelInvoice = useCallback(
    (id: string) => {
      const existing = (data.invoices ?? []).find((item) => item.id === id);
      if (!existing) return { error: "Invoice not found." };
      if (existing.status === "cancelled") {
        return { error: "Invoice is already cancelled." };
      }
      const next: Invoice = {
        ...existing,
        status: "cancelled",
        updatedAt: clientStamp(),
      };
      commit({
        ...data,
        invoices: (data.invoices ?? []).map((item) =>
          item.id === id ? next : item,
        ),
      });
      return next;
    },
    [commit, data],
  );

  const recordPayment = useCallback(
    (input: PaymentInput) => {
      const invoice = (data.invoices ?? []).find(
        (item) => item.id === input.invoiceId,
      );
      if (!invoice) return { error: "Invoice not found." };

      const validationError = validatePaymentInput({
        amount: input.amount,
        balanceDue: invoice.balanceDue,
        invoiceStatus: invoice.status,
        date: input.date,
        method: input.method,
      });
      if (validationError) return { error: validationError };

      const payment: Payment = {
        id: createPaymentId((data.payments ?? []).map((item) => item.id)),
        invoiceId: invoice.id,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        date: input.date,
        amount: roundMoney(input.amount),
        method: input.method,
        reference: input.reference?.trim() || undefined,
        notes: input.notes?.trim() || "",
        createdAt: clientStamp(),
      };

      const payments = [payment, ...(data.payments ?? [])];
      const refreshedInvoice = refreshInvoiceFinancials(invoice, payments);

      commit({
        ...data,
        payments,
        invoices: (data.invoices ?? []).map((item) =>
          item.id === invoice.id ? refreshedInvoice : item,
        ),
      });
      return payment;
    },
    [commit, data],
  );

  const addExpense = useCallback(
    (input: ExpenseInput) => {
      const errors = validateExpenseInput(input);
      if (Object.keys(errors).length) {
        return { error: Object.values(errors)[0] || "Invalid expense." };
      }
      const stamp = clientStamp();
      const next: Expense = {
        id: createExpenseId((data.expenses ?? []).map((item) => item.id)),
        title: input.title.trim(),
        category: input.category,
        amount: input.amount,
        date: input.date,
        paymentMethod: input.paymentMethod,
        description: input.description?.trim() || "",
        reference: input.reference?.trim() || undefined,
        createdAt: stamp,
        updatedAt: stamp,
      };
      commit({ ...data, expenses: [next, ...(data.expenses ?? [])] });
      return next;
    },
    [commit, data],
  );

  const updateExpense = useCallback(
    (id: string, input: ExpenseInput) => {
      const existing = (data.expenses ?? []).find((item) => item.id === id);
      if (!existing) return { error: "Expense not found." };
      const errors = validateExpenseInput(input);
      if (Object.keys(errors).length) {
        return { error: Object.values(errors)[0] || "Invalid expense." };
      }
      const next: Expense = {
        ...existing,
        title: input.title.trim(),
        category: input.category,
        amount: input.amount,
        date: input.date,
        paymentMethod: input.paymentMethod,
        description: input.description?.trim() || "",
        reference: input.reference?.trim() || undefined,
        updatedAt: clientStamp(),
      };
      commit({
        ...data,
        expenses: (data.expenses ?? []).map((item) =>
          item.id === id ? next : item,
        ),
      });
      return next;
    },
    [commit, data],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      if (!(data.expenses ?? []).some((item) => item.id === id)) {
        return { ok: false, message: "Expense not found." };
      }
      commit({
        ...data,
        expenses: (data.expenses ?? []).filter((item) => item.id !== id),
      });
      return { ok: true, message: "Expense deleted." };
    },
    [commit, data],
  );

  const stats = useMemo(() => {
    const today = clinicTodayIso();
    const todays = data.appointments.filter((a) => a.date === today);
    return {
      totalPatients: data.patients.length,
      totalDoctors: data.doctors.length,
      todaysAppointments: todays.length,
      pendingAppointments: data.appointments.filter(
        (a) => a.status === "pending" || a.status === "scheduled",
      ).length,
      completedAppointments: data.appointments.filter(
        (a) => a.status === "completed",
      ).length,
      confirmedAppointments: data.appointments.filter(
        (a) => a.status === "confirmed",
      ).length,
      cancelledAppointments: data.appointments.filter(
        (a) => a.status === "cancelled",
      ).length,
    };
  }, [data.appointments, data.doctors.length, data.patients.length]);

  const billingSummary = useMemo(
    () =>
      buildBillingSummary({
        invoices: data.invoices ?? [],
        payments: data.payments ?? [],
        expenses: data.expenses ?? [],
      }),
    [data.expenses, data.invoices, data.payments],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      data,
      patients: data.patients,
      doctors: data.doctors,
      departments: data.departments,
      services: data.services,
      appointments: data.appointments,
      schedules: data.schedules ?? [],
      medicalRecords: data.medicalRecords ?? [],
      consultations: data.consultations ?? [],
      prescriptions: data.prescriptions ?? [],
      invoices: data.invoices ?? [],
      payments: data.payments ?? [],
      expenses: data.expenses ?? [],
      stats,
      billingSummary,
      getDoctorSchedule,
      upsertDoctorSchedule,
      addPatient,
      updatePatient,
      deletePatient,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addService,
      updateService,
      deleteService,
      addAppointment,
      updateAppointmentStatus,
      updateAppointment,
      getMedicalRecord,
      upsertMedicalRecord,
      getConsultationByAppointment,
      saveConsultationDraft,
      finalizeConsultation,
      savePrescription,
      issuePrescription,
      cancelPrescription,
      saveInvoice,
      issueInvoice,
      cancelInvoice,
      recordPayment,
      addExpense,
      updateExpense,
      deleteExpense,
      resetDemoData,
    }),
    [
      ready,
      data,
      stats,
      billingSummary,
      getDoctorSchedule,
      upsertDoctorSchedule,
      addPatient,
      updatePatient,
      deletePatient,
      addDoctor,
      updateDoctor,
      deleteDoctor,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addService,
      updateService,
      deleteService,
      addAppointment,
      updateAppointmentStatus,
      updateAppointment,
      getMedicalRecord,
      upsertMedicalRecord,
      getConsultationByAppointment,
      saveConsultationDraft,
      finalizeConsultation,
      savePrescription,
      issuePrescription,
      cancelPrescription,
      saveInvoice,
      issueInvoice,
      cancelInvoice,
      recordPayment,
      addExpense,
      updateExpense,
      deleteExpense,
      resetDemoData,
    ],
  );

  return (
    <CarePointContext.Provider value={value}>
      {children}
    </CarePointContext.Provider>
  );
}

export function useCarePointStore() {
  const ctx = useContext(CarePointContext);
  if (!ctx) {
    throw new Error("useCarePointStore must be used within CarePointProvider");
  }
  return ctx;
}
