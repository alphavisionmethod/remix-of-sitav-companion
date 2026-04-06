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
  mode: z.enum(["think", "learn", "build", "create"]).optional().default("think"),
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
