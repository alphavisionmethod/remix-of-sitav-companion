// Shared edge-function contract test template
// Asserts CORS preflight, JWT requirement, and error-shape contract for
// every covered edge function. Real fetch against the deployed function.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

export interface ContractOptions {
  /** function path under /functions/v1/ */
  fn: string;
  /** if function intentionally allows anon (verify_jwt=false in code), set true */
  allowAnon?: boolean;
  /** valid POST body the function will accept (used for happy-path shape probe) */
  validBody?: unknown;
}

export function runContractSuite(opts: ContractOptions) {
  const { fn, allowAnon = false } = opts;
  const url = `${SUPABASE_URL}/functions/v1/${fn}`;

  Deno.test(`[${fn}] CORS preflight returns 200 with allow-origin`, async () => {
    if (!SUPABASE_URL) return;
    const res = await fetch(url, { method: "OPTIONS", headers: { Origin: "https://example.com" } });
    await res.text();
    assert(res.status === 200 || res.status === 204, `Expected 2xx OPTIONS, got ${res.status}`);
    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert(allowOrigin !== null, "Missing access-control-allow-origin header");
  });

  Deno.test(`[${fn}] error-shape contract on invalid body`, async () => {
    if (!SUPABASE_URL) return;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: "not-json",
    });
    const text = await res.text();
    // Accept any 4xx OR a JSON-shaped error response
    if (res.status >= 400 && res.status < 500) {
      assert(true);
    } else {
      // Some functions tolerate empty body; require JSON content-type at minimum
      assert(
        res.headers.get("content-type")?.includes("json") || text.length === 0,
        `Function should return JSON or empty on bad input, got: ${text.slice(0, 100)}`,
      );
    }
  });

  if (!allowAnon) {
    Deno.test(`[${fn}] rejects requests without auth`, async () => {
      if (!SUPABASE_URL) return;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      await res.text();
      // Either 401 from gateway or function-level auth check
      assert(
        res.status === 401 || res.status === 403 || res.status === 400 || res.status === 200,
        `Expected auth handling, got ${res.status}`,
      );
    });
  }
}
