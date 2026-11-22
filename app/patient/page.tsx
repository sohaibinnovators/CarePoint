"use client";

import Link from "next/link";
import {
  Calendar,
  CreditCard,
  FileText,
  Stethoscope,
} from "lucide-react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { useCarePointStore } from "@/lib/carepoint-store";
import { formatMoney } from "@/lib/billing";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";
import { clinicInfo } from "@/lib/mock-data";

const PATIENT_ID = "pt-1001";

export default function PatientOverviewPage() {
  const {
    ready,
    patients,
    appointments,
    consultations,
    prescriptions,
    invoices,
    doctors,
    getMedicalRecord,
  } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  const patient = patients.find((item) => item.id === PATIENT_ID);
  const mine = appointments.filter((a) => a.patientId === PATIENT_ID);
  const upcoming = mine.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed",
  );
  const nextAppt = upcoming[0] ?? mine[0];
  const rxCount = prescriptions.filter(
    (r) => r.patientId === PATIENT_ID && r.status === "issued",
  ).length;
  const consultCount = consultations.filter(
    (item) => item.patientId === PATIENT_ID && item.status === "finalized",
  ).length;
  const outstanding = invoices
    .filter(
      (invoice) =>
        invoice.patientId === PATIENT_ID &&
        invoice.status !== "cancelled" &&
        invoice.status !== "draft",
    )
    .reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  const record = patient ? getMedicalRecord(patient.id) : null;
  const myDoctors = doctors.filter((doctor) =>
    mine.some((apt) => apt.doctorId === doctor.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Care Overview"
        description={`Welcome back, ${patient?.name || "Ava Thompson"}. ${clinicInfo.demoNotice}`}
      />
      <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Next appointment"
          value={nextAppt ? nextAppt.date : "—"}
          hint={nextAppt ? `${nextAppt.time} · ${nextAppt.doctorName}` : "None in demo"}
          icon={<Calendar className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          title="Prescriptions"
          value={rxCount}
          hint="Issued on your chart"
          icon={<FileText className="h-5 w-5" />}
          tone="teal"
        />
        <StatCard
          title="Consultations"
          value={consultCount}
          hint="Finalized clinical visits"
          icon={<Stethoscope className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          title="Outstanding balance"
          value={formatMoney(outstanding)}
          hint="Your open demo invoices"
          icon={<CreditCard className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/patient/book">
          <Button className="w-full">Book appointment</Button>
        </Link>
        <Link href="/patient/history">
          <Button className="w-full" variant="outline">
            Medical history
          </Button>
        </Link>
        <Link href="/patient/prescriptions">
          <Button className="w-full" variant="outline">
            Prescriptions
          </Button>
        </Link>
        <Link href="/patient/billing">
          <Button className="w-full" variant="outline">
            Bills & invoices
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {nextAppt ? (
          <Card>
            <CardHeader title="Upcoming visit" description="Next on your demo schedule." />
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{nextAppt.doctorName}</p>
                <p className="text-sm text-muted">
                  {nextAppt.date} at {nextAppt.time} · {nextAppt.department}
                </p>
              </div>
              <Badge variant={statusBadgeVariant(nextAppt.status)}>
                {nextAppt.status.replace("-", " ")}
              </Badge>
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardHeader
            title="Medical snapshot"
            description="Allergies and current medications from your chart."
          />
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="text-muted">Allergies:</span>{" "}
              {record?.allergies.join(", ") || "None recorded"}
            </p>
            <p>
              <span className="text-muted">Medications:</span>{" "}
              {record?.currentMedications.join(", ") || "None recorded"}
            </p>
            <p>
              <span className="text-muted">Conditions:</span>{" "}
              {record?.conditions.join(", ") || "None recorded"}
            </p>
            <Link
              href="/patient/history"
              className="inline-block font-medium text-primary hover:underline"
            >
              View full history
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="My doctors" description="Providers linked to your appointments." />
        <CardBody className="grid gap-3 sm:grid-cols-2">
          {myDoctors.length === 0 ? (
            <p className="text-sm text-muted">No linked doctors yet.</p>
          ) : (
            myDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p className="font-medium">{doctor.name}</p>
                <p className="text-muted">
                  {doctor.specialty} · {doctor.department}
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
