"use client";

import { CarePointProvider } from "@/lib/carepoint-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CarePointProvider>{children}</CarePointProvider>;
}
