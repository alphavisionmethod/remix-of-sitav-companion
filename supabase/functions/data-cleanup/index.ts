// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Retention / Cleanup Edge Function (C-014)
//
// Batched, secret-gated cleanup runner. Iterates a typed list of
// retention targets (expires_at columns or created_at cutoffs),
// deletes in batches of 500 to avoid long locks, and writes one
// receipt per table to public.data_retention_runs.
//
// Auth: requires header `x-cleanup-secret` matching the
// DATA_CLEANUP_SECRET environment variable. Designed to be called
// by pg_cron (`net.http_post`) and by admins via the dashboard.
//
// Body (optional, JSON):
//   { dryRun?: boolean, only?: string[] }
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cleanup-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RetentionMode = "expires_at" | "created_at_cutoff";

interface RetentionTarget {
  table: string;
  mode: RetentionMode;
  /** Used when mode === "created_at_cutoff" */
  cutoffDays?: number;
  /** Optional notes for the receipt metadata */
  notes?: string;
}

/**
 * Canonical retention targets. Aligned with security/policies/security-policies.md:
 *   - Audit logs:     2 years  (730d)
 *   - AI request logs: 1 year  (365d)
 *   - Sync / ephemeral: 90 days
 *   - User notifications: 90 days
 *
 * `expires_at` mode deletes rows whose expires_at < now.
 * `created_at_cutoff` mode deletes rows whose created_at < now - cutoffDays.
 */
const RETENTION_TARGETS: RetentionTarget[] = [
  // ── New TTL-managed tables (C-014 migration) ──
  { table: "notifications", mode: "expires_at" },
  { table: "ai_workforce_invocations", mode: "expires_at" },
  { table: "ai_workforce_outputs", mode: "expires_at" },
  { table: "ai_inference_receipts", mode: "expires_at" },
  { table: "cloud_audit_events", mode: "expires_at" },
  { table: "error_events", mode: "expires_at" },
  { table: "cloud_activity_journal", mode: "expires_at" },

  // ── Pre-existing TTL tables (already had expires_at) ──
  { table: "admin_sessions", mode: "expires_at" },
  { table: "advisor_board_memory", mode: "expires_at" },
  { table: "ai_workforce_cached_outputs", mode: "expires_at" },
  { table: "cloud_import_export_jobs", mode: "expires_at" },
  { table: "cloud_shares", mode: "expires_at" },
  { table: "connector_oauth_tokens", mode: "expires_at" },
  { table: "connector_tokens", mode: "expires_at" },
  { table: "device_attestations", mode: "expires_at" },
  { table: "dual_authority_challenges", mode: "expires_at" },
  { table: "licenses", mode: "expires_at" },
  { table: "mobile_push_tokens", mode: "expires_at" },
  { table: "os_elevation_tokens", mode: "expires_at" },
  { table: "quotes", mode: "expires_at" },
  { table: "support_access_grants", mode: "expires_at" },
  { table: "webauthn_challenges", mode: "expires_at" },
];

const BATCH_SIZE = 500;

const BodySchema = z
  .object({
    dryRun: z.boolean().optional().default(false),
    only: z.array(z.string()).optional(),
  })
  .strict();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // ── Secret gate ──
  const expectedSecret = Deno.env.get("DATA_CLEANUP_SECRET");
  if (!expectedSecret) {
    console.error("DATA_CLEANUP_SECRET not configured");
    return jsonResponse(
      { error: "Server misconfigured: DATA_CLEANUP_SECRET missing" },
      500,
    );
  }
  const providedSecret = req.headers.get("x-cleanup-secret");
  if (providedSecret !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // ── Parse body (optional) ──
  let body: { dryRun: boolean; only?: string[] } = { dryRun: false };
  if (req.headers.get("content-length") && Number(req.headers.get("content-length")) > 0) {
    try {
      const raw = await req.json();
      const parsed = BodySchema.safeParse(raw);
      if (!parsed.success) {
        return jsonResponse(
          { error: "Invalid body", details: parsed.error.flatten() },
          400,
        );
      }
      body = parsed.data;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const targets = body.only
    ? RETENTION_TARGETS.filter((t) => body.only!.includes(t.table))
    : RETENTION_TARGETS;

  const perTable: Record<
    string,
    { rowsDeleted: number; durationMs: number; error?: string }
  > = {};
  let totalDeleted = 0;

  for (const target of targets) {
    const start = Date.now();
    let rowsDeleted = 0;
    let errorMsg: string | undefined;

    try {
      const cutoffIso =
        target.mode === "created_at_cutoff"
          ? new Date(
              Date.now() - (target.cutoffDays ?? 90) * 24 * 60 * 60 * 1000,
            ).toISOString()
          : new Date().toISOString();

      // Batched delete loop
      while (true) {
        const query = supabase
          .from(target.table)
          .select("id", { head: false })
          .limit(BATCH_SIZE);

        const filtered =
          target.mode === "expires_at"
            ? query.lt("expires_at", cutoffIso).not("expires_at", "is", null)
            : query.lt("created_at", cutoffIso);

        const { data: rows, error: selErr } = await filtered;
        if (selErr) {
          errorMsg = `select: ${selErr.message}`;
          break;
        }
        if (!rows || rows.length === 0) break;

        if (body.dryRun) {
          rowsDeleted += rows.length;
          // Stop after first batch in dry-run to avoid undercounting via paging
          // (we can't paginate without deleting). For accurate dry-run size,
          // we issue a single count query instead.
          const { count } = await supabase
            .from(target.table)
            .select("id", { count: "exact", head: true })
            .lt(
              target.mode === "expires_at" ? "expires_at" : "created_at",
              cutoffIso,
            )
            .not(
              target.mode === "expires_at" ? "expires_at" : "created_at",
              "is",
              null,
            );
          rowsDeleted = count ?? rows.length;
          break;
        }

        const ids = rows.map((r: { id: string }) => r.id);
        const { error: delErr } = await supabase
          .from(target.table)
          .delete()
          .in("id", ids);
        if (delErr) {
          errorMsg = `delete: ${delErr.message}`;
          break;
        }
        rowsDeleted += ids.length;
        if (ids.length < BATCH_SIZE) break;
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    }

    const durationMs = Date.now() - start;
    perTable[target.table] = { rowsDeleted, durationMs, error: errorMsg };
    totalDeleted += rowsDeleted;

    // Receipt
    await supabase.from("data_retention_runs").insert({
      table_name: target.table,
      mode: target.mode,
      rows_deleted: rowsDeleted,
      duration_ms: durationMs,
      dry_run: body.dryRun,
      error: errorMsg ?? null,
      metadata: { notes: target.notes ?? null, cutoffDays: target.cutoffDays ?? null },
    });
  }

  return jsonResponse({
    status: "ok",
    dryRun: body.dryRun,
    totalDeleted,
    perTable,
    ranAt: new Date().toISOString(),
  });
});

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
