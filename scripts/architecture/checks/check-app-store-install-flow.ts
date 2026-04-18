#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: App Store install flow truth
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; consumerCount: number }>("generated/deployment-gap-closure/app-install-truth-map.json");
if (!data) {
  console.warn("⚠ app-install-truth-map.json missing — run gap-closure:evidence first");
  process.exit(0);
}
const ok = data.classification === "real-production-grade";
console.log(`${ok ? "✅" : "⚠"} App Store install: ${data.classification} (${data.consumerCount} consumers)`);
process.exit(0); // warn-level
