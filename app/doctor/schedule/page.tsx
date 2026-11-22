"use client";

import { useMemo, useState } from "react";
import { AvailabilityEditor } from "@/components/scheduling/availability-editor";
import { SlotPicker } from "@/components/scheduling/slot-picker";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useCarePointStore } from "@/lib/carepoint-store";
import { describeSchedule, generateDaySlots } from "@/lib/scheduling";
import { clinicTodayIso } from "@/lib/time";
import { clinicInfo } from "@/lib/mock-data";

const DEFAULT_DOCTOR_ID = "dr-elena-hayes";

export default function DoctorSchedulePage() {
  const {
    ready,
    doctors,
    appointments,
    getDoctorSchedule,
    upsertDoctorSchedule,
  } = useCarePointStore();
  const [doctorId, setDoctorId] = useState(DEFAULT_DOCTOR_ID);
  const [previewDate, setPreviewDate] = useState(clinicTodayIso());

  const schedule = useMemo(
    () => getDoctorSchedule(doctorId),
    [getDoctorSchedule, doctorId],
  );

  const slots = useMemo(
    () =>
      generateDaySlots({
        schedule,
        date: previewDate,
        appointments,
        doctorId,
      }),
    [schedule, previewDate, appointments, doctorId],
  );

  if (!ready) return <StoreLoading />;

  const doctor = doctors.find((d) => d.id === doctorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule / Availability"
        description="Configure working days, hours, breaks, and unavailable dates. Saved in localStorage."
      />
      <p className="text-sm text-muted">{clinicInfo.demoNotice}</p>

      <Card>
        <CardHeader
          title="Doctor"
          description="Admins and doctors can edit any demo schedule in this Phase 3 UI."
          action={
            <Select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-56"
            >
              {doctors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          }
        />
        <CardBody className="space-y-2">
          <p className="text-sm font-medium">{doctor?.name}</p>
          <p className="text-sm text-muted">{describeSchedule(schedule)}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Edit availability" />
        <CardBody>
          <AvailabilityEditor
            schedule={schedule}
            onSave={(input) => upsertDoctorSchedule(doctorId, input)}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Slot preview"
          description="Dynamic slots for the selected date using live appointments."
          action={
            <input
              type="date"
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
              className="h-9 rounded-lg border border-border px-2 text-sm"
            />
          }
        />
        <CardBody>
          <SlotPicker slots={slots} value="" onChange={() => {}} />
        </CardBody>
      </Card>
    </div>
  );
}
