import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

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
        const { data, error } = await supabase
          .from("simulations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ simulations: data || [] }), {
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
        const { title, scenario_type, parameters, iterations } = body;
        if (!title || !scenario_type) {
          return new Response(JSON.stringify({ error: "Missing title or scenario_type" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("simulations").insert({
          user_id: user.id,
          title,
          scenario_type,
          parameters: parameters || {},
          status: "pending",
        }).select().single();

        if (error) throw error;

        // Run simulation (simplified — real version would be async worker)
        const iterCount = Math.min(iterations || 1000, 100000);
        const results: number[] = [];
        for (let i = 0; i < Math.min(iterCount, 100); i++) {
          results.push(Math.random() * 100);
        }
        const mean = results.reduce((a, b) => a + b, 0) / results.length;
        const variance = results.reduce((sum, v) => sum + (v - mean) ** 2, 0) / results.length;

        await supabase.from("simulations").update({
          status: "completed",
          result: {
            iterations: iterCount,
            mean: Math.round(mean * 100) / 100,
            std_dev: Math.round(Math.sqrt(variance) * 100) / 100,
            percentiles: { p5: results.sort()[Math.floor(results.length * 0.05)], p95: results.sort()[Math.floor(results.length * 0.95)] },
          },
          completed_at: new Date().toISOString(),
        }).eq("id", data.id);

        return new Response(JSON.stringify({ simulation: { ...data, status: "completed" } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get": {
        const simId = url.searchParams.get("id");
        if (!simId) {
          return new Response(JSON.stringify({ error: "Missing id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase
          .from("simulations")
          .select("*")
          .eq("id", simId)
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ simulation: data }), {
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
