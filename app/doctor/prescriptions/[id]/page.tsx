import { DoctorPrescriptionDetailClient } from "./prescription-detail-client";
import { seedPrescriptions } from "@/lib/seed-data";

export function generateStaticParams() {
  return seedPrescriptions.map((rx) => ({ id: rx.id }));
}

export default async function DoctorPrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorPrescriptionDetailClient prescriptionId={id} />;
}
