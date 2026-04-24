import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * G10 — Cron freshness gate.
 *
 * Every function declared with a `[functions.<name>]` block in
 * `supabase/config.toml` (the convention used for cron-/webhook-
 * triggered functions that bypass JWT verification) must:
 *
 *   1. Have an actual implementation file at
 *      `supabase/functions/<name>/index.ts`.
 *   2. Be registered in `EDGE_FUNCTION_REGISTRY` so topology
 *      tooling, owners, and runtime callers stay in sync.
 *
 * This test is deterministic, file-system only, and runs in <100ms.
 */
describe("Cron / config-block freshness", () => {
  const configPath = path.resolve("supabase/config.toml");
  const config = fs.readFileSync(configPath, "utf8");

  // Match every `[functions.<name>]` block header.
  const blockNames = Array.from(config.matchAll(/^\[functions\.([a-z0-9-]+)\]/gim))
    .map((m) => m[1]);

  it("config.toml declares at least one function block", () => {
    expect(blockNames.length).toBeGreaterThan(0);
  });

  for (const name of blockNames) {
    describe(`function "${name}"`, () => {
      it("has an implementation at supabase/functions/<name>/index.ts", () => {
        const fnPath = path.resolve("supabase/functions", name, "index.ts");
        expect(
          fs.existsSync(fnPath),
          `Missing implementation: ${fnPath}`,
        ).toBe(true);
      });

      it("is referenced in EDGE_FUNCTION_REGISTRY", () => {
        const registry = fs.readFileSync(
          path.resolve("src/lib/backend-topology/edge-function-registry.ts"),
          "utf8",
        );
        // Match either the literal name in quotes or in a path: "/<name>".
        const quoted = new RegExp(`["']${name}["']`);
        const pathRef = new RegExp(`/${name}["']`);
        expect(
          quoted.test(registry) || pathRef.test(registry),
          `Function "${name}" has a config.toml block but is not in EDGE_FUNCTION_REGISTRY`,
        ).toBe(true);
      });
    });
  }
});