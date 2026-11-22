"use client";

import { useMemo, useState } from "react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import {
  ageGroup,
  DEMO_BILLING_NOTICE,
  downloadCsv,
  filterByDateRange,
  formatMoney,
  monthlyTotals,
  paymentsByMethod,
  sumExpenses,
  sumPayments,
} from "@/lib/billing";
import { clinicTodayIso, startOfWeekIso } from "@/lib/time";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Stethoscope,
  Receipt,
} from "lucide-react";

export default function AdminReportsPage() {
  const {
    ready,
    patients,
    doctors,
    departments,
    appointments,
    consultations,
    invoices,
    payments,
    expenses,
    billingSummary,
  } = useCarePointStore();

  const [fromDate, setFromDate] = useState("2026-11-01");
  const [toDate, setToDate] = useState(clinicTodayIso());
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [expenseCategory, setExpenseCategory] = useState("all");

  const filteredPayments = useMemo(() => {
    let list = filterByDateRange(payments, fromDate, toDate);
    if (doctorFilter !== "all") {
      const invoiceIds = new Set(
        invoices
          .filter((invoice) => invoice.doctorId === doctorFilter)
          .map((invoice) => invoice.id),
      );
      list = list.filter((payment) => invoiceIds.has(payment.invoiceId));
    }
    if (departmentFilter !== "all") {
      const doctorIds = new Set(
        doctors
          .filter((doctor) => doctor.departmentId === departmentFilter)
          .map((doctor) => doctor.id),
      );
      const invoiceIds = new Set(
        invoices
          .filter((invoice) => invoice.doctorId && doctorIds.has(invoice.doctorId))
          .map((invoice) => invoice.id),
      );
      list = list.filter((payment) => invoiceIds.has(payment.invoiceId));
    }
    if (paymentStatus !== "all") {
      const invoiceIds = new Set(
        invoices
          .filter((invoice) => invoice.status === paymentStatus)
          .map((invoice) => invoice.id),
      );
      list = list.filter((payment) => invoiceIds.has(payment.invoiceId));
    }
    return list;
  }, [
    payments,
    fromDate,
    toDate,
    doctorFilter,
    departmentFilter,
    paymentStatus,
    invoices,
    doctors,
  ]);

  const filteredExpenses = useMemo(() => {
    let list = filterByDateRange(expenses, fromDate, toDate);
    if (expenseCategory !== "all") {
      list = list.filter((expense) => expense.category === expenseCategory);
    }
    return list;
  }, [expenses, fromDate, toDate, expenseCategory]);

  const filteredAppointments = useMemo(() => {
    let list = filterByDateRange(appointments, fromDate, toDate);
    if (doctorFilter !== "all") {
      list = list.filter((apt) => apt.doctorId === doctorFilter);
    }
    if (departmentFilter !== "all") {
      list = list.filter((apt) => apt.departmentId === departmentFilter);
    }
    return list;
  }, [appointments, fromDate, toDate, doctorFilter, departmentFilter]);

  const today = clinicTodayIso();
  const weekStart = startOfWeekIso(today);
  const year = 2026;

  const dailyRevenue = sumPayments(
    payments.filter((payment) => payment.date === today),
  );
  const weeklyRevenue = sumPayments(
    payments.filter((payment) => payment.date >= weekStart && payment.date <= today),
  );
  const monthlyRevenue = sumPayments(
    payments.filter((payment) => payment.date.startsWith("2026-11")),
  );
  const yearlyRevenue = sumPayments(
    payments.filter((payment) => payment.date.startsWith("2026")),
  );

  const revenueTrend = monthlyTotals(
    payments.map((payment) => ({ date: payment.date, amount: payment.amount })),
    year,
  );
  const methodBreakdown = paymentsByMethod(filteredPayments).map((item) => ({
    label: item.label,
    value: Math.round(item.value),
  }));

  const appointmentTrend = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = days.map((label) => ({ label, value: 0 }));
    for (const apt of filteredAppointments) {
      const date = new Date(`${apt.date}T00:00:00Z`);
      const index = (date.getUTCDay() + 6) % 7;
      counts[index].value += 1;
    }
    return counts;
  }, [filteredAppointments]);

  const doctorWorkload = useMemo(() => {
    return doctors.map((doctor) => {
      const doctorAppointments = filteredAppointments.filter(
        (apt) => apt.doctorId === doctor.id,
      );
      const completedConsults = consultations.filter(
        (item) =>
          item.doctorId === doctor.id &&
          item.status === "finalized" &&
          (!fromDate || item.updatedAt.slice(0, 10) >= fromDate) &&
          (!toDate || item.updatedAt.slice(0, 10) <= toDate),
      ).length;
      return {
        doctor: doctor.name,
        appointments: doctorAppointments.length,
        completed: doctorAppointments.filter((apt) => apt.status === "completed")
          .length,
        consultations: completedConsults,
      };
    });
  }, [doctors, filteredAppointments, consultations, fromDate, toDate]);

  const genderDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const patient of patients) {
      map.set(patient.gender, (map.get(patient.gender) || 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value }));
  }, [patients]);

  const ageDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const patient of patients) {
      const group = ageGroup(patient.age);
      map.set(group, (map.get(group) || 0) + 1);
    }
    return ["0-17", "18-34", "35-49", "50-64", "65+"].map((label) => ({
      label,
      value: map.get(label) || 0,
    }));
  }, [patients]);

  const newPatients = patients.filter(
    (patient) =>
      (!fromDate || patient.registrationDate >= fromDate) &&
      (!toDate || patient.registrationDate <= toDate),
  ).length;

  if (!ready) return <StoreLoading />;

  const collectedInRange = sumPayments(filteredPayments);
  const expensesInRange = sumExpenses(filteredExpenses);
  const netBalance = Math.round((collectedInRange - expensesInRange) * 100) / 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Data-driven demo reports from local appointments, payments, and expenses."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv("carepoint-report-summary.csv", [
                {
                  dailyRevenue,
                  weeklyRevenue,
                  monthlyRevenue,
                  yearlyRevenue,
                  collectedInRange,
                  expensesInRange,
                  netBalance,
                  appointments: filteredAppointments.length,
                  patients: patients.length,
                  newPatients,
                },
              ])
            }
          >
            Export summary CSV
          </Button>
        }
      />
      <p className="text-xs text-muted">{DEMO_BILLING_NOTICE}</p>

      <Card>
        <CardHeader title="Filters" description="Exports use the current filter selection." />
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
          <Select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="all">All doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </Select>
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="all">All invoice statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially-paid">Partially paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
          >
            <option value="all">All expense categories</option>
            <option value="staff-salaries">Staff Salaries</option>
            <option value="medical-supplies">Medical Supplies</option>
            <option value="equipment">Equipment</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </Select>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Daily revenue"
          value={formatMoney(dailyRevenue)}
          hint="Collected payments today"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Weekly revenue"
          value={formatMoney(weeklyRevenue)}
          tone="teal"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly revenue"
          value={formatMoney(monthlyRevenue)}
          tone="emerald"
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          title="Yearly revenue"
          value={formatMoney(yearlyRevenue)}
          tone="amber"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Appointments (filtered)"
          value={filteredAppointments.length}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Completed"
          value={
            filteredAppointments.filter((apt) => apt.status === "completed").length
          }
          tone="emerald"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Cancelled"
          value={
            filteredAppointments.filter((apt) => apt.status === "cancelled").length
          }
          tone="amber"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Pending / scheduled"
          value={
            filteredAppointments.filter(
              (apt) => apt.status === "pending" || apt.status === "scheduled",
            ).length
          }
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Revenue trend (2026)"
            description="Collected payments by month — demo data"
          />
          <CardBody>
            {revenueTrend.every((item) => item.value === 0) ? (
              <p className="text-sm text-muted">No payment data for this year.</p>
            ) : (
              <LineChart data={revenueTrend.map((item) => ({ ...item, value: Math.round(item.value) }))} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Revenue by payment method"
            description="Filtered payment totals"
          />
          <CardBody>
            {methodBreakdown.every((item) => item.value === 0) ? (
              <p className="text-sm text-muted">No payments match these filters.</p>
            ) : (
              <BarChart data={methodBreakdown} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Appointment trends" description="By weekday in filter range" />
          <CardBody>
            {appointmentTrend.every((item) => item.value === 0) ? (
              <p className="text-sm text-muted">No appointments in this range.</p>
            ) : (
              <BarChart data={appointmentTrend} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Patient distribution" description="Gender (demo registry)" />
          <CardBody>
            <BarChart data={genderDistribution} />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Age groups" />
          <CardBody>
            <BarChart data={ageDistribution} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Expense & profit overview"
            description="Collected payments minus expenses (demo)"
          />
          <CardBody className="space-y-2 text-sm">
            <p>
              Collected (filtered): <strong>{formatMoney(collectedInRange)}</strong>
            </p>
            <p>
              Expenses (filtered): <strong>{formatMoney(expensesInRange)}</strong>
            </p>
            <p>
              Outstanding balances:{" "}
              <strong>{formatMoney(billingSummary.pendingPayments)}</strong>
            </p>
            <p>
              Net operating balance: <strong>{formatMoney(netBalance)}</strong>
            </p>
            <p className="text-xs text-muted">
              Revenue uses payment records, not invoice totals. Cancelled invoices are
              excluded from outstanding balances.
            </p>
            <p>
              Registered patients: {patients.length} · New in range: {newPatients}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Doctor workload"
          description="Appointments and finalized consultations in the selected range"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "carepoint-doctor-workload.csv",
                  doctorWorkload.map((row) => ({
                    doctor: row.doctor,
                    appointments: row.appointments,
                    completedAppointments: row.completed,
                    consultations: row.consultations,
                  })),
                )
              }
            >
              Export CSV
            </Button>
          }
        />
        <CardBody className="p-0">
          <Table
            headers={[
              "Doctor",
              "Appointments",
              "Completed visits",
              "Consultations",
            ]}
          >
            {doctorWorkload.map((row) => (
              <tr key={row.doctor}>
                <Td className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    {row.doctor}
                  </span>
                </Td>
                <Td>{row.appointments}</Td>
                <Td>{row.completed}</Td>
                <Td>{row.consultations}</Td>
              </tr>
            ))}
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
