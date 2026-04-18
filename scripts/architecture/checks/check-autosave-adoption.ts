#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: draft autosave adoption
import { readJsonSafe } from "../lib/utils";

const MIN_CONSUMERS = 0; // baselined; M3 will raise this
const data = readJsonSafe<{ consumerCount: number; classification: string }>("generated/deployment-gap-closure/autosave-adoption-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const ok = data.consumerCount >= MIN_CONSUMERS;
console.log(`${ok ? "✅" : "⚠"} Autosave: ${data.consumerCount} consumers (min ${MIN_CONSUMERS}, ${data.classification})`);
process.exit(0);
