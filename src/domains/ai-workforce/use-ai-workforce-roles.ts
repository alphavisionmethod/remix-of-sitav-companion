import { useQuery } from "@tanstack/react-query";
import { fetchWorkforceRoles, fetchWorkforceRoleHealth } from "./admin-ai-workforce-client";

export function useAIWorkforceRoles() {
  return useQuery({
    queryKey: ["ai-workforce-roles"],
    queryFn: fetchWorkforceRoles,
    staleTime: 30_000,
  });
}

export function useAIWorkforceRoleHealth() {
  return useQuery({
    queryKey: ["ai-workforce-role-health"],
    queryFn: fetchWorkforceRoleHealth,
    staleTime: 30_000,
  });
}
