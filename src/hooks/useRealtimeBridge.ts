// ═══════════════════════════════════════════════════════════════
// SITA OS — Realtime Bridge Hook
// Starts/stops the UnifiedEventService Realtime bridge on auth state
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { unifiedEventService } from "@/lib/services/event-bus/unified-event-service";

/**
 * Starts the Supabase Realtime bridge when the user is authenticated.
 * Stops the bridge on sign-out. Mount once in PlatformInit.
 */
export function useRealtimeBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      unifiedEventService.startRealtimeBridge();
    } else {
      unifiedEventService.stopRealtimeBridge();
    }

    return () => {
      unifiedEventService.stopRealtimeBridge();
    };
  }, [user]);
}
