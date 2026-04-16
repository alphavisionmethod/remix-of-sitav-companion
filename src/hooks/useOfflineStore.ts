// ═══════════════════════════════════════════════════════════════
// SITA OS — useOfflineStore Hook
// Cache-first data access with offline queue.
// On first-class mobile, additionally exposes the mobile-platform
// sync queue depth so UI surfaces stay truthful per runtime tier.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  cacheGet,
  cacheSet,
  queueAction,
  getPendingActions,
  startSyncManager,
  stopSyncManager,
} from '@/lib/offline-db';
import { fromDynamicTable } from "@/lib/supabase-helpers";
import {
  mobileSyncQueue,
  getMobileSyncHealth,
  type OfflineMutation,
} from "@/lib/mobile-platform";
import { useMobileRuntime } from "@/lib/mobile-platform";

interface UseOfflineStoreOptions {
  /** Cache key for this data */
  key: string;
  /** Cache TTL in milliseconds (default: 5 min) */
  ttl?: number;
  /** Enable sync manager for pending actions */
  enableSync?: boolean;
}

export function useOfflineStore<T = unknown>({
  key,
  ttl = 5 * 60 * 1000,
  enableSync = true,
}: UseOfflineStoreOptions) {
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileQueueDepth, setMobileQueueDepth] = useState(0);
  const { isFirstClassMobile } = useMobileRuntime();

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Update pending count periodically (web cache queue)
  useEffect(() => {
    const check = async () => {
      const pending = await getPendingActions();
      setPendingCount(pending.length);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to mobile sync queue when on a first-class mobile runtime
  useEffect(() => {
    if (!isFirstClassMobile) return;
    const update = (q: ReadonlyArray<OfflineMutation>) => {
      setMobileQueueDepth(q.filter((m) => m.status === "queued").length);
    };
    const unsub = mobileSyncQueue.subscribe(update);
    setMobileQueueDepth(getMobileSyncHealth().totalQueued);
    return () => { unsub(); };
  }, [isFirstClassMobile]);

  // Start sync manager (web cache queue)
  useEffect(() => {
    if (!enableSync) return;

    startSyncManager(async (action) => {
      try {
        const { error } = await fromDynamicTable(action.table)
          [action.operation === 'insert' ? 'insert' : action.operation === 'update' ? 'update' : 'delete'](
            action.payload
          );
        return !error;
      } catch {
        return false;
      }
    });

    return () => stopSyncManager();
  }, [enableSync]);

  /** Get cached data, fetching from network if stale */
  const getCached = useCallback(
    async (fetcher: () => Promise<T>): Promise<T | null> => {
      const cached = await cacheGet<T>(key);
      if (cached !== null) return cached;

      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const data = await fetcher();
          await cacheSet(key, data, ttl);
          return data;
        } catch {
          return null;
        }
      }

      return null;
    },
    [key, ttl]
  );

  const setCache = useCallback(
    async (data: T) => {
      await cacheSet(key, data, ttl);
    },
    [key, ttl]
  );

  const queueMutation = useCallback(
    async (
      table: string,
      operation: 'insert' | 'update' | 'delete',
      payload: Record<string, unknown>
    ) => {
      const id = await queueAction(table, operation, payload);
      const pending = await getPendingActions();
      setPendingCount(pending.length);
      return id;
    },
    []
  );

  return {
    isOnline,
    pendingCount,
    /** Queue depth from the mobile-platform sync engine (0 on non-mobile). */
    mobileQueueDepth,
    /** True only when we are on a true mobile runtime tier. */
    isFirstClassMobile,
    getCached,
    setCache,
    queueMutation,
  };
}
