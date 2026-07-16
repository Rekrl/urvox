type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SensorIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3a5 5 0 0 1 5 5c0 2.5-2.2 4-3.2 6.6L12 21l-1.8-6.4C9.2 12 7 10.5 7 8a5 5 0 0 1 5-5Z" />
      <circle cx="12" cy="8" r="1.6" />
    </svg>
  );
}

export function ReportIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M16 4v3h3" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

export function LedgerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="9" y="14" width="6" height="6" rx="1.2" />
      <path d="M10 7h4M7 10v4M17 10v4h-2" />
    </svg>
  );
}

export function TechIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 9l2 2-2 2M13 13h4" />
    </svg>
  );
}

export function CitizenIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
    </svg>
  );
}

export function TransparencyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 4c0 9-6 15-15 15C5 10 11 4 20 4Z" />
      <path d="M5 19c3-4 6.5-7 11-10" />
    </svg>
  );
}
