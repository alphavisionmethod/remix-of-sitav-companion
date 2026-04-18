// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Source Marker
// All data in mock-data/ files is classified as DEMO SCENARIO DATA.
// In real mode, pages should use mode-aware data services instead.
// This marker enables runtime source tracking.
// ═══════════════════════════════════════════════════════════════

/**
 * Runtime marker: data from mock-data/ files is demo scenario data.
 * Pages consuming this data are operating in demo-backed mode.
 * The Dual Reality system classifies this as source: "demo".
 */
export const __DEMO_SOURCE__ = true;
export const __DATA_CLASSIFICATION__ = "demo-scenario" as const;

/** Returns true if current window has ?mode=real, indicating mock usage is a truth violation */
export function isDemoViolation(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "real";
}
