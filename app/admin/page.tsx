"use client";

import Link from "next/link";
import {
  Calendar,
  CalendarCheck,
  Clock,
  DollarSign,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { formatMoney, monthlyTotals } from "@/lib/billing";
import { clinicInfo } from "@/lib/mock-data";
import type { AppointmentStatus } from "@/lib/types";

export default function AdminOverviewPage() {
  const {
    ready,
    stats,
    appointments,
    patients,
    doctors,
    consultations,
    prescriptions,
    invoices,
    payments,
    expenses,
    billingSummary,
  } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  const recentAppointments = [...appointments]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5);

  const recentPatients = [...patients]
    .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
    .slice(0, 4);

  const recentInvoices = [...invoices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const clinicalSummary = {
    consultations: consultations.length,
    prescriptions: prescriptions.length,
    issuedRx: prescriptions.filter((rx) => rx.status === "issued").length,
  };

  const appointmentChartData = (
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
  ).map((label, index) => ({
    label,
    value: appointments.filter((apt) => {
      const day = new Date(`${apt.date}T00:00:00Z`).getUTCDay();
      return (day + 6) % 7 === index;
    }).length,
  }));

  const revenueChartData = monthlyTotals(
    payments.map((payment) => ({ date: payment.date, amount: payment.amount })),
    2026,
  ).map((item) => ({ label: item.label, value: Math.round(item.value) }));

  const paymentStatusChart = [
    { label: "Paid", value: invoices.filter((i) => i.status === "paid").length },
    {
      label: "Partial",
      value: invoices.filter((i) => i.status === "partially-paid").length,
    },
    {
      label: "Unpaid",
      value: invoices.filter((i) => i.status === "unpaid").length,
    },
    {
      label: "Overdue",
      value: invoices.filter((i) => i.status === "overdue").length,
    },
  ];

  const statusSummary = (
    [
      "pending",
      "scheduled",
      "confirmed",
      "checked-in",
      "completed",
      "cancelled",
    ] as AppointmentStatus[]
  ).map((key) => ({
    key,
    label: key.replace("-", " "),
    value: appointments.filter((a) => a.status === key).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic overview"
        description="Live demo statistics from localStorage-backed CarePoint data."
      />

      <p className="rounded-lg border border-primary/20 bg-light-blue/30 px-4 py-3 text-sm text-foreground">
        {clinicInfo.demoNotice}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total patients"
          value={stats.totalPatients.toLocaleString()}
          hint="From local demo registry"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Doctors"
          value={stats.totalDoctors}
          hint="Active care providers"
          tone="teal"
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <StatCard
          title="Today's appointments"
          value={stats.todaysAppointments}
          hint="Based on your local date"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Pending"
          value={stats.pendingAppointments}
          hint="Pending + scheduled"
          tone="amber"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Completed"
          value={stats.completedAppointments}
          hint="All-time completed in demo"
          tone="emerald"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Collected revenue"
          value={formatMoney(billingSummary.totalCollected)}
          hint="From payment records"
          tone="teal"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Consultations"
          value={clinicalSummary.consultations}
          hint="All demo consultation records"
          tone="teal"
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <StatCard
          title="Prescriptions"
          value={clinicalSummary.prescriptions}
          hint={`${clinicalSummary.issuedRx} issued`}
          tone="emerald"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Clinical coverage"
          value={patients.filter((p) =>
            consultations.some((c) => c.patientId === p.id) ||
            prescriptions.some((rx) => rx.patientId === p.id),
          ).length}
          hint="Patients with consult or Rx activity"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Outstanding invoices"
          value={formatMoney(billingSummary.pendingPayments)}
          hint={`${billingSummary.overdueInvoices} overdue`}
          tone="amber"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Today's collections"
          value={formatMoney(billingSummary.todaysCollections)}
          tone="emerald"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Expenses"
          value={formatMoney(billingSummary.totalExpenses)}
          hint={`${expenses.length} records`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Net operating balance"
          value={formatMoney(billingSummary.netOperatingBalance)}
          hint="Collected − expenses (demo)"
          tone="teal"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/billing"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-3 text-xs font-medium shadow-sm hover:bg-slate-50"
        >
          Billing
        </Link>
        <Link
          href="/admin/patients"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-3 text-xs font-medium shadow-sm hover:bg-slate-50"
        >
          Manage patients
        </Link>
        <Link
          href="/admin/appointments"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-3 text-xs font-medium shadow-sm hover:bg-slate-50"
        >
          View appointments
        </Link>
        <Link
          href="/admin/doctors"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-3 text-xs font-medium shadow-sm hover:bg-slate-50"
        >
          Doctor directory
        </Link>
        <Link
          href="/admin/patients"
          className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-white shadow-sm hover:bg-primary-dark"
        >
          <UserPlus className="h-4 w-4" />
          Add patient
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statusSummary.map((item) => (
          <Card key={item.key}>
            <CardBody>
              <p className="text-sm capitalize text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Appointments by weekday"
            description="Derived from live local appointment records."
          />
          <CardBody>
            <BarChart data={appointmentChartData} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Collected revenue trend (2026)"
            description="From payment records — fictional demo amounts."
          />
          <CardBody>
            <LineChart data={revenueChartData} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Invoice status distribution" />
          <CardBody>
            <BarChart data={paymentStatusChart} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Recent billing activity"
            action={
              <Link href="/admin/billing" className="text-sm font-medium text-primary hover:underline">
                Open billing
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted">No invoices yet.</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    {invoice.id} · {invoice.patientName}
                  </span>
                  <span className="font-medium">{formatMoney(invoice.total)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent appointments"
            description="Latest demo bookings"
            action={
              <Link
                href="/admin/appointments"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            <Table headers={["Patient", "Doctor", "When", "Status"]}>
              {recentAppointments.map((apt) => (
                <tr key={apt.id}>
                  <Td className="font-medium">{apt.patientName}</Td>
                  <Td>{apt.doctorName}</Td>
                  <Td>
                    {apt.date} · {apt.time}
                  </Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent patient registrations"
            description="Newest demo patients"
            action={
              <Link
                href="/admin/patients"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            <Table headers={["Patient", "Registered", "Status"]}>
              {recentPatients.map((patient) => (
                <tr key={patient.id}>
                  <Td>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-xs text-muted">{patient.id}</p>
                  </Td>
                  <Td>{patient.registrationDate}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(patient.status)}>
                      {patient.status}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Doctor overview"
          description="Current demo roster"
          action={
            <Link
              href="/admin/doctors"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          }
        />
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 6).map((doctor) => (
            <div
              key={doctor.id}
              className="rounded-xl border border-border px-4 py-3"
            >
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-muted">
                {doctor.specialty} · {doctor.department}
              </p>
              <Badge
                className="mt-2"
                variant={
                  doctor.availabilityStatus === "available" ? "success" : "muted"
                }
              >
                {doctor.availabilityStatus}
              </Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
