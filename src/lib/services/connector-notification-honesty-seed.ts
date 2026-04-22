// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector + Notification Launch-Honesty Seed Service
// Conservative default classifications before runtime verification
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

export interface HonestySeedEntry {
  target: string;
  domain: string;
  honestyClass: "real" | "partial" | "demo_governed" | "planned" | "internal_only" | "unavailable";
  reason: string;
  promotionPath: string;
  claimSafe: boolean;
  qualifierRequired: boolean;
}

export const CONNECTOR_NOTIFICATION_HONESTY_SEEDS: HonestySeedEntry[] = [
  // ── Connectors ──
  {
    target: "google_drive",
    domain: "connectors",
    honestyClass: "partial",
    reason: "OAuth architecture exists (connector-oauth edge fn, token persistence, consent ledger). Not promoted to real until callback, token lifecycle, and health are runtime-verified.",
    promotionPath: "partial → real: requires verified OAuth callback + token persistence + reauth cycle",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "google_gmail",
    domain: "connectors",
    honestyClass: "planned",
    reason: "Registry seeded, OAuth scopes defined, but no dedicated Gmail runtime verification yet.",
    promotionPath: "planned → partial: requires Gmail-specific sync/read implementation",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "google_calendar",
    domain: "connectors",
    honestyClass: "planned",
    reason: "Registry seeded, OAuth scopes defined, but no Calendar-specific runtime path.",
    promotionPath: "planned → partial: requires Calendar-specific sync implementation",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "connected_services_surface",
    domain: "connectors",
    honestyClass: "partial",
    reason: "ConnectorHub UI is operational with connect/disconnect buttons and honest state display. Only real when at least one real connector is verified.",
    promotionPath: "partial → real: at least one connector must be live_verified",
    claimSafe: false,
    qualifierRequired: true,
  },

  // ── Notifications ──
  {
    target: "web_push",
    domain: "notifications",
    honestyClass: "partial",
    reason: "VAPID keys configured, push-dispatch edge function exists, delivery receipts table created. Not real until subscription + dispatch + receipt loop is runtime-verified.",
    promotionPath: "partial → real: requires verified subscription + dispatch + delivery receipt + user response",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "in_app_notifications",
    domain: "notifications",
    honestyClass: "partial",
    reason: "notifications_queue table + dispatch trigger exist. Notification center UI renders queue items.",
    promotionPath: "partial → real: requires verified end-to-end event → queue → display → read loop",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "android_push",
    domain: "notifications",
    honestyClass: "planned",
    reason: "Not required in current web-first phase. FCM integration is deferred.",
    promotionPath: "planned → partial: requires FCM integration + token persistence",
    claimSafe: false,
    qualifierRequired: true,
  },
  {
    target: "apple_push",
    domain: "notifications",
    honestyClass: "planned",
    reason: "Intentionally deferred — Apple Developer Program membership not currently held. This is an honest deferral, not a failure.",
    promotionPath: "planned → partial: requires Apple Developer membership + APNs configuration",
    claimSafe: false,
    qualifierRequired: true,
  },

  // ── Admin Surfaces ──
  {
    target: "connector_runtime_verification_board",
    domain: "admin",
    honestyClass: "internal_only",
    reason: "Admin/operator diagnostic surface — not user-facing",
    promotionPath: "N/A — internal tool",
    claimSafe: false,
    qualifierRequired: false,
  },
  {
    target: "notification_runtime_verification_board",
    domain: "admin",
    honestyClass: "internal_only",
    reason: "Admin/operator diagnostic surface — not user-facing",
    promotionPath: "N/A — internal tool",
    claimSafe: false,
    qualifierRequired: false,
  },
];

/**
 * Seed connector + notification launch-honesty classifications
 * into ecosystem_launch_readiness table.
 */
export async function seedConnectorNotificationHonesty(): Promise<{ seeded: number; errors: string[] }> {
  const errors: string[] = [];
  let seeded = 0;

  for (const entry of CONNECTOR_NOTIFICATION_HONESTY_SEEDS) {
    const { error } = await fromDynamicTable("ecosystem_launch_readiness").upsert(
      {
        target: entry.target,
        target_name: entry.target.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        ecosystem: entry.domain,
        launch_stage: entry.honestyClass === "real" ? "live" : entry.honestyClass === "partial" ? "beta" : entry.honestyClass === "planned" ? "planned" : "alpha",
        launch_ready: entry.honestyClass === "real",
        pilot_ready: entry.honestyClass === "real" || entry.honestyClass === "partial",
        blockers: entry.claimSafe ? [] : [entry.reason],
        evidence: {
          honesty_class: entry.honestyClass,
          promotion_path: entry.promotionPath,
          claim_safe: entry.claimSafe,
          qualifier_required: entry.qualifierRequired,
          seeded_at: new Date().toISOString(),
        },
      } as never,
      { onConflict: "target" }
    );

    if (error) {
      errors.push(`${entry.target}: ${(error as Error)?.message ?? String(error)}`);
    } else {
      seeded++;
    }
  }

  return { seeded, errors };
}

/**
 * Get all connector + notification honesty seed definitions (no DB call needed).
 */
export function getConnectorNotificationHonestySeeds(): HonestySeedEntry[] {
  return CONNECTOR_NOTIFICATION_HONESTY_SEEDS;
}

