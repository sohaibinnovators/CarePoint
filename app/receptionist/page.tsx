"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Calendar,
  ClipboardCheck,
  CreditCard,
  Users,
} from "lucide-react";
import { formatMoney } from "@/lib/billing";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import { clinicTodayIso } from "@/lib/validation";

export default function ReceptionistOverviewPage() {
  const { ready, appointments, stats, billingSummary } = useCarePointStore();
  const todayIso = clinicTodayIso();

  const today = useMemo(
    () =>
      appointments
        .filter((a) => a.date === todayIso)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, todayIso],
  );

  const queue = useMemo(
    () =>
      today.filter(
        (a) =>
          a.status === "confirmed" ||
          a.status === "checked-in" ||
          a.status === "pending" ||
          a.status === "scheduled",
      ),
    [today],
  );

  const checkIns = useMemo(
    () => today.filter((a) => a.status === "checked-in"),
    [today],
  );

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Front Desk Overview"
        description={`Today's operations for ${clinicInfo.name}. ${clinicInfo.demoNotice}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's appointments"
          value={stats.todaysAppointments}
          hint={`All departments · ${todayIso}`}
          icon={<Calendar className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          title="Queue length"
          value={queue.length}
          hint="Pending arrival or in lobby"
          icon={<Users className="h-5 w-5" />}
          tone="teal"
        />
        <StatCard
          title="Checked in"
          value={checkIns.length}
          hint="Ready for provider"
          icon={<ClipboardCheck className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          title="Outstanding balances"
          value={formatMoney(billingSummary.pendingPayments)}
          hint={`${billingSummary.overdueInvoices} overdue invoices`}
          icon={<CreditCard className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/receptionist/register">
          <Button>Register patient</Button>
        </Link>
        <Link href="/receptionist/book">
          <Button variant="outline">Book appointment</Button>
        </Link>
        <Link href="/receptionist/billing">
          <Button variant="outline">Billing</Button>
        </Link>
        <Link href="/receptionist/queue">
          <Button variant="outline">Open queue</Button>
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Today's appointment list"
          description="Live schedule from the shared demo store (localStorage)."
        />
        <CardBody className="p-0">
          {today.length === 0 ? (
            <EmptyState
              title="No appointments today"
              description="Book a visit or pick another date in the calendar."
            />
          ) : (
            <Table headers={["Time", "Patient", "Doctor", "Department", "Status"]}>
              {today.map((apt) => (
                <tr key={apt.id}>
                  <Td>{apt.time}</Td>
                  <Td className="font-medium">{apt.patientName}</Td>
                  <Td>{apt.doctorName}</Td>
                  <Td>{apt.department}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status.replace("-", " ")}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
}