"use client";

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
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "scheduled", label: "Scheduled" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked-in", label: "Checked in" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUSES: AppointmentStatus[] = [
  "pending",
  "scheduled",
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
];

export default function ReceptionistAppointmentsPage() {
  const { ready, appointments, updateAppointmentStatus } = useCarePointStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [detailOpen, setDetailOpen] = useState<Appointment | null>(null);
  const [statusModal, setStatusModal] = useState<Appointment | null>(null);
  const [nextStatus, setNextStatus] = useState<AppointmentStatus>("confirmed");
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesTab = tab === "all" || apt.status === tab;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q) ||
        apt.id.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [appointments, search, tab]);

  function openStatusModal(apt: Appointment) {
    setStatusModal(apt);
    setNextStatus(apt.status);
  }

  function saveStatus() {
    if (!statusModal) return;
    updateAppointmentStatus(statusModal.id, nextStatus);
    setToast(`Status updated to ${nextStatus.replace("-", " ")}.`);
    setStatusModal(null);
  }

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Manage Appointments"
        description="Review and update appointment status. Shared with admin via the demo store."
      />

      {toast ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <DataToolbar
            tabs={STATUS_TABS}
            activeTab={tab}
            onTabChange={setTab}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search patient, doctor, department, or ID…"
          />
          {filtered.length === 0 ? (
            <EmptyState
              title="No appointments match"
              description="Try another filter or book a new visit from the front desk."
            />
          ) : (
            <Table
              headers={[
                "Date",
                "Time",
                "Patient",
                "Doctor",
                "Department",
                "Status",
                "Actions",
              ]}
            >
              {filtered.map((apt) => (
                <tr key={apt.id}>
                  <Td>{apt.date}</Td>
                  <Td>{apt.time}</Td>
                  <Td className="font-medium">{apt.patientName}</Td>
                  <Td>{apt.doctorName}</Td>
                  <Td>{apt.department}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(apt.status)}>
                      {apt.status.replace("-", " ")}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailOpen(apt)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusModal(apt)}
                        disabled={apt.status === "cancelled"}
                      >
                        Status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRescheduleTarget(apt)}
                        disabled={
                          apt.status === "cancelled" ||
                          apt.status === "completed"
                        }
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingCancel(apt)}
                        disabled={apt.status === "cancelled"}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
        </CardBody>
      </Card>

      <Modal
        open={detailOpen !== null}
        onClose={() => setDetailOpen(null)}
        title="Appointment details"
        description={detailOpen ? `ID ${detailOpen.id}` : undefined}
        className="max-w-lg"
      >
        {detailOpen ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Patient", detailOpen.patientName],
              ["Doctor", detailOpen.doctorName],
              ["Department", detailOpen.department],
              ["Date", detailOpen.date],
              ["Time", detailOpen.time],
              ["Type", detailOpen.type],
              ["Visit", detailOpen.visitType],
              ["Status", detailOpen.status.replace("-", " ")],
              ["Reason", detailOpen.reason || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className={label === "Reason" ? "sm:col-span-2" : undefined}
              >
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={statusModal !== null}
        onClose={() => setStatusModal(null)}
        title="Update appointment status"
        description={
          statusModal
            ? `${statusModal.patientName} · ${statusModal.date} ${statusModal.time}`
            : undefined
        }
      >
        <Select
          value={nextStatus}
          onChange={(e) =>
            setNextStatus(e.target.value as AppointmentStatus)
          }
          aria-label="Appointment status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("-", " ")}
            </option>
          ))}
        </Select>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setStatusModal(null)}>
            Close
          </Button>
          <Button onClick={saveStatus}>Save status</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancel appointment?"
        message={
          pendingCancel
            ? `Cancel ${pendingCancel.patientName}'s visit on ${pendingCancel.date} at ${pendingCancel.time}? The slot will reopen in the shared demo store.`
            : ""
        }
        confirmLabel="Cancel appointment"
        danger
        onClose={() => setPendingCancel(null)}
        onConfirm={() => {
          if (!pendingCancel) return;
          updateAppointmentStatus(pendingCancel.id, "cancelled");
          setToast(
            `Cancelled appointment for ${pendingCancel.patientName}.`,
          );
          setPendingCancel(null);
        }}
      />

      <RescheduleModal
        appointment={rescheduleTarget}
        open={rescheduleTarget !== null}
        onClose={() => setRescheduleTarget(null)}
        onDone={(apt) =>
          setToast(`Rescheduled ${apt.id} to ${apt.date} ${apt.time}.`)
        }
      />
    </>
  );
}