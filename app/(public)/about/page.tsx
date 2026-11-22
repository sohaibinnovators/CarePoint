import Image from "next/image";
import Link from "next/link";
import { ClinicMap } from "@/components/media/clinic-map";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { clinicImages } from "@/lib/media";
import { clinicInfo, departments } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Clinic",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">About CarePoint</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight">
            A clinic experience designed for clarity and coordinated care
          </h1>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
            CarePoint is a frontend demonstration of a modern clinic management
            system. The public site and role-based dashboards showcase layouts,
            navigation, and workflows using fictional sample data only.
          </p>
        </div>
        <div className="relative min-h-64 overflow-hidden rounded-2xl border border-border">
          <Image
            src={clinicImages.about}
            alt="CarePoint demo clinic hallway"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 560px"
            priority
          />
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Our mission",
            body: "Make clinic operations feel calm, professional, and easy to navigate for patients and staff.",
          },
          {
            title: "Our approach",
            body: "Clean interfaces, realistic workflows, and role-specific tools without clutter or noise.",
          },
          {
            title: "Our promise",
            body: "Demo content is labeled clearly. No real patient records or clinical systems are connected.",
          },
        ].map((item) => (
          <Card key={item.title}>
            <CardBody>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="mt-14">
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-border">
          <div className="relative aspect-[21/8] min-h-40">
            <Image
              src={clinicImages.reception}
              alt="CarePoint demo reception area"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-slate-950/35" />
            <div className="absolute inset-0 flex items-end p-6">
              <h2 className="text-2xl font-semibold text-white">Departments</h2>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted">
          Sample specialty groups used across the demo experience.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardBody>
                <h3 className="font-semibold">{dept.name}</h3>
                <p className="mt-2 text-sm text-muted">{dept.description}</p>
                <p className="mt-4 text-xs text-muted">
                  {dept.doctors} doctors · {dept.patients} demo patients
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Visit information</h2>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <p>{clinicInfo.address}</p>
            <p>{clinicInfo.hours}</p>
            <p>{clinicInfo.phone}</p>
            <p>{clinicInfo.email}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/appointment">
              <Button>Book Appointment</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
        <ClinicMap heightClass="min-h-64" />
      </section>
    </div>
  );
}
