import { cn } from "@/lib/utils";

export function BarChart({
  data,
  className,
  color = "#2563EB",
}: {
  data: { label: string; value: number }[];
  className?: string;
  color?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-48 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: color,
                minHeight: item.value > 0 ? 8 : 0,
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  data,
  className,
}: {
  data: { label: string; value: number }[];
  className?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("space-y-3", className)}>
      <svg viewBox="0 0 100 100" className="h-48 w-full overflow-visible" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#0D9488"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {data.map((item, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 100;
          const y = 100 - (item.value / max) * 100;
          return (
            <circle key={item.label} cx={x} cy={y} r="1.8" fill="#2563EB" />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
