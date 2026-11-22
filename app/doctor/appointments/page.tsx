"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { RescheduleModal } from "@/components/scheduling/reschedule-modal";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { DataToolbar } from "@/components/dashboard/data-toolbar";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { isConsultationEligible } from "@/lib/clinical";
import { clinicInfo } from "@/lib/mock-data";
import type { Appointment } from "@/lib/types";

const DOCTOR_ID = "dr-elena-hayes";

export default function DoctorAppointmentsPage() {
  const {
    ready,
    appointments,
    updateAppointmentStatus,
  } = useCarePointStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => a.doctorId === DOCTOR_ID)
      .filter((a) => {
        const matchesSearch =
          !search.trim() ||
          a.patientName.toLowerCase().includes(search.toLowerCase()) ||
          a.department.toLowerCase().includes(search.toLowerCase()) ||
          a.type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [appointments, search, statusFilter]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="Live schedule for Dr. Elena Hayes from the shared demo store."
      />
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <DataToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search patients, department, type…"
            filter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={[
              { label: "All statuses", value: "all" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Checked in", value: "checked-in" },
              { label: "Pending", value: "pending" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
          <Table
            headers={[
              "Date",
              "Time",
              "Patient",
              "Type",
              "Status",
              "Actions",
            ]}
          >
            {filtered.map((apt) => (
              <tr key={apt.id}>
                <Td>{apt.date}</Td>
                <Td>{apt.time}</Td>
                <Td className="font-medium">{apt.patientName}</Td>
                <Td>
                  {apt.type}
                  <span className="block text-xs text-muted">
                    {apt.durationMinutes} min
                  </span>
                </Td>
                <Td>
                  <Badge variant={statusBadgeVariant(apt.status)}>
                    {apt.status.replace("-", " ")}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(apt)}>
                      View
                    </Button>
                    {isConsultationEligible(apt) ? (
                      <Link href={`/doctor/consultations/${apt.id}`}>
                        <Button size="sm" variant="ghost">
                          Consult
                        </Button>
                      </Link>
                    ) : null}
                    {apt.status !== "cancelled" && apt.status !== "completed" ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReschedule(apt)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateAppointmentStatus(apt.id, "completed")
                          }
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCancelTarget(apt)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          {filtered.length === 0 ? (
            <EmptyState
              title="No appointments"
              description="Nothing matches this filter for your demo roster."
            />
          ) : null}
          <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
        </CardBody>
      </Card>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Appointment"}
      >
        {selected ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Patient</dt>
              <dd className="font-medium">{selected.patientName}</dd>
            </div>
            <div>
              <dt className="text-muted">When</dt>
              <dd className="font-medium">
                {selected.date} · {selected.time}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Status</dt>
              <dd>
                <Badge variant={statusBadgeVariant(selected.status)}>
                  {selected.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="font-medium">
                {selected.type} ({selected.visitType})
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Reason</dt>
              <dd className="font-medium">{selected.reason || "—"}</dd>
            </div>
            {isConsultationEligible(selected) ? (
              <div className="sm:col-span-2">
                <Link href={`/doctor/consultations/${selected.id}`}>
                  <Button size="sm">Open consultation workspace</Button>
                </Link>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Modal>

      <RescheduleModal
        appointment={reschedule}
        open={reschedule !== null}
        onClose={() => setReschedule(null)}
        onDone={(apt) => setToast(`Rescheduled ${apt.id} to ${apt.date} ${apt.time}.`)}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel appointment?"
        message={
          cancelTarget
            ? `Cancel ${cancelTarget.id}? The slot will become available again.`
            : ""
        }
        confirmLabel="Cancel appointment"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          updateAppointmentStatus(cancelTarget.id, "cancelled");
          setToast(`Cancelled ${cancelTarget.id}.`);
        }}
      />
    </div>
  );
}
