// Phase 5: AI Receipt Hardening — periodic snapshot of receipt coverage.
// Reads ai_invocations vs ai_action_receipts in a rolling 24h window and
// persists a snapshot row to ai_receipt_completeness_snapshots.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.45.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceKey);

  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  try {
    const { data: invocations, error: invErr } = await sb
      .from("ai_invocations")
      .select("id, created_at")
      .gte("created_at", windowStart.toISOString())
      .lte("created_at", windowEnd.toISOString());

    if (invErr) throw invErr;

    const invocationIds = (invocations ?? []).map((r) => r.id);
    let withReceipt = 0;
    const missing: string[] = [];

    if (invocationIds.length > 0) {
      const { data: receipts, error: rcptErr } = await sb
        .from("ai_action_receipts")
        .select("invocation_id")
        .in("invocation_id", invocationIds);
      if (rcptErr) throw rcptErr;
      const receiptedSet = new Set((receipts ?? []).map((r) => r.invocation_id));
      withReceipt = receiptedSet.size;
      for (const id of invocationIds) {
        if (!receiptedSet.has(id)) missing.push(id);
      }
    }

    const total = invocationIds.length;
    const pct = total === 0 ? 100 : Math.round((withReceipt / total) * 10000) / 100;

    const { data: snap, error: snapErr } = await sb
      .from("ai_receipt_completeness_snapshots")
      .insert({
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        total_invocations: total,
        invocations_with_receipt: withReceipt,
        receipt_coverage_pct: pct,
        missing_receipt_ids: missing.slice(0, 200),
      })
      .select("id")
      .single();

    if (snapErr) throw snapErr;

    return new Response(
      JSON.stringify({
        ok: true,
        snapshot_id: snap?.id,
        total,
        with_receipt: withReceipt,
        coverage_pct: pct,
        missing_count: missing.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String((err as Error).message ?? err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
