// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend-mirrored Zod Schemas for Edge Functions
// These schemas MUST match the validation in edge functions.
// If a test fails, either the frontend call or the edge function changed.
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Shared schemas (from _shared/zod-validate.ts) ────────────

export const ChatAdvisorRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(32000),
  })).min(1).max(50),
  advisor: z.string().max(50).optional().default("general"),
  context: z.record(z.unknown()).optional(),
});

export const BrainCoreRequestSchema = z.object({
  intent: z.string().min(1).max(255),
  advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]),
  context: z.record(z.unknown()).optional().default({}),
  secondary_advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]).optional(),
  stream: z.boolean().optional().default(false),
});

export const PersonalBrainRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(32000),
  })).min(1).max(50),
  mode: z.enum(["think", "learn", "build", "create"]).optional().default("think"),
});

export const OsCommandRequestSchema = z.object({
  device_id: z.string().min(1).max(255),
  command: z.enum(["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"]),
  params: z.record(z.unknown()).optional(),
});

export const AdminUsersActionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "assign_role", "revoke_role"]),
  target_user_id: z.string().uuid(),
  role: z.string().max(50).optional(),
});

// ── Connector OAuth ──────────────────────────────────────────

export const ConnectorOAuthInitiateSchema = z.object({
  action: z.literal("initiate"),
  connector_id: z.string().min(1),
  scopes: z.array(z.string()).optional(),
  redirect_uri: z.string().url().optional(),
});

export const ConnectorOAuthDisconnectSchema = z.object({
  action: z.literal("disconnect"),
  account_id: z.string().uuid(),
});

export const ConnectorOAuthReconnectSchema = z.object({
  action: z.literal("reconnect"),
  account_id: z.string().uuid(),
});

export const ConnectorOAuthCheckConfigSchema = z.object({
  action: z.literal("check_config"),
});

// ── Alert Ingest ─────────────────────────────────────────────

export const AlertIngestRequestSchema = z.object({
  source: z.string().min(1),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  subsystem: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fingerprint: z.string().optional(),
  runbook_id: z.string().nullish(),
  metadata: z.record(z.unknown()).optional(),
  related_incident_id: z.string().nullish(),
  dedup_key: z.string().nullish(),
});

// ── Boardroom Session ────────────────────────────────────────

export const BoardroomSessionRequestSchema = z.object({
  action: z.enum(["assemble", "add-item", "add-evidence", "recommend", "vote", "decide", "adjourn"]),
  session_id: z.string().optional(),
  item_id: z.string().optional(),
  recommendation_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});

// ── Kill Switch Toggle ──────────────────────────────────────

export const KillSwitchToggleRequestSchema = z.object({
  switchId: z.string().min(1),
  enable: z.boolean(),
  reason: z.string().min(1),
  expiresInMinutes: z.number().optional(),
  severity: z.string().optional(),
  approvalId: z.string().optional(),
});

// ── Connector Batch ─────────────────────────────────────────

export const ConnectorBatchRequestSchema = z.object({
  action: z.literal("submit"),
  connector_type: z.string().optional(),
  operations: z.array(z.object({
    type: z.string(),
    payload: z.record(z.unknown()).optional(),
    connector_type: z.string().optional(),
  })),
});

// ── Cloud Sync API ──────────────────────────────────────────

export const CloudSyncPushSchema = z.object({
  namespace: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
  device_id: z.string().optional(),
  content_hash: z.string().optional(),
});

// ── Admin Reset / Revoke ────────────────────────────────────

export const AdminResetUserSetupSchema = z.object({
  target_user_id: z.string().uuid(),
});

export const AdminRevokeSessionSchema = z.object({
  target_user_id: z.string().uuid(),
  reason: z.string().optional(),
});

// ── Production Launch Attestor ──────────────────────────────

export const ProductionLaunchAttestorSchema = z.object({
  surface_key: z.string().min(1),
  posture: z.enum(["green", "yellow", "red", "deferred", "archived"]).optional(),
  justification: z.string().optional(),
});

// ── Generic Response Shapes ─────────────────────────────────

export const SuccessResponseSchema = z.object({
  success: z.boolean().optional(),
  ok: z.boolean().optional(),
  error: z.string().optional(),
}).passthrough();

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.unknown()).optional(),
});