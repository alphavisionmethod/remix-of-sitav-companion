#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: DB truth completeness
import { readJsonSafe } from "../lib/utils";

interface DB { components: Record<string, boolean>; classification: string }
const data = readJsonSafe<DB>("generated/deployment-gap-closure/db-truth-closure-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const missing = Object.entries(data.components).filter(([, v]) => !v).map(([k]) => k);
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "⚠"} DB truth: ${data.classification}${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`);
process.exit(0);
