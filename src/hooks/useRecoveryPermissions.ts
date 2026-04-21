// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Ops Permission Gate
// Server-side + client-side permission checks for recovery actions
// ═══════════════════════════════════════════════════════════════

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RecoveryPermission = "support.view" | "admin.recovery";

interface RecoveryPermissions {
  canView: boolean;
  canExecute: boolean;
  isLoading: boolean;
  permissions: RecoveryPermission[];
  userId: string | null;
}

export function useRecoveryPermissions(): RecoveryPermissions {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user_roles_recovery", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Check user_roles table for admin/operator roles
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

  const permissions: RecoveryPermission[] = [];
  if (isOperator || isAdmin) permissions.push("support.view");
  if (isAdmin) permissions.push("admin.recovery");

  return {
    canView: permissions.includes("support.view"),
    canExecute: permissions.includes("admin.recovery"),
    isLoading,
    permissions,
    userId: user?.id ?? null,
  };
}