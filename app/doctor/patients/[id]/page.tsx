import { DoctorPatientChartClient } from "./patient-chart-client";
import { seedPatients } from "@/lib/seed-data";

export function generateStaticParams() {
  return seedPatients.map((p) => ({ id: p.id }));
}

export default async function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorPatientChartClient patientId={id} />;
}
