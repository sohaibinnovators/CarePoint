"use client";

import type { SlotOption } from "@/lib/scheduling";
import { cn } from "@/lib/utils";

export function SlotPicker({
  slots,
  value,
  onChange,
  emptyMessage = "No available slots for this date.",
}: {
  slots: SlotOption[];
  value: string;
  onChange: (time: string) => void;
  emptyMessage?: string;
}) {
  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  const availableCount = slots.filter((slot) => slot.available).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        {availableCount} open slot{availableCount === 1 ? "" : "s"} · booked and break
        times stay disabled
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => onChange(slot.time)}
            className={cn(
              "rounded-lg border px-2 py-2 text-xs font-medium transition",
              !slot.available &&
                "cursor-not-allowed border-border bg-slate-50 text-slate-400 line-through",
              slot.available &&
                value !== slot.time &&
                "border-border bg-white text-foreground hover:border-primary/40",
              slot.available &&
                value === slot.time &&
                "border-primary bg-light-blue text-primary",
            )}
            title={slot.reason}
          >
            {slot.time}
            {!slot.available && slot.reason ? (
              <span className="mt-0.5 block text-[10px] font-normal normal-case no-underline">
                {slot.reason}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
