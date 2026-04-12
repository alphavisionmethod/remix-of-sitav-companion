// ═══════════════════════════════════════════════════════════════
// Calm UI Engine — Micro-Interaction Timings
// Centralized timing constants + CSS custom property injection
// ═══════════════════════════════════════════════════════════════

export const MI_TIMINGS = {
  hover: 80,
  click: 120,
  animate: 200,
  spring: 300,
  settle: 500,
} as const;

/** CSS custom properties for micro-interaction timings */
export const MI_CSS_VARS = {
  "--mi-hover": `${MI_TIMINGS.hover}ms`,
  "--mi-click": `${MI_TIMINGS.click}ms`,
  "--mi-animate": `${MI_TIMINGS.animate}ms`,
  "--mi-spring": `${MI_TIMINGS.spring}ms`,
  "--mi-settle": `${MI_TIMINGS.settle}ms`,
} as const;

/** Inject micro-interaction CSS custom properties onto :root */
export function injectMITimings(): void {
  const root = document.documentElement;
  Object.entries(MI_CSS_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/** Framer Motion transition presets using MI timings */
export const MI_TRANSITIONS = {
  hover: { duration: MI_TIMINGS.hover / 1000 },
  click: { duration: MI_TIMINGS.click / 1000 },
  animate: { duration: MI_TIMINGS.animate / 1000 },
  spring: { type: "spring" as const, stiffness: 260, damping: 22, duration: MI_TIMINGS.spring / 1000 },
} as const;
