// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Reauth Actions
//
// Real reauth dispatcher used by the admin Integrations surfaces.
// Writes to connector_accounts.status='reauth_required', flips
// connector_oauth_tokens.reauth_required=true, and emits a
// timeline_events row for observability.
//
// All RLS already enforces "user owns row OR admin".
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface RequestReauthInput {
  accountId: string;
  reason?: string;
}

export interface RequestReauthResult {
  ok: boolean;
  error?: string;
}

export async function requestProviderReauth(
  input: RequestReauthInput,
): Promise<RequestReauthResult> {
  const { accountId, reason = "Operator-initiated reauth" } = input;

  // Look up the account to get user + provider for the timeline event
  const { data: account, error: accErr } = await supabase
    .from("connector_accounts")
    .select("id, user_id, connector_type, display_name")
    .eq("id", accountId)
    .maybeSingle();
  if (accErr || !account) {
    return { ok: false, error: accErr?.message ?? "account not found" };
  }

  // 1. Mark account reauth_required
  const { error: upd1 } = await supabase
    .from("connector_accounts")
    .update({ status: "reauth_required", updated_at: new Date().toISOString() })
    .eq("id", accountId);
  if (upd1) return { ok: false, error: upd1.message };

  // 2. Flip token row
  const { error: upd2 } = await supabase
    .from("connector_oauth_tokens")
    .update({ reauth_required: true, updated_at: new Date().toISOString() })
    .eq("account_id", accountId);
  if (upd2) return { ok: false, error: upd2.message };

  // 3. Timeline event for observability streams
  const { error: tlErr } = await supabase.from("timeline_events").insert({
    user_id: account.user_id,
    event_type: "connector.reauth_requested",
    actor_type: "operator",
    actor_id: "admin",
    subject_type: "connector_account",
    subject_id: accountId,
    action: "reauth_requested",
    description: `Reauth requested for ${account.display_name ?? account.connector_type}`,
    metadata: { connector_type: account.connector_type, reason },
    domain: "integrations",
  });
  if (tlErr) {
    // Non-fatal: state already mutated — we surface a warning, not a failure.
    console.warn("[requestProviderReauth] timeline insert failed:", tlErr.message);
  }

  return { ok: true };
}
