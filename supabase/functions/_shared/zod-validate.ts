import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "./cors.ts";

// ═══════════════════════════════════════════════════════════════
// Zod Validation Utility for Edge Functions
// ═══════════════════════════════════════════════════════════════

export { z };

export function zodValidate<T>(body: unknown, schema: z.ZodSchema<T>):
  | { success: true; data: T }
  | { success: false; response: Response } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      ),
    };
  }
  return { success: true, data: result.data };
}

// ── Schemas ──────────────────────────────────────────────────

export const ChatAdvisorSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(32000),
  })).min(1).max(50),
  advisor: z.string().max(50).optional().default("general"),
  context: z.record(z.unknown()).optional(),
});

export const BrainCoreSchema = z.object({
  intent: z.string().min(1).max(255),
  advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]),
  context: z.record(z.unknown()).optional().default({}),
  secondary_advisor: z.enum(["money", "business", "concierge", "family", "growth", "general"]).optional(),
  stream: z.boolean().optional().default(false),
});

export const PersonalBrainSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().max(32000),
  })).min(1).max(50),
  mode: z.enum([
    "think","learn","build","create",
    "research","strategize","coach","reflect","decide",
  ]).optional().default("think"),
  chatId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
});

// ── Personal Brain Router Schemas ────────────────────────────
export const PBRouterSchema = z.object({
  action: z.enum([
    "infer",
    "memory.save", "memory.list", "memory.toggle", "memory.delete",
    "learn.scan",
    "file.ingest",
    "voice.transcribe",
    "voice.tts",
    "data.export",
    "data.delete",
    "digest.generate", "digest.list", "digest.dismiss",
    "workspace.invite", "workspace.accept", "workspace.list_members", "workspace.remove_member", "workspace.update_role",
    "tool.list", "tool.upsert", "tool.toggle", "tool.delete",
    "insights.scan", "insights.list", "insights.update_status",
  ]),
  payload: z.record(z.unknown()).optional().default({}),
});

export const PBMemorySaveSchema = z.object({
  content: z.string().min(1).max(4000),
  category: z.string().min(1).max(64).default("general"),
  kind: z.enum(["explicit","inferred"]).default("explicit"),
  confidence: z.number().min(0).max(1).default(1),
  source_chat_id: z.string().uuid().optional(),
});

export const PBMemoryToggleSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active","disabled","pending"]),
});

export const PBMemoryDeleteSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().max(64).optional(),
}).refine(d => d.id || d.category, { message: "id or category required" });

export const PBLearnScanSchema = z.object({
  windowMessages: z.number().int().min(1).max(200).default(40),
  chatId: z.string().uuid().optional(),
});

export const PBFileIngestSchema = z.object({
  storage_path: z.string().min(1).max(1024),
  filename: z.string().min(1).max(512),
  mime_type: z.string().max(255).optional(),
  size_bytes: z.number().int().nonnegative().optional(),
  scope: z.enum(["global","workspace"]).default("global"),
  workspace_id: z.string().uuid().optional(),
  text_content: z.string().max(200000).optional(),
});

export const PBVoiceTranscribeSchema = z.object({
  audio_base64: z.string().min(1).max(20_000_000),
  mime_type: z.string().min(1).max(64).default("audio/webm"),
  language: z.string().max(8).optional(),
});

export const PBVoiceTtsSchema = z.object({
  text: z.string().min(1).max(5000),
  voice_id: z.string().max(64).optional(),
});

// ── Phase 7 schemas ──────────────────────────────────────────
export const PBDigestGenerateSchema = z.object({
  period: z.enum(["daily","weekly"]).default("daily"),
});

export const PBDigestDismissSchema = z.object({
  id: z.string().uuid(),
});

export const PBWorkspaceInviteSchema = z.object({
  workspace_id: z.string().uuid(),
  email: z.string().email().max(255),
  role: z.enum(["viewer","editor","owner"]).default("viewer"),
});

export const PBWorkspaceAcceptSchema = z.object({
  invite_token: z.string().min(8).max(64),
});

export const PBWorkspaceListMembersSchema = z.object({
  workspace_id: z.string().uuid(),
});

export const PBWorkspaceRemoveMemberSchema = z.object({
  member_id: z.string().uuid(),
});

export const PBWorkspaceUpdateRoleSchema = z.object({
  member_id: z.string().uuid(),
  role: z.enum(["viewer","editor","owner"]),
});

export const PBToolUpsertSchema = z.object({
  tool_key: z.string().min(1).max(64),
  display_name: z.string().min(1).max(120),
  description: z.string().max(500).default(""),
  kind: z.enum(["web_search","calendar","file_search","memory_search","custom"]).default("custom"),
  config: z.record(z.unknown()).default({}),
  enabled: z.boolean().default(true),
});

export const PBToolToggleSchema = z.object({
  id: z.string().uuid(),
  enabled: z.boolean(),
});

export const PBToolDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const PBInsightsScanSchema = z.object({
  windowMessages: z.number().int().min(10).max(500).default(80),
});

export const PBInsightsUpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new","pinned","dismissed"]),
});

export const OsCommandSchema = z.object({
  device_id: z.string().min(1).max(255),
  command: z.enum(["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"]),
  params: z.record(z.unknown()).optional(),
});

export const AdminUsersActionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "assign_role", "revoke_role"]),
  target_user_id: z.string().uuid(),
  role: z.string().max(50).optional(),
});
