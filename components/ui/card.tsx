import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function StatCard({
  title,
  value,
  hint,
  icon,
  tone = "blue",
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  tone?: "blue" | "teal" | "amber" | "emerald" | "slate";
}) {
  const tones = {
    blue: "bg-light-blue text-primary",
    teal: "bg-teal-50 text-secondary",
    amber: "bg-amber-50 text-warning",
    emerald: "bg-emerald-50 text-success",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
