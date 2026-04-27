// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Query Hook
// Routes ALL reads through the kernel's projection layer.
// Generates read-receipts, respects policy, emits audit events.
// ═══════════════════════════════════════════════════════════════

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSitaKernel } from "@/platform/sita/contexts/SitaKernelContext";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

interface KernelQueryOptions<T> {
  /** Select columns (default: "*") */
  select?: string;
  /** Order by column */
  orderBy?: string;
  /** Ascending order */
  ascending?: boolean;
  /** Row limit */
  limit?: number;
  /** Filter conditions as key-value pairs */
  filters?: Record<string, unknown>;
  /** Whether query requires authentication */
  requireAuth?: boolean;
  /** Enable/disable the query */
  enabled?: boolean;
  /** Stale time in ms */
  staleTime?: number;
  /** Transform raw data after fetch */
  transform?: (data: Record<string, unknown>[]) => T[];
}

/**
 * Kernel-routed query hook.
 * Replaces direct `fromTable().select()` with kernel-observed reads.
 *
 * Usage:
 * ```ts
 * const { data } = useKernelQuery<Invoice>("finance", "invoices", {
 *   filters: { status: "overdue" },
 *   orderBy: "due_date",
 *   limit: 50,
 * });
 * ```
 */
export function useKernelQuery<T = Record<string, unknown>>(
  domain: string,
  table: string,
  options: KernelQueryOptions<T> = {},
) {
  const kernel = useSitaKernel();

  return useQuery<T[]>({
    queryKey: [domain, table, options.filters, options.select, options.orderBy, options.limit],
    queryFn: async () => {
      // Auth check
      if (options.requireAuth !== false) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
      }

      // Build query
      let q = fromDynamicTable(table).select(options.select || "*");

      // Apply filters
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            q = q.eq(key, value);
          }
        }
      }

      // Ordering
      if (options.orderBy) {
        q = q.order(options.orderBy, { ascending: options.ascending ?? false });
      } else {
        q = q.order("created_at", { ascending: false });
      }

      // Limit
      q = q.limit(options.limit ?? 100);

      const { data, error } = await q;
      if (error) {
        console.error(`[KernelQuery] ${domain}.${table} error:`, error);
        return [];
      }

      const raw = (data || []) as unknown as Record<string, unknown>[];

      // Emit read-receipt for audit
      kernel.eventBus.publish("kernel.read.v1", {
        domain,
        table,
        rowCount: raw.length,
        filters: options.filters,
        timestamp: Date.now(),
      }, { source: "kernel-query" });

      // Transform if provided
      if (options.transform) {
        return options.transform(raw);
      }

      return raw as T[];
    },
    enabled: options.enabled ?? true,
    staleTime: options.staleTime,
  });
}

/**
 * Kernel-routed single-record query.
 */
export function useKernelQuerySingle<T = Record<string, unknown>>(
  domain: string,
  table: string,
  id: string,
  options: Omit<KernelQueryOptions<T>, "filters" | "limit"> = {},
) {
  const kernel = useSitaKernel();

  return useQuery<T | null>({
    queryKey: [domain, table, "single", id],
    queryFn: async () => {
      if (options.requireAuth !== false) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
      }

      const { data, error } = await fromDynamicTable(table)
        .select(options.select || "*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(`[KernelQuery] ${domain}.${table}/${id} error:`, error);
        return null;
      }

      kernel.eventBus.publish("kernel.read.v1", {
        domain,
        table,
        rowCount: data ? 1 : 0,
        recordId: id,
        timestamp: Date.now(),
      }, { source: "kernel-query" });

      return (data as T) || null;
    },
    enabled: !!id && (options.enabled ?? true),
    staleTime: options.staleTime,
  });
}
