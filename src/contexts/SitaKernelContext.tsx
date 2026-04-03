// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel React Context
// Provides unified access to all kernel services via hooks
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useMemo, useCallback, useState, useRef, type ReactNode } from "react";
import { SitaKernel, getSitaKernel } from "@/lib/sita-kernel";
import { useEntityContext } from "@/contexts/EntityContext";
import type { CanonicalChainResult } from "@/lib/core-services/index";
import type { Receipt } from "@/lib/core-services/receipt-service";
import type { MemoryEntry } from "@/lib/core-services/memory-service";
import type { TrustState } from "@/lib/core-services/trust-state-service";

// ── Context ─────────────────────────────────────────────────────

const KernelCtx = createContext<SitaKernel | null>(null);

// ── Provider ────────────────────────────────────────────────────

export function SitaKernelProvider({ children }: { children: ReactNode }) {
  const kernel = useMemo(() => getSitaKernel(), []);
  const { current: entity } = useEntityContext();

  // Sync entity context into kernel whenever it changes
  useEffect(() => {
    kernel.setActiveEntity(entity);
  }, [kernel, entity]);

  return <KernelCtx.Provider value={kernel}>{children}</KernelCtx.Provider>;
}

// ── Core Hook ───────────────────────────────────────────────────

export function useSitaKernel(): SitaKernel {
  const kernel = useContext(KernelCtx);
  if (!kernel) {
    // Fallback: return the singleton even outside provider (e.g. tests)
    return getSitaKernel();
  }
  return kernel;
}

// ── Canonical Action Hook ───────────────────────────────────────

export function useCanonicalAction() {
  const kernel = useSitaKernel();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<CanonicalChainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    domain: string,
    capabilityId: string,
    payload: Record<string, unknown>,
    options?: { amount?: number; isSimulation?: boolean; intent?: string }
  ): Promise<CanonicalChainResult | null> => {
    setIsExecuting(true);
    setError(null);
    try {
      const result = await kernel.executeAction({
        intent: options?.intent ?? capabilityId,
        domain,
        capabilityId,
        payload,
        amount: options?.amount,
        isSimulation: options?.isSimulation,
      });
      setLastResult(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Execution failed";
      setError(msg);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [kernel]);

  return { execute, isExecuting, lastResult, error };
}

// ── Shared Memory Hook ──────────────────────────────────────────

export function useSharedMemory(key?: string) {
  const kernel = useSitaKernel();
  const [entries, setEntries] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => {
      if (key) {
        const results = kernel.memory.query({ key });
        setEntries(results);
      } else {
        setEntries(kernel.memory.getAll());
      }
    };
    refresh();

    // Subscribe to memory-related events to auto-refresh
    const subId = kernel.eventBus.subscribe("memory.*", refresh, "shared-memory-hook");
    // Also refresh on any execution (which stores memory)
    const execSubId = kernel.eventBus.subscribe("execution.completed.v1", refresh, "shared-memory-exec");

    return () => {
      kernel.eventBus.unsubscribe(subId);
      kernel.eventBus.unsubscribe(execSubId);
    };
  }, [kernel, key]);

  const store = useCallback((k: string, value: unknown, options?: { tags?: string[]; confidence?: number }) => {
    kernel.storeMemory(k, value, options);
    // Trigger a refresh event
    kernel.emitEvent("memory.stored.v1", { key: k });
  }, [kernel]);

  return { entries, store };
}

// ── Shared Trust Hook ───────────────────────────────────────────

export function useSharedTrust(entityId?: string) {
  const kernel = useSitaKernel();
  const [trustState, setTrustState] = useState<TrustState | null>(null);

  useEffect(() => {
    const id = entityId ?? kernel.tenantId;
    const state = kernel.trust.getTrustState(id);
    setTrustState(state ?? null);

    const subId = kernel.eventBus.subscribe("trust.*", () => {
      const updated = kernel.trust.getTrustState(id);
      setTrustState(updated ?? null);
    }, "shared-trust-hook");

    return () => {
      kernel.eventBus.unsubscribe(subId);
    };
  }, [kernel, entityId]);

  return { trustState, history: kernel.trust.getHistory(entityId ?? kernel.tenantId) };
}

// ── Entity-Scoped Data Hook ─────────────────────────────────────

export function useEntityScoped() {
  const kernel = useSitaKernel();
  const { current } = useEntityContext();

  return {
    entityId: current.id,
    entityType: current.type,
    entityName: current.name,
    tenantId: kernel.tenantId,
    kernel,
  };
}

// ── Kernel Status Hook ──────────────────────────────────────────

export function useKernelStatus() {
  const kernel = useSitaKernel();
  const [status, setStatus] = useState(kernel.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(kernel.getStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, [kernel]);

  return status;
}
