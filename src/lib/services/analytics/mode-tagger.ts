// ═══════════════════════════════════════════════════════════════
// SITA OS — Analytics Mode Tagger
// Wraps any analytics event with the active runtime mode so demo
// activity never contaminates live dashboards.
// ═══════════════════════════════════════════════════════════════

export type RuntimeMode = "demo" | "live";

/**
 * Returns the current runtime mode as observed at the global level.
 * Defaults to "demo" if not yet initialised (safer for honesty).
 */
export function getRuntimeMode(): RuntimeMode {
  if (typeof window === "undefined") return "demo";
  const m = (window as any).__SITA_RUNTIME_MODE__;
  return m === "live" ? "live" : "demo";
}

/**
 * Tag a properties object with `{ mode }`. Never overrides if the
 * caller has already supplied a `mode` field.
 */
export function tagWithMode<T extends Record<string, unknown>>(properties: T): T & { mode: RuntimeMode } {
  if ("mode" in properties) return properties as T & { mode: RuntimeMode };
  return { ...properties, mode: getRuntimeMode() };
}
