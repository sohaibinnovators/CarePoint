import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-light-blue text-primary",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-danger",
  muted: "bg-slate-100 text-muted",
  teal: "bg-teal-50 text-secondary",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(
  status: string,
): keyof typeof variants {
  const map: Record<string, keyof typeof variants> = {
    scheduled: "default",
    confirmed: "teal",
    "checked-in": "success",
    completed: "success",
    cancelled: "danger",
    pending: "warning",
    paid: "success",
    unpaid: "warning",
    "partially-paid": "teal",
    overdue: "danger",
    draft: "muted",
    issued: "success",
    finalized: "success",
    active: "success",
    inactive: "muted",
    "on-leave": "warning",
  };
  return map[status] ?? "muted";
}
