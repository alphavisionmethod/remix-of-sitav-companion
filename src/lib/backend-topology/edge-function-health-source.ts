// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Health Source (Phase 17.2)
//
// Provides per-function health metrics for all 85 edge functions.
// Queries the Supabase function_edge_logs analytics view via the
// db-truth-introspect adapter. Falls back to a registry-driven
// "unknown" baseline when the analytics view is not reachable
// (e.g. in offline / preview mode).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EDGE_FUNCTION_REGISTRY } from "./edge-function-registry";

export type HealthBand = "green" | "amber" | "red" | "unknown";

export interface EdgeFunctionHealth {
  readonly name: string;
  readonly invocations1h: number;
  readonly errors1h: number;
  readonly errorRate: number;        // 0..1
  readonly p50ms: number | null;
  readonly p95ms: number | null;
  readonly p99ms: number | null;
  readonly lastSuccessAt: string | null;
  readonly lastErrorAt: string | null;
  readonly healthScore: number;      // 0..100
  readonly band: HealthBand;
}

function bandFor(errorRate: number, p95: number | null, invocations: number): HealthBand {
  if (invocations === 0) return "unknown";
  if (errorRate >= 0.1) return "red";
  if (errorRate >= 0.02 || (p95 !== null && p95 > 5000)) return "amber";
  return "green";
}

function scoreFor(errorRate: number, p95: number | null, invocations: number): number {
  if (invocations === 0) return 50;
  let score = 100;
  score -= Math.min(60, errorRate * 100 * 6);
  if (p95 !== null) {
    if (p95 > 1000) score -= Math.min(30, (p95 - 1000) / 200);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function emptyForRegistry(): EdgeFunctionHealth[] {
  return EDGE_FUNCTION_REGISTRY.map((fn) => ({
    name: fn.name,
    invocations1h: 0,
    errors1h: 0,
    errorRate: 0,
    p50ms: null,
    p95ms: null,
    p99ms: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    healthScore: 50,
    band: "unknown" as HealthBand,
  }));
}

interface UseEdgeFunctionHealthResult {
  readonly data: readonly EdgeFunctionHealth[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refreshedAt: string | null;
  readonly refresh: () => void;
}

/**
 * Pulls per-function health metrics from the db-truth-introspect
 * edge function (which exposes a read-only `edge_function_metrics`
 * aggregator). Always returns one row per registered function so
 * the dashboard surfaces every name even when no telemetry yet.
 */
export function useEdgeFunctionHealth(): UseEdgeFunctionHealthResult {
  const baseline = useMemo(() => emptyForRegistry(), []);
  const [data, setData] = useState<readonly EdgeFunctionHealth[]>(baseline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: payload, error: err } = await supabase.functions.invoke(
          "db-truth-introspect",
          { body: { op: "edge-function-metrics", windowMinutes: 60 } },
        );
        if (cancelled) return;
        if (err) throw err;

        const rows = Array.isArray(payload?.metrics) ? payload.metrics : [];
        const byName = new Map<string, Partial<EdgeFunctionHealth>>();
        for (const r of rows) {
          if (!r?.name) continue;
          byName.set(r.name, {
            invocations1h: Number(r.invocations1h ?? 0),
            errors1h: Number(r.errors1h ?? 0),
            p50ms: r.p50ms == null ? null : Number(r.p50ms),
            p95ms: r.p95ms == null ? null : Number(r.p95ms),
            p99ms: r.p99ms == null ? null : Number(r.p99ms),
            lastSuccessAt: r.lastSuccessAt ?? null,
            lastErrorAt: r.lastErrorAt ?? null,
          });
        }

        const merged: EdgeFunctionHealth[] = baseline.map((b) => {
          const m = byName.get(b.name);
          if (!m) return b;
          const invocations = m.invocations1h ?? 0;
          const errors = m.errors1h ?? 0;
          const errorRate = invocations > 0 ? errors / invocations : 0;
          return {
            name: b.name,
            invocations1h: invocations,
            errors1h: errors,
            errorRate,
            p50ms: m.p50ms ?? null,
            p95ms: m.p95ms ?? null,
            p99ms: m.p99ms ?? null,
            lastSuccessAt: m.lastSuccessAt ?? null,
            lastErrorAt: m.lastErrorAt ?? null,
            healthScore: scoreFor(errorRate, m.p95ms ?? null, invocations),
            band: bandFor(errorRate, m.p95ms ?? null, invocations),
          };
        });

        setData(merged);
        setRefreshedAt(new Date().toISOString());
      } catch (e) {
        if (cancelled) return;
        // Soft-fail: keep baseline (unknown band) and surface an error.
        setError(e instanceof Error ? e.message : String(e));
        setRefreshedAt(new Date().toISOString());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [baseline, tick]);

  return {
    data,
    loading,
    error,
    refreshedAt,
    refresh: () => setTick((t) => t + 1),
  };
}

export function summariseHealth(rows: readonly EdgeFunctionHealth[]): {
  green: number; amber: number; red: number; unknown: number; total: number;
} {
  let green = 0, amber = 0, red = 0, unknown = 0;
  for (const r of rows) {
    if (r.band === "green") green++;
    else if (r.band === "amber") amber++;
    else if (r.band === "red") red++;
    else unknown++;
  }
  return { green, amber, red, unknown, total: rows.length };
}
