// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend API Schema Validation (Zod)
// Runtime validation using shared schemas for frontend calls.
// Types come from api-schemas/index.ts, Zod schemas mirror
// supabase/functions/_shared/zod-validate.ts
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Chat Message ─────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(32000),
});

// ── Personal Brain ───────────────────────────────────────────

export const PersonalBrainRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  mode: z.enum(["think", "learn", "build", "create"]).optional().default("think"),
});

// ── Chat Advisor ─────────────────────────────────────────────

export const ChatAdvisorRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  advisor: z.string().max(50).optional().default("general"),
  context: z.record(z.unknown()).optional(),
});

// ── Brain Core ───────────────────────────────────────────────

export const BrainCoreRequestSchema = z.object({
  intent: z.string().min(1).max(255),
  advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]),
  context: z.record(z.unknown()).optional().default({}),
  secondary_advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]).optional(),
  stream: z.boolean().optional().default(false),
});

// ── OS Command ───────────────────────────────────────────────

export const OsCommandRequestSchema = z.object({
  device_id: z.string().min(1).max(255),
  command: z.enum(["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"]),
  params: z.record(z.unknown()).optional(),
});

// ── Connector Operations ─────────────────────────────────────

export const ConnectorOperationsRequestSchema = z.object({
  action: z.enum([
    "create_instance", "sync_instance", "seed_registry",
    "disconnect", "sync_run", "health_check", "demo_activate",
  ]),
  connector_type: z.string().optional(),
  instance_id: z.string().optional(),
  account_id: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

// ── MSA Operations ───────────────────────────────────────────

export const MsaOperationsRequestSchema = z.object({
  action: z.enum([
    "seed_surfaces", "seed_capabilities", "seed_experience_grammars",
    "portability_report", "surface_launch_profile_check",
    "audit_boundaries", "check_consistency",
  ]),
  params: z.record(z.unknown()).optional(),
});

// ── GDPR ─────────────────────────────────────────────────────

export const GdprExportRequestSchema = z.object({
  format: z.enum(["json", "csv"]).optional().default("json"),
});

export const GdprDeleteRequestSchema = z.object({
  confirm: z.boolean().optional(),
});

// ── Revenue Caller ───────────────────────────────────────────

export const RevenueCallerRequestSchema = z.object({
  action: z.enum(["call", "status", "history"]),
  to: z.string().optional(),
  contactId: z.string().optional(),
  script: z.string().optional(),
});

// ── Device Telemetry ─────────────────────────────────────────

export const DeviceTelemetryRequestSchema = z.object({
  device_id: z.string().min(1),
  metrics: z.record(z.number()),
  timestamp: z.string().optional(),
});

// ── Agent Signal ─────────────────────────────────────────────

export const AgentSignalRequestSchema = z.object({
  agent_id: z.string().min(1).max(255),
  signal_type: z.string().min(1).max(100),
  payload: z.record(z.unknown()).optional(),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
});

// ── Seed User Data ───────────────────────────────────────────

export const SeedUserDataRequestSchema = z.object({
  force: z.boolean().optional(),
}).optional();

// ── File Ingestion ───────────────────────────────────────────

export const FileIngestionRequestSchema = z.object({
  storage_path: z.string().min(1),
  filename: z.string().min(1),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().positive(),
});

// ── Admin ────────────────────────────────────────────────────

export const AdminApiRequestSchema = z.object({
  _endpoint: z.string().min(1).max(100),
}).passthrough();

export const AdminIntelligenceRequestSchema = z.object({
  _endpoint: z.enum(["anomalies", "forecast", "optimize"]),
});

// ═══════════════════════════════════════════════════════════════
// Schema registry for frontend validation
// ═══════════════════════════════════════════════════════════════

export const FRONTEND_SCHEMAS = {
  "personal-brain": PersonalBrainRequestSchema,
  "chat-advisor": ChatAdvisorRequestSchema,
  "brain-core": BrainCoreRequestSchema,
  "os-command": OsCommandRequestSchema,
  "connector-operations": ConnectorOperationsRequestSchema,
  "msa-operations": MsaOperationsRequestSchema,
  "gdpr-export": GdprExportRequestSchema,
  "gdpr-delete": GdprDeleteRequestSchema,
  "revenue-caller": RevenueCallerRequestSchema,
  "device-telemetry": DeviceTelemetryRequestSchema,
  "agent-signal": AgentSignalRequestSchema,
  "file-ingestion": FileIngestionRequestSchema,
  "admin-api": AdminApiRequestSchema,
  "admin-intelligence": AdminIntelligenceRequestSchema,
} as const;
