// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic CRUD Capability Handler
// Routes all table-level CRUD operations through the kernel.
// Capability IDs follow the convention: {table}.{operation}
// ═══════════════════════════════════════════════════════════════

import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

export interface CrudPayload {
  table: string;
  data?: Record<string, unknown>;
  id?: string;
  filters?: Record<string, unknown>;
  userId?: string;
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("Not authenticated");
  return user.id;
}

/**
 * Execute a generic CRUD operation.
 * Called by the kernel's capability router when a capability matches "*.insert|update|upsert|delete".
 */
export async function executeCrud(
  capabilityId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const [table, operation] = capabilityId.split(".");
  if (!table || !operation) throw new Error(`Invalid capability: ${capabilityId}`);

  const userId = (payload.userId ?? payload.user_id) as string ?? await getUserId();
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const id = (payload.id ?? data.id) as string | undefined;

  // Ensure user_id is always set for inserts/upserts
  const withUser: Record<string, unknown> = { ...data, user_id: userId };
  // Remove meta fields from the actual DB payload
  delete withUser.userId;
  delete withUser._capabilityId;

  switch (operation) {
    case "insert": {
      const { data: result, error } = await fromDynamicTable(table)
        .insert(withUser)
        .select()
        .single();
      if (error) throw error;
      return result as Record<string, unknown>;
    }
    case "update": {
      if (!id) throw new Error("update requires id");
      const updateData = { ...data };
      delete updateData.userId;
      delete updateData.table;
      delete updateData.id;
      const { data: result, error } = await fromDynamicTable(table)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as Record<string, unknown>;
    }
    case "upsert": {
      const conflict = payload.onConflict as string | undefined;
      const opts = conflict ? { onConflict: conflict } : undefined;
      const { data: result, error } = await fromDynamicTable(table)
        .upsert(withUser, opts)
        .select()
        .single();
      if (error) throw error;
      return result as Record<string, unknown>;
    }
    case "delete": {
      if (!id) throw new Error("delete requires id");
      const { error } = await fromDynamicTable(table)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { deleted: true, id };
    }
    case "bulk_upsert": {
      const items = payload.items as Record<string, unknown>[];
      const conflict = payload.onConflict as string | undefined;
      const itemsWithUser = items.map(item => ({ ...item, user_id: userId }));
      const { error } = await fromDynamicTable(table)
        .upsert(itemsWithUser as never, conflict ? { onConflict: conflict } : undefined);
      if (error) throw error;
      return { upserted: items.length };
    }
    default:
      throw new Error(`Unknown CRUD operation: ${operation}`);
  }
}

/**
 * Register the generic CRUD handler with the kernel capability router.
 */
export function registerCrudCapabilities(
  register: (domain: string, capabilityId: string, handler: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>) => void,
) {
  // Register a wildcard-style handler — the kernel routes "*.insert", "*.update", etc.
  // through executeCrud when no specific handler is registered.
  register("crud", "*", async (payload) => {
    const capabilityId = payload._capabilityId as string;
    return executeCrud(capabilityId, payload);
  });
}
