// ═══════════════════════════════════════════════════════════════
// SITA OS — Capacitor Native Bridge (Phase 3)
// Optional, lazy bridge to @capacitor/* APIs. Safe in pure web:
// when Capacitor is not present, all calls return null/false honestly.
//
// IMPORTANT: We do NOT import @capacitor/* statically — the project
// runs as a web SPA today. Capacitor packages are detected at runtime
// via the global window.Capacitor surface that the native shell injects.
// ═══════════════════════════════════════════════════════════════

export interface CapacitorPluginCall {
  pluginId: string;
  method: string;
  options?: Record<string, unknown>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => "ios" | "android" | "web";
  Plugins?: Record<string, Record<string, (opts?: unknown) => Promise<unknown>>>;
  registerPlugin?: <T = unknown>(name: string) => T;
}

function getCapacitor(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  const cap = (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap ?? null;
}

export function isCapacitorAvailable(): boolean {
  const cap = getCapacitor();
  return !!cap?.isNativePlatform?.();
}

export function getCapacitorPlatform(): "ios" | "android" | "web" {
  const cap = getCapacitor();
  return cap?.getPlatform?.() ?? "web";
}

/**
 * Invoke a Capacitor plugin method by id. Returns null if Capacitor is
 * unavailable or the plugin/method is not registered. Never throws on
 * "not installed" — that is part of the honest fallback contract.
 */
export async function invokeCapacitorPlugin<T = unknown>(
  call: CapacitorPluginCall,
): Promise<T | null> {
  const cap = getCapacitor();
  if (!cap?.Plugins) return null;
  const plugin = cap.Plugins[call.pluginId];
  if (!plugin) return null;
  const fn = plugin[call.method];
  if (typeof fn !== "function") return null;
  try {
    const result = await fn(call.options);
    return (result as T) ?? null;
  } catch (err) {
    console.warn(`[CapacitorBridge] ${call.pluginId}.${call.method} failed`, err);
    return null;
  }
}

/** Surface a stable, lazy error code when a plugin is missing. */
export const CAPACITOR_PLUGIN_MISSING = "capacitor-plugin-missing" as const;
