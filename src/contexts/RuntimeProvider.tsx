// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Runtime Provider
// Composes SitaKernel + SitaOS + NovaSDK into a single provider
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { SitaKernelProvider } from "@/platform/sita/contexts/SitaKernelContext";
import { SitaOSProvider } from "@/platform/sita/contexts/SitaOSContext";
import { NovaSDKProvider } from "@/platform/nova-sdk/contexts/NovaSDKContext";
import { RuntimeTierProvider } from "@/runtimes/runtime-context";
import { usePipelineBootstrap } from "@/hooks/usePipelineBootstrap";
import { useAutonomyBootstrap } from "@/platform/orchestration/hooks/useAutonomyBootstrap";
import { ActiveWorkspaceProvider } from "@/platform/workspace/workspace-context";

/** Boots the orchestration pipeline inside the provider tree */
function PipelineBootstrap({ children }: { children: ReactNode }) {
  usePipelineBootstrap();
  useAutonomyBootstrap();
  return <>{children}</>;
}

/**
 * RuntimeProvider — single provider that boots all runtime layers:
 * 1. RuntimeTierProvider (4-Tier runtime truth: web/desktop/appliance/simulated)
 * 2. SitaKernel (core services: trust, memory, receipts, workflows)
 * 3. SitaOS (15 orchestration services: attention, intent, continuity…)
 * 4. NovaSDK (app runtime: registry, bridge, events, filesystem)
 * 5. PipelineBootstrap (orchestration pipeline: signals → advisors → boards → boardroom)
 *
 * Order matters: TierProvider → Kernel → OS → SDK → Pipeline
 * The TierProvider is the outermost so any inner layer can read the active tier.
 */
export function RuntimeProvider({ children }: { children: ReactNode }) {
  return (
    <RuntimeTierProvider>
      <SitaKernelProvider>
        <SitaOSProvider>
          <NovaSDKProvider>
            <ActiveWorkspaceProvider>
              <PipelineBootstrap>
                {children}
              </PipelineBootstrap>
            </ActiveWorkspaceProvider>
          </NovaSDKProvider>
        </SitaOSProvider>
      </SitaKernelProvider>
    </RuntimeTierProvider>
  );
}

// Re-export all hooks from a single location for convenience
export { useSitaKernel, useCanonicalAction, useSharedMemory, useSharedTrust, useEntityScoped, useCapabilityLease, useConstitution, useKernelStatus, useWorkflowRecovery, useWorkflowReplay, useTransitionValidator, useReceiptVerification, useWebsiteManager, useCloudControlPlane, useEdgeDeviceRuntime, useFleetOTA, useIncidentManagement, useFraudSentinel, useGovernanceSimulator, useSearchFabric, useSelfHealingServices, useLifeSimulator, useEmergencyHalt, useCurrentLayer } from "@/platform/sita/contexts/SitaKernelContext";
export { useSitaOS } from "@/platform/sita/contexts/SitaOSContext";
export { useNovaSDK } from "@/platform/nova-sdk/contexts/NovaSDKContext";
