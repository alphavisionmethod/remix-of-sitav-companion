#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: mobile offline persistence (truth-classified)
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; webOfflineDbExists: boolean }>("generated/deployment-gap-closure/mobile-offline-truth-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const ok = data.classification === "honestly-archived" && data.webOfflineDbExists;
console.log(`${ok ? "✅" : "⚠"} Mobile offline: ${data.classification}, web IndexedDB=${data.webOfflineDbExists}`);
process.exit(0);
