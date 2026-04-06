// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Resolution Engine
// Central dispatcher: UI → service → resolution → provider
// Prevents raw mock imports, enforces side-effect policies
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "../reality-mode-registry";
import { getModeDefinition } from "../reality-mode-registry";
import { resolveSurfaceModeBinding, type SurfaceModeBinding } from "../surface-class-registry";
import { resolveMode } from "../reality-mode-resolver";

// ── Types ───────────────────────────────────────────────────────

export type ProviderSourceType = "real_provider" | "demo_provider" | "internal_provider" | "unavailable";

export type SideEffectPolicy = "allow" | "simulate_only" | "block" | "allow_test_store";

export interface CapabilityResolution {
  capabilityKey: string;
  mode: RealityModeKey;
  providerSource: ProviderSourceType;
  sideEffectPolicy: SideEffectPolicy;
  launchHonestyClass: string;
  analyticsBucket: "real" | "demo" | "internal_test" | "discard";
  scenarioKey?: string;
  metadata: {
    resolvedAt: number;
    route: string;
    surfaceClass: string;
  };
}

export interface NormalizedResponse<T> {
  data: T;
  reality: {
    mode: RealityModeKey;
    providerSource: ProviderSourceType;
    isSimulated: boolean;
    scenarioKey?: string;
  };
  freshness: "live" | "cached" | "scenario_seeded" | "stale";
  timestamp: string;
}

// ── Resolution Engine ───────────────────────────────────────────

export function resolveCapability(capabilityKey: string, route?: string): CapabilityResolution {
  const currentRoute = route ?? window.location.pathname;
  const modeResolution = resolveMode({ route: currentRoute });
  const binding = resolveSurfaceModeBinding(currentRoute, modeResolution.mode);
  const modeDef = getModeDefinition(modeResolution.mode);

  const sideEffectPolicy: SideEffectPolicy = modeDef.sideEffects.externalWritesAllowed
    ? "allow"
    : modeResolution.mode === "sandbox"
      ? "allow_test_store"
      : "simulate_only";

  return {
    capabilityKey,
    mode: modeResolution.mode,
    providerSource: binding.providerSource as ProviderSourceType,
    sideEffectPolicy,
    launchHonestyClass: binding.launchHonestyClass,
    analyticsBucket: binding.analyticsBucket as "real" | "demo" | "internal_test" | "discard",
    scenarioKey: modeResolution.scenarioKey,
    metadata: {
      resolvedAt: Date.now(),
      route: currentRoute,
      surfaceClass: binding.surfaceClass,
    },
  };
}

// ── Normalized Response Factory ─────────────────────────────────

export function wrapResponse<T>(
  data: T,
  resolution: CapabilityResolution
): NormalizedResponse<T> {
  return {
    data,
    reality: {
      mode: resolution.mode,
      providerSource: resolution.providerSource,
      isSimulated: resolution.providerSource !== "real_provider",
      scenarioKey: resolution.scenarioKey,
    },
    freshness: resolution.mode === "real" ? "live" : "scenario_seeded",
    timestamp: new Date().toISOString(),
  };
}

// ── Side Effect Guard ───────────────────────────────────────────

export function guardSideEffect(
  resolution: CapabilityResolution,
  actionType: string
): { allowed: boolean; reason: string } {
  if (resolution.sideEffectPolicy === "allow") {
    return { allowed: true, reason: "real_mode_allowed" };
  }
  if (resolution.sideEffectPolicy === "block") {
    return { allowed: false, reason: `Side effects blocked in ${resolution.mode} mode` };
  }
  if (resolution.sideEffectPolicy === "simulate_only") {
    return { allowed: false, reason: `Action '${actionType}' simulated in ${resolution.mode} mode — no real effect` };
  }
  if (resolution.sideEffectPolicy === "allow_test_store") {
    return { allowed: true, reason: "test_store_write_allowed" };
  }
  return { allowed: false, reason: "unknown_policy" };
}

// ── Capability Service Factory ──────────────────────────────────

export interface CapabilityProvider<TData, TAction = void> {
  fetch(resolution: CapabilityResolution): Promise<TData>;
  execute?(resolution: CapabilityResolution, action: TAction): Promise<{ success: boolean; message: string }>;
}

export interface CapabilityServiceConfig<TData, TAction = void> {
  capabilityKey: string;
  realProvider: CapabilityProvider<TData, TAction>;
  demoProvider: CapabilityProvider<TData, TAction>;
  internalProvider?: CapabilityProvider<TData, TAction>;
}

export function createCapabilityService<TData, TAction = void>(
  config: CapabilityServiceConfig<TData, TAction>
) {
  function getProvider(source: ProviderSourceType): CapabilityProvider<TData, TAction> {
    switch (source) {
      case "real_provider": return config.realProvider;
      case "demo_provider": return config.demoProvider;
      case "internal_provider": return config.internalProvider ?? config.demoProvider;
      default: return config.demoProvider;
    }
  }

  return {
    async fetch(route?: string): Promise<NormalizedResponse<TData>> {
      const resolution = resolveCapability(config.capabilityKey, route);
      const provider = getProvider(resolution.providerSource);
      const data = await provider.fetch(resolution);
      return wrapResponse(data, resolution);
    },

    async execute(action: TAction, route?: string): Promise<NormalizedResponse<{ success: boolean; message: string }>> {
      const resolution = resolveCapability(config.capabilityKey, route);
      const guard = guardSideEffect(resolution, config.capabilityKey);

      if (!guard.allowed) {
        return wrapResponse({ success: false, message: guard.reason }, resolution);
      }

      const provider = getProvider(resolution.providerSource);
      if (!provider.execute) {
        return wrapResponse({ success: false, message: "No execute handler" }, resolution);
      }

      const result = await provider.execute(resolution, action);
      return wrapResponse(result, resolution);
    },

    resolve(route?: string): CapabilityResolution {
      return resolveCapability(config.capabilityKey, route);
    },
  };
}
