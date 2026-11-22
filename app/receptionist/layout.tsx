import type { Metadata } from "next";
import { ReceptionistShell } from "./receptionist-shell";

export const metadata: Metadata = {
  title: "Receptionist Dashboard",
  robots: { index: false, follow: false },
};

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReceptionistShell>{children}</ReceptionistShell>;
}
