import Link from "next/link";
import { Cross } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  light = false,
}: {
  href?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          light ? "bg-white/15 text-white" : "bg-primary text-white",
        )}
      >
        <Cross className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-lg font-semibold tracking-tight",
            light ? "text-white" : "text-foreground",
          )}
        >
          CarePoint
        </span>
        <span
          className={cn(
            "block text-[11px]",
            light ? "text-slate-300" : "text-muted",
          )}
        >
          Clinic Management
        </span>
      </span>
    </Link>
  );
}
