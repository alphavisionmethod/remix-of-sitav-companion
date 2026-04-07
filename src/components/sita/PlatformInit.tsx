// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Infrastructure Initialization
// Wires Electron bridge + offline sync manager at app root
// ═══════════════════════════════════════════════════════════════

import { useElectronBridge } from "@/hooks/useElectronBridge";
import { useOfflineStore } from "@/hooks/useOfflineStore";

/**
 * Invisible component that initializes platform-level hooks.
 * Mount once inside the authenticated provider tree.
 * - ElectronBridge: graceful no-op when not in Electron
 * - OfflineStore: starts sync manager for pending mutations
 */
export function PlatformInit() {
  // Initialize Electron IPC bridge (no-op in web)
  useElectronBridge();

  // Initialize offline sync manager
  useOfflineStore({ key: "sita-platform-sync", enableSync: true });

  return null;
}
