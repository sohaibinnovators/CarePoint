import type {
  LegacyInvoiceSnippet,
  LegacyPrescriptionSnippet,
  NotificationItem,
  StaffMember,
  Testimonial,
} from "./types";
import { formatMoney } from "./billing";
import {
  seedAppointments,
  seedDepartments,
  seedDoctors,
  seedInvoices,
  seedPatients,
  seedPrescriptions,
  seedServices,
} from "./seed-data";

export const clinicInfo = {
  name: "CarePoint",
  tagline: "Better Care. Smarter Management.",
  phone: "+1 (555) 014-2890",
  email: "hello@carepoint.demo",
  address: "1280 Wellness Avenue, Suite 400, Riverside Medical District",
  hours: "Mon–Fri 8:00 AM – 8:00 PM · Sat 9:00 AM – 4:00 PM",
  demoNotice:
    "All names, figures, and records are fictional demo data. Dashboard changes persist in this browser via localStorage only.",
};

export const doctors = seedDoctors;
export const services = seedServices;
export const departments = seedDepartments;
export const patients = seedPatients;
export const appointments = seedAppointments;

export const staff: StaffMember[] = [
  {
    id: "st-01",
    name: "Priya Nair",
    role: "Clinic Administrator",
    department: "Administration",
    email: "priya.nair@carepoint.demo",
    phone: "+1 (555) 400-2001",
    status: "active",
  },
  {
    id: "st-02",
    name: "Daniel Ruiz",
    role: "Reception Lead",
    department: "Front Desk",
    email: "daniel.ruiz@carepoint.demo",
    phone: "+1 (555) 400-2002",
    status: "active",
  },
  {
    id: "st-03",
    name: "Hannah Cole",
    role: "Billing Specialist",
    department: "Finance",
    email: "hannah.cole@carepoint.demo",
    phone: "+1 (555) 400-2003",
    status: "active",
  },
  {
    id: "st-04",
    name: "Chris Nguyen",
    role: "Nurse Coordinator",
    department: "Nursing",
    email: "chris.nguyen@carepoint.demo",
    phone: "+1 (555) 400-2004",
    status: "on-leave",
  },
  {
    id: "st-05",
    name: "Sara Whitfield",
    role: "Lab Technician",
    department: "Diagnostics",
    email: "sara.whitfield@carepoint.demo",
    phone: "+1 (555) 400-2005",
    status: "active",
  },
];

/** Static marketing/snippet fallback — dashboards should prefer store invoices. */
export const invoices: LegacyInvoiceSnippet[] = seedInvoices.map((invoice) => ({
  id: invoice.id,
  patientName: invoice.patientName,
  date: invoice.date,
  amount: formatMoney(invoice.total),
  status: invoice.status,
  items: invoice.items.map((item) => item.description).join(", "),
}));

/** Static marketing/snippet fallback — dashboards should prefer store prescriptions. */
export const prescriptions: LegacyPrescriptionSnippet[] = seedPrescriptions.map(
  (rx) => ({
    id: rx.id,
    patientName: rx.patientName,
    doctorName: rx.doctorName,
    date: rx.date,
    medications: rx.medications.map(
      (med) => `${med.name} ${med.dosage} — ${med.frequency}`,
    ),
    notes: rx.notes,
  }),
);

export const notifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "New appointment request",
    message: "Nora Alvarez requested a pediatric wellness visit for today.",
    time: "12 min ago",
    type: "appointment",
    read: false,
  },
  {
    id: "n-2",
    title: "Invoice overdue",
    message: "INV-2044 for Ethan Brooks is marked overdue in demo billing.",
    time: "1 hour ago",
    type: "warning",
    read: false,
  },
  {
    id: "n-3",
    title: "Lab results ready",
    message: "Demo lab panel for Liam Foster is ready for review.",
    time: "3 hours ago",
    type: "success",
    read: true,
  },
  {
    id: "n-4",
    title: "Staff schedule update",
    message: "Chris Nguyen is marked on leave through Friday.",
    time: "Yesterday",
    type: "info",
    read: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Jordan Miles",
    role: "Demo Patient",
    quote:
      "Booking was simple and the clinic interface felt calm and organized from the first visit.",
    rating: 5,
  },
  {
    id: "t-2",
    name: "Priya Desai",
    role: "Demo Patient",
    quote:
      "I appreciated how clearly appointments, doctors, and follow-ups were presented.",
    rating: 5,
  },
  {
    id: "t-3",
    name: "Sam Ortega",
    role: "Demo Patient Parent",
    quote:
      "The pediatric visit flow was easy to understand and the reminders felt thoughtful.",
    rating: 4,
  },
];

export const appointmentChartData = [
  { label: "Mon", value: 18 },
  { label: "Tue", value: 24 },
  { label: "Wed", value: 21 },
  { label: "Thu", value: 27 },
  { label: "Fri", value: 31 },
  { label: "Sat", value: 14 },
  { label: "Sun", value: 6 },
];

export const revenueChartData = [
  { label: "Jun", value: 42 },
  { label: "Jul", value: 48 },
  { label: "Aug", value: 51 },
  { label: "Sep", value: 47 },
  { label: "Oct", value: 56 },
  { label: "Nov", value: 61 },
];

/** Static fallback only — dashboards should prefer useCarePointStore().stats */
export const dashboardStats = {
  totalPatients: patients.length,
  totalDoctors: doctors.length,
  todaysAppointments: 4,
  pendingAppointments: 2,
  completedAppointments: 1,
  demoRevenue: "$61,450",
};

export const whyChoose = [
  {
    title: "Coordinated Care",
    description:
      "Appointments, departments, and follow-ups stay aligned across clinic teams.",
  },
  {
    title: "Clear Patient Journey",
    description:
      "From booking to billing, every step is designed to feel simple and professional.",
  },
  {
    title: "Role-Based Workspaces",
    description:
      "Admin, doctor, receptionist, and patient views are tailored to daily workflows.",
  },
  {
    title: "Trusted Clinical Presence",
    description:
      "A calm healthcare aesthetic that prioritizes clarity over clutter.",
  },
];

export const medicalNotes = [
  {
    id: "note-1",
    patientName: "Liam Foster",
    date: "2026-11-19",
    summary: "BP improved with current regimen. Continue monitoring.",
  },
  {
    id: "note-2",
    patientName: "Maya Singh",
    date: "2026-11-12",
    summary: "Mild dermatitis responding to topical treatment.",
  },
  {
    id: "note-3",
    patientName: "Owen Carter",
    date: "2026-10-30",
    summary: "Right knee strain. Start physiotherapy referral.",
  },
];

export function getDoctorById(id: string) {
  return doctors.find((doctor) => doctor.id === id);
}

export function getServiceById(id: string) {
  return services.find((service) => service.id === id);
}

export function getPatientById(id: string) {
  return patients.find((patient) => patient.id === id);
}
