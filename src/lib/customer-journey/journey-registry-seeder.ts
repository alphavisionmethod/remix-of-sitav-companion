// ═══════════════════════════════════════════════════════════════
// SITA OS — Journey Registry Seeder
// Seeds normalized customer_journey_registry + customer_journey_status
// from the in-code CUSTOMER_JOURNEY_REGISTRY definition
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { CUSTOMER_JOURNEY_REGISTRY } from "./journey-registry";

/**
 * Maps a domain string to a domain_family for the normalized registry
 */
function domainToFamily(domain: string): string {
  const MAP: Record<string, string> = {
    auth: "auth",
    core: "core",
    files: "files",
    boardroom: "boardroom",
    ai: "ai",
    approvals: "approvals",
    connectors: "connectors",
    settings: "settings",
    admin: "admin",
    demo: "demo",
    onboarding: "onboarding",
    search: "search",
    money: "money",
    business: "business",
  };
  return MAP[domain] || domain;
}

/**
 * Maps a persona string to surface_class
 */
function personaToSurface(persona: string): string {
  const MAP: Record<string, string> = {
    user: "web_app",
    operator: "admin_panel",
    admin: "admin_panel",
    internal_test: "internal",
  };
  return MAP[persona] || "web_app";
}

export interface SeedResult {
  registryCount: number;
  statusCount: number;
}

/**
 * Seed the normalized customer_journey_registry and customer_journey_status tables
 * from the in-code CUSTOMER_JOURNEY_REGISTRY.
 * Uses upsert on journey_key to be idempotent.
 */
export async function seedJourneyRegistry(): Promise<SeedResult> {
  const registryRows = CUSTOMER_JOURNEY_REGISTRY.map((j) => ({
    journey_key: j.journeyKey,
    display_name: j.displayName,
    persona: j.persona as string,
    surface_class: personaToSurface(j.persona),
    domain_family: domainToFamily(j.domain),
    route_key: j.routeFamily,
    priority_class: j.launchImportance === "launch_blocker" ? "p0" : j.launchImportance === "pilot_blocker" ? "p0" : "p1",
    launch_importance: j.launchImportance as string,
    expected_outcome: j.expectedOutcome,
    supported_modes: JSON.parse(JSON.stringify(j.primaryModes)),
    launch_honesty_class: null as string | null,
    owner_team: j.owner,
    is_active: true,
  }));

  // Upsert registry rows
  const { error: regError } = await (supabase as any)
    .from("customer_journey_registry")
    .upsert(registryRows, { onConflict: "journey_key" });
  if (regError) throw regError;

  // Get all registry IDs back
  const { data: registryData, error: fetchError } = await (supabase as any)
    .from("customer_journey_registry")
    .select("id, journey_key");
  if (fetchError) throw fetchError;

  // Seed status rows (unverified initial state)
  const statusRows = (registryData ?? []).map((r: any) => ({
    journey_id: r.id,
    current_status: "unverified",
    owner_team: CUSTOMER_JOURNEY_REGISTRY.find((j) => j.journeyKey === r.journey_key)?.owner || null,
  }));

  // Upsert status rows (journey_id is unique)
  const { error: statusError } = await (supabase as any)
    .from("customer_journey_status")
    .upsert(statusRows, { onConflict: "journey_id" });
  if (statusError) throw statusError;

  return {
    registryCount: registryRows.length,
    statusCount: statusRows.length,
  };
}
