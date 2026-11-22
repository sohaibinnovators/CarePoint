"use client";

import { AppointmentBookingForm } from "@/components/management/appointment-booking-form";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";

export default function PatientBookPage() {
  const { ready } = useCarePointStore();

  if (!ready) return <StoreLoading />;

  return (
    <>
      <PageHeader
        title="Book Appointment"
        description={`Request a visit using the shared demo registry. ${clinicInfo.demoNotice}`}
      />
      <Card>
        <CardBody>
          <AppointmentBookingForm />
        </CardBody>
      </Card>
    </>
  );
}
