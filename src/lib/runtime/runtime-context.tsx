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
import { getFeatureRuntimeTier } from "./feature-runtime-tier-registry";

interface RuntimeTierContextValue {
  probe: RuntimeTierProbe;
  tier: RuntimeTier;
  resolveCapability: (capabilityId: string) => TierAvailability;
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
          const probedMap = probeDesktopCapabilities();
          const status = probedMap.get(capabilityId);
          if (!status) return "prohibited";
          if (status === "available") return "supported";
          if (status === "degraded") return "fallback";
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
      const feature = getFeatureRuntimeTier(featureId);
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

export function useFeatureRuntimeTier(featureId: string): TierAvailability {
  return useRuntimeTierContext().resolveFeature(featureId);
}

export function useIsTier(tier: RuntimeTier): boolean {
  return useRuntimeTierContext().tier === tier;
}
