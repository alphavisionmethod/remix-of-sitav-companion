// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent: Per-domain autonomy tier (Phase E)
// ═══════════════════════════════════════════════════════════════
// L0 — propose only (always ask)
// L1 — suggest (default; ask before each step)
// L2 — assist (auto-run low-risk reversible; ask for medium/high)
// L3 — execute (auto-run any reversible; ask only for irreversible/high)
// L4 — autopilot (auto-run anything within ceiling policy)
//
// Local-first: localStorage is the source of truth for fast reads,
// best-effort sync to `sita_autonomy_preferences` for portability.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SitaAgentDomain } from "./plan-types";

const LS_KEY = "sita_autonomy_tiers_v1";
const DEFAULT: Record<SitaAgentDomain, number> = {
  business: 1,
  finance: 1,
  concierge: 1,
};

export type AutonomyTiers = Record<SitaAgentDomain, number>;

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(4, Math.round(n)));
}

function readLocal(): AutonomyTiers {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<AutonomyTiers>;
    return {
      business: clamp(parsed.business ?? DEFAULT.business),
      finance: clamp(parsed.finance ?? DEFAULT.finance),
      concierge: clamp(parsed.concierge ?? DEFAULT.concierge),
    };
  } catch {
    return { ...DEFAULT };
  }
}

function writeLocal(tiers: AutonomyTiers) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(tiers));
    window.dispatchEvent(new CustomEvent("sita-autonomy-changed", { detail: tiers }));
  } catch {
    /* noop */
  }
}

export function getAutonomyTier(domain: SitaAgentDomain): number {
  return readLocal()[domain];
}

export function getAutonomyTiers(): AutonomyTiers {
  return readLocal();
}

export async function setAutonomyTier(domain: SitaAgentDomain, tier: number, userId?: string | null) {
  const next = { ...readLocal(), [domain]: clamp(tier) };
  writeLocal(next);
  if (userId) {
    try {
      await supabase.from("sita_autonomy_preferences").upsert(
        { user_id: userId, tiers: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    } catch (err) {
      console.warn("[sita-autonomy] remote sync failed", err);
    }
  }
}

export function useAutonomyTiers(userId?: string | null): {
  tiers: AutonomyTiers;
  setTier: (domain: SitaAgentDomain, tier: number) => Promise<void>;
} {
  const [tiers, setTiers] = useState<AutonomyTiers>(() => readLocal());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AutonomyTiers>).detail;
      if (detail) setTiers(detail);
    };
    window.addEventListener("sita-autonomy-changed", onChange);
    return () => window.removeEventListener("sita-autonomy-changed", onChange);
  }, []);

  // One-shot remote hydrate (does not overwrite local if server is empty).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("sita_autonomy_preferences")
          .select("tiers")
          .eq("user_id", userId)
          .maybeSingle();
        if (cancelled || !data?.tiers) return;
        const remote = data.tiers as Partial<AutonomyTiers>;
        const merged: AutonomyTiers = {
          business: clamp(remote.business ?? readLocal().business),
          finance: clamp(remote.finance ?? readLocal().finance),
          concierge: clamp(remote.concierge ?? readLocal().concierge),
        };
        writeLocal(merged);
      } catch {
        /* noop */
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const setTier = useCallback(async (domain: SitaAgentDomain, tier: number) => {
    await setAutonomyTier(domain, tier, userId ?? null);
  }, [userId]);

  return { tiers, setTier };
}

/** Decide whether a step can run without explicit user approval. */
export function canAutoRunStep(opts: {
  tier: number;
  risk: "low" | "medium" | "high";
  reversible: boolean;
  requiresApproval: boolean;
}): boolean {
  if (opts.requiresApproval) return false;
  if (!opts.reversible && opts.risk !== "low") return false;
  switch (opts.tier) {
    case 0: return false;
    case 1: return false;
    case 2: return opts.risk === "low" && opts.reversible;
    case 3: return opts.reversible;
    case 4: return true;
    default: return false;
  }
}