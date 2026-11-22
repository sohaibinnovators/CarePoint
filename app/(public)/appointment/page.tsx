"use client";

import { AppointmentBookingForm } from "@/components/management/appointment-booking-form";
import { StoreLoading } from "@/components/management/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";

export default function AppointmentPage() {
  const { ready } = useCarePointStore();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-secondary">Scheduling</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Book an Appointment
      </h1>
      <p className="mt-3 text-muted">
        Complete the demo booking form below. {clinicInfo.demoNotice}
      </p>
      <Card className="mt-8">
        <CardBody>
          {!ready ? <StoreLoading /> : <AppointmentBookingForm />}
        </CardBody>
      </Card>
    </div>
  );
}
