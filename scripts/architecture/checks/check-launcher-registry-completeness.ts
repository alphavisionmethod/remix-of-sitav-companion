#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — launcher/app-registry completeness gate (warn-level baseline).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "generated/profile-and-runtime-hardening/app-registry-map.json";
const OUT = "generated"; mkdirSync(OUT, { recursive: true });

if (!existsSync(SRC)) {
  console.warn("[launcher-registry] evidence map missing — run generate-runtime-evidence-maps first");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  apps: Array<{ appId: string; drift: string[] }>;
  manifestOrphans: string[];
};

const offenders = data.apps.filter((a) => a.drift.length > 0);
const BUDGET = Number(process.env.LAUNCHER_REGISTRY_BUDGET ?? 5);
const ok = offenders.length <= BUDGET && data.manifestOrphans.length === 0;

writeFileSync(join(OUT, "launcher-registry-completeness.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "launcher-registry-completeness",
  level: "warn",
  budget: BUDGET,
  offenderCount: offenders.length,
  manifestOrphans: data.manifestOrphans,
  offenders: offenders.slice(0, 20),
  ok,
}, null, 2));

console.log(`launcher-registry: ${offenders.length} apps with drift (budget ${BUDGET}), orphans ${data.manifestOrphans.length} — ${ok ? "OK" : "WARN"}`);
process.exit(0); // warn-level
