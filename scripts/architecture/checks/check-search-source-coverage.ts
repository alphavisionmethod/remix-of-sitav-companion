#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase S) — search source coverage
// Asserts that ≥4 canonical consumers wire useGlobalSearch / Universal
// Command Surface, so federated cross-domain search never regresses.
import { readJsonSafe } from "../lib/utils";

const MIN_CONSUMERS = 4; // Phase S baseline: UniversalCommandSurface, SearchPage, LeadsInbox, FilesSearch
const data = readJsonSafe<{ consumerCount: number; classification: string; resultDomains: string[] }>(
  "generated/deployment-gap-closure/search-wiring-map.json"
);
if (!data) {
  console.error("❌ search-wiring-map.json missing — run gap-closure:evidence");
  process.exit(1);
}
const ok = data.consumerCount >= MIN_CONSUMERS;
console.log(
  `${ok ? "✅" : "❌"} Search: ${data.consumerCount} consumers (min ${MIN_CONSUMERS}), ${data.resultDomains.length} domains`
);
process.exit(ok ? 0 : 1);
