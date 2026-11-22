import { clinicInfo } from "@/lib/mock-data";

export function DemoBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
      {clinicInfo.demoNotice}
    </div>
  );
}
