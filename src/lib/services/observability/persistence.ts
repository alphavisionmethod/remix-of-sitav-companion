// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Persistence
// Flushes in-memory metrics to metrics_snapshots table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { ObservabilityService } from "./index";

export async function flushMetricsToDatabase(
  service: ObservabilityService,
  userId: string
): Promise<{ flushed: number; errors: number }> {
  const state = service.evaluate();
  let flushed = 0;
  let errors = 0;

  // Flush all current metrics
  const rows = state.metrics.map(m => ({
    user_id: userId,
    domain: m.domain || "system",
    metric_name: m.name,
    metric_type: m.type,
    value: m.value,
    tags: { unit: m.unit, labels: m.labels || {} } as never,
    metadata: { source: "observability-service" } as never,
    recorded_at: m.timestamp || new Date().toISOString(),
  }));

  // Also flush SLO states as metrics
  for (const slo of state.slos) {
    rows.push({
      user_id: userId,
      domain: "slo",
      metric_name: `slo.${slo.name}`,
      metric_type: "gauge",
      value: slo.currentValue ?? 0,
      tags: { target: slo.target, isMet: slo.isMet, burnRate: slo.burnRate } as never,
      metadata: { sloId: slo.id, window: slo.window } as never,
      recorded_at: new Date().toISOString(),
    });
  }

  if (rows.length === 0) return { flushed: 0, errors: 0 };

  // Batch insert in chunks of 50
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await fromDynamicTable("metrics_snapshots").insert(chunk);
    if (error) {
      console.error("[ObservabilityPersistence] Flush error:", error);
      errors += chunk.length;
    } else {
      flushed += chunk.length;
    }
  }

  return { flushed, errors };
}

// Periodic flush — call this to start auto-flushing every N minutes
let flushInterval: ReturnType<typeof setInterval> | null = null;

export function startPeriodicFlush(
  service: ObservabilityService,
  userId: string,
  intervalMs = 300_000 // 5 minutes default
): () => void {
  stopPeriodicFlush();
  flushInterval = setInterval(async () => {
    try {
      const result = await flushMetricsToDatabase(service, userId);
      if (result.flushed > 0) {
        console.log(`[ObservabilityPersistence] Flushed ${result.flushed} metrics`);
      }
    } catch (e) {
      console.error("[ObservabilityPersistence] Periodic flush failed:", e);
    }
  }, intervalMs);

  return stopPeriodicFlush;
}

export function stopPeriodicFlush(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
}

