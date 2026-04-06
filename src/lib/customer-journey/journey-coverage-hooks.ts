// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Journey Coverage Hooks
// Action inventory + route verification coverage
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";

// ── Action Inventory ──

export function useActionInventory(filters?: { priority?: string; domain?: string }) {
  return useQuery({
    queryKey: ["ui-action-inventory", filters],
    queryFn: async () => {
      let q = (supabase as any)
        .from("ui_action_inventory")
        .select("*")
        .order("route_key", { ascending: true });
      if (filters?.priority) q = q.eq("priority_class", filters.priority);
      const { data, error } = await q;
      if (error) throw error;
      let results = data ?? [];
      if (filters?.domain) {
        results = results.filter((a: any) => a.route_key?.startsWith(filters.domain));
      }
      return results;
    },
  });
}

export function useSeedActionInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rows = SURFACE_REGISTRY.map((s) => ({
        user_id: user.id,
        route_key: s.routeKey,
        surface_class: s.shell,
        component_name: s.componentName || null,
        action_key: s.routeKey,
        action_label: s.actionLabel,
        action_type: s.actionType,
        selector_hint: s.actionSelector || null,
        test_id: s.actionSelector?.match(/data-testid='([^']+)'/)?.[1] || null,
        expected_outcome: s.expectedResult,
        supported_modes: s.supportedModes,
        priority_class: s.testPriority.toLowerCase(),
        launch_honesty_class: s.launchHonestyClass,
        is_active: true,
      }));

      const { error } = await (supabase as any)
        .from("ui_action_inventory")
        .upsert(rows, { onConflict: "user_id,route_key,action_key" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ui-action-inventory"] }),
  });
}

// ── Route Verification Coverage ──

export function useRouteCoverage() {
  return useQuery({
    queryKey: ["route-verification-coverage"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("route_verification_coverage")
        .select("*")
        .order("coverage_percent", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSeedRouteCoverage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Group surfaces by route
      const routeMap = new Map<string, { total: number; p0: number; p1: number; shell: string }>();
      for (const s of SURFACE_REGISTRY) {
        const key = s.routePath;
        const existing = routeMap.get(key) || { total: 0, p0: 0, p1: 0, shell: s.shell };
        existing.total++;
        if (s.testPriority === "P0") existing.p0++;
        if (s.testPriority === "P1") existing.p1++;
        routeMap.set(key, existing);
      }

      const rows = Array.from(routeMap.entries()).map(([route, stats]) => ({
        user_id: user.id,
        route_key: route,
        surface_class: stats.shell,
        total_actions: stats.total,
        verified_actions: 0,
        p0_actions: stats.p0,
        p0_verified_actions: 0,
        p1_actions: stats.p1,
        p1_verified_actions: 0,
        coverage_percent: 0,
      }));

      const { error } = await (supabase as any)
        .from("route_verification_coverage")
        .upsert(rows, { onConflict: "user_id,route_key" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["route-verification-coverage"] }),
  });
}
