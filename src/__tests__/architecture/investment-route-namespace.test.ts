// ═══════════════════════════════════════════════════════════════
// Architecture Test — Investment Route Namespace
//
// Locks in Phase 5: `/investment` (singular) is the SINGLE
// canonical Investment Office namespace. Plural `/investments/*`
// must NOT appear in route families, App.tsx, or the family
// registry — only in the redirect map.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const FAMILIES_DIR = "src/routes/families";
const PLURAL_RX = /path\s*=\s*["'`]\/investments(?:\/|["'`])/;
const SCRIPT = "scripts/architecture/audits/check-investment-route-namespace.ts";

describe("Investment route namespace", () => {
  it("families directory exists", () => {
    expect(fs.existsSync(FAMILIES_DIR)).toBe(true);
  });

  it("no plural `/investments/*` paths in src/routes/families/", () => {
    const offenders: Array<{ file: string; line: number; text: string }> = [];
    for (const entry of fs.readdirSync(FAMILIES_DIR)) {
      if (!/\.tsx?$/.test(entry)) continue;
      const full = path.join(FAMILIES_DIR, entry);
      const lines = fs.readFileSync(full, "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (PLURAL_RX.test(lines[i])) {
          offenders.push({ file: entry, line: i + 1, text: lines[i].trim() });
        }
      }
    }
    expect(
      offenders,
      `Plural namespace leaks:\n${offenders.map((o) => `  ${o.file}:${o.line} ${o.text}`).join("\n")}`,
    ).toEqual([]);
  });

  it("no plural `/investments/*` paths in src/App.tsx", () => {
    const src = fs.readFileSync("src/App.tsx", "utf8");
    const matches: string[] = [];
    for (const line of src.split("\n")) {
      if (PLURAL_RX.test(line)) matches.push(line.trim());
    }
    expect(matches, `App.tsx plural leaks:\n${matches.join("\n")}`).toEqual([]);
  });

  it("guard script exits 0", () => {
    let exitCode = 0;
    let output = "";
    try {
      output = execSync(`npx tsx ${SCRIPT}`, { stdio: "pipe", timeout: 60_000 }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    expect(exitCode, output.slice(0, 800)).toBe(0);
  }, 90_000);
});
