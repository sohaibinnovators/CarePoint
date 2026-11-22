"use client";

import { useMemo, useState } from "react";
import { AppointmentBookingForm } from "@/components/management/appointment-booking-form";
import { ConfirmDialog } from "@/components/management/confirm-dialog";
import { EmptyState, StoreLoading } from "@/components/management/empty-state";
import { RescheduleModal } from "@/components/scheduling/reschedule-modal";
import { DataToolbar } from "@/components/dashboard/data-toolbar";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/input";
import { Table, Td } from "@/components/ui/table";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "scheduled", label: "Scheduled" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked-in", label: "Checked in" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function timeRank(time: string) {
  return time;
}

export default function AdminAppointmentsPage() {
  const {
    ready,
    appointments,
    doctors,
    departments,
    updateAppointmentStatus,
  } = useCarePointStore();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = appointments.filter((apt) => {
      const matchesTab = tab === "all" || apt.status === tab;
      const matchesDoctor =
        doctorFilter === "all" || apt.doctorId === doctorFilter;
      const matchesDepartment =
        departmentFilter === "all" || apt.departmentId === departmentFilter;
      const matchesDate = !dateFilter || apt.date === dateFilter;
      const matchesSearch =
        !q ||
        apt.id.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q);
      return (
        matchesTab &&
        matchesDoctor &&
        matchesDepartment &&
        matchesDate &&
        matchesSearch
      );
    });
    return list.sort((a, b) => {
      const da = `${a.date}T${timeRank(a.time)}`;
      const db = `${b.date}T${timeRank(b.time)}`;
      return db.localeCompare(da);
    });
  }, [
    appointments,
    search,
    tab,
    doctorFilter,
    departmentFilter,
    dateFilter,
  ]);

  if (!ready) return <StoreLoading />;

  function setStatus(id: string, status: AppointmentStatus) {
    const updated = updateAppointmentStatus(id, status);
    if (updated) {
      setToast(`Appointment ${updated.id} marked ${status}.`);
      setSelected((prev) => (prev?.id === id ? updated : prev));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Book, filter, and update demo appointments. Shared with receptionist via localStorage."
        actions={
          <Button onClick={() => setBookingOpen(true)}>Book appointment</Button>
        }
      />

      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>
      {toast ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {toast}
        </p>
      ) : null}

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, doctor, or appointment ID…"
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          aria-label="Filter by doctor"
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
          aria-label="Filter by department"
        >
          <option value="all">All departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </Select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by date"
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <Card>
        <CardBody className="p-0">
          <Table
            headers={[
              "ID",
              "Patient",
              "Doctor",
              "Department",
              "Date",
              "Time",
              "Type",
              "Status",
              "Actions",
            ]}
          >
            {filtered.map((apt) => (
              <tr key={apt.id}>
                <Td className="font-mono text-xs">{apt.id}</Td>
                <Td className="font-medium">{apt.patientName}</Td>
                <Td>{apt.doctorName}</Td>
                <Td>{apt.department}</Td>
                <Td>{apt.date}</Td>
                <Td>{apt.time}</Td>
                <Td>
                  {apt.type}
                  <span className="block text-xs text-muted">{apt.visitType}</span>
                </Td>
                <Td>
                  <Badge variant={statusBadgeVariant(apt.status)}>
                    {apt.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(apt)}
                    >
                      View
                    </Button>
                    {apt.status !== "cancelled" && apt.status !== "completed" ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRescheduleTarget(apt)}
                        >
                          Reschedule
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
              title="No appointments match"
              description="Adjust filters or book a new demo appointment."
            />
          ) : null}
        </CardBody>
      </Card>

      <Modal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book appointment"
        description="Creates a demo appointment stored in localStorage."
        className="max-w-3xl"
      >
        <AppointmentBookingForm
          onBooked={(apt) => {
            setToast(`Booked ${apt.id} for ${apt.patientName}.`);
            setBookingOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.id : "Appointment"}
        description="Demo appointment detail"
        className="max-w-xl"
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted">Patient</dt>
                <dd className="font-medium">{selected.patientName}</dd>
              </div>
              <div>
                <dt className="text-muted">Doctor</dt>
                <dd className="font-medium">{selected.doctorName}</dd>
              </div>
              <div>
                <dt className="text-muted">Department</dt>
                <dd className="font-medium">{selected.department}</dd>
              </div>
              <div>
                <dt className="text-muted">When</dt>
                <dd className="font-medium">
                  {selected.date} · {selected.time}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Type</dt>
                <dd className="font-medium">
                  {selected.type} ({selected.visitType})
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
              <div className="sm:col-span-2">
                <dt className="text-muted">Reason</dt>
                <dd className="font-medium">{selected.reason || "—"}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "pending",
                  "confirmed",
                  "checked-in",
                  "completed",
                  "cancelled",
                ] as AppointmentStatus[]
              ).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={selected.status === status ? "primary" : "outline"}
                  onClick={() => {
                    if (status === "cancelled") {
                      setCancelTarget(selected);
                      return;
                    }
                    setStatus(selected.id, status);
                  }}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel appointment?"
        message={
          cancelTarget
            ? `Cancel ${cancelTarget.id} for ${cancelTarget.patientName}? This keeps the record with cancelled status and releases the slot.`
            : ""
        }
        confirmLabel="Cancel appointment"
        danger
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          setStatus(cancelTarget.id, "cancelled");
          setCancelTarget(null);
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
    </div>
  );
}
