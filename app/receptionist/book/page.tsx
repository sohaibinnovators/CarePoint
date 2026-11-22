"use client";

import { AppointmentBookingForm } from "@/components/management/appointment-booking-form";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";

export default function ReceptionistBookPage() {
  const { ready } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Book Appointment"
        description="Schedule a visit using live patients, doctors, and departments from the demo store."
      />
      <Card>
        <CardHeader
          title="Appointment request"
          description={clinicInfo.demoNotice}
        />
        <CardBody>
          <AppointmentBookingForm />
        </CardBody>
      </Card>
    </>
  );
}