// ═══════════════════════════════════════════════════════════════════
// SITA OS — Module Registry Service (Phase 1)
// Reads from public.module_registry. Single source of truth for which
// modules / sub-apps exist, where they live, and how they should be
// surfaced in launcher, nav, command palette, admin views.
// ═══════════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ModulePillar = "business" | "concierge" | "finance" | "health" | "shared" | "trust";
export type ModuleLifecycle = "ga" | "beta" | "experimental" | "legacy" | "planned";
export type AuthorityLevel = "suggest" | "ask" | "pre_approved" | "blocked";
export type ModuleHealth = "healthy" | "degraded" | "down" | "unknown";

export interface ModuleRegistryRow {
  id: string;
  module_id: string;
  parent_id: string | null;
  pillar: ModulePillar;
  label: string;
  description: string | null;
  route_prefix: string | null;
  icon: string | null;
  category: string | null;
  feature_flag: string | null;
  lifecycle: ModuleLifecycle;
  default_authority_level: AuthorityLevel;
  health_status: ModuleHealth;
  owner: string | null;
  sort_order: number;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

export interface RouteOwnershipRow {
  id: string;
  route_path: string;
  module_id: string;
  is_shared: boolean;
  is_trust: boolean;
  visibility: "public" | "internal" | "admin";
  lifecycle: ModuleLifecycle;
  notes: string | null;
}

export const MODULE_REGISTRY_QUERY_KEY = ["sita", "module-registry"] as const;
export const ROUTE_OWNERSHIP_QUERY_KEY = ["sita", "route-ownership"] as const;

/** Fetch all modules. Cached for the session — modules rarely change. */
export function useModuleRegistry() {
  return useQuery({
    queryKey: MODULE_REGISTRY_QUERY_KEY,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ModuleRegistryRow[]> => {
      const { data, error } = await supabase
        .from("module_registry")
        .select("*")
        .eq("enabled", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ModuleRegistryRow[];
    },
  });
}

/** Fetch all known route ownership rows. */
export function useRouteOwnership() {
  return useQuery({
    queryKey: ROUTE_OWNERSHIP_QUERY_KEY,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<RouteOwnershipRow[]> => {
      const { data, error } = await supabase
        .from("route_ownership")
        .select("*")
        .order("route_path", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RouteOwnershipRow[];
    },
  });
}

/** Best-prefix-match for a given path → owning module row. */
export function findOwningModule(
  path: string,
  modules: readonly ModuleRegistryRow[],
): ModuleRegistryRow | null {
  let best: ModuleRegistryRow | null = null;
  let bestLen = 0;
  for (const m of modules) {
    const prefix = m.route_prefix;
    if (!prefix) continue;
    if (path === prefix || path.startsWith(prefix + "/")) {
      if (prefix.length > bestLen) {
        best = m;
        bestLen = prefix.length;
      }
    }
  }
  return best;
}

/** Group modules by parent_id for tree rendering. */
export function groupModulesByParent(
  modules: readonly ModuleRegistryRow[],
): { roots: ModuleRegistryRow[]; childrenOf: Record<string, ModuleRegistryRow[]> } {
  const roots: ModuleRegistryRow[] = [];
  const childrenOf: Record<string, ModuleRegistryRow[]> = {};
  for (const m of modules) {
    if (!m.parent_id) {
      roots.push(m);
    } else {
      (childrenOf[m.parent_id] ??= []).push(m);
    }
  }
  return { roots, childrenOf };
}