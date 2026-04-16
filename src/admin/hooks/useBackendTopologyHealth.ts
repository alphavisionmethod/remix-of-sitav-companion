// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Topology & DB Health Hook
// Provides topology validation + DB health data for admin UI
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { validateTopology, type TopologyValidationResult } from "@/lib/backend-topology/edge-function-topology-validator";
import { EDGE_FUNCTION_REGISTRY, type EdgeFunctionEntry } from "@/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_CATEGORIES, getCategoryCounts, type EdgeFunctionCategory, type ClassificationVerdict } from "@/lib/backend-topology/edge-function-categories";
import { EDGE_FUNCTION_OWNER_MAP, getOwnerCounts, type OwnerTeam } from "@/lib/backend-topology/edge-function-owner-map";
import { computeDbHealth, type DbHealthReport } from "@/lib/db/db-health-engine";

export interface BackendTopologyHealth {
  readonly topology: TopologyValidationResult;
  readonly dbHealth: DbHealthReport;
  readonly categoryCounts: Record<EdgeFunctionCategory, number>;
  readonly ownerCounts: Record<OwnerTeam, number>;
  readonly backendCategoryCounts: Partial<Record<ClassificationVerdict, number>>;
  readonly functions: readonly EdgeFunctionEntry[];
  readonly functionDetails: readonly {
    readonly name: string;
    readonly category: EdgeFunctionCategory | "unknown";
    readonly backendCategory: ClassificationVerdict;
    readonly boundedContext: string;
    readonly owner: OwnerTeam | "unassigned";
    readonly authModel: string;
    readonly sideEffectClass: string;
    readonly allowedCallers: readonly string[];
    readonly callsInto: readonly string[];
    readonly runtimeConsequence: string;
    readonly migrationStatus: string;
    readonly status: string;
  }[];
}

export function useBackendTopologyHealth(): BackendTopologyHealth {
  return useMemo(() => {
    const topology = validateTopology();
    const dbHealth = computeDbHealth();
    const categoryCounts = getCategoryCounts();
    const ownerCounts = getOwnerCounts();

    const backendCategoryCounts: Partial<Record<ClassificationVerdict, number>> = {};
    for (const f of EDGE_FUNCTION_REGISTRY) {
      backendCategoryCounts[f.category] = (backendCategoryCounts[f.category] ?? 0) + 1;
    }

    const functionDetails = EDGE_FUNCTION_REGISTRY.map(f => ({
      name: f.name,
      category: (EDGE_FUNCTION_CATEGORIES[f.name] ?? "unknown") as EdgeFunctionCategory | "unknown",
      backendCategory: f.category,
      boundedContext: f.boundedContext,
      owner: (EDGE_FUNCTION_OWNER_MAP[f.name] ?? "unassigned") as OwnerTeam | "unassigned",
      authModel: f.authModel,
      sideEffectClass: f.sideEffectClass,
      allowedCallers: f.allowedCallers,
      callsInto: f.callsInto,
      runtimeConsequence: f.runtimeConsequence,
      migrationStatus: f.migrationStatus,
      status: f.status,
    }));

    return { topology, dbHealth, categoryCounts, ownerCounts, backendCategoryCounts, functions: EDGE_FUNCTION_REGISTRY, functionDetails };
  }, []);
}
