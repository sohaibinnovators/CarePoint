"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import type { TimelineEvent } from "@/lib/types";

export function ClinicalTimeline({
  events,
  doctorLinks = false,
}: {
  events: TimelineEvent[];
  doctorLinks?: boolean;
}) {
  if (!events.length) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
        No clinical timeline events yet for this demo patient.
      </p>
    );
  }

  return (
    <div className="relative space-y-4 border-l-2 border-border pl-6">
      {events.map((event) => (
        <Card key={event.id} className="relative">
          <span className="absolute top-5 -left-[1.9rem] h-3 w-3 rounded-full border-2 border-primary bg-white" />
          <CardBody className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                {event.type}
              </p>
              <p className="text-xs text-muted">{event.date}</p>
            </div>
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-muted">{event.detail}</p>
            {event.doctorName ? (
              <p className="text-xs text-muted">Doctor: {event.doctorName}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              {doctorLinks && event.appointmentId ? (
                <Link
                  href={`/doctor/consultations/${event.appointmentId}`}
                  className="font-medium text-primary hover:underline"
                >
                  Open consultation
                </Link>
              ) : null}
              {doctorLinks && event.prescriptionId ? (
                <Link
                  href={`/doctor/prescriptions/${event.prescriptionId}`}
                  className="font-medium text-primary hover:underline"
                >
                  View prescription
                </Link>
              ) : null}
              {!doctorLinks && event.prescriptionId ? (
                <Link
                  href="/patient/prescriptions"
                  className="font-medium text-primary hover:underline"
                >
                  View prescriptions
                </Link>
              ) : null}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
