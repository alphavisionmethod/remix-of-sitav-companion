import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders }

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`scheduler-dispatch:${clientId}`, 60, 60000);
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date().toISOString();

    // 1. Check global kill switch
    const { data: globalKill } = await supabase
      .from("automation_kill_switches")
      .select("*")
      .eq("scope", "global")
      .eq("enabled", true)
      .limit(1);

    if (globalKill && globalKill.length > 0) {
      return new Response(JSON.stringify({
        status: "killed",
        reason: globalKill[0].reason || "Global kill switch active",
        jobs_dispatched: 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Find due jobs
    const { data: dueJobs, error: jobsErr } = await supabase
      .from("scheduled_jobs")
      .select("*")
      .eq("state", "active")
      .lte("next_run_at", now)
      .order("next_run_at", { ascending: true })
      .limit(50);

    if (jobsErr) {
      return new Response(JSON.stringify({ error: jobsErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dueJobs || dueJobs.length === 0) {
      return new Response(JSON.stringify({
        status: "ok",
        message: "No jobs due",
        jobs_dispatched: 0,
        checked_at: now,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Check domain and job-class kill switches
    const { data: domainKills } = await supabase
      .from("automation_kill_switches")
      .select("scope, scope_id")
      .eq("enabled", true)
      .in("scope", ["domain", "job_class"]);

    const killedScopes = new Set(
      (domainKills || []).map((k: any) => `${k.scope}:${k.scope_id}`)
    );

    const results: any[] = [];

    for (const job of dueJobs) {
      // Check domain/class kill switches
      if (killedScopes.has(`domain:${job.domain}`) || killedScopes.has(`job_class:${job.job_class}`)) {
        results.push({ job_id: job.id, name: job.name, status: "skipped", reason: "kill_switch" });
        continue;
      }

      const startedAt = new Date().toISOString();

      // 4. Create execution record
      const { data: exec, error: execErr } = await supabase
        .from("job_executions")
        .insert({
          user_id: job.user_id,
          job_id: job.id,
          started_at: startedAt,
          status: "running",
          attempt_number: 1,
          triggered_by: "scheduler",
          mode: "real",
          policy_decision: "allowed",
        })
        .select("id")
        .single();

      if (execErr || !exec) {
        results.push({ job_id: job.id, name: job.name, status: "error", reason: "exec_record_failed" });
        continue;
      }

      // 5. Dispatch — attempt to invoke target function
      let outcome = "success";
      let errorMessage: string | null = null;
      let output: any = null;

      try {
        if (job.target_function.startsWith("edge:")) {
          const fnName = job.target_function.replace("edge:", "");
          const fnUrl = `${supabaseUrl}/functions/v1/${fnName}`;
          const resp = await fetch(fnUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job_id: job.id,
              job_class: job.job_class,
              domain: job.domain,
              metadata: job.metadata,
              triggered_by: "scheduler-dispatch",
            }),
          });
          output = { status_code: resp.status };
          if (!resp.ok) {
            outcome = "failure";
            errorMessage = `Edge function returned ${resp.status}`;
            try { output.body = await resp.text(); } catch { /* ignore */ }
          } else {
            try { output.body = await resp.json(); } catch { /* ignore */ }
          }
        } else if (job.target_function === "internal:noop") {
          output = { message: "noop executed" };
        } else {
          outcome = "failure";
          errorMessage = `Unknown target_function format: ${job.target_function}`;
        }
      } catch (err) {
        outcome = "failure";
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      const completedAt = new Date().toISOString();
      const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();

      // 6. Update execution record
      await supabase
        .from("job_executions")
        .update({
          completed_at: completedAt,
          status: outcome,
          duration_ms: durationMs,
          output,
          error_message: errorMessage,
          retryable: outcome === "failure" && (job.fail_count || 0) < job.max_retries,
        })
        .eq("id", exec.id);

      // 7. Calculate next run and update job
      const nextRun = calculateNextRun(job.cron_expression);
      await supabase
        .from("scheduled_jobs")
        .update({
          last_run_at: completedAt,
          last_run_status: outcome,
          next_run_at: nextRun,
          run_count: (job.run_count || 0) + 1,
          fail_count: outcome === "failure" ? (job.fail_count || 0) + 1 : job.fail_count,
          state: outcome === "failure" && (job.fail_count || 0) + 1 >= job.max_retries ? "degraded" : "active",
        })
        .eq("id", job.id);

      results.push({
        job_id: job.id,
        name: job.name,
        execution_id: exec.id,
        status: outcome,
        duration_ms: durationMs,
      });
    }

    return new Response(JSON.stringify({
      status: "ok",
      jobs_dispatched: results.length,
      results,
      checked_at: now,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateNextRun(cronExpr: string): string {
  // Simple cron parser for common patterns
  const parts = cronExpr.split(" ");
  const now = new Date();

  if (parts.length !== 5) {
    // Default: 1 hour from now
    return new Date(now.getTime() + 3600000).toISOString();
  }

  const [minute, hour] = parts;

  // Every N minutes: */N * * * *
  if (minute.startsWith("*/")) {
    const interval = parseInt(minute.slice(2)) || 60;
    return new Date(now.getTime() + interval * 60000).toISOString();
  }

  // Top of every hour: 0 * * * *
  if (minute === "0" && hour === "*") {
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next.toISOString();
  }

  // Specific minute every hour: N * * * *
  if (hour === "*") {
    const min = parseInt(minute) || 0;
    const next = new Date(now);
    next.setMinutes(min, 0, 0);
    if (next <= now) next.setHours(next.getHours() + 1);
    return next.toISOString();
  }

  // Daily at specific time: M H * * *
  if (parts[2] === "*" && parts[3] === "*") {
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  // Fallback: 1 hour
  return new Date(now.getTime() + 3600000).toISOString();
}
