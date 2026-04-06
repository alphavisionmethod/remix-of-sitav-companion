// ═══════════════════════════════════════════════════════════════
// SITA OS — Typed Edge Function Client
// Type-safe wrapper around supabase.functions.invoke()
// Uses shared API schemas for compile-time safety.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { EdgeFunctionMap, EdgeFunctionName } from "@/packages/contracts/api-schemas";

export interface EdgeCallOptions {
  method?: "POST" | "GET";
  headers?: Record<string, string>;
}

export interface EdgeCallResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Type-safe edge function caller.
 * Enforces correct request/response types at compile time.
 *
 * @example
 * const result = await callEdge("personal-brain", {
 *   messages: [{ role: "user", content: "Hello" }],
 *   mode: "think",
 * });
 * // result.data is PersonalBrainResponse | null
 */
export async function callEdge<K extends EdgeFunctionName>(
  functionName: K,
  body: EdgeFunctionMap[K]["request"],
  options?: EdgeCallOptions,
): Promise<EdgeCallResult<EdgeFunctionMap[K]["response"]>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      method: options?.method,
      headers: options?.headers,
    });

    if (error) {
      return { data: null, error: error.message || "Edge function error" };
    }

    return { data: data as EdgeFunctionMap[K]["response"], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error calling edge function",
    };
  }
}

/**
 * Fire-and-forget edge function call (no response needed).
 */
export async function fireEdge<K extends EdgeFunctionName>(
  functionName: K,
  body: EdgeFunctionMap[K]["request"],
): Promise<void> {
  await supabase.functions.invoke(functionName, { body }).catch(() => {});
}

/**
 * Batch multiple edge function calls in parallel.
 */
export async function batchEdge<
  C extends Array<{ fn: EdgeFunctionName; body: unknown }>
>(
  calls: C,
): Promise<Array<EdgeCallResult<unknown>>> {
  return Promise.all(
    calls.map(({ fn, body }) =>
      callEdge(fn as EdgeFunctionName, body as EdgeFunctionMap[typeof fn]["request"]),
    ),
  );
}
