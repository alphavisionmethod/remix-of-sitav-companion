import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};


const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "catalog";

    switch (action) {
      case "catalog": {
        const { data: apps } = await supabase
          .from("managed_apps")
          .select("*")
          .order("display_name");

        const { data: installed } = await supabase
          .from("managed_apps")
          .select("app_key")
          .eq("user_id", user.id)
          .eq("status", "installed");

        const installedKeys = new Set((installed || []).map((a: any) => a.app_key));

        return new Response(JSON.stringify({
          apps: (apps || []).map((app: any) => ({
            ...app,
            is_installed: installedKeys.has(app.app_key),
          })),
          installed_count: installedKeys.size,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "install": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { app_key } = body;
        if (!app_key) {
          return new Response(JSON.stringify({ error: "Missing app_key" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("managed_apps").upsert({
          user_id: user.id,
          app_key,
          status: "installed",
          display_name: app_key,
        }, { onConflict: "user_id,app_key" }).select().single();

        if (error) throw error;

        return new Response(JSON.stringify({ app: data, status: "installed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "uninstall": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { app_key } = body;
        if (!app_key) {
          return new Response(JSON.stringify({ error: "Missing app_key" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase
          .from("managed_apps")
          .update({ status: "uninstalled" })
          .eq("user_id", user.id)
          .eq("app_key", app_key);

        if (error) throw error;

        return new Response(JSON.stringify({ app_key, status: "uninstalled" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
