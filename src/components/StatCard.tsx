export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "good" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-ink-3 bg-ink-2/60 p-5">
      <p className="text-xs uppercase tracking-wide text-text-on-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-text-on-ink">{value}</p>
      {delta && (
        <p
          className={`mt-1 text-xs ${
            tone === "good"
              ? "text-status-good"
              : tone === "warning"
                ? "text-status-warning"
                : "text-text-on-ink-secondary"
          }`}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
