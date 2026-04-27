// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Mutation Hook
// Wraps useCanonicalAction with React Query mutation patterns.
// ALL writes go through the canonical execution chain.
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useCanonicalAction } from "@/platform/sita/contexts/SitaKernelContext";
import { toast } from "sonner";

interface KernelMutationOptions {
  /** Toast message on success */
  successMessage?: string;
  /** Query keys to invalidate on success */
  invalidateKeys?: string[][];
  /** Amount for budget/approval gating */
  amount?: number;
  /** Run as simulation (no side effects) */
  isSimulation?: boolean;
  /** Custom intent label for audit trail */
  intent?: string;
  /** Suppress default error toast */
  silentErrors?: boolean;
}

/**
 * Kernel-routed mutation hook.
 * Replaces direct `fromTable().insert/update/delete` with canonical chain execution.
 *
 * Usage:
 * ```ts
 * const { mutate } = useKernelMutation("finance", "invoice.create", {
 *   successMessage: "Invoice created",
 *   invalidateKeys: [["invoices"]],
 * });
 * mutate({ customer_id, amount, due_date });
 * ```
 */
export function useKernelMutation(
  domain: string,
  capabilityId: string,
  options: KernelMutationOptions = {},
) {
  const { execute } = useCanonicalAction();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const result = await execute(domain, capabilityId, payload, {
        amount: options.amount,
        isSimulation: options.isSimulation,
        intent: options.intent ?? capabilityId,
      });

      if (!result) throw new Error(`Kernel execution failed for ${domain}.${capabilityId}`);

      if ((result as Record<string, unknown>).blocked) {
        throw new Error(
          (result as Record<string, unknown>).blockReason as string ||
          `Action blocked by policy for ${capabilityId}`
        );
      }

      return result;
    },
    onSuccess: () => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (err: Error) => {
      if (!options.silentErrors) {
        toast.error(err.message);
      }
    },
  });
}

/**
 * Kernel-routed mutation for batch operations.
 * Executes multiple payloads through the canonical chain sequentially.
 */
export function useKernelBatchMutation(
  domain: string,
  capabilityId: string,
  options: KernelMutationOptions = {},
) {
  const { execute } = useCanonicalAction();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payloads: Record<string, unknown>[]) => {
      const results: Record<string, unknown>[] = [];
      for (const payload of payloads) {
        const result = await execute(domain, capabilityId, payload, {
          amount: options.amount,
          isSimulation: options.isSimulation,
          intent: options.intent ?? `batch.${capabilityId}`,
        });
        if (result) results.push(result as Record<string, unknown>);
      }
      return results;
    },
    onSuccess: () => {
      if (options.successMessage) toast.success(options.successMessage);
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (err: Error) => {
      if (!options.silentErrors) toast.error(err.message);
    },
  });
}
