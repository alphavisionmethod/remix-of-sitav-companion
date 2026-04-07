// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Batch Operations Engine
// Submit, track, cancel & retry batch connector operations
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth, AuthResult } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("connector-batch");

const OperationSchema = z.object({
  connector_id: z.string().min(1),
  action: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
});

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("submit"),
    operations: z.array(OperationSchema).min(1).max(100),
    label: z.string().max(255).optional(),
  }),
  z.object({
    action: z.literal("status"),
    batch_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("cancel"),
    batch_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("list"),
    limit: z.number().min(1).max(50).optional(),
  }),
  z.object({
    action: z.literal("retry-failed"),
    batch_id: z.string().uuid(),
  }),
]);

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const start = Date.now();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`batch:${ip}`, 30, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth as AuthResult;

  try {
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return corsError("Validation failed: " + JSON.stringify(parsed.error.flatten()), 400);
    }

    const data = parsed.data;
    let result: unknown;

    switch (data.action) {
      case "submit": {
        const batchId = crypto.randomUUID();
        const correlationId = `batch:${batchId}`;
        const batchLogger = logger.child(correlationId);
        batchLogger.info("Batch submitted", { operations: data.operations.length, label: data.label });

        // Create batch header audit entry
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "connector_batch:submit",
          category: "connector",
          actor: "user",
          target_type: "batch",
          target_id: batchId,
          severity: "medium",
          correlation_id: correlationId,
          details: {
            batch_id: batchId,
            label: data.label || null,
            total_operations: data.operations.length,
            status: "processing",
          },
        });

        // Process each operation with error isolation
        const results: Array<{ index: number; status: string; connector_id: string; action: string; error?: string }> = [];

        for (let i = 0; i < data.operations.length; i++) {
          const op = data.operations[i];
          try {
            // Validate connector exists
            const { data: connector, error: connErr } = await supabase
              .from("connector_registry")
              .select("id, display_name, connector_class")
              .eq("id", op.connector_id)
              .maybeSingle();

            if (connErr || !connector) {
              results.push({ index: i, status: "failed", connector_id: op.connector_id, action: op.action, error: "Connector not found" });
              continue;
            }

            // Check user has connection
            const { data: account } = await supabase
              .from("connector_accounts")
              .select("id, status")
              .eq("user_id", user.id)
              .eq("connector_id", op.connector_id)
              .eq("status", "active")
              .maybeSingle();

            if (!account) {
              results.push({ index: i, status: "failed", connector_id: op.connector_id, action: op.action, error: "No active connection" });
              continue;
            }

            // Log individual operation success
            await supabase.from("audit_logs").insert({
              user_id: user.id,
              action: `connector_batch:op:${op.action}`,
              category: "connector",
              actor: "system",
              target_type: "connector",
              target_id: op.connector_id,
              severity: "low",
              correlation_id: correlationId,
              details: { batch_id: batchId, index: i, connector: (connector as Record<string, unknown>).display_name, payload_keys: Object.keys(op.payload || {}) },
            });

            results.push({ index: i, status: "completed", connector_id: op.connector_id, action: op.action });
          } catch (opError: unknown) {
            const errMsg = opError instanceof Error ? opError.message : "Unknown error";
            results.push({ index: i, status: "failed", connector_id: op.connector_id, action: op.action, error: errMsg });

            await supabase.from("audit_logs").insert({
              user_id: user.id,
              action: "connector_batch:op:error",
              category: "connector",
              actor: "system",
              target_type: "connector",
              target_id: op.connector_id,
              severity: "high",
              correlation_id: correlationId,
              details: { batch_id: batchId, index: i, error: errMsg },
            });
          }
        }

        const completed = results.filter(r => r.status === "completed").length;
        const failed = results.filter(r => r.status === "failed").length;

        // Update batch header
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "connector_batch:complete",
          category: "connector",
          actor: "system",
          target_type: "batch",
          target_id: batchId,
          severity: failed > 0 ? "high" : "low",
          correlation_id: correlationId,
          details: { batch_id: batchId, total: data.operations.length, completed, failed, status: failed === 0 ? "completed" : "partial" },
        });

        batchLogger.complete(200, Date.now() - start, { completed, failed });
        result = { batch_id: batchId, total: data.operations.length, completed, failed, results };
        break;
      }

      case "status": {
        const correlationId = `batch:${data.batch_id}`;
        const { data: logs, error } = await supabase
          .from("audit_logs")
          .select("action, details, created_at, severity")
          .eq("user_id", user.id)
          .eq("correlation_id", correlationId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (!logs || logs.length === 0) return corsError("Batch not found", 404);

        const header = logs.find((l: any) => l.action === "connector_batch:submit");
        const completion = logs.find((l: any) => l.action === "connector_batch:complete");
        const opLogs = logs.filter((l: any) => l.action.startsWith("connector_batch:op:"));

        result = {
          batch_id: data.batch_id,
          status: completion ? ((completion as Record<string, unknown>).details as unknown)?.status || "completed" : "processing",
          total: (header as Record<string, unknown>)?.details?.total_operations || 0,
          completed: opLogs.filter((l: any) => !l.action.includes("error")).length,
          failed: opLogs.filter((l: any) => l.action.includes("error")).length,
          submitted_at: (header as Record<string, unknown>)?.created_at,
          completed_at: (completion as Record<string, unknown>)?.created_at || null,
          label: (header as Record<string, unknown>)?.details?.label || null,
        };
        break;
      }

      case "cancel": {
        const correlationId = `batch:${data.batch_id}`;
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "connector_batch:cancel",
          category: "connector",
          actor: "user",
          target_type: "batch",
          target_id: data.batch_id,
          severity: "medium",
          correlation_id: correlationId,
          details: { batch_id: data.batch_id, cancelled_at: new Date().toISOString() },
        });

        result = { batch_id: data.batch_id, status: "cancelled" };
        break;
      }

      case "list": {
        const limit = data.limit || 20;
        const { data: batches, error } = await supabase
          .from("audit_logs")
          .select("target_id, details, created_at")
          .eq("user_id", user.id)
          .eq("action", "connector_batch:submit")
          .eq("category", "connector")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        result = {
          batches: (batches || []).map((b: any) => ({
            batch_id: b.target_id,
            label: b.details?.label || null,
            total_operations: b.details?.total_operations || 0,
            submitted_at: b.created_at,
          })),
          total: (batches || []).length,
        };
        break;
      }

      case "retry-failed": {
        const correlationId = `batch:${data.batch_id}`;
        const { data: failedOps, error } = await supabase
          .from("audit_logs")
          .select("details")
          .eq("user_id", user.id)
          .eq("correlation_id", correlationId)
          .eq("action", "connector_batch:op:error");

        if (error) throw error;
        if (!failedOps || failedOps.length === 0) return corsError("No failed operations to retry", 404);

        const retryBatchId = crypto.randomUUID();
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "connector_batch:retry",
          category: "connector",
          actor: "user",
          target_type: "batch",
          target_id: retryBatchId,
          severity: "medium",
          correlation_id: `batch:${retryBatchId}`,
          details: {
            original_batch_id: data.batch_id,
            retry_count: failedOps.length,
            status: "queued",
          },
        });

        result = { retry_batch_id: retryBatchId, original_batch_id: data.batch_id, retrying: failedOps.length };
        break;
      }
    }

    const latency = Date.now() - start;
    logger.complete(200, latency, { action: data.action, userId: user.id });
    return corsResponse({ success: true, action: data.action, ...result, latency_ms: latency });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("Batch operation failed", { error: msg, userId: user.id });
    return corsError(msg, 500);
  }
});
