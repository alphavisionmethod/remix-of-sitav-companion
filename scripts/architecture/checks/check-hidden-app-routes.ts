#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — top-level user-plane routes that are not backed by an app registry entry (warn-level).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/app-route-profile-map.json";

if (!existsSync(SRC)) {
  console.warn("[hidden-app-routes] evidence map missing — run generate-runtime-evidence-maps first");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  routes: Array<{ path: string; file: string; hiddenAppLike: boolean }>;
};

const hidden = data.routes.filter((r) => r.hiddenAppLike);
const BUDGET = Number(process.env.HIDDEN_APP_ROUTES_BUDGET ?? 0);
const ok = hidden.length <= BUDGET;

writeFileSync(join(OUT, "hidden-app-routes.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "hidden-app-routes",
  level: "block",
  budget: BUDGET,
  hiddenCount: hidden.length,
  sample: hidden.slice(0, 30),
  ok,
}, null, 2));

console.log(`hidden-app-routes: ${hidden.length} (budget ${BUDGET}) — ${ok ? "OK" : "FAIL"}`);
process.exit(ok ? 0 : 1); // block-level — graduated
