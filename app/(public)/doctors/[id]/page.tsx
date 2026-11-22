import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorPhoto } from "@/components/media/doctor-photo";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardBody } from "@/components/ui/card";
import { clinicImages } from "@/lib/media";
import { doctors, getDoctorById } from "@/lib/mock-data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return doctors.map((doctor) => ({ id: doctor.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = getDoctorById(id);
  return { title: doctor?.name ?? "Doctor Profile" };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = getDoctorById(id);
  if (!doctor) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          { label: doctor.name },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-[21/9]">
              <Image
                src={clinicImages.about}
                alt="CarePoint clinic corridor demo photo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <DoctorPhoto
              doctorId={doctor.id}
              name={doctor.name}
              initials={doctor.imageInitials}
              size="xl"
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {doctor.name}
              </h1>
              <p className="text-secondary">{doctor.specialty}</p>
              <p className="mt-1 text-sm text-muted">{doctor.department}</p>
            </div>
          </div>
          <p className="mt-6 leading-relaxed text-muted">{doctor.bio}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Department", doctor.department],
              ["Experience", doctor.experience],
              ["Education", doctor.education],
              ["Availability", doctor.availability],
              ["Demo patients", String(doctor.patients)],
              ["Rating", `${doctor.rating} / 5`],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardBody>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-1 font-medium">{value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
        <Card className="h-fit overflow-hidden">
          <DoctorPhoto
            doctorId={doctor.id}
            name={doctor.name}
            initials={doctor.imageInitials}
            size="hero"
            className="rounded-none"
          />
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold">Book with {doctor.name}</h2>
            <p className="text-sm text-muted">
              Continue to the demo appointment form. No real scheduling occurs.
            </p>
            <p className="text-sm">
              <span className="text-muted">Email:</span> {doctor.email}
            </p>
            <p className="text-sm">
              <span className="text-muted">Phone:</span> {doctor.phone}
            </p>
            <Link href="/appointment">
              <Button className="w-full">Book Appointment</Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" className="w-full">
                Back to doctors
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
