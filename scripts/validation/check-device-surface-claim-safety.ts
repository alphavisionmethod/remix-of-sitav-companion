#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 5 Gate 6: Device Surface Claim Safety
// Every DWE*/UAO0[38]*Ambient* page in src/pages/ MUST be in the demo-only-surface-registry,
// OR carry an explicit "// claim-safety:exempt" sentinel comment.
import * as fs from "node:fs";
import * as cp from "node:child_process";

const REGISTRY_PATH = "src/lib/claim-safety/demo-only-surface-registry.ts";

function registeredIds(): Set<string> {
  const src = fs.readFileSync(REGISTRY_PATH, "utf-8");
  const ids = new Set<string>();
  const re = /surfaceId:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) ids.add(m[1]);
  return ids;
}

const registered = registeredIds();
let violations: string[] = [];

const out = cp.execSync(
  `find src/pages -type f \\( -name "DWE0*.tsx" -o -name "UAO03*Ambient*.tsx" -o -name "UAO08*Ambient*.tsx" \\) 2>/dev/null || true`,
  { encoding: "utf-8" },
);
const files = out.split("\n").filter(Boolean);

for (const f of files) {
  const base = f.split("/").pop()!.replace(/\.tsx$/, "");
  // Extract leading uppercase prefix like DWE01 / UAO03 / UAO08.
  const idMatch = base.match(/^([A-Z]+\d+)/);
  if (!idMatch) continue;
  const id = idMatch[1];
  if (registered.has(id)) continue;

  const content = fs.readFileSync(f, "utf-8");
  if (content.includes("// claim-safety:exempt")) continue;
  violations.push(`unregistered demo-class page: ${id} (${f})`);
}

const ok = violations.length === 0;
console.log(`${ok ? "✅" : "❌"} device-surface-claim-safety: ${files.length} scanned, ${violations.length} unregistered`);
violations.slice(0, 15).forEach((v) => console.error(`   ${v}`));
process.exit(ok ? 0 : 1);
