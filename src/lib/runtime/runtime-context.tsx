// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Tier Context
// React provider + hooks for runtime-truth-aware UI.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { RuntimeTier, TierAvailability } from "./runtime-tier-model";
import { probeRuntimeTier, type RuntimeTierProbe } from "./runtime-detection";
import { getWebCapability } from "./web/web-capability-map";
import { getApplianceCapability } from "./appliance/appliance-capabilities";
import { probeDesktopCapabilities } from "./desktop/desktop-host-capabilities";
import { getFeatureTier } from "./feature-tier-registry";

interface RuntimeTierContextValue {
  probe: RuntimeTierProbe;
  tier: RuntimeTier;
  /** Resolve capability availability under the active tier. */
  resolveCapability: (capabilityId: string) => TierAvailability;
  /** Resolve a feature's availability under the active tier. */
  resolveFeature: (featureId: string) => TierAvailability;
}

const RuntimeTierContext = createContext<RuntimeTierContextValue | null>(null);

export function RuntimeTierProvider({ children }: { children: ReactNode }) {
  const value = useMemo<RuntimeTierContextValue>(() => {
    const probe = probeRuntimeTier();
    const tier = probe.tier;

    const resolveCapability = (capabilityId: string): TierAvailability => {
      switch (tier) {
        case "WEB_APP": {
          const entry = getWebCapability(capabilityId);
          return entry?.availability ?? "prohibited";
        }
        case "DESKTOP_HOST": {
          const probed = probeDesktopCapabilities().find((c) => c.id === capabilityId);
          if (!probed) return "prohibited";
          if (probed.status === "available") return "supported";
          if (probed.status === "fallback") return "fallback";
          return "prohibited";
        }
        case "APPLIANCE_RUNTIME": {
          const entry = getApplianceCapability(capabilityId);
          return entry?.availability ?? "prohibited";
        }
        case "SIMULATED_OS_EXPERIENCE":
          return "simulated";
      }
    };

    const resolveFeature = (featureId: string): TierAvailability => {
      const feature = getFeatureTier(featureId);
      if (!feature) return "prohibited";
      if (feature.supportedTiers.includes(tier)) return "supported";
      if (feature.simulatedTiers.includes(tier)) return "simulated";
      if (feature.fallbackTiers.includes(tier)) return "fallback";
      if (feature.roadmapTiers.includes(tier)) return "roadmap";
      return "prohibited";
    };

    return { probe, tier, resolveCapability, resolveFeature };
  }, []);

  return <RuntimeTierContext.Provider value={value}>{children}</RuntimeTierContext.Provider>;
}

/** Throw-safe hook — requires the provider to be mounted. */
function useRuntimeTierContext(): RuntimeTierContextValue {
  const ctx = useContext(RuntimeTierContext);
  if (!ctx) {
    throw new Error(
      "[runtime] useRuntimeTier/useCapability must be used inside <RuntimeTierProvider>",
    );
  }
  return ctx;
}

export function useRuntimeTier(): RuntimeTier {
  return useRuntimeTierContext().tier;
}

export function useRuntimeProbe(): RuntimeTierProbe {
  return useRuntimeTierContext().probe;
}

export function useCapability(capabilityId: string): TierAvailability {
  return useRuntimeTierContext().resolveCapability(capabilityId);
}

export function useFeatureTier(featureId: string): TierAvailability {
  return useRuntimeTierContext().resolveFeature(featureId);
}

export function useIsTier(tier: RuntimeTier): boolean {
  return useRuntimeTierContext().tier === tier;
}
