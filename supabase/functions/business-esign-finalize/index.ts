// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10: Built-in e-sign — finalize signature
//
// PUBLIC endpoint — the signer hits this from the /sign/:token
// page (no Lovable auth). Authenticates via the secret sign_token
// stored in document_signatures. Captures typed-name signature,
// IP, user agent, and timestamp. Triggers PDF generation via the
// service role to produce the executed contract artifact.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { withCors } from "../_shared/cors.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";

const Schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("view"), sign_token: z.string().min(20).max(120) }),
  z.object({
    action: z.literal("sign"),
    sign_token: z.string().min(20).max(120),
    typed_signature: z.string().min(2).max(120),
    accepted_terms: z.boolean(),
    consent_text: z.string().max(800).optional(),
  }),
  z.object({ action: z.literal("decline"), sign_token: z.string().min(20).max(120), reason: z.string().max(400).optional() }),
]);

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

Deno.serve(withCors("business-esign-finalize", async (req, ctx) => {
  let raw: unknown;
  try { raw = await req.json(); } catch { return ctx.error("Invalid JSON body", 400); }
  const v = zodValidate(raw, Schema);
  if (!v.success) return v.response;
  const d = v.data;

  // Service-role client — token IS the auth boundary here
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const svc = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: sig, error: sigErr } = await svc
    .from("document_signatures")
    .select("*")
    .eq("sign_token", d.sign_token)
    .maybeSingle();
  if (sigErr) return ctx.error(sigErr.message, 500);
  if (!sig) return ctx.error("Invalid or unknown signing link", 404);

  if (new Date(sig.expires_at).getTime() < Date.now() && sig.status !== "signed") {
    if (sig.status !== "expired") {
      await svc.from("document_signatures").update({ status: "expired" }).eq("id", sig.id);
    }
    return ctx.error("This signing link has expired", 410);
  }

  // Resolve associated document title for display
  let documentTitle: string | null = null;
  let documentBody: string | null = null;
  let ownerLabel: string | null = null;
  if (sig.document_type === "proposal" || sig.document_type === "contract") {
    const { data: prop } = await svc.from("proposals")
      .select("title, scope, content")
      .eq("id", sig.document_id).maybeSingle();
    documentTitle = prop?.title ?? null;
    const c = prop?.content as Record<string, unknown> | null;
    documentBody = String((c?.body as string | undefined) ?? prop?.scope ?? "");
  } else if (sig.document_type === "invoice") {
    const { data: inv } = await svc.from("invoices")
      .select("invoice_number, amount_cents, currency")
      .eq("id", sig.document_id).maybeSingle();
    documentTitle = inv ? `Invoice #${inv.invoice_number}` : null;
  }

  // ── Action: view ─────────────────────────────────────────────
  if (d.action === "view") {
    if (sig.status === "pending") {
      await svc.from("document_signatures").update({
        status: "viewed",
        viewed_at: new Date().toISOString(),
      }).eq("id", sig.id);
    }
    return ctx.json({
      ok: true,
      signature_id: sig.id,
      status: sig.status === "pending" ? "viewed" : sig.status,
      document_type: sig.document_type,
      document_title: documentTitle,
      document_body: documentBody,
      signer_email: sig.signer_email,
      signer_name: sig.signer_name,
      expires_at: sig.expires_at,
      already_signed: sig.status === "signed",
      typed_signature: sig.status === "signed" ? sig.typed_signature : null,
      signed_at: sig.signed_at,
    });
  }

  // ── Action: decline ─────────────────────────────────────────
  if (d.action === "decline") {
    if (sig.status === "signed") return ctx.error("Already signed", 409);
    await svc.from("document_signatures").update({
      status: "declined",
      evidence: { ...(sig.evidence ?? {}), decline_reason: d.reason ?? null, declined_at: new Date().toISOString() },
    }).eq("id", sig.id);
    await svc.from("receipts").insert({
      user_id: sig.user_id,
      receipt_class: "business",
      subject_type: sig.document_type,
      subject_id: sig.document_id,
      actor_user_id: sig.user_id,
      actor_kind: "external_signer",
      action_key: "esign.declined",
      outcome: "declined",
      payload: { signer_email: sig.signer_email, reason: d.reason ?? null },
      evidence: { signature_id: sig.id, ip: clientIp(req) },
    });
    return ctx.json({ ok: true, status: "declined" });
  }

  // ── Action: sign ─────────────────────────────────────────────
  if (sig.status === "signed") {
    return ctx.json({ ok: true, already_signed: true, status: "signed", signed_at: sig.signed_at });
  }
  if (!d.accepted_terms) return ctx.error("You must accept the e-sign disclosure", 400);

  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? "unknown";
  const signedAt = new Date().toISOString();

  const { data: signed, error: updErr } = await svc.from("document_signatures").update({
    status: "signed",
    signed_at: signedAt,
    signer_ip: ip,
    signer_user_agent: ua.slice(0, 400),
    typed_signature: d.typed_signature,
    evidence: {
      ...(sig.evidence ?? {}),
      consent_text: d.consent_text ?? "I agree my typed name constitutes a legal electronic signature.",
      signed_at_iso: signedAt,
      signer_ip: ip,
      signer_user_agent: ua.slice(0, 400),
    },
  }).eq("id", sig.id).select("id, document_type, document_id, signed_at, user_id").single();
  if (updErr) return ctx.error(updErr.message, 500);

  // Stamp proposal status → signed
  if (sig.document_type === "proposal" || sig.document_type === "contract") {
    const { data: prev } = await svc.from("proposals")
      .select("content").eq("id", sig.document_id).maybeSingle();
    const content = (prev?.content && typeof prev.content === "object")
      ? prev.content as Record<string, unknown> : {};
    await svc.from("proposals").update({
      status: "signed",
      content: {
        ...content,
        esign: {
          ...((content?.esign as Record<string, unknown>) ?? {}),
          status: "signed",
          signed_at: signedAt,
          signature_id: signed.id,
          signer_ip: ip,
        },
      },
    }).eq("id", sig.document_id).eq("user_id", sig.user_id);
  }

  // Verifiable receipt
  await svc.from("receipts").insert({
    user_id: sig.user_id,
    receipt_class: "business",
    subject_type: sig.document_type,
    subject_id: sig.document_id,
    actor_user_id: sig.user_id,
    actor_kind: "external_signer",
    action_key: "esign.signed",
    outcome: "success",
    payload: { signer_email: sig.signer_email, signer_name: sig.signer_name, typed_signature: d.typed_signature },
    evidence: {
      signature_id: signed.id,
      signer_ip: ip,
      signer_user_agent: ua.slice(0, 400),
      signed_at_iso: signedAt,
    },
  });

  // Trigger executed-contract PDF generation (best-effort — non-blocking failure)
  let pdfPath: string | null = null;
  try {
    const pdfResp = await fetch(`${SUPABASE_URL}/functions/v1/business-pdf-generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "contract", signature_id: signed.id }),
    });
    if (pdfResp.ok) {
      const j = await pdfResp.json().catch(() => null) as Record<string, unknown> | null;
      pdfPath = (j?.pdf_path as string | undefined) ?? null;
    }
  } catch (_) { /* leave pdfPath null */ }

  return ctx.json({
    ok: true,
    status: "signed",
    signature_id: signed.id,
    signed_at: signedAt,
    pdf_generated: !!pdfPath,
    pdf_path: pdfPath,
  });
}));