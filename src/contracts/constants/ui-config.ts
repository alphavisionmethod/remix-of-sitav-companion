// ═══════════════════════════════════════════════════════════════
// SITA OS — Shared UI Configuration Constants
// Pure visual/UI constants that are identical in demo and live mode.
// These are NOT mock data — they are static configuration.
// ═══════════════════════════════════════════════════════════════

/** Calendar month names */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Calendar day abbreviations (Mon-first) */
export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Asset allocation chart colors */
export const ASSET_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500",
  "bg-gray-400", "bg-rose-500", "bg-cyan-500",
];

/** Revenue pie chart colors (HSL token references) */
export const PIE_COLORS = [
  "hsl(var(--trust-safe))", "hsl(var(--accent))",
  "hsl(var(--primary))", "hsl(var(--destructive))",
  "hsl(var(--urgency-high))", "hsl(var(--muted-foreground))",
];

/** Life simulator severity color scale */
export const SEVERITY_COLORS = [
  "bg-trust-safe", "bg-trust-safe", "bg-sita-gold", "bg-sita-gold",
  "bg-destructive/80", "bg-destructive", "bg-destructive", "bg-destructive",
];

/** Comparison operators for rule/playbook builders */
export const OPERATORS = [
  { value: "gt", label: ">" }, { value: "lt", label: "<" },
  { value: "eq", label: "=" }, { value: "not_eq", label: "≠" },
  { value: "contains", label: "contains" }, { value: "exists", label: "exists" },
];

/** Delay/wait options for automation steps */
export const DELAY_OPTIONS = [
  "1 hour", "4 hours", "1 day", "2 days", "3 days", "1 week", "2 weeks",
];

/** Date range filter options */
export const DATE_RANGES = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];
