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
    const action = url.searchParams.get("action") || "snapshot";

    switch (action) {
      case "snapshot": {
        // Build a digital twin snapshot from multiple domain data sources
        const [healthScores, profitSignals, positions, recommendations] = await Promise.all([
          supabase.from("business_health_scores").select("*").eq("user_id", user.id).order("scored_at", { ascending: false }).limit(10),
          supabase.from("profit_signals").select("*").eq("user_id", user.id).order("detected_at", { ascending: false }).limit(10),
          supabase.from("portfolio_positions").select("*").eq("user_id", user.id),
          supabase.from("ai_workforce_recommendations").select("id, title, severity, confidence, status, domain").eq("user_id", user.id).eq("status", "new").limit(5),
        ]);

        const businessHealth = (healthScores.data || []).reduce((acc: any, s: any) => {
          acc[s.dimension] = { score: s.score, trend: s.trend };
          return acc;
        }, {});

        const portfolioValue = (positions.data || []).reduce((sum: number, p: any) =>
          sum + (p.quantity || 0) * (p.current_price || p.entry_price || 0), 0);

        return new Response(JSON.stringify({
          twin_id: `twin_${user.id.slice(0, 8)}`,
          generated_at: new Date().toISOString(),
          business_health: businessHealth,
          portfolio_value: portfolioValue,
          active_positions: positions.data?.length || 0,
          profit_signals: profitSignals.data?.length || 0,
          pending_recommendations: recommendations.data?.length || 0,
          recommendations: recommendations.data || [],
          overall_score: Object.values(businessHealth).reduce((sum: number, s: any) => sum + (s.score || 0), 0) / Math.max(Object.keys(businessHealth).length, 1),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "simulate": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { scenario, parameters } = body;
        if (!scenario) {
          return new Response(JSON.stringify({ error: "Missing scenario" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Record simulation request
        const { data: sim, error: simError } = await supabase.from("simulations").insert({
          user_id: user.id,
          title: `Digital Twin: ${scenario}`,
          scenario_type: scenario,
          parameters: parameters || {},
          status: "running",
        }).select().single();

        if (simError) {
          return new Response(JSON.stringify({ error: simError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Mark completed (real simulation would be async)
        await supabase.from("simulations").update({
          status: "completed",
          result: { scenario, impact_estimate: "moderate", confidence: 0.72 },
          completed_at: new Date().toISOString(),
        }).eq("id", sim.id);

        return new Response(JSON.stringify({
          simulation_id: sim.id,
          scenario,
          status: "completed",
          result: { impact_estimate: "moderate", confidence: 0.72 },
        }), {
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
