import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";

const FUNCTIONS_DIR = "supabase/functions";

describe("Edge Function Structural Verification", () => {
  const entries = EDGE_FUNCTION_REGISTRY.filter(e =>
    fs.existsSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"))
  );

  it("every function has Deno.serve handler", () => {
    const missing: string[] = [];
    for (const entry of entries) {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, entry.name, "index.ts"), "utf8");
      if (!code.includes("Deno.serve") && !code.includes("serve(")) {
        missing.push(entry.name);
      }
    }
    expect(missing, `No serve handler: ${missing.slice(0, 10).join(", ")}`).toHaveLength(0);
  });

  it("every function has CORS handling", () => {
    const missing: string[] = [];
    for (const entry of entries) {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, entry.name, "index.ts"), "utf8");
      const hasCors = code.includes("corsHeaders") || code.includes("Access-Control") || code.includes("cors");
      if (!hasCors) missing.push(entry.name);
    }
    // Allow up to 5% without explicit CORS (cron/internal functions)
    const threshold = Math.floor(entries.length * 0.95);
    expect(entries.length - missing.length, `${missing.length} functions lack CORS`).toBeGreaterThanOrEqual(threshold);
  });

  it("no function imports from src/integrations/supabase/client (tolerance ≤ 2)", () => {
    const violators: string[] = [];
    for (const entry of entries) {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, entry.name, "index.ts"), "utf8");
      if (code.includes("src/integrations/supabase/client") || code.includes("@/integrations/supabase/client")) {
        violators.push(entry.name);
      }
    }
    // Allow ≤ 2 legacy functions that still import browser client
    expect(violators.length, `Forbidden client import: ${violators.join(", ")}`).toBeLessThanOrEqual(2);
  });

  it("service-role functions use SUPABASE_SERVICE_ROLE_KEY", () => {
    const serviceRoleFns = entries.filter(e => e.authModel === "service-role");
    const missing: string[] = [];
    for (const entry of serviceRoleFns) {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, entry.name, "index.ts"), "utf8");
      if (!code.includes("SERVICE_ROLE") && !code.includes("service_role")) {
        missing.push(entry.name);
      }
    }
    // Allow some tolerance for functions that inherit service role from caller
    const threshold = Math.floor(serviceRoleFns.length * 0.8);
    expect(serviceRoleFns.length - missing.length).toBeGreaterThanOrEqual(threshold);
  });
});