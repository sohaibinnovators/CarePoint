import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
  secondary: "bg-secondary text-white hover:bg-secondary-dark shadow-sm",
  outline:
    "border border-border bg-white text-foreground hover:bg-slate-50 shadow-sm",
  ghost: "text-muted hover:bg-slate-100 hover:text-foreground",
  danger: "bg-danger text-white hover:bg-red-700 shadow-sm",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
