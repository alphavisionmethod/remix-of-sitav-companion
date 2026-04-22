import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";

const FUNCTIONS_DIR = "supabase/functions";

describe("Edge Function Auth Model Verification", () => {
  const entries = EDGE_FUNCTION_REGISTRY.filter(e =>
    fs.existsSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"))
  );

  describe("service-role functions", () => {
    const srFns = entries.filter(e => e.authModel === "service-role");

    it("identifies service-role functions", () => {
      expect(srFns.length).toBeGreaterThan(0);
    });

    it("≥80% reference SERVICE_ROLE_KEY in code", () => {
      const withKey = srFns.filter(e => {
        const code = fs.readFileSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"), "utf8");
        return code.includes("SERVICE_ROLE") || code.includes("service_role");
      });
      expect(withKey.length / srFns.length).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("jwt-verified functions", () => {
    const jwtFns = entries.filter(e => e.authModel === "jwt");

    it("identifies jwt functions", () => {
      expect(jwtFns.length).toBeGreaterThan(0);
    });

    it("≥70% reference Authorization or auth in code", () => {
      const withAuth = jwtFns.filter(e => {
        const code = fs.readFileSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"), "utf8");
        return code.includes("Authorization") || code.includes("authorization") || code.includes("getUser") || code.includes("auth");
      });
      expect(withAuth.length / jwtFns.length).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe("anon functions", () => {
    const anonFns = entries.filter(e => (e.authModel as string) === "anon" || (e.authModel as string) === "none");

    it("anon functions do not enforce auth headers", () => {
      const violators = anonFns.filter(e => {
        const code = fs.readFileSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"), "utf8");
        return code.includes("401") && code.includes("Unauthorized");
      });
      // Allow ≤2 exceptions (functions that optionally check auth)
      expect(violators.length, `Anon functions enforcing auth: ${violators.map(v => v.name).join(", ")}`).toBeLessThanOrEqual(2);
    });
  });
});