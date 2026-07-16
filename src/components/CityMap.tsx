import { STATUS_COLORS } from "@/lib/palette";
import type { AssetStatus } from "@/lib/types";

export type CityMapPoint = {
  id: string;
  x: number;
  y: number;
  status: AssetStatus;
};

export function CityMap({
  points,
  selectedId,
  onSelect,
  ariaLabel = "Mapa ilustrativo da cidade",
}: {
  points: CityMapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full rounded-2xl border border-ink-3 bg-ink-2/60"
      role="img"
      aria-label={ariaLabel}
    >
      <rect x="0" y="0" width="100" height="100" fill="var(--ink-2)" />

      {/* stylised road grid */}
      {[15, 32, 49, 66, 83].map((pos) => (
        <line
          key={`v-${pos}`}
          x1={pos}
          y1={0}
          x2={pos}
          y2={100}
          stroke="var(--border-on-ink)"
          strokeWidth={0.4}
        />
      ))}
      {[15, 32, 49, 66, 83].map((pos) => (
        <line
          key={`h-${pos}`}
          x1={0}
          y1={pos}
          x2={100}
          y2={pos}
          stroke="var(--border-on-ink)"
          strokeWidth={0.4}
        />
      ))}

      <line x1={0} y1={100} x2={100} y2={0} stroke="var(--border-on-ink-strong)" strokeWidth={0.6} strokeDasharray="1 2" />

      <text x={6} y={8} className="hash-texture" fontSize={4} fill="var(--text-on-ink-muted)">
        ZONA A
      </text>
      <text x={82} y={96} className="hash-texture" fontSize={4} fill="var(--text-on-ink-muted)">
        ZONA B
      </text>

      {points.map((point) => {
        const color = STATUS_COLORS[point.status];
        const selected = point.id === selectedId;
        return (
          <g
            key={point.id}
            transform={`translate(${point.x} ${point.y})`}
            onClick={() => onSelect(point.id)}
            className="cursor-pointer"
          >
            {point.status === "critical" && (
              <circle r={4.5} fill={color} opacity={0.25}>
                <animate attributeName="r" values="3;5.5;3" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.05;0.35" dur="1.8s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              r={selected ? 3 : 2.2}
              fill={color}
              stroke="var(--ink-0)"
              strokeWidth={0.6}
            />
            {selected && (
              <circle r={4.2} fill="none" stroke={color} strokeWidth={0.4} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
