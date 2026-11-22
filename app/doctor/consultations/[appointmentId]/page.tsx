import { DoctorConsultationClient } from "./consultation-client";
import { seedAppointments } from "@/lib/seed-data";

export function generateStaticParams() {
  return seedAppointments.map((apt) => ({ appointmentId: apt.id }));
}

export default async function DoctorConsultationPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  return <DoctorConsultationClient appointmentId={appointmentId} />;
}
