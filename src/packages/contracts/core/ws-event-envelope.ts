// ═══════════════════════════════════════════════════════════════
// SITA OS — WebSocket Event Envelope Standard (Section 20)
// All real-time events conform to this envelope for audit,
// replay, ordering, debugging, and client consistency.
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/**
 * Canonical event scopes for multiplexed WebSocket.
 * Clients subscribe to one or more scopes to filter events.
 */
export type WsEventScope =
  | "system"
  | "command"
  | "security"
  | "sync"
  | "device"
  | "update"
  | "ai"
  | "healing"
  | "notification"
  | "timeline"
  | "audit"
  | "admin";

/** Actor types for tracing who/what triggered the event */
export type WsActorType = "user" | "agent" | "system" | "admin" | "scheduler" | "os-agent";

/** Risk levels for event classification */
export type WsRiskLevel = "none" | "low" | "medium" | "high" | "critical";

/**
 * Full WebSocket Event Envelope — the standard for all real-time events.
 * Superset of the existing EventEnvelope, backwards-compatible.
 */
export interface WsEventEnvelope<T = Record<string, unknown>> {
  /** Unique event identifier */
  event_id: string;
  /** Event type key, e.g. "command.update", "system.status", "security.alert" */
  type: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Cross-request correlation identifier */
  correlation_id: string;
  /** What kind of actor triggered this event */
  actor_type: WsActorType;
  /** ID of the actor (user_id, agent_id, system identifier) */
  actor_id: string;
  /** Originating service or subsystem */
  source: string;
  /** Event scope for subscription filtering */
  scope: WsEventScope;
  /** Risk level for the event (enables security filtering) */
  risk_level: WsRiskLevel;
  /** Event-specific typed payload */
  payload: T;
  /** Optional domain for cross-domain events */
  domain?: DomainId;
  /** Optional tenant scoping */
  tenant_id?: string;
  /** Optional device scoping */
  device_id?: string;
  /** Optional causation chain reference */
  caused_by?: string;
  /** Sequence number for ordering within a session */
  seq?: number;
}

// ── Typed Payload Interfaces ──────────────────────────────────

export interface SystemStatusPayload {
  device_id: string;
  cpu: number;
  memory: number;
  health: "good" | "degraded" | "critical";
}

export interface CommandUpdatePayload {
  id: string;
  status: string;
  progress?: number;
  phase?: string;
  error?: string;
}

export interface SecurityAlertPayload {
  level: "low" | "medium" | "high" | "critical";
  message: string;
  requires_approval: boolean;
  approval_id?: string;
}

export interface SyncProgressPayload {
  device_id: string;
  progress: number;
  conflicts: number;
  latency_ms: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body?: string;
  actionable: boolean;
  action_id?: string;
}

export interface DeviceEventPayload {
  device_id: string;
  event: "online" | "offline" | "revoked" | "locked" | "updated";
  device_name?: string;
}

export interface AiStreamPayload {
  request_id: string;
  chunk: string;
  done?: boolean;
  model?: string;
}

export interface HealingEventPayload {
  action: string;
  status: "started" | "running" | "completed" | "failed";
  target?: string;
  detail?: string;
}

export interface UpdateEventPayload {
  event:
    | "update.available"
    | "update.downloading"
    | "update.installing"
    | "update.completed"
    | "update.failed"
    | "update.rolled_back"
    | "rollout.paused";
  version?: string;
  progress?: number;
  device_id?: string;
}

export interface TimelineReceiptPayload {
  event:
    | "command.completed"
    | "approval.recorded"
    | "rollback.completed"
    | "policy.changed"
    | "trust.changed";
  ref_id: string;
  summary: string;
}

// ── Factory ───────────────────────────────────────────────────

let _seq = 0;

export function createWsEnvelope<T>(
  type: string,
  scope: WsEventScope,
  payload: T,
  options: {
    actor_type?: WsActorType;
    actor_id?: string;
    source?: string;
    risk_level?: WsRiskLevel;
    correlation_id?: string;
    device_id?: string;
    domain?: DomainId;
    caused_by?: string;
  } = {},
): WsEventEnvelope<T> {
  return {
    event_id: crypto.randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    correlation_id: options.correlation_id ?? crypto.randomUUID(),
    actor_type: options.actor_type ?? "system",
    actor_id: options.actor_id ?? "sita-os",
    source: options.source ?? "unified-ws-client",
    scope,
    risk_level: options.risk_level ?? "none",
    payload,
    domain: options.domain,
    device_id: options.device_id,
    caused_by: options.caused_by,
    seq: ++_seq,
  };
}
