// ═══════════════════════════════════════════════════════════════
// SITA OS — User BFF Gateway
// Aggregation API for product UI — shaped payloads, user-scoped
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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const route = url.pathname.replace(/^\/user-bff-gateway\/?/, "").replace(/^\//, "");

    switch (route) {
      case "dashboard": {
        const [profile, devices, notifications, cases] = await Promise.all([
          supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle(),
          supabase.from("cloud_devices").select("id, device_name, platform, trust_state, last_seen_at").eq("user_id", user.id).order("last_seen_at", { ascending: false }).limit(5),
          supabase.from("platform_notifications").select("id, title, category, severity, created_at, read").eq("target_user_id", user.id).eq("audience", "user").eq("dismissed", false).order("created_at", { ascending: false }).limit(10),
          supabase.from("support_cases").select("id, title, status, priority, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        ]);

        const deviceList = devices.data ?? [];
        const notifList = (notifications.data ?? []) as Array<Record<string, unknown>>;
        const caseList = (cases.data ?? []) as Array<Record<string, unknown>>;

        return json({
          account: {
            id: user.id,
            email: user.email,
            displayName: profile.data?.display_name ?? user.email?.split("@")[0],
            avatarUrl: profile.data?.avatar_url,
          },
          devices: {
            total: deviceList.length,
            trusted: deviceList.filter((d) => d.trust_state === "trusted").length,
            recent: deviceList,
          },
          notifications: {
            unread: notifList.filter((n) => !n.read).length,
            recent: notifList,
          },
          support: {
            openCases: caseList.filter((c) => ["open", "investigating", "escalated"].includes(c.status as string)).length,
            recent: caseList,
          },
        });
      }

      case "devices": {
        const { data } = await supabase
          .from("cloud_devices")
          .select("id, device_name, platform, trust_state, last_seen_at, os_version, app_version")
          .eq("user_id", user.id)
          .order("last_seen_at", { ascending: false });
        return json({ devices: data ?? [] });
      }

      case "notifications": {
        const { data } = await supabase
          .from("platform_notifications")
          .select("*")
          .eq("target_user_id", user.id)
          .eq("audience", "user")
          .eq("dismissed", false)
          .order("created_at", { ascending: false })
          .limit(50);
        return json({ notifications: (data ?? []) as unknown[] });
      }

      case "support/create-case": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        if (!body.title) return json({ error: "title required" }, 400);

        const { data, error } = await supabase
          .from("support_cases")
          .insert({
            user_id: user.id,
            title: body.title,
            description: body.description ?? "",
            category: body.category ?? "general",
            priority: body.priority ?? "normal",
            correlation_id: `case-${crypto.randomUUID().slice(0, 12)}`,
            self_repair_attempted: body.selfRepairAttempted ?? false,
            self_repair_result: body.selfRepairResult ?? null,
          })
          .select()
          .single();

        if (error) return json({ error: error.message }, 500);

        // Add creation event
        await supabase.from("support_case_events").insert({
          case_id: (data as Record<string, unknown>).id,
          event_type: "created",
          actor_user_id: user.id,
          content: `Case opened: ${body.title}`,
          metadata: { category: body.category, priority: body.priority },
        });

        return json({ case: data }, 201);
      }

      default:
        return json({ error: `Unknown route: ${route}`, available: ["dashboard", "devices", "notifications", "support/create-case"] }, 404);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
