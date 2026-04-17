// ═══════════════════════════════════════════════════════════════
// health-live (Phase 20.C)
// Liveness probe: returns 200 with no dependencies.
// For external monitor heartbeat / load balancer.
// ═══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const startedAt = Date.now();

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      status: "alive",
      uptime_seconds: Math.round((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
