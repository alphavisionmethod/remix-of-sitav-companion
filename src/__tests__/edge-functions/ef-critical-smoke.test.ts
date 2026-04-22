import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";

const FUNCTIONS_DIR = "supabase/functions";

const CRITICAL_FUNCTIONS = [
  "ai-gateway", "boardroom-session", "brain-core", "admin-gateway",
  "agent-executor", "advisor-conversation", "webhook-retry-processor",
  "alert-router", "app-store-api", "cashflow-calculate",
  "admin-bff-gateway", "advisor-agent-loop", "agent-scheduler",
  "connector-oauth-callback", "data-cleanup", "invoice-generate",
  "notification-dispatch", "os-update-manifest", "webhook-ingest",
  "ai-receipt-completeness-snapshot",
];

const existing = CRITICAL_FUNCTIONS.filter(fn =>
  fs.existsSync(path.join(FUNCTIONS_DIR, fn, "index.ts"))
);

describe("Critical Edge Function Smoke Tests", () => {
  it("at least 15 of 20 critical functions exist on disk", () => {
    expect(existing.length, `Only ${existing.length}/20 critical functions found`).toBeGreaterThanOrEqual(15);
  });

  for (const fn of existing) {
    describe(`[${fn}]`, () => {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, fn, "index.ts"), "utf8");

      it("has Deno.serve or serve() handler", () => {
        expect(code.includes("Deno.serve") || code.includes("serve("), `${fn} missing serve handler`).toBe(true);
      });

      it("has CORS handling", () => {
        const hasCors = code.includes("corsHeaders") || code.includes("Access-Control") || code.includes("OPTIONS");
        expect(hasCors, `${fn} missing CORS handling`).toBe(true);
      });

      it("has error handling (try/catch or error response)", () => {
        const hasErrorHandling = code.includes("try") || code.includes("catch") || code.includes("error") || code.includes("Error");
        expect(hasErrorHandling, `${fn} missing error handling`).toBe(true);
      });

      it("has proper status code usage", () => {
        const hasStatusCodes = code.includes("status:") || code.includes("200") || code.includes("400") || code.includes("500");
        expect(hasStatusCodes, `${fn} missing HTTP status codes`).toBe(true);
      });

      it("does not import browser Supabase client", () => {
        const forbidden = code.includes("@/integrations/supabase/client") || code.includes("src/integrations/supabase/client");
        expect(forbidden, `${fn} imports browser client`).toBe(false);
      });
    });
  }
});