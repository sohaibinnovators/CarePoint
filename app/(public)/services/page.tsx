import Image from "next/image";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { getServiceImage } from "@/lib/media";
import { services } from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-primary">Care offerings</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Our Services</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Explore sample medical services used throughout the CarePoint demo.
        Prices and durations are fictional.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link key={service.id} href={`/services/${service.id}`}>
            <Card className="h-full overflow-hidden transition hover:border-primary/30">
              <div className="relative h-44">
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
                <h2 className="mt-2 text-lg font-semibold">{service.name}</h2>
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
  );
}
