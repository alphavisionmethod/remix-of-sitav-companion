// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Routing Service
// Supabase-backed: routing policies, capability → model mapping
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { AIRoutingPolicy } from "./types";

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
