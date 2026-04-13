// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Runtime Provider
// Composes SitaKernel + SitaOS + NovaSDK into a single provider
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { SitaKernelProvider } from "@/contexts/SitaKernelContext";
import { SitaOSProvider } from "@/contexts/SitaOSContext";
import { NovaSDKProvider } from "@/contexts/NovaSDKContext";

/**
 * RuntimeProvider — single provider that boots all three runtime layers:
 * 1. SitaKernel (core services: trust, memory, receipts, workflows)
 * 2. SitaOS (15 orchestration services: attention, intent, continuity…)
 * 3. NovaSDK (app runtime: registry, bridge, events, filesystem)
 *
 * Order matters: Kernel → OS (depends on kernel being available) → SDK
 */
export function RuntimeProvider({ children }: { children: ReactNode }) {
  return (
    <SitaKernelProvider>
      <SitaOSProvider>
        <NovaSDKProvider>
          {children}
        </NovaSDKProvider>
      </SitaOSProvider>
    </SitaKernelProvider>
  );
}

// Re-export all hooks from a single location for convenience
export { useSitaKernel, useCanonicalAction, useSharedMemory, useSharedTrust, useEntityScoped, useCapabilityLease, useConstitution, useKernelStatus, useWorkflowRecovery, useWorkflowReplay, useTransitionValidator, useReceiptVerification, useWebsiteManager, useCloudControlPlane, useEdgeDeviceRuntime, useFleetOTA, useIncidentManagement, useFraudSentinel, useGovernanceSimulator, useSearchFabric, useSelfHealingServices, useLifeSimulator, useEmergencyHalt, useCurrentLayer } from "@/contexts/SitaKernelContext";
export { useSitaOS } from "@/contexts/SitaOSContext";
export { useNovaSDK } from "@/contexts/NovaSDKContext";
