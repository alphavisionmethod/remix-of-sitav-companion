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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "summary";

    switch (action) {
      case "summary": {
        const [positions, orders, watchlist, strategies, riskProfiles] = await Promise.all([
          supabase.from("portfolio_positions").select("*").eq("user_id", user.id),
          supabase.from("trade_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
          supabase.from("market_watchlist_items").select("*").eq("user_id", user.id),
          supabase.from("investment_strategies").select("*").eq("user_id", user.id),
          supabase.from("investment_risk_profiles").select("*").eq("user_id", user.id).limit(1),
        ]);

        const totalValue = (positions.data || []).reduce((sum: number, p: any) => {
          return sum + (p.quantity || 0) * (p.current_price || p.entry_price || 0);
        }, 0);

        return new Response(JSON.stringify({
          portfolio_value: totalValue,
          position_count: positions.data?.length || 0,
          open_orders: (orders.data || []).filter((o: any) => o.status === "open").length,
          watchlist_count: watchlist.data?.length || 0,
          strategy_count: strategies.data?.length || 0,
          risk_profile: riskProfiles.data?.[0] || null,
          positions: positions.data || [],
          recent_orders: orders.data || [],
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "place-order": {
        if (req.method !== "POST") {
          return new Response(JSON.stringify({ error: "POST required" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { symbol, side, order_type, quantity, limit_price, strategy_id } = body;
        if (!symbol || !side || !quantity) {
          return new Response(JSON.stringify({ error: "Missing required fields: symbol, side, quantity" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("trade_orders").insert({
          user_id: user.id,
          symbol,
          side,
          order_type: order_type || "market",
          quantity,
          limit_price: limit_price || null,
          strategy_id: strategy_id || null,
          status: "pending",
        }).select().single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ order: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "risk-analysis": {
        const { data: positions } = await supabase
          .from("portfolio_positions")
          .select("*")
          .eq("user_id", user.id);

        const totalValue = (positions || []).reduce((sum: number, p: any) => {
          return sum + (p.quantity || 0) * (p.current_price || p.entry_price || 0);
        }, 0);

        const concentrations = (positions || []).map((p: any) => {
          const posValue = (p.quantity || 0) * (p.current_price || p.entry_price || 0);
          return {
            symbol: p.symbol,
            value: posValue,
            weight: totalValue > 0 ? posValue / totalValue : 0,
            asset_class: p.asset_class || "unknown",
          };
        }).sort((a: any, b: any) => b.weight - a.weight);

        const topConcentration = concentrations[0]?.weight || 0;
        const riskLevel = topConcentration > 0.4 ? "high" : topConcentration > 0.2 ? "medium" : "low";

        return new Response(JSON.stringify({
          total_value: totalValue,
          position_count: positions?.length || 0,
          concentration_risk: riskLevel,
          top_holdings: concentrations.slice(0, 5),
          diversification_score: Math.max(0, 100 - (topConcentration * 100)),
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
