#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 5: Future-Vision Route Containment
// Every route registered with containment="future_vision" must NOT appear in user-profile navigation.
// Operator-only routes are acceptable.
import * as fs from "node:fs";

const REGISTRY_PATH = "src/lib/claim-safety/demo-only-surface-registry.ts";

function extractFutureVisionRoutes(): string[] {
  const src = fs.readFileSync(REGISTRY_PATH, "utf-8");
  const out: string[] = [];
  const re = /surfaceId:\s*"([^"]+)"[\s\S]*?containment:\s*"future_vision"[\s\S]*?route:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push(m[2]);
  return out;
}

const futureRoutes = extractFutureVisionRoutes();
let violations: string[] = [];

// Scan user-facing nav configs for any future-vision route.
const USER_NAV_GLOBS = [
  "src/components/launcher/",
  "src/components/user/",
  "src/pages/home/",
  "src/lib/navigation/user-",
];

for (const route of futureRoutes) {
  for (const dir of USER_NAV_GLOBS) {
    if (!fs.existsSync(dir)) continue;
    try {
      const { execSync } = require("node:child_process");
      const out = execSync(
        `grep -rln "${route}" ${dir} --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
        { encoding: "utf-8" },
      );
      out
        .split("\n")
        .filter(Boolean)
        .forEach((f: string) => violations.push(`future-vision route ${route} appears in user nav: ${f}`));
    } catch {}
  }
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} future-vision-route-containment: ${futureRoutes.length} routes, ${violations.length} leaks`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
