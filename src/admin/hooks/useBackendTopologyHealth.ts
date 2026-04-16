// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend Topology & DB Health Hook
// Provides topology validation + DB health data for admin UI
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { validateTopology, type TopologyValidationResult } from "@/lib/backend-topology/edge-function-topology-validator";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_CATEGORIES, getCategoryCounts, type EdgeFunctionCategory } from "@/lib/backend-topology/edge-function-categories";
import { EDGE_FUNCTION_OWNER_MAP, getOwnerCounts, type OwnerTeam } from "@/lib/backend-topology/edge-function-owner-map";
import { computeDbHealth, type DbHealthReport } from "@/lib/db/db-health-engine";

export interface BackendTopologyHealth {
  readonly topology: TopologyValidationResult;
  readonly dbHealth: DbHealthReport;
  readonly categoryCounts: Record<EdgeFunctionCategory, number>;
  readonly ownerCounts: Record<OwnerTeam, number>;
  readonly functions: typeof EDGE_FUNCTION_REGISTRY;
  readonly functionDetails: readonly {
    name: string;
    category: EdgeFunctionCategory | "unknown";
    owner: OwnerTeam | "unassigned";
    status: string;
  }[];
}

export function useBackendTopologyHealth(): BackendTopologyHealth {
  return useMemo(() => {
    const topology = validateTopology();
    const dbHealth = computeDbHealth();
    const categoryCounts = getCategoryCounts();
    const ownerCounts = getOwnerCounts();

    const functionDetails = EDGE_FUNCTION_REGISTRY.map(f => ({
      name: f.name,
      category: (EDGE_FUNCTION_CATEGORIES[f.name] ?? "unknown") as EdgeFunctionCategory | "unknown",
      owner: (EDGE_FUNCTION_OWNER_MAP[f.name] ?? "unassigned") as OwnerTeam | "unassigned",
      status: f.status,
    }));

    return { topology, dbHealth, categoryCounts, ownerCounts, functions: EDGE_FUNCTION_REGISTRY, functionDetails };
  }, []);
}
