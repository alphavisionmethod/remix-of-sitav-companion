// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Config Service
// Canonical persistence for AutopilotConfig.
// Reads/writes `public.autopilot_configs` (RLS: self-only).
// Demo mode bypasses DB. One-time migration from legacy
// localStorage key `sita-autopilot-config` runs on first live load.
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";
import {
  getDefaultConfig,
  type AutopilotConfig,
} from "@/lib/domain-engines/autopilot-engine";

const LEGACY_LS_KEY = "sita-autopilot-config";

export type AutopilotConfigSource = "live" | "demo" | "default" | "migrated";

export interface AutopilotConfigSnapshot {
  config: AutopilotConfig;
  isOnboarded: boolean;
  source: AutopilotConfigSource;
  updatedAt: string | null;
}

export interface FetchAutopilotConfigOptions {
  mode: "demo" | "live";
  userId: string | null;
}

function safeReadLegacyLocal(): AutopilotConfig | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AutopilotConfig>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...getDefaultConfig(), ...parsed };
  } catch {
    return null;
  }
}

function clearLegacyLocal() {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    /* swallow */
  }
}

function sanitizeConfig(input: unknown): AutopilotConfig {
  const base = getDefaultConfig();
  if (!input || typeof input !== "object") return base;
  const c = input as Partial<AutopilotConfig>;
  return {
    isOnboarded: Boolean(c.isOnboarded ?? base.isOnboarded),
    approvalMode: (c.approvalMode ?? base.approvalMode) as AutopilotConfig["approvalMode"],
    activePlaybooks: Array.isArray(c.activePlaybooks) ? c.activePlaybooks : base.activePlaybooks,
    notificationChannels: Array.isArray(c.notificationChannels)
      ? c.notificationChannels
      : base.notificationChannels,
    maxAutoActionsPerDay:
      typeof c.maxAutoActionsPerDay === "number" ? c.maxAutoActionsPerDay : base.maxAutoActionsPerDay,
    businessHoursOnly:
      typeof c.businessHoursOnly === "boolean" ? c.businessHoursOnly : base.businessHoursOnly,
    timezone: typeof c.timezone === "string" && c.timezone ? c.timezone : base.timezone,
  };
}

function getDemoConfig(): AutopilotConfig {
  return {
    ...getDefaultConfig(),
    isOnboarded: true,
    activePlaybooks: ["receivable-recovery", "leak-seal", "win-back-cold"],
  };
}

export async function fetchAutopilotConfig(
  opts: FetchAutopilotConfigOptions,
): Promise<AutopilotConfigSnapshot> {
  if (opts.mode === "demo") {
    return { config: getDemoConfig(), isOnboarded: true, source: "demo", updatedAt: null };
  }

  if (!opts.userId) {
    return {
      config: getDefaultConfig(),
      isOnboarded: false,
      source: "default",
      updatedAt: null,
    };
  }

  const { data, error } = await fromTable("autopilot_configs")
    .select("config, is_onboarded, updated_at")
    .eq("user_id", opts.userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return {
      config: sanitizeConfig(data.config),
      isOnboarded: Boolean(data.is_onboarded),
      source: "live",
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  }

  // No row yet — try one-time migration from legacy localStorage.
  const legacy = safeReadLegacyLocal();
  if (legacy) {
    const sanitized = sanitizeConfig(legacy);
    try {
      await fromTable("autopilot_configs").upsert(
        {
          user_id: opts.userId,
          config: sanitized,
          is_onboarded: Boolean(sanitized.isOnboarded),
          schema_version: 1,
        },
        { onConflict: "user_id" },
      );
      clearLegacyLocal();
      return {
        config: sanitized,
        isOnboarded: Boolean(sanitized.isOnboarded),
        source: "migrated",
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return {
        config: sanitized,
        isOnboarded: Boolean(sanitized.isOnboarded),
        source: "default",
        updatedAt: null,
      };
    }
  }

  return {
    config: getDefaultConfig(),
    isOnboarded: false,
    source: "default",
    updatedAt: null,
  };
}

export interface SaveAutopilotConfigOptions {
  userId: string;
  config: AutopilotConfig;
}

export async function saveAutopilotConfig(
  opts: SaveAutopilotConfigOptions,
): Promise<AutopilotConfigSnapshot> {
  const sanitized = sanitizeConfig(opts.config);
  const { data, error } = await fromTable("autopilot_configs")
    .upsert(
      {
        user_id: opts.userId,
        config: sanitized,
        is_onboarded: Boolean(sanitized.isOnboarded),
        schema_version: 1,
      },
      { onConflict: "user_id" },
    )
    .select("config, is_onboarded, updated_at")
    .maybeSingle();

  if (error) throw error;

  return {
    config: sanitizeConfig(data?.config ?? sanitized),
    isOnboarded: Boolean(data?.is_onboarded ?? sanitized.isOnboarded),
    source: "live",
    updatedAt: (data?.updated_at as string | null) ?? new Date().toISOString(),
  };
}

export type AutopilotEventKind =
  | "autopilot.config.update"
  | "autopilot.wizard.complete"
  | "autopilot.wizard.skip";

export interface RecordAutopilotEventOptions {
  userId: string;
  kind: AutopilotEventKind;
  summary: string;
  payload?: Record<string, unknown>;
}

/**
 * Records a governance receipt for an Autopilot configuration change.
 * Non-blocking: failures are logged but never thrown.
 */
export async function recordAutopilotEvent(
  opts: RecordAutopilotEventOptions,
): Promise<void> {
  try {
    await fromTable("ai_action_receipts").insert({
      user_id: opts.userId,
      recommendation_summary: opts.summary,
      action_type: opts.kind,
      action_payload: opts.payload ?? {},
      confidence: 1,
      risk_tier: "low",
      status: "executed",
      executed_at: new Date().toISOString(),
      metadata: { source: "autopilot-hub" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[autopilot] failed to record event", opts.kind, err);
  }
}

export const __testing__ = { sanitizeConfig, getDemoConfig, LEGACY_LS_KEY };
