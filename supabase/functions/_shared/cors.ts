import { securityHeaders } from "./security-headers.ts";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  ...securityHeaders,
};

export function corsResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function corsError(message: string, status: number) {
  return corsResponse({ error: message }, status);
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Wraps an edge function handler with automatic CORS preflight,
 * request-ID tracking, structured error logging, and Sentry-style
 * JSON output on failure. Use this as the single entry point for
 * every edge function to eliminate inconsistent CORS definitions.
 *
 * @example
 * ```ts
 * import { withCors } from "../_shared/cors.ts";
 * Deno.serve(withCors("my-function", async (req, ctx) => {
 *   return ctx.json({ ok: true });
 * }));
 * ```
 */
export interface CorsContext {
  requestId: string;
  json: (body: unknown, status?: number) => Response;
  error: (message: string, status?: number, extra?: Record<string, unknown>) => Response;
}

export function withCors(
  functionName: string,
  handler: (req: Request, ctx: CorsContext) => Promise<Response> | Response,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    // Handle preflight
    const preflightResp = handleCors(req);
    if (preflightResp) return preflightResp;

    const requestId = crypto.randomUUID();
    const start = Date.now();

    const ctx: CorsContext = {
      requestId,
      json: (body, status = 200) => corsResponse({ ...((typeof body === "object" && body !== null) ? body : { data: body }), _requestId: requestId }, status),
      error: (message, status = 500, extra) => {
        const payload = { error: message, _requestId: requestId, _function: functionName, ...extra };
        // Structured error log for Sentry/log drain
        console.error(JSON.stringify({
          ts: new Date().toISOString(),
          level: "error",
          fn: functionName,
          requestId,
          msg: message,
          status,
          latencyMs: Date.now() - start,
          ...extra,
        }));
        return corsResponse(payload, status);
      },
    };

    try {
      const response = await handler(req, ctx);
      // Log completion
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        fn: functionName,
        requestId,
        msg: "request_complete",
        status: response.status,
        latencyMs: Date.now() - start,
      }));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      // Structured Sentry-compatible error log
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        fn: functionName,
        requestId,
        msg: message,
        stack,
        latencyMs: Date.now() - start,
        sentry: true,
        tags: { function: functionName, requestId },
      }));
      return corsResponse({ error: message, _requestId: requestId, _function: functionName }, 500);
    }
  };
}
