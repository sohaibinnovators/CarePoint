"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StoreLoading } from "@/components/management/empty-state";
import { PageHeader } from "@/components/layout/dashboard-shell";
import { DoctorPhoto } from "@/components/media/doctor-photo";
import { Card, CardBody } from "@/components/ui/card";
import { useCarePointStore } from "@/lib/carepoint-store";
import { clinicInfo } from "@/lib/mock-data";
import { Star } from "lucide-react";

const PATIENT_ID = "pt-1001";

export default function PatientDoctorsPage() {
  const { ready, appointments, doctors } = useCarePointStore();

  const myDoctors = useMemo(() => {
    const doctorIds = new Set(
      appointments
        .filter((apt) => apt.patientId === PATIENT_ID)
        .map((apt) => apt.doctorId),
    );
    return doctors.filter((doctor) => doctorIds.has(doctor.id));
  }, [appointments, doctors]);

  if (!ready) return <StoreLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Doctors"
        description="Providers linked to your demo appointments."
      />

      {myDoctors.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No doctors linked yet. Book an appointment to build your care team.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <DoctorPhoto
                    doctorId={doctor.id}
                    name={doctor.name}
                    initials={doctor.imageInitials}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                    <p className="text-sm text-muted">{doctor.specialty}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {doctor.rating} rating · {doctor.availability}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted">{doctor.bio}</p>
                <Link
                  href={`/doctors/${doctor.id}`}
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  View public profile →
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-muted">{clinicInfo.demoNotice}</p>
    </div>
  );
}
