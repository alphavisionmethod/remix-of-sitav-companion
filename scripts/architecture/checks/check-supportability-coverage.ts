#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: supportability coverage
import { readJsonSafe } from "../lib/utils";

interface S { components: Record<string, boolean>; classification: string; runbookFileCount: number }
const data = readJsonSafe<S>("generated/deployment-gap-closure/supportability-coverage-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const missing = Object.entries(data.components).filter(([, v]) => !v).map(([k]) => k);
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "⚠"} Supportability: ${data.classification} (${data.runbookFileCount} runbook files)${missing.length ? ` missing: ${missing.join(", ")}` : ""}`);
process.exit(0);
