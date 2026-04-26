// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10: Built-in e-sign — request signature
//
// Creates a `document_signatures` row with a cryptographically
// random sign_token and returns the public sign URL. The owner
// can then send that URL to the recipient (manually or via the
// dispatch function).
// ═══════════════════════════════════════════════════════════════

import { withCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";

const Schema = z.object({
  document_type: z.enum(["proposal", "contract", "invoice"]),
  document_id: z.string().uuid(),
  signer_email: z.string().email().max(254),
  signer_name: z.string().max(120).optional(),
  expires_in_days: z.number().int().min(1).max(90).optional().default(30),
  return_url: z.string().url().optional(),
});

function genToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(withCors("business-esign-request", async (req, ctx) => {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth;

  let raw: unknown;
  try { raw = await req.json(); } catch { return ctx.error("Invalid JSON body", 400); }
  const v = zodValidate(raw, Schema);
  if (!v.success) return v.response;
  const d = v.data;

  // Verify ownership of the source document
  if (d.document_type === "proposal" || d.document_type === "contract") {
    const { data: prop, error: pe } = await supabase
      .from("proposals")
      .select("id, title")
      .eq("id", d.document_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (pe) return ctx.error(pe.message, 500);
    if (!prop) return ctx.error("Proposal not found", 404);
  } else {
    const { data: inv, error: ie } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", d.document_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ie) return ctx.error(ie.message, 500);
    if (!inv) return ctx.error("Invoice not found", 404);
  }

  const token = genToken();
  const expiresAt = new Date(Date.now() + d.expires_in_days * 86400_000).toISOString();

  const { data: sig, error: insErr } = await supabase
    .from("document_signatures")
    .insert({
      user_id: user.id,
      document_type: d.document_type,
      document_id: d.document_id,
      signer_email: d.signer_email,
      signer_name: d.signer_name ?? null,
      sign_token: token,
      status: "pending",
      expires_at: expiresAt,
      evidence: { return_url: d.return_url ?? null, requested_via: "business-esign-request" },
    })
    .select("id, sign_token, status, expires_at, signer_email")
    .single();
  if (insErr) return ctx.error(insErr.message, 500);

  // Stamp source proposal with esign reference
  if (d.document_type === "proposal" || d.document_type === "contract") {
    const { data: prev } = await supabase
      .from("proposals")
      .select("content")
      .eq("id", d.document_id)
      .eq("user_id", user.id)
      .maybeSingle();
    const content = (prev?.content && typeof prev.content === "object")
      ? prev.content as Record<string, unknown> : {};
    await supabase.from("proposals").update({
      content: {
        ...content,
        esign: {
          signature_id: sig.id,
          status: "pending",
          requested_at: new Date().toISOString(),
          signer_email: d.signer_email,
        },
      },
    }).eq("id", d.document_id).eq("user_id", user.id);
  }

  // Receipt for the request (verifiable trail)
  await supabase.from("receipts").insert({
    user_id: user.id,
    receipt_class: "business",
    subject_type: d.document_type,
    subject_id: d.document_id,
    actor_user_id: user.id,
    actor_kind: "user",
    action_key: "esign.requested",
    outcome: "success",
    payload: { signer_email: d.signer_email },
    evidence: { signature_id: sig.id, expires_at: expiresAt },
  });

  // Build public sign URL — caller can override origin via header for embeds.
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  const cleanOrigin = origin.replace(/\/$/, "").replace(/\/[^/]*$/, "");
  const signUrl = `${cleanOrigin}/sign/${token}`;

  return ctx.json({
    ok: true,
    signature_id: sig.id,
    sign_token: token,
    sign_url: signUrl,
    expires_at: expiresAt,
    status: sig.status,
    signer_email: sig.signer_email,
  });
}));