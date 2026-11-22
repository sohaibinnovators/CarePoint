import type { Metadata } from "next";
import { DoctorShell } from "./doctor-shell";

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  robots: { index: false, follow: false },
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorShell>{children}</DoctorShell>;
}
