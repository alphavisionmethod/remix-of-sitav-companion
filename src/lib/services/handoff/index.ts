// ═══════════════════════════════════════════════════════════════
// SITA OS — Handoff Service
// Creates, persists, and consumes cross-surface handoff packets
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

export interface HandoffInput {
  fromSurface: string;
  toSurface: string;
  domain: DomainId;
  context: Record<string, unknown>;
  memoryKeys?: string[];
  unresolvedItems?: string[];
  priority?: "high" | "medium" | "low";
  fromAdvisor?: string;
  toAdvisor?: string;
  ttlMinutes?: number;
}

export interface PersistedHandoff {
  id: string;
  user_id: string;
  from_surface: string;
  to_surface: string;
  domain: string;
  context: Record<string, unknown>;
  memory_keys: string[];
  unresolved_items: string[];
  priority: string;
  accepted: boolean;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export class HandoffService {
  async createHandoff(userId: string, input: HandoffInput): Promise<string | null> {
    const expiresAt = new Date(
      Date.now() + (input.ttlMinutes ?? 30) * 60 * 1000
    ).toISOString();

    const { data, error } = await fromTable("handoff_packets")
      .insert({
        user_id: userId,
        from_surface: input.fromSurface,
        to_surface: input.toSurface,
        from_advisor: input.fromAdvisor ?? null,
        to_advisor: input.toAdvisor ?? null,
        domain: input.domain,
        context: input.context,
        memory_keys: input.memoryKeys ?? [],
        unresolved_items: input.unresolvedItems ?? [],
        priority: input.priority ?? "medium",
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[HandoffService] Create failed:", error);
      return null;
    }
    return data?.id ?? null;
  }

  async getPendingHandoffs(userId: string, surfaceId?: string): Promise<PersistedHandoff[]> {
    let query = fromTable("handoff_packets")
      .select("*")
      .eq("user_id", userId)
      .eq("accepted", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (surfaceId) {
      query = query.eq("to_surface", surfaceId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[HandoffService] Fetch failed:", error);
      return [];
    }
    return data ?? [];
  }

  async acceptHandoff(handoffId: string): Promise<boolean> {
    const { error } = await fromTable("handoff_packets")
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", handoffId);

    if (error) {
      console.error("[HandoffService] Accept failed:", error);
      return false;
    }
    return true;
  }

  async dismissHandoff(handoffId: string): Promise<boolean> {
    // Mark as accepted so it won't show again
    return this.acceptHandoff(handoffId);
  }
}

// ── Factory ─────────────────────────────────────────────────────

let _instance: HandoffService | null = null;

export function getHandoffService(): HandoffService {
  if (!_instance) _instance = new HandoffService();
  return _instance;
}
