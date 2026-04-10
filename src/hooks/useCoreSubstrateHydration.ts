// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Substrate Boot Hydration Hook
// Hydrates EventBus, MemoryService, ReceiptService from durable
// storage after authentication. Runs once per session.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSitaKernel } from "@/lib/sita-kernel";

export interface SubstrateHydrationStatus {
  hydrated: boolean;
  hydrating: boolean;
  eventCount: number;
  memoryCount: number;
  receiptCount: number;
  error: string | null;
  hydratedAt: string | null;
}

const INITIAL_STATUS: SubstrateHydrationStatus = {
  hydrated: false,
  hydrating: false,
  eventCount: 0,
  memoryCount: 0,
  receiptCount: 0,
  error: null,
  hydratedAt: null,
};

// Module-level singleton to prevent double hydration across hot-reloads
let _globalHydrated = false;

export function useCoreSubstrateHydration(): SubstrateHydrationStatus {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubstrateHydrationStatus>(INITIAL_STATUS);
  const hydrationTriggered = useRef(false);

  useEffect(() => {
    if (authLoading || !user || hydrationTriggered.current || _globalHydrated) return;
    hydrationTriggered.current = true;

    const run = async () => {
      setStatus(s => ({ ...s, hydrating: true }));

      const kernel = getSitaKernel();
      let eventCount = 0;
      let memoryCount = 0;
      let receiptCount = 0;
      let error: string | null = null;

      try {
        // Hydrate in parallel — each service handles its own errors gracefully
        const [events, memCount, rcptCount] = await Promise.allSettled([
          kernel.eventBus.replayFromStorage({ limit: 200 }),
          kernel.memory.hydrate({ limit: 500 }),
          kernel.receipts.hydrate({ limit: 500 }),
        ]);

        if (events.status === "fulfilled") eventCount = events.value?.length ?? 0;
        if (memCount.status === "fulfilled") memoryCount = memCount.value ?? 0;
        if (rcptCount.status === "fulfilled") receiptCount = rcptCount.value ?? 0;

        // Emit substrate hydrated event
        kernel.eventBus.publish("kernel.substrate.hydrated.v1", {
          eventCount,
          memoryCount,
          receiptCount,
          timestamp: new Date().toISOString(),
        }, { source: "core-substrate-hydration", domain: "kernel" }).catch(() => {});

        _globalHydrated = true;
      } catch (e: any) {
        error = e?.message ?? "Unknown hydration error";
        console.warn("[substrate-hydration] Error:", error);
      }

      setStatus({
        hydrated: true,
        hydrating: false,
        eventCount,
        memoryCount,
        receiptCount,
        error,
        hydratedAt: new Date().toISOString(),
      });
    };

    run();
  }, [user, authLoading]);

  return status;
}
