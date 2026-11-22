import {
  Activity,
  Bell,
  Calendar,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Stethoscope,
  UserPlus,
  Users,
  UserRound,
  Building2,
  BriefcaseMedical,
  BarChart3,
  Clock3,
  Wallet,
} from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/dashboard-shell";

export const adminNav: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarCheck },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Services", href: "/admin/services", icon: BriefcaseMedical },
  { label: "Staff", href: "/admin/staff", icon: UserRound },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Expenses", href: "/admin/expenses", icon: Wallet },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const doctorNav: DashboardNavItem[] = [
  { label: "Overview", href: "/doctor", icon: LayoutDashboard },
  { label: "My Appointments", href: "/doctor/appointments", icon: CalendarCheck },
  { label: "Patient Records", href: "/doctor/patients", icon: ClipboardList },
  { label: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
  { label: "Schedule", href: "/doctor/schedule", icon: Clock3 },
  { label: "Medical Notes", href: "/doctor/notes", icon: NotebookPen },
  { label: "Notifications", href: "/doctor/notifications", icon: Bell },
  { label: "Profile Settings", href: "/doctor/settings", icon: Settings },
];

export const receptionistNav: DashboardNavItem[] = [
  { label: "Overview", href: "/receptionist", icon: LayoutDashboard },
  { label: "Register Patient", href: "/receptionist/register", icon: UserPlus },
  { label: "Patient Directory", href: "/receptionist/patients", icon: Users },
  { label: "Book Appointment", href: "/receptionist/book", icon: Calendar },
  { label: "Appointment Calendar", href: "/receptionist/calendar", icon: CalendarCheck },
  { label: "Manage Appointments", href: "/receptionist/appointments", icon: ClipboardList },
  { label: "Check-in / Queue", href: "/receptionist/queue", icon: Activity },
  { label: "Billing", href: "/receptionist/billing", icon: CreditCard },
  { label: "Notifications", href: "/receptionist/notifications", icon: Bell },
  { label: "Profile Settings", href: "/receptionist/settings", icon: Settings },
];

export const patientNav: DashboardNavItem[] = [
  { label: "Overview", href: "/patient", icon: LayoutDashboard },
  { label: "My Appointments", href: "/patient/appointments", icon: Calendar },
  { label: "Book Appointment", href: "/patient/book", icon: CalendarCheck },
  { label: "My Doctors", href: "/patient/doctors", icon: Stethoscope },
  { label: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
  { label: "Medical History", href: "/patient/history", icon: ClipboardList },
  { label: "Bills & Invoices", href: "/patient/billing", icon: CreditCard },
  { label: "Notifications", href: "/patient/notifications", icon: Bell },
  { label: "Profile Settings", href: "/patient/settings", icon: Settings },
];
