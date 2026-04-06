// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Caller Edge Function
// Initiates outbound calls via Twilio and logs call activity
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";

interface CallRequest {
  action: "call" | "hangup" | "log";
  to?: string;
  contactId?: string;
  contactName?: string;
  notes?: string;
  duration?: number;
  outcome?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders }

  // Rate limiting
  const clientId = req.headers.get("authorization")?.slice(-10) || "anon";
  const rl = checkRateLimit(`revenue-caller:${clientId}`, 60, 60000);
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  // Input validation
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
  const BodySchema = z.object({ action: z.string().min(1), amount: z.number().optional(), metadata: z.record(z.unknown()).optional() });
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
  });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CallRequest = await req.json();

    if (body.action === "call") {
      if (!body.to || !body.contactId) {
        return new Response(JSON.stringify({ error: "Missing 'to' or 'contactId'" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check for Twilio credentials
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioFrom = Deno.env.get("TWILIO_PHONE_NUMBER");

      let callResult: Record<string, unknown>;

      if (twilioSid && twilioToken && twilioFrom) {
        // Real Twilio call
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`;
        const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

        const formData = new URLSearchParams();
        formData.append("To", body.to);
        formData.append("From", twilioFrom);
        formData.append("Url", "http://demo.twilio.com/docs/voice.xml");

        const twilioResp = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const twilioData = await twilioResp.json();

        if (!twilioResp.ok) {
          return new Response(JSON.stringify({
            error: `Twilio error [${twilioResp.status}]`,
            details: twilioData,
          }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        callResult = {
          provider: "twilio",
          callSid: twilioData.sid,
          status: twilioData.status,
          to: body.to,
          from: twilioFrom,
        };
      } else {
        // No Twilio configured — return simulated response
        callResult = {
          provider: "simulated",
          callSid: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          status: "initiated",
          to: body.to,
          from: "+1-000-000-0000",
          note: "Twilio not configured — call simulated",
        };
      }

      // Log call initiation to communication_log
      await supabase.from("communication_log").insert({
        user_id: user.id,
        channel: "phone",
        direction: "outbound",
        contact_name: body.contactName ?? null,
        subject: `Call to ${body.contactName ?? body.to}`,
        status: "initiated",
        metadata: callResult,
      });

      return new Response(JSON.stringify({ success: true, call: callResult }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "log") {
      // Log call outcome
      await supabase.from("communication_log").insert({
        user_id: user.id,
        channel: "phone",
        direction: "outbound",
        contact_name: body.contactName ?? null,
        subject: `Call to ${body.contactName ?? "Unknown"}`,
        body: body.notes ?? null,
        status: body.outcome ?? "completed",
        metadata: {
          duration: body.duration ?? 0,
          outcome: body.outcome ?? "completed",
          contactId: body.contactId,
        },
      });

      return new Response(JSON.stringify({ success: true, logged: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "hangup") {
      return new Response(JSON.stringify({ success: true, action: "hangup" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${body.action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[revenue-caller] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
