// ═══════════════════════════════════════════════════════════════
// SITA OS — App Window Design System
// Strict spacing, typography, materials, shadows for all app windows
// ═══════════════════════════════════════════════════════════════

// ── Spacing Scale (px) ───────────────────────────────────────

export const SPACE = {
  micro: 4,
  tight: 8,
  normal: 16,
  section: 24,
  large: 32,
} as const;

// ── Typography Scale ─────────────────────────────────────────

export const TYPE = {
  label: { size: 11, weight: 500, tracking: "0.04em", lineHeight: 1.2 },
  body: { size: 13, weight: 400, tracking: "0.01em", lineHeight: 1.5 },
  title: { size: 16, weight: 600, tracking: "-0.01em", lineHeight: 1.3 },
  heading: { size: 18, weight: 600, tracking: "-0.02em", lineHeight: 1.25 },
} as const;

// ── Tailwind class helpers ───────────────────────────────────

export const APP_TYPE = {
  label: "text-[11px] font-medium tracking-wider leading-tight",
  body: "text-[13px] font-normal tracking-[0.01em] leading-relaxed",
  title: "text-[16px] font-semibold tracking-tight leading-snug",
  heading: "text-[18px] font-semibold tracking-tight leading-snug",
} as const;

// ── Window Materials ─────────────────────────────────────────

export const APP_MATERIALS = {
  windowBg: {
    light: "bg-[hsl(0_0%_100%/0.72)]",
    dark: "bg-[hsl(0_0%_0%/0.62)]",
  },
  windowBorder: {
    light: "border-[hsl(0_0%_100%/0.35)]",
    dark: "border-[hsl(0_0%_100%/0.12)]",
  },
  sidebarBg: {
    light: "bg-[hsl(0_0%_0%/0.02)]",
    dark: "bg-[hsl(0_0%_100%/0.03)]",
  },
  sidebarBorder: "border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]",
  divider: "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.06)]",
  hoverBg: "hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)]",
  activeBg: "bg-[hsl(210_80%_55%/0.12)] dark:bg-[hsl(210_80%_55%/0.18)]",
} as const;

// ── Window Shadows (dual-layer depth) ────────────────────────

export const APP_SHADOWS = {
  focused:
    "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_20px_40px_hsl(0_0%_0%/0.18)]",
  unfocused:
    "shadow-[0_2px_4px_hsl(0_0%_0%/0.05),0_12px_28px_hsl(0_0%_0%/0.10)]",
  innerGlow:
    "shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15)]",
} as const;

// ── Window Chrome ────────────────────────────────────────────

export const APP_CHROME = {
  titleBarHeight: 40,
  toolbarHeight: 36,
  cornerRadius: 16,
  accentStripHeight: 2,
} as const;

// ── Component Presets ────────────────────────────────────────

export const APP_COMPONENTS = {
  button: {
    base: "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-100 active:scale-[0.98]",
    primary:
      "bg-[hsl(210_80%_55%)] text-[hsl(0_0%_100%)] hover:bg-[hsl(210_80%_50%)]",
    secondary:
      "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)] text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)] hover:bg-[hsl(0_0%_0%/0.10)] dark:hover:bg-[hsl(0_0%_100%/0.12)]",
    ghost:
      "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)]",
  },
  input: {
    base: "rounded-lg border border-[hsl(0_0%_0%/0.08)] dark:border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.04)] px-3 py-1.5 text-[13px] placeholder:text-[hsl(0_0%_0%/0.3)] dark:placeholder:text-[hsl(0_0%_100%/0.3)] focus:outline-none focus:ring-2 focus:ring-[hsl(210_80%_55%/0.3)] transition-all duration-150",
  },
  card: {
    base: "rounded-xl border border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_0%/0.02)] dark:bg-[hsl(0_0%_100%/0.03)] p-4",
  },
  listItem: {
    base: "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors duration-100 cursor-default",
    active: "bg-[hsl(210_80%_55%/0.12)] text-[hsl(210_80%_45%)] dark:text-[hsl(210_80%_65%)] font-medium",
    inactive: "text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)]",
  },
} as const;

// ── App Accent Colors (mapped from iconBg gradients) ─────────

export const APP_ACCENTS: Record<string, string> = {
  finder: "from-[hsl(210_80%_60%)] to-[hsl(250_70%_55%)]",
  settings: "from-[hsl(0_0%_45%)] to-[hsl(0_0%_35%)]",
  terminal: "from-[hsl(0_0%_15%)] to-[hsl(0_0%_25%)]",
  notes: "from-[hsl(45_85%_55%)] to-[hsl(35_80%_45%)]",
  calendar: "from-[hsl(0_70%_55%)] to-[hsl(15_80%_50%)]",
  mail: "from-[hsl(210_80%_55%)] to-[hsl(200_70%_50%)]",
  default: "from-[hsl(265_55%_58%)] to-[hsl(280_50%_50%)]",
  "business-os": "from-[hsl(265_55%_58%)] to-[hsl(285_50%_48%)]",
  "money-os": "from-[hsl(152_55%_48%)] to-[hsl(165_50%_42%)]",
  concierge: "from-[hsl(285_55%_55%)] to-[hsl(310_50%_48%)]",
} as const;
