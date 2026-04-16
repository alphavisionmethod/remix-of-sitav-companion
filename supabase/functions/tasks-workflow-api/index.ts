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
    const action = url.searchParams.get("action") || "list";

    switch (action) {
      case "list": {
        const { data: steps } = await supabase
          .from("command_steps")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        const pending = (steps || []).filter((s: any) => s.status === "pending").length;
        const inProgress = (steps || []).filter((s: any) => s.status === "in_progress").length;
        const completed = (steps || []).filter((s: any) => s.status === "completed").length;

        return new Response(JSON.stringify({
          tasks: steps || [],
          summary: { pending, in_progress: inProgress, completed, total: steps?.length || 0 },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { title, description, command_id, step_order } = body;
        if (!title) {
          return new Response(JSON.stringify({ error: "Missing title" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("command_steps").insert({
          user_id: user.id,
          command_id: command_id || crypto.randomUUID(),
          step_key: title.toLowerCase().replace(/\s+/g, "_"),
          label: title,
          description: description || "",
          status: "pending",
          step_order: step_order || 0,
        }).select().single();

        if (error) throw error;

        return new Response(JSON.stringify({ task: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update-status": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { task_id, status } = body;
        if (!task_id || !status) {
          return new Response(JSON.stringify({ error: "Missing task_id or status" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData: any = { status };
        if (status === "completed") updateData.completed_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("command_steps")
          .update(updateData)
          .eq("id", task_id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ task: data }), {
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
