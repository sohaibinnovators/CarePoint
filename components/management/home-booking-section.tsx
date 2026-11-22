"use client";

import { AppointmentBookingForm } from "@/components/management/appointment-booking-form";
import { StoreLoading } from "@/components/management/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";

export function HomeBookingSection() {
  const { ready } = useCarePointStore();
  return (
    <Card>
      <CardBody>{!ready ? <StoreLoading /> : <AppointmentBookingForm />}</CardBody>
    </Card>
  );
}
