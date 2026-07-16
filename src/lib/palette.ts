// Mirrors the CSS custom properties in globals.css. Kept as plain hex here
// because some components need string concatenation (alpha suffixes) that
// doesn't work with `var(--token)` references.
export const STATUS_COLORS = {
  ok: "#2fae72",
  warning: "#e3a83d",
  critical: "#e2564a",
} as const;

export const CATEGORICAL_COLORS = [
  "#1c9a89",
  "#b8801f",
  "#7c63e0",
  "#d94f41",
  "#3d82c9",
  "#5c9440",
  "#c24f87",
  "#c96a28",
] as const;

export const SIGNAL_COLOR = "#c6ff4f";
