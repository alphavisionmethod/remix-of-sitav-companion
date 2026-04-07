// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Hook
// React hook for consuming observability data in components
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { telemetry, type TelemetryEvent } from "./telemetry-collector";
import { tracer } from "./distributed-tracing";
import { SITA_SLOS, computeSLOStatus, type SLOStatus } from "./slo-tracking";
import {
  computeHealthIndex,
  probeStatusToScore,
  scoreToStatus,
  type CompositeHealthIndex,
  type SubsystemHealth,
} from "./health-index";
import { supabase } from "@/integrations/supabase/client";

export interface UseObservabilityReturn {
  healthIndex: CompositeHealthIndex | null;
  recentEvents: TelemetryEvent[];
  sloStatuses: SLOStatus[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  recordMetric: (metric: string, value: number) => void;
}

export function useObservability(): UseObservabilityReturn {
  const [healthIndex, setHealthIndex] = useState<CompositeHealthIndex | null>(null);
  const [recentEvents, setRecentEvents] = useState<TelemetryEvent[]>([]);
  const [sloStatuses, setSloStatuses] = useState<SLOStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousScore = useRef<number | undefined>();

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Get probe results from runtime-probes edge function
      const probeResult = await supabase.functions.invoke("runtime-probes");
      const probeData = probeResult.data;

      // 2. Build subsystem health from probes
      const subsystems: SubsystemHealth[] = [];
      if (probeData?.probes) {
        const probeToSubsystem: Record<string, string> = {
          "db-health": "database",
          "auth-health": "auth",
          "edge-health": "edge-functions",
          "ai-gateway": "ai-gateway",
          "storage-health": "storage",
          "scheduler-health": "scheduler",
          "rls-health": "database", // Contributes to DB health
        };

        for (const probe of probeData.probes) {
          const subsystemName = probeToSubsystem[probe.probe_id] ?? probe.probe_id;
          subsystems.push({
            name: subsystemName,
            score: probeStatusToScore(probe.status),
            status: scoreToStatus(probeStatusToScore(probe.status)),
            lastChecked: Date.now(),
            details: probe.error ?? undefined,
          });
        }
      }

      // Add frontend health from telemetry
      const lcpStats = telemetry.getStats("lcp");
      const clsStats = telemetry.getStats("cls");
      const errorStats = telemetry.getStats("error_count");
      const frontendScore = Math.round(
        (lcpStats && lcpStats.p95 < 2500 ? 100 : lcpStats ? 60 : 80) * 0.4 +
        (clsStats && clsStats.p95 < 0.1 ? 100 : clsStats ? 60 : 80) * 0.3 +
        (errorStats && errorStats.count < 5 ? 100 : errorStats ? 50 : 90) * 0.3
      );
      subsystems.push({
        name: "frontend",
        score: frontendScore,
        status: scoreToStatus(frontendScore),
        lastChecked: Date.now(),
      });

      // 3. Compute SLO statuses (using mock good/total events from available data)
      const slos = SITA_SLOS.map(slo => {
        // In a real system, these would come from a metrics database
        // For now, derive from probe results and telemetry
        let goodEvents = 95;
        let totalEvents = 100;

        const matchingProbe = probeData?.probes?.find((p: any) =>
          slo.service.includes(p.target?.split("-")[0] ?? "")
        );
        if (matchingProbe) {
          goodEvents = matchingProbe.status === "pass" ? 99 : matchingProbe.status === "degraded" ? 90 : 50;
        }

        return computeSLOStatus(slo, goodEvents, totalEvents);
      });
      setSloStatuses(slos);

      // 4. Compute composite health index
      const index = computeHealthIndex(subsystems, slos, [], previousScore.current);
      previousScore.current = index.overallScore;
      setHealthIndex(index);

      // 5. Update recent events
      setRecentEvents(telemetry.getRecentEvents(50));
    } catch (err) {
      console.error("[Observability] Refresh failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Start telemetry collection
    telemetry.start();

    // Initial refresh
    refresh();

    // Auto-refresh every 60s
    const interval = setInterval(refresh, 60_000);

    // Subscribe to telemetry events for live updates
    const unsubscribe = telemetry.subscribe(() => {
      setRecentEvents(telemetry.getRecentEvents(50));
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refresh]);

  const recordMetric = useCallback((metric: string, value: number) => {
    telemetry.record(metric as unknown, value);
  }, []);

  return { healthIndex, recentEvents, sloStatuses, isLoading, refresh, recordMetric };
}
