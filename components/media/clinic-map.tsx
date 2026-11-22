import { MapPin } from "lucide-react";
import { clinicMap } from "@/lib/media";
import { clinicInfo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ClinicMap({
  className,
  heightClass = "min-h-56",
}: {
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white",
        className,
      )}
    >
      <div className={cn("relative w-full", heightClass)}>
        <iframe
          title="CarePoint demo clinic location map"
          src={clinicMap.embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">{clinicMap.label}</p>
            <p className="text-muted">{clinicInfo.address}</p>
            <p className="mt-1 text-xs text-muted">
              Dummy demo map — not a live clinic location.
            </p>
          </div>
        </div>
        <a
          href={clinicMap.openUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          Open map
        </a>
      </div>
    </div>
  );
}
