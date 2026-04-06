// Main entrypoint for Supabase Edge Runtime (self-hosted)
// Routes requests to individual edge functions based on path

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const functionName = pathParts[0];

  if (!functionName || functionName === "health") {
    return new Response(
      JSON.stringify({ status: "healthy", service: "sita-edge-functions", timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const modulePath = `/home/deno/functions/${functionName}/index.ts`;
    const mod = await import(modulePath);

    if (typeof mod.default === "function") {
      return await mod.default(req);
    }

    return new Response(
      JSON.stringify({ error: "Function has no default export", function: functionName }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Module not found") || message.includes("Cannot find")) {
      return new Response(
        JSON.stringify({ error: "Function not found", function: functionName }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Function execution failed", function: functionName, message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
