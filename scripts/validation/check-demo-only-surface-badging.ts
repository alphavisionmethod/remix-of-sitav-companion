#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 4: Demo-Only Surface Badging
// Every component listed in src/lib/claim-safety/demo-only-surface-registry.ts
// MUST import DemoOnlyBanner. Fails if any registered surface drops the banner.
import * as fs from "node:fs";
import * as path from "node:path";

const REGISTRY_PATH = "src/lib/claim-safety/demo-only-surface-registry.ts";

function extractRegisteredPaths(): { id: string; componentPath: string }[] {
  const src = fs.readFileSync(REGISTRY_PATH, "utf-8");
  const out: { id: string; componentPath: string }[] = [];
  const re = /surfaceId:\s*"([^"]+)"[\s\S]*?componentPath:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({ id: m[1], componentPath: m[2] });
  }
  return out;
}

const surfaces = extractRegisteredPaths();
let violations: string[] = [];

for (const s of surfaces) {
  if (!fs.existsSync(s.componentPath)) {
    violations.push(`${s.id}: file not found at ${s.componentPath}`);
    continue;
  }
  const content = fs.readFileSync(s.componentPath, "utf-8");
  if (!content.includes("DemoOnlyBanner")) {
    violations.push(`${s.id}: ${s.componentPath} missing DemoOnlyBanner import/usage`);
  }
  if (!content.includes(`surfaceId="${s.id}"`)) {
    violations.push(`${s.id}: ${s.componentPath} missing <DemoOnlyBanner surfaceId="${s.id}" />`);
  }
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} demo-only-surface-badging: ${surfaces.length} surfaces, ${violations.length} unbadged`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
