// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Infrastructure Initialization
// Wires Electron bridge + offline sync + core substrate hydration
// + Realtime event bridge
// ═══════════════════════════════════════════════════════════════

import { useElectronBridge } from "@/hooks/useElectronBridge";
import { useOfflineStore } from "@/hooks/useOfflineStore";
import { useCoreSubstrateHydration } from "@/hooks/useCoreSubstrateHydration";
import { useRealtimeBridge } from "@/hooks/useRealtimeBridge";
import { useEffect } from "react";
import { createCloudSyncManager } from "@/lib/core-services/cloud-sync-manager";

/**
 * Invisible component that initializes platform-level hooks.
 * Mount once inside the authenticated provider tree.
 */
export function PlatformInit() {
  useElectronBridge();
  useOfflineStore({ key: "sita-platform-sync", enableSync: true });
  useCoreSubstrateHydration();
  useRealtimeBridge();

  // Start Cloud Sync Manager
  useEffect(() => {
    const manager = createCloudSyncManager();
    return () => manager.stop();
  }, []);

  return null;
}
