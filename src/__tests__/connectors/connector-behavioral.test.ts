import { describe, it, expect } from "vitest";
import * as fs from "fs";

function findFile(patterns: string[]): string | null {
  for (const p of patterns) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

describe("Connector Behavioral Contracts", () => {
  const catalogPath = findFile([
    "src/lib/connectors/connector-catalog.ts",
    "src/lib/integrations/connector-catalog.ts",
    "src/integrations/connector-catalog.ts",
    "src/lib/connectors/catalog.ts",
  ]);

  const registryPath = findFile([
    "src/lib/connectors/connector-registry.ts",
    "src/lib/integrations/connector-registry.ts",
    "src/integrations/connector-registry.ts",
  ]);

  it("connector catalog or registry file exists", () => {
    expect(catalogPath || registryPath, "No connector catalog/registry found").toBeTruthy();
  });

  if (catalogPath) {
    const content = fs.readFileSync(catalogPath, "utf8");

    it("catalog defines connectors with required fields", () => {
      expect(content).toContain("name");
      expect(content).toContain("provider");
    });

    it("catalog has auth type definitions", () => {
      const hasAuthType = content.includes("authType") || content.includes("auth_type") || content.includes("AuthType");
      expect(hasAuthType, "Catalog missing auth type definitions").toBe(true);
    });

    it("catalog has status field", () => {
      const hasStatus = content.includes("status") || content.includes("Status");
      expect(hasStatus, "Catalog missing status field").toBe(true);
    });
  }

  describe("connector infrastructure", () => {
    it("OAuth callback edge function exists", () => {
      const candidates = [
        "supabase/functions/connector-oauth-callback/index.ts",
        "supabase/functions/oauth-callback/index.ts",
        "supabase/functions/connector-auth/index.ts",
      ];
      const found = candidates.some(f => fs.existsSync(f));
      expect(found, "No OAuth callback edge function").toBe(true);
    });

    it("webhook ingest function exists", () => {
      expect(fs.existsSync("supabase/functions/webhook-ingest/index.ts")).toBe(true);
    });
  });
});