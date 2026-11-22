export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked-in"
  | "completed"
  | "cancelled"
  | "pending";

export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "partially-paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type PaymentMethod = "cash" | "bank-transfer" | "card" | "other";

export type ExpenseCategory =
  | "staff-salaries"
  | "medical-supplies"
  | "equipment"
  | "utilities"
  | "rent"
  | "maintenance"
  | "other";

export type AvailabilityStatus = "available" | "unavailable";

export type AppointmentVisitType = "in-person" | "online";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SlotDurationMinutes = 15 | 30 | 45 | 60;

export type ScheduleTimeRange = {
  id: string;
  start: string; // HH:MM 24h
  end: string; // HH:MM 24h
  label?: string;
};

export type DoctorSchedule = {
  doctorId: string;
  workingDays: Weekday[];
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDurationMinutes: SlotDurationMinutes;
  breaks: ScheduleTimeRange[];
  unavailableDates: string[]; // YYYY-MM-DD
  maxAppointmentsPerDay: number;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  department: string;
  departmentId: string;
  experience: string;
  experienceYears: number;
  education: string;
  qualification: string;
  bio: string;
  rating: number;
  patients: number;
  availability: string;
  availabilityStatus: AvailabilityStatus;
  consultationFee: string;
  email: string;
  phone: string;
  imageInitials: string;
  imagePreview?: string;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  departmentId?: string;
  description: string;
  duration: string;
  price: string;
  features: string[];
};

export type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  notes: string;
  registrationDate: string;
  lastVisit: string;
  status: "active" | "inactive";
  condition: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  department: string;
  departmentId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
  visitType: AppointmentVisitType;
  reason: string;
  durationMinutes: number;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "on-leave";
};

/** Legacy Phase 1 display-only invoice snippet (mock marketing data). */
export type LegacyInvoiceSnippet = {
  id: string;
  patientName: string;
  date: string;
  amount: string;
  status: InvoiceStatus | "pending";
  items: string;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  discount: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
};

/** Legacy Phase 1 display-only prescription snippet (mock marketing data). */
export type LegacyPrescriptionSnippet = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: string[];
  notes: string;
};

export type MedicalRecord = {
  patientId: string;
  allergies: string[];
  conditions: string[];
  pastHistory: string;
  currentMedications: string[];
  familyHistory: string;
  clinicalNotes: string;
  updatedAt: string;
  updatedByDoctorId?: string;
};

export type ConsultationStatus = "draft" | "finalized";

export type Consultation = {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  chiefComplaint: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatmentPlan: string;
  followUp: string;
  additionalNotes: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
};

export type PrescriptionMedication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export type PrescriptionStatus = "draft" | "issued" | "cancelled";

export type Prescription = {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId?: string;
  appointmentId?: string;
  patientName: string;
  doctorName: string;
  medications: PrescriptionMedication[];
  date: string;
  status: PrescriptionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TimelineEventType =
  | "registration"
  | "appointment"
  | "consultation"
  | "prescription"
  | "follow-up";

export type TimelineEvent = {
  id: string;
  patientId: string;
  type: TimelineEventType;
  date: string;
  title: string;
  detail: string;
  doctorName?: string;
  appointmentId?: string;
  consultationId?: string;
  prescriptionId?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "appointment";
  read: boolean;
};

export type Department = {
  id: string;
  name: string;
  doctors: number;
  patients: number;
  description: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type CarePointData = {
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
  version: number;
};

export type PatientInput = {
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodType?: string;
  notes?: string;
  status?: "active" | "inactive";
  condition?: string;
};

export type DoctorInput = {
  name: string;
  specialty: string;
  departmentId: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  consultationFee: string;
  bio: string;
  availabilityStatus: AvailabilityStatus;
  availability?: string;
  imagePreview?: string;
};

export type DepartmentInput = {
  name: string;
  description: string;
};

export type ServiceInput = {
  name: string;
  category: string;
  departmentId?: string;
  description: string;
  duration: string;
  price: string;
  features?: string[];
};

export type AppointmentInput = {
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  type: string;
  visitType: AppointmentVisitType;
  reason?: string;
  status?: AppointmentStatus;
  durationMinutes?: number;
};

export type DoctorScheduleInput = Omit<DoctorSchedule, "doctorId">;

export type MedicalRecordInput = Omit<
  MedicalRecord,
  "patientId" | "updatedAt" | "updatedByDoctorId"
>;

export type ConsultationInput = {
  appointmentId: string;
  chiefComplaint: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatmentPlan: string;
  followUp: string;
  additionalNotes: string;
};

export type PrescriptionInput = {
  patientId: string;
  doctorId: string;
  consultationId?: string;
  appointmentId?: string;
  medications: Omit<PrescriptionMedication, "id">[];
  date: string;
  notes?: string;
  status?: PrescriptionStatus;
};

export type InvoiceInput = {
  patientId: string;
  appointmentId?: string;
  doctorId?: string;
  date: string;
  dueDate: string;
  items: Omit<InvoiceLineItem, "id">[];
  discount: number;
  taxRate: number;
  notes?: string;
  status?: Extract<InvoiceStatus, "draft" | "unpaid">;
};

export type PaymentInput = {
  invoiceId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
};

export type ExpenseInput = {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  reference?: string;
};
