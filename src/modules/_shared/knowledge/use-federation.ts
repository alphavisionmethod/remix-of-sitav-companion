// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8 Federation hooks
// React Query bindings for cross-workspace federation surfaces.
// ═══════════════════════════════════════════════════════════════
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFederation,
  federateMemories,
  listFederationOverview,
  revokeFederation,
  type CreateFederationInput,
} from "./federation-service";

const KEY = ["phase-8", "federation-overview"] as const;

export function useFederationOverview() {
  return useQuery({
    queryKey: KEY,
    queryFn: listFederationOverview,
    staleTime: 30_000,
  });
}

export function useCreateFederation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFederationInput) => createFederation(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRevokeFederation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (federationId: string) => revokeFederation(federationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useFederateMemories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { federationId: string; memoryIds: string[] }) =>
      federateMemories(input.federationId, input.memoryIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}