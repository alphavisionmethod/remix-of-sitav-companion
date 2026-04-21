// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Permission Gate Hook
// Checks admin_role_permissions for specific permission scopes.
// ═══════════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PermissionScope =
  | "support.view"
  | "admin.recovery"
  | "simulate.run"
  | "simulate.view"
  | "explain.view"
  | "boardroom.intake"
  | "audit.view"
  | "flags.rollout"
  | "maintenance.emergency";

interface PermissionGateResult {
  hasPermission: (scope: PermissionScope) => boolean;
  hasAny: (...scopes: PermissionScope[]) => boolean;
  hasAll: (...scopes: PermissionScope[]) => boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isLoading: boolean;
  permissions: PermissionScope[];
}

export function usePermissionGate(): PermissionGateResult {
  const { user } = useAuth();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["user_roles_gate", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user!.id);
      if (error) return [];
      return (data as any[]).map((r: any) => r.role as string);
    },
    staleTime: 60_000,
  });

  const isAdmin = roles.includes("admin");
  const isOperator = roles.includes("moderator") || isAdmin;

  // Derive permissions from roles
  const permissions: PermissionScope[] = [];
  if (isAdmin) {
    permissions.push(
      "support.view", "admin.recovery", "simulate.run", "simulate.view",
      "explain.view", "boardroom.intake", "audit.view", "flags.rollout",
      "maintenance.emergency"
    );
  } else if (isOperator) {
    permissions.push("support.view", "simulate.view", "explain.view", "boardroom.intake", "audit.view");
  } else if (user) {
    // Regular authenticated users get basic scopes
    permissions.push("simulate.view", "explain.view", "boardroom.intake");
  }

  const hasPermission = (scope: PermissionScope) => permissions.includes(scope);
  const hasAny = (...scopes: PermissionScope[]) => scopes.some(s => permissions.includes(s));
  const hasAll = (...scopes: PermissionScope[]) => scopes.every(s => permissions.includes(s));

  return { hasPermission, hasAny, hasAll, isAdmin, isOperator, isLoading: rolesLoading, permissions };
}