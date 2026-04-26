// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10: Communication dispatch (email + SMS).
//
// channel: "email" → Resend via Lovable connector gateway.
//   Required env: LOVABLE_API_KEY, RESEND_API_KEY (auto-injected
//   when the Resend connector is linked).
// channel: "sms" → Twilio via gateway.
//   Required env: LOVABLE_API_KEY, TWILIO_API_KEY, TWILIO_FROM_NUMBER.
//   When TWILIO_API_KEY is missing we deliberately defer (logged
//   as 'skipped: no_connector') so the rest of the flow keeps
//   working — owner connects Twilio later.
//
// Every dispatch is recorded in `business_dispatch_log` and a
// matching `receipts` row is emitted for the verifiable trail.
// ═══════════════════════════════════════════════════════════════

import { withCors } from "../_shared/cors.ts";
import { requireAuth, getServiceClient } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";

const Schema = z.object({
  channel: z.enum(["email", "sms"]),
  recipient: z.string().min(3).max(254),
  subject: z.string().max(200).optional(),
  message_text: z.string().min(1).max(8000),
  message_html: z.string().max(40000).optional(),
  template_key: z.string().max(80).optional(),
  subject_type: z.string().max(50).default("ad_hoc"),
  subject_id: z.string().uuid().optional(),
  from_email: z.string().email().optional(),
  from_name: z.string().max(120).optional(),
  reply_to: z.string().email().optional(),
});

const RESEND_GATEWAY = "https://connector-gateway.lovable.dev/resend";
const TWILIO_GATEWAY = "https://connector-gateway.lovable.dev/twilio";

interface DispatchOutcome {
  status: "sent" | "failed" | "skipped";
  provider: string;
  provider_message_id: string | null;
  error_code: string | null;
  error_message: string | null;
  latency_ms: number;
  payload_extra: Record<string, unknown>;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function sendEmail(params: {
  recipient: string;
  subject: string;
  text: string;
  html?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
}): Promise<DispatchOutcome> {
  const t0 = Date.now();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return {
      status: "skipped",
      provider: "resend",
      provider_message_id: null,
      error_code: "no_connector",
      error_message: "Resend connector not linked — email dispatch deferred.",
      latency_ms: Date.now() - t0,
      payload_extra: { connector_required: "resend" },
    };
  }

  const fromAddr = params.fromEmail ?? "SITA OS <onboarding@resend.dev>";
  const fromHeader = params.fromName ? `${params.fromName} <${fromAddr.replace(/.*<|>/g, "")}>` : fromAddr;

  const body: Record<string, unknown> = {
    from: fromHeader,
    to: [params.recipient],
    subject: params.subject,
    html: params.html ?? `<pre style="font-family:Inter,system-ui;white-space:pre-wrap;">${escapeHtml(params.text)}</pre>`,
    text: params.text,
  };
  if (params.replyTo) body.reply_to = params.replyTo;

  try {
    const resp = await fetch(`${RESEND_GATEWAY}/emails`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await resp.json().catch(() => ({} as Record<string, unknown>));
    if (!resp.ok) {
      return {
        status: "failed",
        provider: "resend",
        provider_message_id: null,
        error_code: String(resp.status),
        error_message: typeof json === "object" && json && "message" in json ? String((json as Record<string, unknown>).message) : `HTTP ${resp.status}`,
        latency_ms: Date.now() - t0,
        payload_extra: { resend_response: json },
      };
    }
    return {
      status: "sent",
      provider: "resend",
      provider_message_id: (json as Record<string, unknown>)?.id as string ?? null,
      error_code: null,
      error_message: null,
      latency_ms: Date.now() - t0,
      payload_extra: { resend_id: (json as Record<string, unknown>)?.id ?? null },
    };
  } catch (e) {
    return {
      status: "failed",
      provider: "resend",
      provider_message_id: null,
      error_code: "network",
      error_message: e instanceof Error ? e.message : String(e),
      latency_ms: Date.now() - t0,
      payload_extra: {},
    };
  }
}

async function sendSms(params: { recipient: string; text: string }): Promise<DispatchOutcome> {
  const t0 = Date.now();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_FROM) {
    return {
      status: "skipped",
      provider: "twilio",
      provider_message_id: null,
      error_code: "no_connector",
      error_message: "Twilio connector not linked — SMS dispatch deferred. Connect Twilio in Integrations to enable.",
      latency_ms: Date.now() - t0,
      payload_extra: { connector_required: "twilio" },
    };
  }

  try {
    const form = new URLSearchParams({
      To: params.recipient,
      From: TWILIO_FROM,
      Body: params.text.slice(0, 1600),
    });
    const resp = await fetch(`${TWILIO_GATEWAY}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const json = await resp.json().catch(() => ({} as Record<string, unknown>));
    if (!resp.ok) {
      return {
        status: "failed",
        provider: "twilio",
        provider_message_id: null,
        error_code: String(resp.status),
        error_message: typeof json === "object" && json && "message" in json ? String((json as Record<string, unknown>).message) : `HTTP ${resp.status}`,
        latency_ms: Date.now() - t0,
        payload_extra: { twilio_response: json },
      };
    }
    return {
      status: "sent",
      provider: "twilio",
      provider_message_id: (json as Record<string, unknown>)?.sid as string ?? null,
      error_code: null,
      error_message: null,
      latency_ms: Date.now() - t0,
      payload_extra: { twilio_sid: (json as Record<string, unknown>)?.sid ?? null },
    };
  } catch (e) {
    return {
      status: "failed",
      provider: "twilio",
      provider_message_id: null,
      error_code: "network",
      error_message: e instanceof Error ? e.message : String(e),
      latency_ms: Date.now() - t0,
      payload_extra: {},
    };
  }
}

Deno.serve(withCors("business-dispatch-comm", async (req, ctx) => {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user } = auth;

  let raw: unknown;
  try { raw = await req.json(); } catch { return ctx.error("Invalid JSON body", 400); }
  const v = zodValidate(raw, Schema);
  if (!v.success) return v.response;
  const d = v.data;

  const subject = d.subject ?? `Update from your ${d.subject_type}`;

  let outcome: DispatchOutcome;
  if (d.channel === "email") {
    outcome = await sendEmail({
      recipient: d.recipient,
      subject,
      text: d.message_text,
      html: d.message_html,
      fromEmail: d.from_email,
      fromName: d.from_name,
      replyTo: d.reply_to,
    });
  } else {
    outcome = await sendSms({ recipient: d.recipient, text: d.message_text });
  }

  const svc = getServiceClient();

  // Persist dispatch log row
  const { data: logRow, error: logErr } = await svc.from("business_dispatch_log").insert({
    user_id: user.id,
    subject_type: d.subject_type,
    subject_id: d.subject_id ?? null,
    channel: d.channel,
    provider: outcome.provider,
    recipient: d.recipient,
    template_key: d.template_key ?? null,
    status: outcome.status,
    provider_message_id: outcome.provider_message_id,
    error_code: outcome.error_code,
    error_message: outcome.error_message,
    latency_ms: outcome.latency_ms,
    payload: { subject, ...outcome.payload_extra },
  }).select("id").single();
  if (logErr) console.error("dispatch_log insert failed", logErr.message);

  // Verifiable receipt
  const { data: receipt } = await svc.from("receipts").insert({
    user_id: user.id,
    receipt_class: "business",
    subject_type: d.subject_type,
    subject_id: d.subject_id ?? null,
    actor_user_id: user.id,
    actor_kind: "user",
    action_key: `comm.${d.channel}.${outcome.status}`,
    outcome: outcome.status === "sent" ? "success" : outcome.status === "failed" ? "failure" : "deferred",
    payload: {
      channel: d.channel,
      recipient: d.recipient,
      subject,
      template_key: d.template_key ?? null,
    },
    evidence: {
      provider: outcome.provider,
      provider_message_id: outcome.provider_message_id,
      latency_ms: outcome.latency_ms,
      dispatch_log_id: logRow?.id ?? null,
      delivery_pending: outcome.status === "skipped",
      error_code: outcome.error_code,
    },
  }).select("id").single();

  // Back-link receipt to dispatch row
  if (logRow?.id && receipt?.id) {
    await svc.from("business_dispatch_log").update({ receipt_id: receipt.id }).eq("id", logRow.id);
  }

  return ctx.json({
    ok: outcome.status !== "failed",
    status: outcome.status,
    provider: outcome.provider,
    provider_message_id: outcome.provider_message_id,
    dispatch_log_id: logRow?.id ?? null,
    receipt_id: receipt?.id ?? null,
    error_code: outcome.error_code,
    error_message: outcome.error_message,
    deferred: outcome.status === "skipped",
  });
}));