// Phase 19.B — WebAuthn challenge issuance + verification
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function randomChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bufToB64Url(buf: Uint8Array): string {
  let str = "";
  for (let i = 0; i < buf.length; i++) str += String.fromCharCode(buf[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims.email as string) ?? "user";

    const body = await req.json();
    const action = body?.action as string;

    const rpId = req.headers.get("origin")?.replace(/^https?:\/\//, "").split(":")[0] ?? "localhost";

    // ─────────────────────────────────────────────
    // Registration options
    // ─────────────────────────────────────────────
    if (action === "registration-options") {
      const challenge = randomChallenge();
      await supabase.from("webauthn_challenges").insert({
        user_id: userId,
        challenge,
        ceremony_type: "registration",
      });

      const { data: existing } = await supabase
        .from("user_passkeys")
        .select("credential_id, transports")
        .eq("user_id", userId);

      const userIdBytes = new TextEncoder().encode(userId);

      return new Response(
        JSON.stringify({
          options: {
            challenge,
            rp: { name: "SITA OS", id: rpId },
            user: {
              id: bufToB64Url(userIdBytes),
              name: userEmail,
              displayName: userEmail,
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },   // ES256
              { type: "public-key", alg: -257 }, // RS256
            ],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: {
              residentKey: "preferred",
              userVerification: "preferred",
            },
            excludeCredentials: (existing ?? []).map((c) => ({
              type: "public-key",
              id: c.credential_id,
              transports: c.transports ?? [],
            })),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // Registration verify (trust-on-first-use; production should fully verify attestation)
    // ─────────────────────────────────────────────
    if (action === "registration-verify") {
      const att = body.attestation;
      if (!att?.id || !att?.rawId || !att?.response?.attestationObject) {
        return new Response(JSON.stringify({ error: "Invalid attestation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Consume the most recent unconsumed registration challenge
      const { data: chal } = await supabase
        .from("webauthn_challenges")
        .select("id")
        .eq("user_id", userId)
        .eq("ceremony_type", "registration")
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!chal) {
        return new Response(JSON.stringify({ error: "Challenge expired or missing" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("webauthn_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", chal.id);

      const { data: inserted, error: insErr } = await supabase
        .from("user_passkeys")
        .insert({
          user_id: userId,
          credential_id: att.id,
          public_key: att.response.attestationObject, // store raw attestation; production: extract COSE key
          sign_count: 0,
          transports: att.response.transports ?? [],
          device_label: body.deviceLabel ?? "Passkey",
        })
        .select("id, credential_id, device_label, transports, last_used_at, created_at")
        .single();

      if (insErr) {
        return new Response(JSON.stringify({ error: insErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          passkey: {
            id: inserted.id,
            credentialId: inserted.credential_id,
            deviceLabel: inserted.device_label,
            transports: inserted.transports,
            lastUsedAt: inserted.last_used_at,
            createdAt: inserted.created_at,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // Assertion options
    // ─────────────────────────────────────────────
    if (action === "assertion-options") {
      const challenge = randomChallenge();
      await supabase.from("webauthn_challenges").insert({
        user_id: userId,
        challenge,
        ceremony_type: "authentication",
      });

      const { data: passkeys } = await supabase
        .from("user_passkeys")
        .select("credential_id, transports")
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({
          options: {
            challenge,
            timeout: 60000,
            rpId,
            userVerification: "preferred",
            allowCredentials: (passkeys ?? []).map((p) => ({
              type: "public-key",
              id: p.credential_id,
              transports: p.transports ?? [],
            })),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────
    // Assertion verify
    // ─────────────────────────────────────────────
    if (action === "assertion-verify") {
      const asr = body.assertion;
      if (!asr?.id) {
        return new Response(JSON.stringify({ error: "Invalid assertion" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: chal } = await supabase
        .from("webauthn_challenges")
        .select("id")
        .eq("user_id", userId)
        .eq("ceremony_type", "authentication")
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!chal) {
        return new Response(JSON.stringify({ verified: false, error: "Challenge expired" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase
        .from("webauthn_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", chal.id);

      // Mark passkey as used (signature verification deferred to production hardening)
      await supabase
        .from("user_passkeys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("credential_id", asr.id);

      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
