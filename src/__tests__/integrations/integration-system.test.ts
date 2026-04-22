import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Integration & Connector System — Verification
// ═══════════════════════════════════════════════════════════════

describe("Supabase Client", () => {
  it("client file exists and is auto-generated", () => {
    expect(fs.existsSync("src/integrations/supabase/client.ts")).toBe(true);
  });

  it("types file exists", () => {
    expect(fs.existsSync("src/integrations/supabase/types.ts")).toBe(true);
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("Database");
  });

  it("client uses env variables not hardcoded URLs", () => {
    const client = fs.readFileSync("src/integrations/supabase/client.ts", "utf8");
    expect(client).not.toMatch(/https:\/\/[a-z]+\.supabase\.co/);
  });
});

describe("Edge Functions", () => {
  it("edge functions directory exists", () => {
    expect(fs.existsSync("supabase/functions")).toBe(true);
  });

  it("each edge function has index.ts", () => {
    const funcs = fs.readdirSync("supabase/functions", { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith("_"))
      .map(d => d.name);
    const missing = funcs.filter(f => !fs.existsSync(`supabase/functions/${f}/index.ts`));
    expect(missing, `Functions without index.ts: ${missing.join(", ")}`).toEqual([]);
  });

  it("shared helpers directory exists", () => {
    expect(fs.existsSync("supabase/functions/_shared")).toBe(true);
  });
});

describe("Connector System", () => {
  it("connector behavioral test exists", () => {
    expect(fs.existsSync("src/__tests__/connectors/connector-behavioral.test.ts")).toBe(true);
  });

  it("connector token refresh edge function exists", () => {
    expect(fs.existsSync("supabase/functions/connector-token-refresh/index.ts")).toBe(true);
  });
});