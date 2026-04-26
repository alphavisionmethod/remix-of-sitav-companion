// ═══════════════════════════════════════════════════════════════
// Shared helpers for canonical kernel handlers.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

/** Resolve the current authenticated user. Throws if no session. */
export async function requireUser(): Promise<{ id: string }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Auth error: ${error.message}`);
  if (!data.user) throw new Error("Not authenticated");
  return { id: data.user.id };
}

export type HandlerSuccess = { status: "success"; result: Record<string, unknown>; rollbackData?: Record<string, unknown> };
export type HandlerFailure = { status: "failure"; result: Record<string, unknown> };
export type HandlerOutcome = HandlerSuccess | HandlerFailure;

/** Wrap an async DB op so rejections become structured failures (no throw across executor boundary). */
export async function safe<T extends Record<string, unknown>>(
  fn: () => Promise<T>
): Promise<HandlerOutcome> {
  try {
    const result = await fn();
    return { status: "success", result };
  } catch (err) {
    return {
      status: "failure",
      result: {
        error: err instanceof Error ? err.message : "Unknown handler error",
      },
    };
  }
}

/** Convenience: insert a row into `table`, automatically attaching user_id, and return the row. */
export async function insertRow(
  table: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const user = await requireUser();
  const { data, error } = await fromTable(table)
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown>;
}

/** Convenience: update a row by id (scoped to current user), return updated row. */
export async function updateRowById(
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const user = await requireUser();
  const { data, error } = await fromTable(table)
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown>;
}

/** Convenience: delete a row by id (scoped to current user). Returns the deleted row. */
export async function deleteRowById(
  table: string,
  id: string,
): Promise<Record<string, unknown>> {
  const user = await requireUser();
  const { data, error } = await fromTable(table)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { id, deleted: true, ...(data ?? {}) };
}

/** Some pages call deleteAction.mutate(rawId) while others pass { id }. Normalize. */
export function pickId(payload: Record<string, unknown>): string {
  if (typeof payload === "string") return payload;
  const id = payload.id;
  if (typeof id !== "string") throw new Error("Missing id in payload");
  return id;
}