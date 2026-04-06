// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Probes
// Runtime health checks for core subsystems
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface ProbeResult {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
  checkedAt: string;
}

async function probe(name: string, check: () => Promise<void>): Promise<ProbeResult> {
  const start = performance.now();
  try {
    await check();
    return { name, status: "healthy", latencyMs: Math.round(performance.now() - start), checkedAt: new Date().toISOString() };
  } catch (err) {
    return {
      name,
      status: "unhealthy",
      latencyMs: Math.round(performance.now() - start),
      message: err instanceof Error ? err.message : "Unknown error",
      checkedAt: new Date().toISOString(),
    };
  }
}

/** Supabase connectivity probe */
export async function probeSupabase(): Promise<ProbeResult> {
  return probe("supabase", async () => {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw new Error(error.message);
  });
}

/** Auth probe */
export async function probeAuth(): Promise<ProbeResult> {
  return probe("auth", async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("No active session");
  });
}

/** Storage probe */
export async function probeStorage(): Promise<ProbeResult> {
  return probe("storage", async () => {
    const { error } = await supabase.storage.from("documents").list("", { limit: 1 });
    if (error) throw new Error(error.message);
  });
}

/** Run all probes */
export async function runAllProbes(): Promise<ProbeResult[]> {
  return Promise.all([probeSupabase(), probeAuth(), probeStorage()]);
}

/** Get system health status */
export function getOverallHealth(probes: ProbeResult[]): "healthy" | "degraded" | "unhealthy" {
  if (probes.some(p => p.status === "unhealthy")) return "unhealthy";
  if (probes.some(p => p.status === "degraded")) return "degraded";
  return "healthy";
}
