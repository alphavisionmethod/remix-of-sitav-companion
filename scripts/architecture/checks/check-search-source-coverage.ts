#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: search source coverage
import { readJsonSafe } from "../lib/utils";

const MIN_CONSUMERS = 2;
const data = readJsonSafe<{ consumerCount: number; classification: string; resultDomains: string[] }>("generated/deployment-gap-closure/search-wiring-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const ok = data.consumerCount >= MIN_CONSUMERS;
console.log(`${ok ? "✅" : "⚠"} Search: ${data.consumerCount} consumers, ${data.resultDomains.length} domains`);
process.exit(0);
