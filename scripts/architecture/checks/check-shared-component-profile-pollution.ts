#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — shared component profile pollution gate (warn-level baseline=0).
// Files under src/components/, src/shell-runtime/, src/hooks/, src/runtimes/
// (excluding /admin/ and /mobile/ subtrees, and the allowlisted sita/admin
// presentation primitives) must NOT import from src/admin/** or @/pages/admin/**.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/profile-separation-map.json";

if (!existsSync(SRC)) {
  console.warn("[shared-component-profile-pollution] evidence map missing");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  sharedComponentLeakage: Array<{ file: string; importsAdmin: string[] }>;
};

const BUDGET = Number(process.env.SHARED_PROFILE_POLLUTION_BUDGET ?? 0);
const ok = data.sharedComponentLeakage.length <= BUDGET;

writeFileSync(join(OUT, "shared-component-profile-pollution.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "shared-component-profile-pollution",
  level: "warn",
  budget: BUDGET,
  leakageCount: data.sharedComponentLeakage.length,
  leakage: data.sharedComponentLeakage,
  ok,
}, null, 2));

console.log(`shared-component-profile-pollution: ${data.sharedComponentLeakage.length} (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0); // warn-level
