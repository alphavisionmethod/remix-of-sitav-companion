// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Infrastructure Initialization
// Wires Electron bridge + offline sync + core substrate hydration
// + Realtime event bridge
// ═══════════════════════════════════════════════════════════════

import { useElectronBridge } from "@/hooks/useElectronBridge";
import { useOfflineStore } from "@/hooks/useOfflineStore";
import { useCoreSubstrateHydration } from "@/hooks/useCoreSubstrateHydration";
import { useRealtimeBridge } from "@/hooks/useRealtimeBridge";

/**
 * Invisible component that initializes platform-level hooks.
 * Mount once inside the authenticated provider tree.
 * - ElectronBridge: graceful no-op when not in Electron
 * - OfflineStore: starts sync manager for pending mutations
 * - CoreSubstrateHydration: hydrates EventBus, Memory, Receipts from durable storage
 * - RealtimeBridge: connects server-side events to client event bus
 */
export function PlatformInit() {
  // Initialize Electron IPC bridge (no-op in web)
  useElectronBridge();

  // Initialize offline sync manager
  useOfflineStore({ key: "sita-platform-sync", enableSync: true });

  // Hydrate core substrate from durable storage after auth
  useCoreSubstrateHydration();

  // Start Supabase Realtime bridge for server-side events
  useRealtimeBridge();

  return null;
}
