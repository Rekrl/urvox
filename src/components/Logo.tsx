import type { CSSProperties } from "react";

// Symbol "C" from the Urvox visual identity: a roof (institution, civic
// building) with voice arcs emanating from it — "the city has a voice."
const ARC_PRIMARY = "M41.1 24.2 A10 10 0 0 1 40.2 14.3";
const ARC_SECONDARY = "M49.2 28 A19 19 0 0 1 47.6 9.1";
const ARC_COMPACT = "M45.6 26.4 A15 15 0 0 1 44.3 11.4";

export function LogoMark({
  size = 28,
  compact = false,
  animated = false,
  className = "",
}: {
  size?: number;
  /** Roof + single arc only — for favicon-scale rendering (~16-24px). */
  compact?: boolean;
  /** Arcs emit outward in sequence — reserve for genuine "live" contexts. */
  animated?: boolean;
  className?: string;
}) {
  const arcStyle = (delay: string): CSSProperties | undefined =>
    animated
      ? {
          transformOrigin: "32px 20px",
          animation: "voice-arc 2.4s ease-out infinite",
          animationDelay: delay,
        }
      : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {!compact && (
        <line x1="8" y1="46" x2="56" y2="46" stroke="currentColor" strokeOpacity={0.2} strokeWidth={2} />
      )}
      <path
        d="M14 46 L32 20 L50 46"
        stroke="currentColor"
        strokeWidth={compact ? 6 : 4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {compact ? (
        <path d={ARC_COMPACT} stroke="currentColor" strokeWidth={5.5} strokeLinecap="round" opacity={0.85} />
      ) : (
        <>
          <path
            d={ARC_PRIMARY}
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.85}
            style={arcStyle("0s")}
          />
          <path
            d={ARC_SECONDARY}
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.5}
            style={arcStyle("0.4s")}
          />
        </>
      )}
    </svg>
  );
}

export function Logo({
  withWordmark = true,
  tagline = false,
  className = "",
}: {
  withWordmark?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-text-on-ink ${className}`}>
      <LogoMark size={28} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-tight text-text-on-ink">Urvox</span>
          {tagline && (
            <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-on-ink-muted">
              A cidade tem voz
            </span>
          )}
        </span>
      )}
    </span>
  );
}
