#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: window snap integration
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; appWindowMountIntegratesOverlay: boolean }>("generated/deployment-gap-closure/window-snap-adoption-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const ok = data.appWindowMountIntegratesOverlay === true;
console.log(`${ok ? "✅" : "⚠"} Window snap: ${data.classification}`);
process.exit(0);
