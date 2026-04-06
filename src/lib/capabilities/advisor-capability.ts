// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Capability Module
// Surface-neutral advisor interactions
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { supabase } from "@/integrations/supabase/client";
import type { CapabilityResult } from "@/packages/contracts/msa/capability-contract";

registerCapability("advisor.chat", async (params, context): Promise<CapabilityResult> => {
  const { message, advisorId } = params as { message: string; advisorId?: string };
  if (!message) return { success: false, error: "No message provided" };

  const { data, error } = await supabase.from("advisor_requests").insert({
    user_id: context.userId,
    intent: message,
    advisor_config_id: advisorId || null,
    context: { surface: context.surface, mode: context.mode },
    status: "pending",
  }).select().single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: { requestId: data.id },
    receipt: { id: data.id, hash: data.id, type: "action" },
  };
});

registerCapability("advisor.synthesize", async (params, context): Promise<CapabilityResult> => {
  const { domain, scope } = params as { domain?: string; scope?: string };

  const { data, error } = await supabase.from("advisor_requests").insert({
    user_id: context.userId,
    intent: `synthesize:${domain || "cross-domain"}:${scope || "summary"}`,
    context: { surface: context.surface, mode: context.mode, domain, scope },
    status: "pending",
  }).select().single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: { requestId: data.id },
    receipt: { id: data.id, hash: data.id, type: "action" },
  };
});
