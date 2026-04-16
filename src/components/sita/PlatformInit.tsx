// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Infrastructure Initialization
// Wires Electron bridge + offline sync + core substrate hydration
// + Realtime event bridge + Sync Engine + Unified WS
// ═══════════════════════════════════════════════════════════════

import { useElectronBridge } from "@/hooks/useElectronBridge";
import { useOfflineStore } from "@/hooks/useOfflineStore";
import { useCoreSubstrateHydration } from "@/hooks/useCoreSubstrateHydration";
import { useRealtimeBridge } from "@/hooks/useRealtimeBridge";
import { useUnifiedWsBridge, useWsCacheInvalidation } from "@/hooks/use-unified-ws";
import { useEffect } from "react";
import { createCloudSyncManager } from "@/lib/core-services/cloud-sync-manager";
import { bootOSSecurity, isOSSecurityBooted } from "@/lib/os-security";
import { syncd } from "@/lib/sync-engine";
import { initSessionThreatDetector } from "@/lib/core-services/security/session-threat-detector";
import { initSecureVault } from "@/lib/core-services/security/secure-memory-vault";
import { generateCanaryToken } from "@/lib/core-services/security/ai-output-firewall";
import { mobileSyncQueue, localStorageQueuePersistence, mobileOfflineSyncEngine } from "@/lib/mobile-platform";

/**
 * Invisible component that initializes platform-level hooks.
 * Mount once inside the authenticated provider tree.
 */
export function PlatformInit() {
  useElectronBridge();
  useOfflineStore({ key: "sita-platform-sync", enableSync: true });
  useCoreSubstrateHydration();
  useRealtimeBridge();
  useUnifiedWsBridge();
  useWsCacheInvalidation();

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

  // Boot Session Threat Detector + Secure Vault + AI Canary
  useEffect(() => {
    initSessionThreatDetector();
    console.log("[PlatformInit] Session threat detector initialized");

    initSecureVault().then(() => {
      console.log("[PlatformInit] Secure memory vault initialized");
    }).catch((err) =>
      console.error("[PlatformInit] Vault init failed:", err)
    );

    generateCanaryToken();
    console.log("[PlatformInit] AI canary token generated");
  }, []);

  // Mobile sync queue: attach durable persistence + hydrate
  useEffect(() => {
    mobileSyncQueue.attachPersistence(localStorageQueuePersistence);
    mobileSyncQueue.hydrate().then(() => {
      console.log("[PlatformInit] Mobile sync queue hydrated");
    }).catch((err) => console.error("[PlatformInit] Mobile sync hydrate failed:", err));
    // Engine drain loop is started lazily by the engine itself when needed.
    void mobileOfflineSyncEngine;
  }, []);

  return null;
}
