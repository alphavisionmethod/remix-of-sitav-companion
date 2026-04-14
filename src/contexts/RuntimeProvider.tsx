// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Runtime Provider
// Composes SitaKernel + SitaOS + NovaSDK into a single provider
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { SitaKernelProvider } from "@/contexts/SitaKernelContext";
import { SitaOSProvider } from "@/contexts/SitaOSContext";
import { NovaSDKProvider } from "@/contexts/NovaSDKContext";
import { usePipelineBootstrap } from "@/hooks/usePipelineBootstrap";

/** Boots the orchestration pipeline inside the provider tree */
function PipelineBootstrap({ children }: { children: ReactNode }) {
  usePipelineBootstrap();
  return <>{children}</>;
}

/**
 * RuntimeProvider — single provider that boots all three runtime layers:
 * 1. SitaKernel (core services: trust, memory, receipts, workflows)
 * 2. SitaOS (15 orchestration services: attention, intent, continuity…)
 * 3. NovaSDK (app runtime: registry, bridge, events, filesystem)
 * 4. PipelineBootstrap (orchestration pipeline: signals → advisors → boards → boardroom)
 *
 * Order matters: Kernel → OS → SDK → Pipeline
 */
export function RuntimeProvider({ children }: { children: ReactNode }) {
  return (
    <SitaKernelProvider>
      <SitaOSProvider>
        <NovaSDKProvider>
          <PipelineBootstrap>
            {children}
          </PipelineBootstrap>
        </NovaSDKProvider>
      </SitaOSProvider>
    </SitaKernelProvider>
  );
}

// Re-export all hooks from a single location for convenience
export { useSitaKernel, useCanonicalAction, useSharedMemory, useSharedTrust, useEntityScoped, useCapabilityLease, useConstitution, useKernelStatus, useWorkflowRecovery, useWorkflowReplay, useTransitionValidator, useReceiptVerification, useWebsiteManager, useCloudControlPlane, useEdgeDeviceRuntime, useFleetOTA, useIncidentManagement, useFraudSentinel, useGovernanceSimulator, useSearchFabric, useSelfHealingServices, useLifeSimulator, useEmergencyHalt, useCurrentLayer } from "@/contexts/SitaKernelContext";
export { useSitaOS } from "@/contexts/SitaOSContext";
export { useNovaSDK } from "@/contexts/NovaSDKContext";
