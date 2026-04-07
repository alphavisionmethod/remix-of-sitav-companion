// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Capability Module
// Surface-neutral money/finance operations
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { supabase } from "@/integrations/supabase/client";
import type { CapabilityResult } from "@/packages/contracts/msa/capability-contract";

registerCapability("money.accounts.list", async (_params, context): Promise<CapabilityResult> => {
  const { data, error } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("user_id", context.userId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: data || [] };
});

registerCapability("money.transfer.initiate", async (params, context): Promise<CapabilityResult> => {
  const { fromAccountId, toAccountId, amount, currency } = params as {
    fromAccountId: string; toAccountId: string; amount: number; currency: string;
  };

  if (!fromAccountId || !toAccountId || !amount) {
    return { success: false, error: "Missing required transfer parameters" };
  }

  // This capability requires approval — create approval request
  const { data, error } = await supabase.from("approval_queue").insert({
    user_id: context.userId,
    action_type: "money.transfer",
    action_summary: `Transfer ${currency || "USD"} ${amount} between accounts`,
    proposed_action: { fromAccountId, toAccountId, amount, currency, surface: context.surface },
    status: "pending",
  }).select().single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: { approvalId: data.id, status: "pending_approval" },
    receipt: { id: data.id, hash: data.id, type: "approval" },
  };
});

registerCapability("investment.watchlist.add", async (params, context): Promise<CapabilityResult> => {
  const { assetId, symbol } = params as { assetId?: string; symbol?: string };
  if (!assetId && !symbol) return { success: false, error: "Asset ID or symbol required" };

  // For now store as audit log action until watchlist table exists
  const { data, error } = await supabase.from("audit_logs").insert({
    user_id: context.userId,
    action: "watchlist.add",
    category: "investment",
    actor: "capability",
    details: { assetId, symbol, surface: context.surface },
  }).select().single();

  if (error) return { success: false, error: error.message };
  return {
    success: true,
    data: { logged: true },
    receipt: { id: data.id, hash: data.id, type: "action" },
  };
});
