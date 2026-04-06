import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const GATEWAY_BASE = "https://connector-gateway.lovable.dev";

// Connector ID → env var name mapping
const CONNECTOR_KEYS: Record<string, string> = {
  slack: "SLACK_API_KEY",
  resend: "RESEND_API_KEY",
  twilio: "TWILIO_API_KEY",
};

// Connector ID → gateway path mapping for common actions
const CONNECTOR_ACTIONS: Record<string, Record<string, { method: string; path: string }>> = {
  slack: {
    "send-message": { method: "POST", path: "/slack/api/chat.postMessage" },
    "list-channels": { method: "GET", path: "/slack/api/conversations.list" },
    "health": { method: "POST", path: "/slack/api/auth.test" },
  },
  resend: {
    "send-email": { method: "POST", path: "/resend/emails" },
    "health": { method: "GET", path: "/resend/domains" },
  },
  twilio: {
    "send-sms": { method: "POST", path: "/twilio/2010-04-01/Accounts/{accountSid}/Messages.json" },
    "health": { method: "GET", path: "/twilio/2010-04-01/Accounts.json" },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      const BodySchema = z.object({ connector: z.string().min(1), action: z.string().min(1), payload: z.record(z.unknown()).optional() });
      const body = await req.json();
      const parsed = BodySchema.safeParse(body);
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } catch (_) {
      // Non-JSON body or GET request - continue
    }
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { connector, action, payload } = await req.json();

    if (!connector || !action) {
      return new Response(
        JSON.stringify({ error: "Missing connector or action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check connector key availability
    const connectorKeyName = CONNECTOR_KEYS[connector];
    if (!connectorKeyName) {
      return new Response(
        JSON.stringify({ error: `Unsupported connector: ${connector}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const connectorKey = Deno.env.get(connectorKeyName);
    if (!connectorKey) {
      return new Response(
        JSON.stringify({ error: `${connectorKeyName} is not configured. Connect ${connector} in Owner Center.`, connected: false }),
        { status: 424, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve action to gateway path
    const actionConfig = CONNECTOR_ACTIONS[connector]?.[action];
    if (!actionConfig) {
      return new Response(
        JSON.stringify({ error: `Unknown action '${action}' for connector '${connector}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Make gateway request
    const gatewayUrl = `${GATEWAY_BASE}${actionConfig.path}`;
    const gatewayHeaders: Record<string, string> = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": connectorKey,
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method: actionConfig.method,
      headers: gatewayHeaders,
    };

    if (actionConfig.method === "POST" && payload) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(gatewayUrl, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Gateway error [${response.status}]`, details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Connector proxy error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
