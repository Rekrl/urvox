import { STATUS_COLORS } from "@/lib/palette";

export function StatusLegend({
  labels = ["Normal", "Atenção", "Crítico"],
}: {
  labels?: [string, string, string];
}) {
  const entries: Array<[string, string]> = [
    [labels[0], STATUS_COLORS.ok],
    [labels[1], STATUS_COLORS.warning],
    [labels[2], STATUS_COLORS.critical],
  ];
  return (
    <div className="flex flex-wrap gap-4 text-xs text-text-on-ink-secondary">
      {entries.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}
