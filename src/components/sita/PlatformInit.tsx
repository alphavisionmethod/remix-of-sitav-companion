// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Infrastructure Initialization
// Wires Electron bridge + offline sync + core substrate hydration
// + Realtime event bridge + Sync Engine
// ═══════════════════════════════════════════════════════════════

import { useElectronBridge } from "@/hooks/useElectronBridge";
import { useOfflineStore } from "@/hooks/useOfflineStore";
import { useCoreSubstrateHydration } from "@/hooks/useCoreSubstrateHydration";
import { useRealtimeBridge } from "@/hooks/useRealtimeBridge";
import { useEffect } from "react";
import { createCloudSyncManager } from "@/lib/core-services/cloud-sync-manager";
import { bootOSSecurity, isOSSecurityBooted } from "@/lib/os-security";
import { syncd } from "@/lib/sync-engine";

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

  // Boot OS Security Subsystem
  useEffect(() => {
    if (!isOSSecurityBooted()) {
      bootOSSecurity().catch((err) =>
        console.error("[PlatformInit] OS security boot failed:", err)
      );
    }
  }, []);

  // Start Sync Daemon (syncd)
  useEffect(() => {
    const userId = "platform-user";
    const deviceId = "primary-device";
    syncd.start(userId, deviceId);
    console.log("[PlatformInit] syncd started");
    return () => {
      syncd.stop();
      console.log("[PlatformInit] syncd stopped");
    };
  }, []);

  return null;
}
