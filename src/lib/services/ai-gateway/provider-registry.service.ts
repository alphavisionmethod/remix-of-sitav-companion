// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Provider Registry Service
// Supabase-backed: providers, models, health
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { AIModelRegistry, AIProviderHealth } from "./types";

// ── Model Registry ─────────────────────────────────────────────
export async function getAIModelRegistry(): Promise<AIModelRegistry[]> {
  const { data, error } = await supabase
    .from("ai_model_registry")
    .select("*")
    .order("provider")
    .order("model_class");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveModels(): Promise<AIModelRegistry[]> {
  const { data, error } = await supabase
    .from("ai_model_registry")
    .select("*")
    .eq("deprecated", false)
    .order("provider");
  if (error) throw error;
  return data ?? [];
}

export async function getModelsByProvider(provider: string): Promise<AIModelRegistry[]> {
  const { data, error } = await supabase
    .from("ai_model_registry")
    .select("*")
    .eq("provider", provider)
    .eq("deprecated", false)
    .order("cost_tier");
  if (error) throw error;
  return data ?? [];
}

// ── Provider Health ────────────────────────────────────────────
export async function getProviderHealth(): Promise<AIProviderHealth[]> {
  const { data, error } = await supabase
    .from("ai_provider_health")
    .select("*")
    .order("provider");
  if (error) throw error;
  return data ?? [];
}

export async function getProviderHealthByProvider(provider: string): Promise<AIProviderHealth[]> {
  const { data, error } = await supabase
    .from("ai_provider_health")
    .select("*")
    .eq("provider", provider)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Unique providers from model registry ───────────────────────
export async function getDistinctProviders(): Promise<string[]> {
  const { data, error } = await supabase
    .from("ai_model_registry")
    .select("provider")
    .eq("deprecated", false);
  if (error) throw error;
  const unique = [...new Set((data ?? []).map(d => d.provider))];
  return unique.sort();
}
