#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — command-palette profile leakage gate (warn-level).
// Operator-only apps must never appear in the user-profile palette filter.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/app-registry-map.json";

if (!existsSync(SRC)) {
  console.warn("[command-palette-profile-leakage] evidence map missing");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  apps: Array<{ appId: string; profiles: string[]; commandVisible: boolean; plane: string }>;
};

// Leakage = an admin-plane app that says it's command-visible *and* declares user profile.
const leaks = data.apps.filter(
  (a) => a.plane === "admin" && a.commandVisible && a.profiles.includes("user"),
);

const BUDGET = Number(process.env.COMMAND_PALETTE_LEAK_BUDGET ?? 0);
const ok = leaks.length <= BUDGET;

writeFileSync(join(OUT, "command-palette-profile-leakage.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "command-palette-profile-leakage",
  level: "block",
  budget: BUDGET,
  leakCount: leaks.length,
  leaks,
  ok,
}, null, 2));

console.log(`command-palette-profile-leakage: ${leaks.length} (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(ok ? 0 : 1); // block-level — graduated
