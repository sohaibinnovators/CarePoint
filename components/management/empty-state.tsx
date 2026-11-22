export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function StoreLoading() {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-10 text-center text-sm text-muted">
      Loading demo records…
    </div>
  );
}
