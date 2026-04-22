import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Platform Layer — Directory & Coverage Verification
// ═══════════════════════════════════════════════════════════════

const PLATFORM_DIR = "src/platform";

describe("Platform Layer Coverage", () => {
  const dirs = fs.readdirSync(PLATFORM_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  it("has 15+ platform domains", () => {
    expect(dirs.length).toBeGreaterThanOrEqual(15);
  });

  it("critical platform domains exist", () => {
    const required = ["auth", "ai", "core", "deploy", "governance", "notifications", "execution"];
    const missing = required.filter(d => !dirs.includes(d));
    expect(missing, `Missing platform domains: ${missing.join(", ")}`).toEqual([]);
  });

  it("each platform domain has at least one .ts file", () => {
    const empty: string[] = [];
    for (const d of dirs) {
      const full = `${PLATFORM_DIR}/${d}`;
      const files = fs.readdirSync(full, { recursive: true })
        .filter((f: any) => typeof f === "string" && (f.endsWith(".ts") || f.endsWith(".tsx")));
      if (files.length === 0) empty.push(d);
    }
    expect(empty, `Empty platform domains: ${empty.join(", ")}`).toEqual([]);
  });
});

describe("Hooks Coverage", () => {
  const hooks = fs.readdirSync("src/hooks").filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));

  it("has 100+ hooks", () => {
    expect(hooks.length).toBeGreaterThanOrEqual(100);
  });

  it("critical hooks exist", () => {
    const required = ["use-advisor", "use-app-platform", "use-domain-data"];
    for (const prefix of required) {
      expect(hooks.some(h => h.startsWith(prefix)), `No hook with prefix: ${prefix}`).toBe(true);
    }
  });

  it("no hook uses localStorage for auth tokens", () => {
    const violations: string[] = [];
    for (const h of hooks) {
      const content = fs.readFileSync(`src/hooks/${h}`, "utf8");
      if (content.match(/localStorage\.(get|set)Item\(["'](token|auth|jwt)/)) {
        violations.push(h);
      }
    }
    expect(violations).toEqual([]);
  });
});