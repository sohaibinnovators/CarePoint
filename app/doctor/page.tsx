"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  FileText,
  NotebookPen,
} from "lucide-react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCarePointStore } from "@/lib/carepoint-store";
import { DEMO_CLINICAL_NOTICE, isConsultationEligible } from "@/lib/clinical";
import { describeSchedule, generateDaySlots } from "@/lib/scheduling";
import { clinicTodayIso } from "@/lib/time";
import { clinicInfo } from "@/lib/mock-data";

const DOCTOR_ID = "dr-elena-hayes";

export default function DoctorOverviewPage() {
  const {
    ready,
    appointments,
    patients,
    consultations,
    prescriptions,
    getDoctorSchedule,
  } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  const today = clinicTodayIso();
  const schedule = getDoctorSchedule(DOCTOR_ID);
  const myAppointments = appointments.filter((a) => a.doctorId === DOCTOR_ID);
  const todayList = myAppointments
    .filter((a) => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const eligibleToday = todayList.filter(isConsultationEligible);
  const upcoming = myAppointments
    .filter(
      (a) =>
        a.date >= today &&
        a.status !== "cancelled" &&
        a.status !== "completed",
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);
  const pending = myAppointments.filter(
    (a) => a.status === "pending" || a.status === "scheduled",
  );
  const completed = myAppointments.filter((a) => a.status === "completed");
  const openSlots = generateDaySlots({
    schedule,
    date: today,
    appointments,
    doctorId: DOCTOR_ID,
  }).filter((slot) => slot.available);
  const myConsultations = consultations
    .filter((item) => item.doctorId === DOCTOR_ID)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const myRx = prescriptions
    .filter((item) => item.doctorId === DOCTOR_ID)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const followUps = consultations.filter(
    (item) =>
      item.doctorId === DOCTOR_ID &&
      item.status === "finalized" &&
      item.followUp.trim(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Cardiology workspace for Dr. Elena Hayes. ${clinicInfo.demoNotice}`}
        actions={
          <Link href="/doctor/appointments">
            <Button variant="outline" size="sm">
              View all appointments
            </Button>
          </Link>
        }
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's appointments"
          value={todayList.length}
          hint={`Demo date: ${today}`}
          icon={<CalendarCheck className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          title="Eligible consults"
          value={eligibleToday.length}
          hint="Confirmed / checked-in / completed"
          icon={<NotebookPen className="h-5 w-5" />}
          tone="teal"
        />
        <StatCard
          title="My consultations"
          value={consultations.filter((c) => c.doctorId === DOCTOR_ID).length}
          hint={`${followUps.length} with follow-up notes`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          title="My prescriptions"
          value={prescriptions.filter((rx) => rx.doctorId === DOCTOR_ID).length}
          hint="Draft + issued"
          icon={<FileText className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Today's eligible appointments"
            description="Open the clinical workflow from here."
          />
          <CardBody className="p-0">
            <Table headers={["Time", "Patient", "Status", ""]}>
              {eligibleToday.map((apt) => (
                <tr key={apt.id}>
                  <Td>{apt.time}</Td>
                  <Td className="font-medium">{apt.patientName}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Link
                      href={`/doctor/consultations/${apt.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Open consult
                    </Link>
                  </Td>
                </tr>
              ))}
            </Table>
            {eligibleToday.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">
                No eligible visits today.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Working hours" description="Saved availability" />
          <CardBody className="space-y-3 text-sm">
            <p>{describeSchedule(schedule)}</p>
            <p className="text-muted">
              Pending / scheduled: {pending.length} · Completed: {completed.length}
            </p>
            <p className="text-muted">
              Open slots today: {openSlots.map((s) => s.time).join(", ") || "None"}
            </p>
            <p className="text-muted">Patient registry size: {patients.length}</p>
            <Link href="/doctor/schedule">
              <Button size="sm" variant="outline">
                Edit availability
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent consultations" />
          <CardBody className="space-y-3">
            {myConsultations.length === 0 ? (
              <p className="text-sm text-muted">No consultations recorded yet.</p>
            ) : (
              myConsultations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">{item.patientName}</p>
                    <Badge variant={item.status === "finalized" ? "success" : "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted">{item.chiefComplaint}</p>
                  {item.followUp ? (
                    <p className="mt-1 text-xs text-secondary">
                      Follow-up: {item.followUp}
                    </p>
                  ) : null}
                  <Link
                    href={`/doctor/consultations/${item.appointmentId}`}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Open
                  </Link>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent prescriptions"
            action={
              <Link href="/doctor/prescriptions">
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {myRx.length === 0 ? (
              <p className="text-sm text-muted">No prescriptions yet.</p>
            ) : (
              myRx.map((rx) => (
                <div
                  key={rx.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{rx.patientName}</p>
                    <p className="text-xs text-muted">
                      {rx.date} · {rx.medications.length} med(s) · {rx.status}
                    </p>
                  </div>
                  <Link
                    href={`/doctor/prescriptions/${rx.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Upcoming appointments" />
        <CardBody className="p-0">
          <Table headers={["Date", "Time", "Patient", "Status", ""]}>
            {upcoming.map((apt) => (
              <tr key={apt.id}>
                <Td>{apt.date}</Td>
                <Td>{apt.time}</Td>
                <Td className="font-medium">{apt.patientName}</Td>
                <Td>
                  <Badge variant={statusBadgeVariant(apt.status)}>
                    {apt.status}
                  </Badge>
                </Td>
                <Td>
                  {isConsultationEligible(apt) ? (
                    <Link
                      href={`/doctor/consultations/${apt.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Consult
                    </Link>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
          {upcoming.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted">No upcoming visits.</p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
