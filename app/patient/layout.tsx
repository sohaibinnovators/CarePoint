import type { Metadata } from "next";
import { PatientShell } from "./patient-shell";

export const metadata: Metadata = {
  title: "Patient Portal",
  robots: { index: false, follow: false },
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientShell>{children}</PatientShell>;
}
