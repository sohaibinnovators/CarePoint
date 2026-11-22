import Image from "next/image";
import { getDoctorImage } from "@/lib/media";
import { cn } from "@/lib/utils";

export function DoctorPhoto({
  doctorId,
  name,
  initials,
  size = "md",
  className,
}: {
  doctorId: string;
  name: string;
  initials: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}) {
  const sizes = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
    hero: "h-56 w-full sm:h-72",
  };

  const rounded = size === "hero" ? "rounded-2xl" : "rounded-full";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-light-blue",
        sizes[size],
        rounded,
        className,
      )}
    >
      <Image
        src={getDoctorImage(doctorId)}
        alt={`Demo portrait of ${name}`}
        fill
        className="object-cover object-top"
        sizes={
          size === "hero"
            ? "(max-width: 768px) 100vw, 480px"
            : size === "xl"
              ? "128px"
              : size === "lg"
                ? "96px"
                : "64px"
        }
      />
      <span className="sr-only">{initials}</span>
    </div>
  );
}
