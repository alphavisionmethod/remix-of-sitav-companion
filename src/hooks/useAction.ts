// ═══════════════════════════════════════════════════════════════
// SITA OS — useAction() Hook
// Wraps kernel.executeAction() via useCanonicalAction() with
// React Query mutation patterns, toast feedback, and automatic
// query invalidation. ALL writes should route through this hook.
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCanonicalAction } from "@/platform/sita/contexts/SitaKernelContext";
import { toast } from "sonner";

export interface UseActionOptions {
  /** Toast message on success */
  successMessage?: string;
  /** Toast message on failure (falls back to error.message) */
  errorMessage?: string;
  /** React Query keys to invalidate on success */
  invalidateKeys?: string[][];
  /** Called after successful execution */
  onSuccess?: (result: Record<string, unknown> | null) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Skip toast entirely */
  silent?: boolean;
  /** Amount for budget/approval gating */
  amount?: number;
  /** Run as simulation (no side effects) */
  isSimulation?: boolean;
}

/**
 * Universal kernel mutation hook for SITA OS.
 * Routes all writes through the canonical 12-stage kernel pipeline.
 *
 * @example
 * ```tsx
 * const createBill = useAction("finance", "bill.create", {
 *   successMessage: "Bill created",
 *   invalidateKeys: [["bills"]],
 * });
 *
 * createBill.mutate({ payee: "Electric Co", amount: 150 });
 * ```
 */
export function useAction<TPayload = Record<string, unknown>>(
  domain: string,
  capabilityId: string,
  options: UseActionOptions = {},
) {
  const { execute } = useCanonicalAction();
  const qc = useQueryClient();

  return useMutation<Record<string, unknown> | null, Error, TPayload>({
    mutationFn: async (payload: TPayload) => {
      const result = await execute(domain, capabilityId, payload as unknown as Record<string, unknown>, {
        amount: options.amount,
        isSimulation: options.isSimulation,
        intent: capabilityId,
      });
      if (!result && !options.silent) {
        throw new Error(options.errorMessage ?? `Action ${capabilityId} failed`);
      }
      return result;
    },
    onSuccess: (data) => {
      if (!options.silent && options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
      options.onSuccess?.(data);
    },
    onError: (err: Error) => {
      if (!options.silent) {
        toast.error(options.errorMessage ?? err.message);
      }
      options.onError?.(err);
    },
  });
}
