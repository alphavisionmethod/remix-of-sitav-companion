// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin BFF Gateway
// Aggregation API for admin/support UI — audited, safety-gated
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    // Verify admin permission
    const { data: hasPermission } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!hasPermission) return json({ error: "Admin access required" }, 403);

    const url = new URL(req.url);
    const route = url.pathname.replace(/^\/admin-bff-gateway\/?/, "").replace(/^\//, "");

    // Audit every admin API call
    await adminClient.from("cloud_audit_events").insert({
      actor_user_id: user.id,
      action: `admin-bff:${route}`,
      severity: "info",
      details: { method: req.method, route },
    });

    switch (route) {
      case "system-overview": {
        const [users, devices, blobs, syncJobs, conflicts, supportCases, workerJobs] = await Promise.all([
          adminClient.from("profiles").select("id", { count: "exact", head: true }),
          adminClient.from("cloud_devices").select("trust_state"),
          adminClient.from("cloud_blobs").select("id", { count: "exact", head: true }),
          adminClient.from("cloud_sync_jobs").select("status"),
          adminClient.from("cloud_conflicts").select("id", { count: "exact", head: true }).eq("state", "unresolved"),
          adminClient.from("support_cases").select("status"),
          adminClient.from("cloud_worker_jobs").select("status"),
        ]);

        const devList = (devices.data ?? []) as Array<{ trust_state: string }>;
        const syncList = (syncJobs.data ?? []) as Array<{ status: string }>;
        const caseList = (supportCases.data ?? []) as Array<{ status: string }>;
        const jobList = (workerJobs.data ?? []) as Array<{ status: string }>;

        return json({
          users: { total: users.count ?? 0 },
          devices: {
            total: devList.length,
            trusted: devList.filter((d) => d.trust_state === "trusted").length,
            untrusted: devList.filter((d) => d.trust_state === "untrusted").length,
            pending: devList.filter((d) => d.trust_state === "pending").length,
          },
          storage: { blobCount: blobs.count ?? 0 },
          sync: {
            active: syncList.filter((j) => j.status === "running").length,
            failed: syncList.filter((j) => j.status === "failed").length,
            conflictBacklog: conflicts.count ?? 0,
          },
          support: {
            open: caseList.filter((c) => ["open", "investigating"].includes(c.status)).length,
            escalated: caseList.filter((c) => c.status === "escalated").length,
          },
          workers: {
            active: jobList.filter((j) => j.status === "running").length,
            failed: jobList.filter((j) => j.status === "failed").length,
          },
        });
      }

      case "device-fleet": {
        const { data: devices } = await adminClient.from("cloud_devices").select("platform, trust_state");
        const devList = (devices ?? []) as Array<{ platform: string; trust_state: string }>;

        const byPlatform: Record<string, number> = {};
        const byTrust: Record<string, number> = {};
        devList.forEach((d) => {
          byPlatform[d.platform] = (byPlatform[d.platform] ?? 0) + 1;
          byTrust[d.trust_state] = (byTrust[d.trust_state] ?? 0) + 1;
        });

        return json({ total: devList.length, byPlatform, byTrustState: byTrust });
      }

      case "safety/actions": {
        const { data } = await adminClient.from("admin_safety_actions").select("*").order("risk_level");
        return json({ actions: data ?? [] });
      }

      case "safety/pending": {
        const { data } = await adminClient
          .from("admin_action_confirmations")
          .select("*")
          .in("status", ["pending", "pending_dual_approval"])
          .order("created_at", { ascending: false });
        return json({ pending: data ?? [] });
      }

      case "safety/dry-run": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        if (!body.actionKey) return json({ error: "actionKey required" }, 400);

        // Fetch safety requirements
        const { data: action } = await adminClient
          .from("admin_safety_actions")
          .select("*")
          .eq("action_key", body.actionKey)
          .single();

        if (!action) return json({ error: `Unknown action: ${body.actionKey}` }, 404);

        const actionRow = action as Record<string, unknown>;
        if (!(actionRow.requires_dry_run as boolean)) {
          return json({ error: "This action does not require a dry run" }, 400);
        }

        return json({
          actionKey: body.actionKey,
          params: body.params ?? {},
          impactSummary: `Dry run for ${actionRow.display_name}`,
          risks: ["Review carefully before proceeding"],
          reversible: false,
          estimatedDuration: "Unknown",
        });
      }

      case "safety/confirm": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        if (!body.actionKey || !body.justification) {
          return json({ error: "actionKey and justification required" }, 400);
        }

        const { data, error } = await adminClient
          .from("admin_action_confirmations")
          .insert({
            action_key: body.actionKey,
            actor_user_id: user.id,
            justification: body.justification,
            status: "pending",
            params: body.params ?? {},
            impact_summary: body.impactSummary ?? "",
            correlation_id: crypto.randomUUID(),
          })
          .select()
          .single();

        if (error) return json({ error: error.message }, 500);
        return json({ confirmation: data }, 201);
      }

      default: {
        // User 360 view: /user-360/{userId}
        const user360Match = route.match(/^user-360\/(.+)$/);
        if (user360Match) {
          const targetUserId = user360Match[1];

          const [profile, devices, cases, audit, notifs] = await Promise.all([
            adminClient.from("profiles").select("*").eq("user_id", targetUserId).maybeSingle(),
            adminClient.from("cloud_devices").select("id, device_name, platform, trust_state, last_seen_at").eq("user_id", targetUserId),
            adminClient.from("support_cases").select("id, title, status, priority, created_at").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(10),
            adminClient.from("cloud_audit_events").select("action, created_at, severity").eq("actor_user_id", targetUserId).order("created_at", { ascending: false }).limit(10),
            adminClient.from("platform_notifications").select("id").eq("target_user_id", targetUserId).eq("read", false),
          ]);

          return json({
            profile: profile.data ?? {},
            devices: devices.data ?? [],
            supportCases: cases.data ?? [],
            recentAudit: audit.data ?? [],
            unreadNotifications: (notifs.data ?? []).length,
          });
        }

        return json({
          error: `Unknown route: ${route}`,
          available: ["system-overview", "device-fleet", "user-360/{userId}", "safety/actions", "safety/pending", "safety/dry-run", "safety/confirm"],
        }, 404);
      }
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
