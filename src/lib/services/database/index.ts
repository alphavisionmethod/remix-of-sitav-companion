// ═══════════════════════════════════════════════════════════════
// SITA OS — Database Service
// Supabase client abstraction, typed query builder, health
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

export type QueryStatus = "idle" | "loading" | "success" | "error";

export interface QueryResult<T = unknown> {
  data: T | null;
  error: string | null;
  status: QueryStatus;
  rowCount: number;
  durationMs: number;
}

export interface ConnectionHealth {
  isConnected: boolean;
  latencyMs: number;
  lastCheckedAt: string;
  projectId: string;
  region: string;
}

export interface TableInfo {
  name: string;
  estimatedRowCount: number;
  hasPolicies: boolean;
}

export interface QueryMetrics {
  totalQueries: number;
  avgLatencyMs: number;
  errorRate: number;
  queriesPerMinute: number;
  slowQueries: number;
}

export class DatabaseService {
  private queryLog: Array<{ table: string; operation: string; durationMs: number; success: boolean; timestamp: number }> = [];
  private maxQueryLog = 500;

  async checkHealth(): Promise<ConnectionHealth> {
    const start = Date.now();
    try {
      const { error } = await fromDynamicTable("profiles").select("id").limit(1);
      return {
        isConnected: !error,
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "unknown",
        region: "auto",
      };
    } catch {
      return {
        isConnected: false,
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date().toISOString(),
        projectId: "unknown",
        region: "unknown",
      };
    }
  }

  async query<T = unknown>(table: string, options?: {
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<QueryResult<T[]>> {
    const start = Date.now();
    try {
      let q = fromDynamicTable(table).select(options?.select ?? "*");

      if (options?.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          q = q.eq(key, value);
        }
      }
      if (options?.orderBy) {
        q = q.order(options.orderBy, { ascending: options.ascending ?? false });
      }
      if (options?.limit) q = q.limit(options.limit);
      if (options?.offset) q = q.range(options.offset, options.offset + (options?.limit ?? 10) - 1);

      const { data, error } = await q;
      const durationMs = Date.now() - start;

      this.logQuery(table, "select", durationMs, !error);

      return {
        data: (data as T[]) ?? null,
        error: error?.message ?? null,
        status: error ? "error" : "success",
        rowCount: data?.length ?? 0,
        durationMs,
      };
    } catch (e) {
      const durationMs = Date.now() - start;
      this.logQuery(table, "select", durationMs, false);
      return { data: null, error: String(e), status: "error", rowCount: 0, durationMs };
    }
  }

  async insert<T = unknown>(table: string, records: Record<string, unknown> | Record<string, unknown>[]): Promise<QueryResult<T[]>> {
    const start = Date.now();
    try {
      const { data, error } = await fromDynamicTable(table).insert(records).select();
      const durationMs = Date.now() - start;
      this.logQuery(table, "insert", durationMs, !error);
      return { data: data as T[] ?? null, error: error?.message ?? null, status: error ? "error" : "success", rowCount: data?.length ?? 0, durationMs };
    } catch (e) {
      const durationMs = Date.now() - start;
      this.logQuery(table, "insert", durationMs, false);
      return { data: null, error: String(e), status: "error", rowCount: 0, durationMs };
    }
  }

  async upsert<T = unknown>(table: string, records: Record<string, unknown> | Record<string, unknown>[], onConflict?: string): Promise<QueryResult<T[]>> {
    const start = Date.now();
    try {
      const opts: { onConflict?: string } = {};
      if (onConflict) opts.onConflict = onConflict;
      const { data, error } = await fromDynamicTable(table).upsert(records, opts).select();
      const durationMs = Date.now() - start;
      this.logQuery(table, "upsert", durationMs, !error);
      return { data: data as T[] ?? null, error: error?.message ?? null, status: error ? "error" : "success", rowCount: data?.length ?? 0, durationMs };
    } catch (e) {
      const durationMs = Date.now() - start;
      this.logQuery(table, "upsert", durationMs, false);
      return { data: null, error: String(e), status: "error", rowCount: 0, durationMs };
    }
  }

  getMetrics(): QueryMetrics {
    const queries = this.queryLog;
    const total = queries.length;
    const errors = queries.filter(q => !q.success).length;
    const avgLatency = total > 0 ? Math.round(queries.reduce((s, q) => s + q.durationMs, 0) / total) : 0;
    const oneMinuteAgo = Date.now() - 60_000;
    const recentCount = queries.filter((q: any) => q.timestamp > oneMinuteAgo).length;
    const slowQueries = queries.filter((q: any) => q.durationMs > 1000).length;

    return {
      totalQueries: total,
      avgLatencyMs: avgLatency,
      errorRate: total > 0 ? errors / total : 0,
      queriesPerMinute: recentCount,
      slowQueries,
    };
  }

  private logQuery(table: string, operation: string, durationMs: number, success: boolean): void {
    this.queryLog.push({ table, operation, durationMs, success, timestamp: Date.now() });
    if (this.queryLog.length > this.maxQueryLog) {
      this.queryLog = this.queryLog.slice(-Math.floor(this.maxQueryLog / 2));
    }
  }
}

export function createDatabaseService(): DatabaseService {
  return new DatabaseService();
}

// ── Persistence Adapters (wired to DB tables) ───────────────
export {
  trustStateEventsAdapter,
  encryptedSecretsAdapter,
  notificationsAdapter,
  aiAgentTasksAdapter,
  aiCostLedgerAdapter,
  capitalAllocationsAdapter,
  communicationLogAdapter,
  sovereignExportsAdapter,
} from "./persistence-adapters";

export type {
  TrustStateEventRow,
  EncryptedSecretRow,
  NotificationRow,
  AIAgentTaskRow,
  AICostLedgerRow,
  CapitalAllocationRow,
  CommunicationLogRow,
  SovereignExportRow,
} from "./persistence-adapters";

