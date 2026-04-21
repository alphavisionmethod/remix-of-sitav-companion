// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Offline / Degraded Behavior Matrix
// Product-wide offline/degraded behavior per domain.
// References: feature-runtime-tier-registry, mobile-offline-policy.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";

// ── Connectivity Mode ───────────────────────────────────────────

export type ConnectivityMode = "online" | "offline" | "degraded" | "recovering";

// ── Offline Capability ──────────────────────────────────────────

export type OfflineCapability =
  | "full"           // works fully offline
  | "read-only"      // can read cached data
  | "queued-write"   // writes are queued for sync
  | "blocked"        // completely unavailable offline
  | "degraded-safe"; // partial functionality, safe fallback

// ── Domain Offline Policy ───────────────────────────────────────

export interface DomainOfflinePolicy {
  readonly domain: TaskDomain;
  readonly displayName: string;
  readonly offlineCapability: OfflineCapability;
  readonly cacheDurationMs: number;
  readonly syncStrategy: "immediate" | "batch" | "manual" | "none";
  readonly queueMaxItems: number;
  readonly degradedFeatures: readonly string[];
  readonly blockedFeatures: readonly string[];
  readonly recoveryStrategy: string;
  readonly userNotification: boolean;
}

// ── Registry ────────────────────────────────────────────────────

export const OFFLINE_POLICY_REGISTRY: readonly DomainOfflinePolicy[] = [
  { domain: "business",      displayName: "Business",      offlineCapability: "read-only",     cacheDurationMs: 3600000,   syncStrategy: "immediate", queueMaxItems: 50,  degradedFeatures: ["search", "reports"],     blockedFeatures: ["client-creation", "bulk-import"],       recoveryStrategy: "auto-sync on reconnect", userNotification: true },
  { domain: "finance",       displayName: "Finance",       offlineCapability: "read-only",     cacheDurationMs: 1800000,   syncStrategy: "immediate", queueMaxItems: 20,  degradedFeatures: ["invoice-pdf"],           blockedFeatures: ["payment-processing", "bank-sync"],      recoveryStrategy: "auto-sync on reconnect", userNotification: true },
  { domain: "concierge",     displayName: "Concierge",     offlineCapability: "queued-write",  cacheDurationMs: 7200000,   syncStrategy: "batch",     queueMaxItems: 100, degradedFeatures: ["ai-suggestions"],        blockedFeatures: ["live-chat"],                            recoveryStrategy: "batch sync on reconnect", userNotification: true },
  { domain: "files",         displayName: "Files",         offlineCapability: "read-only",     cacheDurationMs: 86400000,  syncStrategy: "immediate", queueMaxItems: 10,  degradedFeatures: ["ai-analysis"],           blockedFeatures: ["upload", "share"],                      recoveryStrategy: "auto-sync on reconnect", userNotification: true },
  { domain: "trust",         displayName: "Trust Center",  offlineCapability: "read-only",     cacheDurationMs: 3600000,   syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: [],                        blockedFeatures: ["trust-verification", "evidence-submit"],recoveryStrategy: "full refresh on reconnect", userNotification: false },
  { domain: "admin",         displayName: "Admin",         offlineCapability: "blocked",       cacheDurationMs: 0,         syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: [],                        blockedFeatures: ["all"],                                  recoveryStrategy: "requires online", userNotification: true },
  { domain: "integrations",  displayName: "Integrations",  offlineCapability: "blocked",       cacheDurationMs: 0,         syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: [],                        blockedFeatures: ["all"],                                  recoveryStrategy: "requires online", userNotification: true },
  { domain: "ai",            displayName: "AI / Advisors", offlineCapability: "blocked",       cacheDurationMs: 0,         syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: [],                        blockedFeatures: ["all"],                                  recoveryStrategy: "requires online", userNotification: true },
  { domain: "workflows",     displayName: "Workflows",     offlineCapability: "read-only",     cacheDurationMs: 1800000,   syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: ["status-refresh"],        blockedFeatures: ["execution", "approval"],                recoveryStrategy: "status refresh on reconnect", userNotification: true },
  { domain: "support",       displayName: "Support",       offlineCapability: "read-only",     cacheDurationMs: 3600000,   syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: ["search"],                blockedFeatures: ["ticket-creation"],                      recoveryStrategy: "full refresh on reconnect", userNotification: false },
  { domain: "settings",      displayName: "Settings",      offlineCapability: "read-only",     cacheDurationMs: 86400000,  syncStrategy: "immediate", queueMaxItems: 5,   degradedFeatures: [],                        blockedFeatures: ["save"],                                 recoveryStrategy: "auto-sync on reconnect", userNotification: false },
  { domain: "system",        displayName: "System",        offlineCapability: "degraded-safe", cacheDurationMs: 0,         syncStrategy: "none",      queueMaxItems: 0,   degradedFeatures: ["diagnostics", "health"], blockedFeatures: ["updates"],                              recoveryStrategy: "auto-recover", userNotification: true },
] as const;

// ── Helpers ─────────────────────────────────────────────────────

export function getDomainOfflinePolicy(domain: TaskDomain): DomainOfflinePolicy | undefined {
  return OFFLINE_POLICY_REGISTRY.find((p) => p.domain === domain);
}

export function isDomainAvailableOffline(domain: TaskDomain): boolean {
  const policy = getDomainOfflinePolicy(domain);
  return !!policy && policy.offlineCapability !== "blocked";
}