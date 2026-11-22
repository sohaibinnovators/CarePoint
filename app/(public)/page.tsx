import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { HomeBookingSection } from "@/components/management/home-booking-section";
import { ClinicMap } from "@/components/media/clinic-map";
import { DoctorPhoto } from "@/components/media/doctor-photo";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { clinicImages, getServiceImage } from "@/lib/media";
import {
  clinicInfo,
  doctors,
  services,
  testimonials,
  whyChoose,
} from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src={clinicImages.hero}
            alt="CarePoint demo clinic interior"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,23,42,0.88)_0%,rgba(15,23,42,0.72)_45%,rgba(37,99,235,0.45)_100%)]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold tracking-wide text-teal-200">
              CarePoint
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Better Care. Smarter Management.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
              A premium clinic management experience for appointments, care
              teams, and patient journeys — a frontend portfolio clinic CMS demo
              with clearly labeled demo content.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment">
                <Button size="lg">
                  Book Appointment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  Meet Our Doctors
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-200" />
                Role-based dashboards
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-teal-200" />
                Streamlined booking
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-200" />
                Patient-first workflows
              </span>
            </div>
          </div>
          <div className="relative hidden overflow-hidden rounded-2xl border border-white/20 shadow-lg lg:block">
            <div className="relative aspect-[4/3]">
              <Image
                src={clinicImages.careTeam}
                alt="Demo CarePoint clinical care team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                  Clinic operations
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Calm, clear care coordination
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-secondary">About the clinic</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Modern care with an organized front desk and clinical team
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              CarePoint demonstrates how a contemporary clinic can present
              services, doctors, and booking in one polished experience while
              giving staff role-specific dashboards for daily work.
            </p>
            <Link href="/about" className="mt-6 inline-flex">
              <Button variant="outline">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-border shadow-sm">
            <Image
              src={clinicImages.lobby}
              alt="CarePoint demo clinic lobby"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Demo patients", value: "1,284+" },
            { label: "Demo clinicians", value: "28" },
            { label: "Specialties", value: "6" },
            { label: "Avg. rating", value: "4.8" },
          ].map((item) => (
            <Card key={item.label}>
              <CardBody>
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted">{item.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Services</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Medical services & specialties
              </h2>
            </div>
            <Link href="/services" className="hidden sm:inline-flex">
              <Button variant="ghost">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <Card className="h-full overflow-hidden transition hover:border-primary/30">
                  <div className="relative h-40">
                    <Image
                      src={getServiceImage(service.id)}
                      alt={`${service.name} demo illustration`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardBody>
                    <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                      {service.category}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <p className="mt-4 text-sm font-medium text-primary">
                      {service.price} · {service.duration}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-secondary">Care team</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Featured doctors
            </h2>
          </div>
          <Link href="/doctors" className="hidden sm:inline-flex">
            <Button variant="ghost">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 3).map((doctor) => (
            <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
              <Card className="h-full transition hover:border-primary/30">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <DoctorPhoto
                      doctorId={doctor.id}
                      name={doctor.name}
                      initials={doctor.imageInitials}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-muted">{doctor.specialty}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {doctor.bio}
                  </p>
                  <p className="mt-4 text-sm text-foreground">
                    {doctor.experience} experience · Rating {doctor.rating}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-light-blue/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Why Choose CarePoint
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-xl border border-border bg-white p-5"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-primary">Appointments</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Book a visit in a few steps
            </h2>
            <p className="mt-3 text-muted">
              Use the demo booking form to create appointments stored in this
              browser via localStorage.
            </p>
            <div className="relative mt-6 hidden min-h-48 overflow-hidden rounded-2xl border border-border lg:block">
              <Image
                src={clinicImages.reception}
                alt="CarePoint demo reception desk"
                fill
                className="object-cover"
                sizes="560px"
              />
            </div>
          </div>
          <HomeBookingSection />
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Patient testimonials
          </h2>
          <p className="mt-2 text-sm text-muted">
            Clearly identified demo content — not real patient reviews.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id}>
                <CardBody>
                  <p className="text-sm leading-relaxed text-foreground">
                    “{item.quote}”
                  </p>
                  <p className="mt-4 font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">{item.role}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 rounded-2xl border border-border bg-white p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Contact & location
            </h2>
            <p className="mt-3 text-muted">{clinicInfo.demoNotice}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                {clinicInfo.phone}
              </li>
              <li className="text-muted">{clinicInfo.address}</li>
              <li className="text-muted">{clinicInfo.hours}</li>
            </ul>
            <Link href="/contact" className="mt-6 inline-flex">
              <Button>Contact CarePoint</Button>
            </Link>
          </div>
          <ClinicMap heightClass="min-h-64" />
        </div>
      </section>
    </>
  );
}
