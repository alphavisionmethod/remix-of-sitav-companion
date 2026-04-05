import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // GET — check for updates
    if (req.method === "GET") {
      const channel = url.searchParams.get("channel") || "stable";
      const currentVersion = url.searchParams.get("current_version") || "0.0.0";

      const { data, error } = await supabase
        .from("system_update_releases")
        .select("*")
        .eq("channel", channel)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data || data.version === currentVersion) {
        return new Response(JSON.stringify({ update_available: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ update_available: true, release: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST — register device or report update
    if (req.method === "POST") {
      const body = await req.json();
      const action = body.action;

      if (action === "register") {
        const { data, error } = await supabase
          .from("system_update_devices")
          .upsert({
            user_id: body.user_id,
            device_id: body.device_id,
            hostname: body.hostname,
            current_version: body.current_version,
            hardware_profile: body.hardware_profile || {},
            last_check_at: new Date().toISOString(),
          }, { onConflict: "user_id,device_id" })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ device: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "report") {
        const { error } = await supabase.from("system_update_log").insert({
          device_id: body.device_id,
          user_id: body.user_id,
          from_version: body.from_version,
          to_version: body.to_version,
          status: body.status,
          error: body.error || null,
          completed_at: ["success", "failed", "rolled_back"].includes(body.status)
            ? new Date().toISOString()
            : null,
        });

        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
