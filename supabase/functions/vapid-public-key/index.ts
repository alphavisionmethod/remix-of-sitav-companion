import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "GET") {
    return corsError("Method not allowed. Use GET.", 405);
  }

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";

  if (!vapidPublicKey) {
    console.error("VAPID_PUBLIC_KEY environment variable is not set");
    return corsError("VAPID public key not configured", 500);
  }

  return new Response(JSON.stringify({ vapid_public_key: vapidPublicKey }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
