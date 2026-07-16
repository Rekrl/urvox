import { STATUS_COLORS } from "@/lib/palette";
import type { BinStatus, ReportStatus } from "@/lib/types";

export function Badge({
  label,
  icon,
  color,
}: {
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}14`,
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

const BIN_STATUS_CONFIG: Record<BinStatus, { label: string; icon: string }> = {
  ok: { label: "Normal", icon: "●" },
  warning: { label: "Atenção", icon: "▲" },
  critical: { label: "Crítico", icon: "■" },
};

export function StatusBadge({
  status,
  labels,
}: {
  status: BinStatus;
  /** Override the default Normal/Atenção/Crítico wording per domain (e.g. Fluido/Moderado/Congestionado). */
  labels?: [string, string, string];
}) {
  const cfg = BIN_STATUS_CONFIG[status];
  const label = labels
    ? { ok: labels[0], warning: labels[1], critical: labels[2] }[status]
    : cfg.label;
  return <Badge label={label} icon={cfg.icon} color={STATUS_COLORS[status]} />;
}

const REPORT_STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; icon: string; color: string }
> = {
  submetido: { label: "Submetido", icon: "○", color: "#3d82c9" },
  em_curso: { label: "Em curso", icon: "◐", color: STATUS_COLORS.warning },
  resolvido: { label: "Resolvido", icon: "✓", color: STATUS_COLORS.ok },
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const cfg = REPORT_STATUS_CONFIG[status];
  return <Badge label={cfg.label} icon={cfg.icon} color={cfg.color} />;
}

const WORK_ORDER_STATUS_CONFIG: Record<
  "aberta" | "em_execucao" | "concluida",
  { label: string; icon: string; color: string }
> = {
  aberta: { label: "Ordem aberta", icon: "○", color: "#3d82c9" },
  em_execucao: { label: "Em execução", icon: "◐", color: STATUS_COLORS.warning },
  concluida: { label: "Concluída", icon: "✓", color: STATUS_COLORS.ok },
};

export function WorkOrderStatusBadge({
  status,
}: {
  status: "aberta" | "em_execucao" | "concluida";
}) {
  const cfg = WORK_ORDER_STATUS_CONFIG[status];
  return <Badge label={cfg.label} icon={cfg.icon} color={cfg.color} />;
}
