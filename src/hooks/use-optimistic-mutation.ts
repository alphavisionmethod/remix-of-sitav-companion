// ═══════════════════════════════════════════════════════════════
// SITA OS — Optimistic Mutation Hook
// Provides optimistic UI updates with automatic rollback
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";

export type MutationStatus = "idle" | "pending" | "success" | "error";

export interface OptimisticMutationReturn<T> {
  execute: (optimisticValue: T, mutationFn: () => Promise<T>) => Promise<T | null>;
  status: MutationStatus;
  error: string | null;
  value: T | null;
  rollback: () => void;
}

export function useOptimisticMutation<T>(initialValue: T | null = null): OptimisticMutationReturn<T> {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<T | null>(initialValue);
  const [previousValue, setPreviousValue] = useState<T | null>(null);

  const rollback = useCallback(() => {
    if (previousValue !== null) {
      setValue(previousValue);
      setPreviousValue(null);
    }
    setStatus("idle");
    setError(null);
  }, [previousValue]);

  const execute = useCallback(
    async (optimisticValue: T, mutationFn: () => Promise<T>): Promise<T | null> => {
      setPreviousValue(value);
      setValue(optimisticValue);
      setStatus("pending");
      setError(null);

      try {
        const result = await mutationFn();
        setValue(result);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
        return result;
      } catch (err) {
        // Rollback on failure
        setValue(previousValue ?? value);
        setError((err as Error).message);
        setStatus("error");
        return null;
      }
    },
    [value, previousValue]
  );

  return { execute, status, error, value, rollback };
}
