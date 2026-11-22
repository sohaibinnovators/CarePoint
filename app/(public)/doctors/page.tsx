import Link from "next/link";
import { DoctorPhoto } from "@/components/media/doctor-photo";
import { Card, CardBody } from "@/components/ui/card";
import { doctors } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Doctors",
};

export default function DoctorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-secondary">Care team</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Our Doctors</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Browse fictional clinician profiles used to demonstrate CarePoint’s
        public website and doctor dashboard experiences.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
            <Card className="h-full overflow-hidden transition hover:border-primary/30">
              <DoctorPhoto
                doctorId={doctor.id}
                name={doctor.name}
                initials={doctor.imageInitials}
                size="hero"
                className="rounded-none"
              />
              <CardBody>
                <h2 className="text-lg font-semibold">{doctor.name}</h2>
                <p className="text-sm text-secondary">{doctor.specialty}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {doctor.bio}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{doctor.experience}</span>
                  <span className="font-medium text-primary">
                    {doctor.rating} ★
                  </span>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
