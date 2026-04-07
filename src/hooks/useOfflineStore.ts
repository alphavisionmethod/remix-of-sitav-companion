// ═══════════════════════════════════════════════════════════════
// SITA OS — useOfflineStore Hook
// Provides cache-first data access with offline queue
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
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from "@/lib/supabase-helpers";

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

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

  // Update pending count periodically
  useEffect(() => {
    const check = async () => {
      const pending = await getPendingActions();
      setPendingCount(pending.length);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Start sync manager
  useEffect(() => {
    if (!enableSync) return;

    startSyncManager(async (action) => {
      try {
        const { error } = await fromTable(action.table)
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
      // Try cache first
      const cached = await cacheGet<T>(key);
      if (cached !== null) return cached;

      // If online, fetch and cache
      if (navigator.onLine) {
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

  /** Cache data manually */
  const setCache = useCallback(
    async (data: T) => {
      await cacheSet(key, data, ttl);
    },
    [key, ttl]
  );

  /** Queue an offline mutation */
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
    getCached,
    setCache,
    queueMutation,
  };
}
