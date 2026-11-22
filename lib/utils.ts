export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDemoLabel(value: string) {
  return `${value} (Demo)`;
}
