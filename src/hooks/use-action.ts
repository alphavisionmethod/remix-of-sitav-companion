// ═══════════════════════════════════════════════════════════════
// SITA OS — useAction() Hook
// Universal mutation hook routing ALL writes through the kernel.
// Wraps kernel.executeAction() with React Query mutation patterns,
// toast feedback, and automatic query invalidation.
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCanonicalAction } from "@/platform/sita/contexts/SitaKernelContext";
import { toast } from "sonner";
import { useCallback } from "react";

export interface UseActionOptions {
  /** Toast message on success */
  successMessage?: string;
  /** Toast message on failure */
  errorMessage?: string;
  /** React Query keys to invalidate on success */
  invalidateKeys?: string[][];
  /** Called after successful execution */
  onSuccess?: (result: Record<string, unknown> | null) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Skip toast entirely */
  silent?: boolean;
}

/**
 * Universal mutation hook for SITA OS.
 * Routes all writes through the canonical 12-stage kernel pipeline.
 *
 * @example
 * ```tsx
 * const createInvoice = useAction("finance", "invoice.create", {
 *   successMessage: "Invoice created",
 *   invalidateKeys: [["invoices"]],
 * });
 *
 * createInvoice.mutate({ amount: 1000, customer_id: "..." });
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
      const result = await execute(domain, capabilityId, payload as unknown as Record<string, unknown>);
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

/**
 * Imperative variant for non-React-Query contexts (event handlers, etc.).
 * Returns a simple async function instead of a mutation object.
 */
export function useActionFn<TPayload = Record<string, unknown>>(
  domain: string,
  capabilityId: string,
  options: UseActionOptions = {},
) {
  const { execute } = useCanonicalAction();
  const qc = useQueryClient();

  return useCallback(async (payload: TPayload) => {
    try {
      const result = await execute(domain, capabilityId, payload as unknown as Record<string, unknown>);
      if (!options.silent && options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          qc.invalidateQueries({ queryKey: key });
        }
      }
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      if (!options.silent) {
        toast.error(options.errorMessage ?? msg);
      }
      options.onError?.(err instanceof Error ? err : new Error(msg));
      return null;
    }
  }, [execute, domain, capabilityId, qc, options]);
}
