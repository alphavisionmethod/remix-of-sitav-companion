import { corsHeaders, handleCors, corsResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  return corsResponse({ vapid_public_key: vapidPublicKey });
});
