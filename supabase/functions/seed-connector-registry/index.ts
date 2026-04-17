// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Registry Seeder (Phase 22.E)
// Idempotently upserts canonical connectors into connector_registry.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONNECTORS = [
  { connector_id: "gmail", display_name: "Gmail", provider: "google", connector_class: "communication", auth_method: "oauth2", webhook_supported: true, default_scopes: ["https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/gmail.send"], launch_stage: "beta" },
  { connector_id: "google-calendar", display_name: "Google Calendar", provider: "google", connector_class: "calendar", auth_method: "oauth2", webhook_supported: true, default_scopes: ["https://www.googleapis.com/auth/calendar"], launch_stage: "beta" },
  { connector_id: "google-drive", display_name: "Google Drive", provider: "google", connector_class: "cloud-storage", auth_method: "oauth2", webhook_supported: true, default_scopes: ["https://www.googleapis.com/auth/drive.readonly"], launch_stage: "beta" },
  { connector_id: "plaid", display_name: "Plaid", provider: "plaid", connector_class: "banking", auth_method: "oauth2", webhook_supported: true, default_scopes: ["transactions","accounts"], launch_stage: "beta" },
  { connector_id: "stripe", display_name: "Stripe", provider: "stripe", connector_class: "payments", auth_method: "api_key", webhook_supported: true, default_scopes: ["read","write"], launch_stage: "beta" },
  { connector_id: "quickbooks", display_name: "QuickBooks", provider: "intuit", connector_class: "accounting", auth_method: "oauth2", webhook_supported: true, default_scopes: ["com.intuit.quickbooks.accounting"], launch_stage: "planned" },
  { connector_id: "twilio", display_name: "Twilio", provider: "twilio", connector_class: "communication", auth_method: "api_key", webhook_supported: true, default_scopes: ["sms","voice"], launch_stage: "beta" },
  { connector_id: "sendgrid", display_name: "SendGrid", provider: "sendgrid", connector_class: "communication", auth_method: "api_key", webhook_supported: true, default_scopes: ["mail.send"], launch_stage: "planned" },
  { connector_id: "instacart", display_name: "Instacart", provider: "instacart", connector_class: "commerce", auth_method: "oauth2", webhook_supported: false, default_scopes: ["orders.read"], launch_stage: "planned" },
  { connector_id: "hubspot", display_name: "HubSpot", provider: "hubspot", connector_class: "crm", auth_method: "oauth2", webhook_supported: true, default_scopes: ["contacts","crm.objects.deals"], launch_stage: "planned" },
  { connector_id: "slack", display_name: "Slack", provider: "slack", connector_class: "communication", auth_method: "oauth2", webhook_supported: true, default_scopes: ["chat:write","channels:read"], launch_stage: "planned" },
  { connector_id: "dropbox", display_name: "Dropbox", provider: "dropbox", connector_class: "cloud-storage", auth_method: "oauth2", webhook_supported: true, default_scopes: ["files.content.read"], launch_stage: "planned" },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let upserted = 0;
  for (const c of CONNECTORS) {
    const { error } = await supabase.from("connector_registry").upsert(c, { onConflict: "connector_id" });
    if (!error) upserted++;
  }

  return new Response(JSON.stringify({ ok: true, total: CONNECTORS.length, upserted }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
