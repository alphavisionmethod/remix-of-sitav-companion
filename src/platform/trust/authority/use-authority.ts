// ════════════════════════════════════════════════════════════
// SITA OS — Authority Hooks (Phase 2)
// React-Query bindings around the authority evaluator.
// ════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  evaluateActionAuthority,
  setActionAuthority,
  clearActionAuthority,
  type AuthorityDecision,
} from "./authority-evaluator";
import type { AuthorityLevel } from "../registry/trust-action-registry";

export interface TrustCatalogRow {
  action_key: string;
  pillar: string;
  label: string;
  description: string;
  risk_tier: "low" | "medium" | "high" | "critical";
  default_authority_level: AuthorityLevel;
  require_approval: boolean;
  reversible: boolean;
}

export interface AuthoritySettingRow {
  action_key: string;
  authority_level: AuthorityLevel;
  reason: string | null;
  expires_at: string | null;
}

/** Resolve effective authority for a single action. */
export function useActionAuthority(actionKey: string | null) {
  return useQuery<AuthorityDecision | null>({
    queryKey: ["trust", "authority", actionKey],
    enabled: !!actionKey,
    queryFn: async () => (actionKey ? evaluateActionAuthority(actionKey) : null),
    staleTime: 30_000,
  });
}

/** Full catalog (reference data — readable to all signed-in users). */
export function useTrustActionCatalog() {
  return useQuery<TrustCatalogRow[]>({
    queryKey: ["trust", "catalog"],
    queryFn: async () => {
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            order: (col: string) => Promise<{ data: TrustCatalogRow[] | null; error: { message: string } | null }>;
          };
        };
      })
        .from("trust_action_catalog")
        .select("action_key,pillar,label,description,risk_tier,default_authority_level,require_approval,reversible")
        .order("pillar");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

/** Active user overrides. */
export function useMyAuthoritySettings() {
  return useQuery<AuthoritySettingRow[]>({
    queryKey: ["trust", "authority-settings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => Promise<{ data: AuthoritySettingRow[] | null; error: { message: string } | null }>;
          };
        };
      })
        .from("automation_authority_settings")
        .select("action_key,authority_level,reason,expires_at")
        .eq("user_id", u.user.id);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

/** Mutation: set or update an authority override. */
export function useSetActionAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { actionKey: string; level: AuthorityLevel; reason?: string }) =>
      setActionAuthority(input.actionKey, input.level, input.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trust", "authority-settings"] });
      qc.invalidateQueries({ queryKey: ["trust", "authority"] });
    },
  });
}

/** Mutation: revert an action to its catalog default. */
export function useClearActionAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (actionKey: string) => clearActionAuthority(actionKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trust", "authority-settings"] });
      qc.invalidateQueries({ queryKey: ["trust", "authority"] });
    },
  });
}