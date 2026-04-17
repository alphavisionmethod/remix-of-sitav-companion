// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Classification Map
// Layer 3 · Eventing · trust source / persistence / replay rules
// Companion: src/lib/runtime/runtime-message-registry.ts
// Companion doc: docs/architecture/RUNTIME_MESSAGING_ARCHITECTURE.md
// ═══════════════════════════════════════════════════════════════

export type EventTrustSource =
  | "system"            // emitted by signed kernel/runtime
  | "service"           // emitted by trusted backend service
  | "edge-function"     // emitted by Supabase edge function (signed by service_role)
  | "client"            // emitted by user agent (untrusted by default)
  | "connector"         // emitted by external connector ingestion
  | "advisor";          // emitted by AI advisor

export type EventPersistence = "ephemeral" | "in-memory" | "durable" | "durable-replayable";

export type EventDeliveryGuarantee = "best-effort" | "at-least-once" | "exactly-once";

export type EventScope = "global" | "tenant" | "user" | "device" | "session" | "advisor";

export interface EventClassEntry {
  readonly eventClass: string;             // matches MessageCategory or higher abstraction
  readonly trustSource: EventTrustSource;
  readonly persistence: EventPersistence;
  readonly delivery: EventDeliveryGuarantee;
  readonly scope: EventScope;
  readonly replayable: boolean;
  readonly retentionDays: number;
  readonly publishers: readonly string[];   // which services may publish
  readonly subscribers: readonly string[];  // which services may subscribe
  readonly killSwitchTarget: string | null;
}

export const EVENT_CLASSIFICATION_MAP: readonly EventClassEntry[] = [
  { eventClass: "boot",        trustSource: "system",        persistence: "durable",            delivery: "at-least-once", scope: "global",  replayable: true,  retentionDays: 90,  publishers: ["kernel", "service-supervisor"], subscribers: ["observability", "admin-ui"], killSwitchTarget: null },
  { eventClass: "shutdown",    trustSource: "system",        persistence: "durable",            delivery: "at-least-once", scope: "global",  replayable: true,  retentionDays: 90,  publishers: ["kernel", "service-supervisor"], subscribers: ["observability", "admin-ui"], killSwitchTarget: null },
  { eventClass: "crash",       trustSource: "system",        persistence: "durable-replayable", delivery: "at-least-once", scope: "global",  replayable: true,  retentionDays: 365, publishers: ["kernel", "crashd"],            subscribers: ["observability", "admin-ui", "incident-mgmt"], killSwitchTarget: null },
  { eventClass: "lifecycle",   trustSource: "service",       persistence: "durable",            delivery: "at-least-once", scope: "global",  replayable: true,  retentionDays: 90,  publishers: ["service-supervisor"],          subscribers: ["observability", "admin-ui"], killSwitchTarget: null },

  { eventClass: "security",    trustSource: "system",        persistence: "durable-replayable", delivery: "exactly-once",  scope: "global",  replayable: true,  retentionDays: 365 * 7, publishers: ["auth", "trust-governor"],   subscribers: ["observability", "admin-ui", "audit"], killSwitchTarget: "auth-kill" },
  { eventClass: "auth",        trustSource: "edge-function", persistence: "durable",            delivery: "at-least-once", scope: "user",    replayable: true,  retentionDays: 365, publishers: ["auth-edge"],                   subscribers: ["session-registry", "audit", "admin-ui"], killSwitchTarget: "auth-kill" },
  { eventClass: "trust",       trustSource: "system",        persistence: "durable-replayable", delivery: "exactly-once",  scope: "user",    replayable: true,  retentionDays: 365 * 7, publishers: ["trust-governor"],          subscribers: ["audit", "admin-ui"], killSwitchTarget: null },

  { eventClass: "sync",        trustSource: "service",       persistence: "in-memory",          delivery: "at-least-once", scope: "device",  replayable: false, retentionDays: 7,   publishers: ["sync-service"],                subscribers: ["client"], killSwitchTarget: "sync-kill" },
  { eventClass: "storage",     trustSource: "edge-function", persistence: "durable",            delivery: "at-least-once", scope: "user",    replayable: true,  retentionDays: 90,  publishers: ["storage-service"],             subscribers: ["files-projection", "admin-ui"], killSwitchTarget: null },
  { eventClass: "network",     trustSource: "system",        persistence: "in-memory",          delivery: "best-effort",   scope: "device",  replayable: false, retentionDays: 1,   publishers: ["healthd"],                     subscribers: ["observability"], killSwitchTarget: null },

  { eventClass: "ai",          trustSource: "edge-function", persistence: "durable",            delivery: "at-least-once", scope: "user",    replayable: true,  retentionDays: 365, publishers: ["ai-gateway"],                  subscribers: ["audit", "ai-cost", "admin-ui"], killSwitchTarget: "ai-cost-kill" },
  { eventClass: "budget",      trustSource: "service",       persistence: "durable",            delivery: "exactly-once",  scope: "user",    replayable: true,  retentionDays: 365, publishers: ["ai-cost"],                     subscribers: ["audit", "admin-ui"], killSwitchTarget: "ai-cost-kill" },
  { eventClass: "policy",      trustSource: "service",       persistence: "durable-replayable", delivery: "exactly-once",  scope: "global",  replayable: true,  retentionDays: 365 * 7, publishers: ["policy-engine"],            subscribers: ["audit", "admin-ui"], killSwitchTarget: null },

  { eventClass: "advisor",     trustSource: "advisor",       persistence: "durable",            delivery: "at-least-once", scope: "user",    replayable: true,  retentionDays: 365, publishers: ["advisor-runtime"],             subscribers: ["audit", "admin-ui", "boardroom"], killSwitchTarget: "advisor-kill" },
  { eventClass: "workflow",    trustSource: "service",       persistence: "durable-replayable", delivery: "exactly-once",  scope: "user",    replayable: true,  retentionDays: 365, publishers: ["core.workflow-runner"],         subscribers: ["audit", "admin-ui"], killSwitchTarget: "workflow-kill" },
  { eventClass: "approval",    trustSource: "service",       persistence: "durable-replayable", delivery: "exactly-once",  scope: "user",    replayable: true,  retentionDays: 365 * 7, publishers: ["approval-engine"],         subscribers: ["audit", "admin-ui", "executor"], killSwitchTarget: null },

  { eventClass: "deployment",  trustSource: "system",        persistence: "durable",            delivery: "at-least-once", scope: "global",  replayable: true,  retentionDays: 365, publishers: ["release-pipeline"],            subscribers: ["observability", "admin-ui"], killSwitchTarget: null },
  { eventClass: "health",      trustSource: "system",        persistence: "in-memory",          delivery: "best-effort",   scope: "global",  replayable: false, retentionDays: 30,  publishers: ["healthd"],                     subscribers: ["observability", "admin-ui"], killSwitchTarget: null },
  { eventClass: "kill-switch", trustSource: "system",        persistence: "durable-replayable", delivery: "exactly-once",  scope: "global",  replayable: true,  retentionDays: 365 * 7, publishers: ["kill-switch-engine"],     subscribers: ["audit", "admin-ui", "all-services"], killSwitchTarget: null },

  { eventClass: "client.ui",   trustSource: "client",        persistence: "in-memory",          delivery: "best-effort",   scope: "session", replayable: false, retentionDays: 1,   publishers: ["client"],                       subscribers: ["analytics"], killSwitchTarget: null },
  { eventClass: "connector.ingestion", trustSource: "connector", persistence: "durable",        delivery: "at-least-once", scope: "user",    replayable: true,  retentionDays: 365, publishers: ["connector-runner"],            subscribers: ["audit", "domain-services"], killSwitchTarget: "connector-kill" },
] as const;

export function getEventClass(eventClass: string): EventClassEntry | undefined {
  return EVENT_CLASSIFICATION_MAP.find((e) => e.eventClass === eventClass);
}

export function eventsByTrustSource(source: EventTrustSource): readonly EventClassEntry[] {
  return EVENT_CLASSIFICATION_MAP.filter((e) => e.trustSource === source);
}

export function replayableEvents(): readonly EventClassEntry[] {
  return EVENT_CLASSIFICATION_MAP.filter((e) => e.replayable);
}

export function isPublisherAllowed(eventClass: string, publisherId: string): boolean {
  const entry = getEventClass(eventClass);
  if (!entry) return false;
  return entry.publishers.includes(publisherId) || entry.publishers.includes("*");
}
