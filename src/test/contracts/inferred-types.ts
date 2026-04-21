// ═══════════════════════════════════════════════════════════════
// SITA OS — TypeScript types inferred directly from Zod schemas
// Import these in frontend request builders & edge-function handlers
// to guarantee type-level alignment with validation schemas.
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";
import {
  ChatAdvisorRequestSchema,
  BrainCoreRequestSchema,
  PersonalBrainRequestSchema,
  OsCommandRequestSchema,
  AdminUsersActionSchema,
  ConnectorOAuthInitiateSchema,
  ConnectorOAuthDisconnectSchema,
  ConnectorOAuthReconnectSchema,
  ConnectorOAuthCheckConfigSchema,
  AlertIngestRequestSchema,
  BoardroomSessionRequestSchema,
  KillSwitchToggleRequestSchema,
  ConnectorBatchRequestSchema,
  CloudSyncPushSchema,
  AdminResetUserSetupSchema,
  AdminRevokeSessionSchema,
  ProductionLaunchAttestorSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "./edge-function-schemas";

// ── Request types ────────────────────────────────────────────
export type ChatAdvisorRequest = z.infer<typeof ChatAdvisorRequestSchema>;
export type BrainCoreRequest = z.infer<typeof BrainCoreRequestSchema>;
export type PersonalBrainRequest = z.infer<typeof PersonalBrainRequestSchema>;
export type OsCommandRequest = z.infer<typeof OsCommandRequestSchema>;
export type AdminUsersAction = z.infer<typeof AdminUsersActionSchema>;
export type ConnectorOAuthInitiate = z.infer<typeof ConnectorOAuthInitiateSchema>;
export type ConnectorOAuthDisconnect = z.infer<typeof ConnectorOAuthDisconnectSchema>;
export type ConnectorOAuthReconnect = z.infer<typeof ConnectorOAuthReconnectSchema>;
export type ConnectorOAuthCheckConfig = z.infer<typeof ConnectorOAuthCheckConfigSchema>;
export type AlertIngestRequest = z.infer<typeof AlertIngestRequestSchema>;
export type BoardroomSessionRequest = z.infer<typeof BoardroomSessionRequestSchema>;
export type KillSwitchToggleRequest = z.infer<typeof KillSwitchToggleRequestSchema>;
export type ConnectorBatchRequest = z.infer<typeof ConnectorBatchRequestSchema>;
export type CloudSyncPush = z.infer<typeof CloudSyncPushSchema>;
export type AdminResetUserSetup = z.infer<typeof AdminResetUserSetupSchema>;
export type AdminRevokeSession = z.infer<typeof AdminRevokeSessionSchema>;
export type ProductionLaunchAttestor = z.infer<typeof ProductionLaunchAttestorSchema>;

// ── Response types ───────────────────────────────────────────
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ── Schema registry (for programmatic iteration) ────────────
export const SCHEMA_REGISTRY = {
  "chat-advisor": ChatAdvisorRequestSchema,
  "brain-core": BrainCoreRequestSchema,
  "personal-brain": PersonalBrainRequestSchema,
  "os-command": OsCommandRequestSchema,
  "admin-users": AdminUsersActionSchema,
  "connector-oauth-initiate": ConnectorOAuthInitiateSchema,
  "connector-oauth-disconnect": ConnectorOAuthDisconnectSchema,
  "connector-oauth-reconnect": ConnectorOAuthReconnectSchema,
  "connector-oauth-check-config": ConnectorOAuthCheckConfigSchema,
  "alert-ingest": AlertIngestRequestSchema,
  "boardroom-session": BoardroomSessionRequestSchema,
  "kill-switch-toggle": KillSwitchToggleRequestSchema,
  "connector-batch": ConnectorBatchRequestSchema,
  "cloud-sync-push": CloudSyncPushSchema,
  "admin-reset-user-setup": AdminResetUserSetupSchema,
  "admin-revoke-session": AdminRevokeSessionSchema,
  "production-launch-attestor": ProductionLaunchAttestorSchema,
} as const;

export type SchemaKey = keyof typeof SCHEMA_REGISTRY;