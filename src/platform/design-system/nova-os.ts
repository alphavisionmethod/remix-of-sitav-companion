// ═══════════════════════════════════════════════════════════════
// NovaOS Design System — Materials, Depth, Gradients, Shapes, Motion
// CPU-friendly glassmorphism tokens for SITA OS desktop shell
// ═══════════════════════════════════════════════════════════════

// ── Materials ────────────────────────────────────────────────

export const MATERIALS = {
  /** Translucent glass — menu bar, dock, floating panels */
  glass: {
    light: "bg-[hsl(0_0%_100%/0.40)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.30)]",
    dark: "bg-[hsl(0_0%_0%/0.40)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.10)]",
  },
  /** Heavier frosted glass — windows, modals */
  frostedGlass: {
    light: "bg-[hsl(0_0%_100%/0.70)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.30)]",
    dark: "bg-[hsl(0_0%_0%/0.60)] backdrop-blur-2xl border border-[hsl(0_0%_100%/0.10)]",
  },
  /** Subtle surface — widgets, cards on desktop */
  subtleSurface: {
    light: "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.10)]",
    dark: "bg-[hsl(0_0%_100%/0.08)] backdrop-blur-xl border border-[hsl(0_0%_100%/0.10)]",
  },
  /** Menu bar material */
  menuBar: {
    light: "bg-[hsl(0_0%_100%/0.40)] backdrop-blur-md",
    dark: "bg-[hsl(0_0%_0%/0.25)] backdrop-blur-[40px] saturate-[1.8]",
  },
} as const;

// ── Depth Layers ─────────────────────────────────────────────

export const DEPTH_LAYERS = {
  desktop: 0,       // wallpaper + ambient background
  orbs: 1,          // decorative blur orbs
  vignette: 2,      // vignette overlay
  content: 10,      // desktop widgets, clock
  windows: 20,      // floating windows
  dock: 25,         // dock bar
  menuBar: 30,      // system menu bar
  overlay: 40,      // modals, command palette
  contextMenu: 50,  // context menus
} as const;

// ── Icon Gradients ───────────────────────────────────────────

export const ICON_GRADIENTS = {
  blue:    "from-[hsl(210_80%_60%)] to-[hsl(250_70%_55%)]",
  purple:  "from-[hsl(280_70%_60%)] to-[hsl(320_65%_55%)]",
  green:   "from-[hsl(150_60%_45%)] to-[hsl(180_55%_40%)]",
  orange:  "from-[hsl(30_85%_55%)] to-[hsl(15_80%_50%)]",
  pink:    "from-[hsl(330_70%_60%)] to-[hsl(350_65%_55%)]",
  teal:    "from-[hsl(180_55%_45%)] to-[hsl(200_60%_40%)]",
  gold:    "from-[hsl(45_85%_55%)] to-[hsl(35_80%_45%)]",
  indigo:  "from-[hsl(235_65%_55%)] to-[hsl(260_70%_50%)]",
} as const;

// ── Shapes ───────────────────────────────────────────────────

export const SHAPES = {
  window: "rounded-2xl",
  icon: "rounded-xl",
  pill: "rounded-full",
  widget: "rounded-2xl",
  menuBar: "rounded-none",
} as const;

// ── Motion Philosophy ────────────────────────────────────────

export const NOVA_MOTION = {
  /** Max durations in seconds */
  duration: {
    micro: 0.15,
    standard: 0.25,
    emphasis: 0.3,
  },
  /** Only transform + opacity — no layout triggers */
  spring: {
    gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
    snappy: { type: "spring" as const, stiffness: 300, damping: 25 },
    dock: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
  /** Window open / close — spec: open 0.96→1, close 1→0.98 */
  window: {
    enter: { initial: { scale: 0.96, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
    exit: { exit: { scale: 0.98, opacity: 0, transition: { duration: 0.14, ease: "easeOut" } } },
  },
} as const;

// ── Traffic Light Colors ─────────────────────────────────────

export const TRAFFIC_LIGHTS = {
  close: "bg-[hsl(0_70%_60%)]",
  minimize: "bg-[hsl(45_80%_55%)]",
  maximize: "bg-[hsl(130_55%_48%)]",
  inactive: "bg-[hsl(0_0%_50%/0.3)]",
} as const;

// ── Shadow Presets ───────────────────────────────────────────

export const NOVA_SHADOWS = {
  /** Stacked depth: near (sharp) + far (soft) */
  window: "shadow-[0_2px_8px_hsl(0_0%_0%/0.15),0_16px_48px_hsl(0_0%_0%/0.20)]",
  windowFocused: "shadow-[0_2px_10px_hsl(0_0%_0%/0.20),0_20px_60px_hsl(0_0%_0%/0.28)]",
  windowUnfocused: "shadow-[0_2px_6px_hsl(0_0%_0%/0.10),0_12px_36px_hsl(0_0%_0%/0.12)]",
  dock: "shadow-lg shadow-[hsl(0_0%_0%/0.2)]",
  menuBar: "shadow-sm shadow-[hsl(0_0%_0%/0.1)]",
  widget: "shadow-lg shadow-[hsl(0_0%_0%/0.1)]",
} as const;
