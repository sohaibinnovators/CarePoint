"use client";

import { useMemo, useState } from "react";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Appointment, Department, Doctor } from "@/lib/types";
import {
  addDaysIso,
  clinicTodayIso,
  daysInMonth,
  startOfMonthIso,
  startOfWeekIso,
  weekdayFromIso,
  weekdayLabel,
} from "@/lib/time";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";

export function AppointmentCalendar({
  appointments,
  doctors,
  departments,
  onSelect,
}: {
  appointments: Appointment[];
  doctors: Doctor[];
  departments: Department[];
  onSelect?: (appointment: Appointment) => void;
}) {
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(clinicTodayIso());
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDoctor =
        doctorFilter === "all" || apt.doctorId === doctorFilter;
      const matchesDepartment =
        departmentFilter === "all" || apt.departmentId === departmentFilter;
      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;
      return matchesDoctor && matchesDepartment && matchesStatus;
    });
  }, [appointments, doctorFilter, departmentFilter, statusFilter]);

  const days = useMemo(() => {
    if (view === "day") return [anchor];
    if (view === "week") {
      const start = startOfWeekIso(anchor);
      return Array.from({ length: 7 }, (_, i) => addDaysIso(start, i));
    }
    const monthStart = startOfMonthIso(anchor);
    const count = daysInMonth(monthStart);
    return Array.from({ length: count }, (_, i) => addDaysIso(monthStart, i));
  }, [view, anchor]);

  function shift(delta: number) {
    if (view === "day") setAnchor((value) => addDaysIso(value, delta));
    else if (view === "week") setAnchor((value) => addDaysIso(value, delta * 7));
    else setAnchor((value) => addDaysIso(startOfMonthIso(value), delta * 30));
  }

  function openAppointment(apt: Appointment) {
    setSelected(apt);
    onSelect?.(apt);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={view === mode ? "primary" : "outline"}
              onClick={() => setView(mode)}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => shift(-1)}>
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAnchor(clinicTodayIso())}
          >
            Today
          </Button>
          <Button size="sm" variant="outline" onClick={() => shift(1)}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked in</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <div
        className={cn(
          "grid gap-3",
          view === "day" && "grid-cols-1",
          view === "week" && "md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7",
          view === "month" && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {days.map((date) => {
          const weekday = weekdayFromIso(date);
          const items = filtered
            .filter((apt) => apt.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <Card
              key={date}
              className={cn(
                date === clinicTodayIso() && "border-primary/40",
              )}
            >
              <CardHeader
                title={date}
                description={
                  weekday !== null
                    ? `${weekdayLabel(weekday)} · ${items.length} visit${items.length === 1 ? "" : "s"}`
                    : undefined
                }
              />
              <CardBody className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">No appointments</p>
                ) : (
                  items.map((apt) => (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => openAppointment(apt)}
                      className="w-full rounded-lg border border-border bg-slate-50/70 px-3 py-2 text-left transition hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{apt.time}</p>
                          <p className="text-xs text-foreground">
                            {apt.patientName}
                          </p>
                          <p className="text-xs text-muted">{apt.doctorName}</p>
                        </div>
                        <Badge variant={statusBadgeVariant(apt.status)}>
                          {apt.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">
                        {apt.type} · {apt.visitType}
                      </p>
                    </button>
                  ))
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.id ?? "Appointment"}
        description="Demo appointment detail"
      >
        {selected ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Patient</dt>
              <dd className="font-medium">{selected.patientName}</dd>
            </div>
            <div>
              <dt className="text-muted">Doctor</dt>
              <dd className="font-medium">{selected.doctorName}</dd>
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
            <div className="sm:col-span-2">
              <dt className="text-muted">Type</dt>
              <dd className="font-medium">
                {selected.type} ({selected.visitType}) · {selected.durationMinutes}{" "}
                min
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Reason</dt>
              <dd className="font-medium">{selected.reason || "—"}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
