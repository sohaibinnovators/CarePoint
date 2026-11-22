import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { getServiceImage } from "@/lib/media";
import { getServiceById, services } from "@/lib/mock-data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return services.map((service) => ({ id: service.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = getServiceById(id);
  return { title: service?.name ?? "Service Details" };
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = getServiceById(id);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-[16/8] min-h-48">
              <Image
                src={getServiceImage(service.id)}
                alt={`${service.name} demo photo`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />
            </div>
          </div>
          <p className="text-sm font-semibold text-secondary">
            {service.category}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {service.name}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            {service.description}
          </p>
          <ul className="mt-8 space-y-3">
            {service.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <Card className="h-fit">
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold">Service summary</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Duration:</span> {service.duration}
              </p>
              <p>
                <span className="text-muted">Demo price:</span> {service.price}
              </p>
              <p>
                <span className="text-muted">Category:</span> {service.category}
              </p>
            </div>
            <Link href="/appointment">
              <Button className="w-full">Book this service</Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="w-full">
                Back to services
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
