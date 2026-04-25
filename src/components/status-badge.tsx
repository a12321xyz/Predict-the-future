import { formatStatusLabel } from "@/lib/format";

const classes: Record<string, string> = {
  open: "border-blue-400/30 bg-blue-400/10 text-blue-600 dark:text-blue-300",
  resolved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes[status] ?? classes.open}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
