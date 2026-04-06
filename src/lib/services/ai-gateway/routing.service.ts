// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Service
// Supabase-backed: routing policies + capability routing
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { AIRoutingPolicy, AICapabilityRouting } from "./types";

// ── Legacy routing policies ────────────────────────────────────
export async function getRoutingPolicies(): Promise<AIRoutingPolicy[]> {
  const { data, error } = await supabase
    .from("ai_routing_policies")
    .select("*")
    .order("capability_id");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveRoutingPolicies(): Promise<AIRoutingPolicy[]> {
  const { data, error } = await supabase
    .from("ai_routing_policies")
    .select("*")
    .eq("enabled", true)
    .order("capability_id");
  if (error) throw error;
  return data ?? [];
}

export async function getRoutingForCapability(capabilityId: string): Promise<AIRoutingPolicy | null> {
  const { data, error } = await supabase
    .from("ai_routing_policies")
    .select("*")
    .eq("capability_id", capabilityId)
    .eq("enabled", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Canonical capability routing ───────────────────────────────
export async function getCapabilityRouting(): Promise<AICapabilityRouting[]> {
  const { data, error } = await supabase
    .from("ai_capability_routing")
    .select("*")
    .order("capability_key");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveCapabilityRouting(): Promise<AICapabilityRouting[]> {
  const { data, error } = await supabase
    .from("ai_capability_routing")
    .select("*")
    .eq("is_active", true)
    .order("capability_key");
  if (error) throw error;
  return data ?? [];
}

export async function getCapabilityRoutingByKey(capabilityKey: string): Promise<AICapabilityRouting | null> {
  const { data, error } = await supabase
    .from("ai_capability_routing")
    .select("*")
    .eq("capability_key", capabilityKey)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
