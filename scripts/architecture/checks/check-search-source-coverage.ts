#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L → Phase T (BLOCK): federated search adoption.
// Asserts at least MIN_CONSUMERS pages wire useGlobalSearch.
import { readJsonSafe } from "../lib/utils";

const MIN_CONSUMERS = 6; // Phase T: UniversalCommandSurface, SearchPage, LeadsInbox, FilesSearch, ApprovalsCenter, InboxCapture
const data = readJsonSafe<{ consumerCount: number; classification: string; resultDomains: string[] }>("generated/deployment-gap-closure/search-wiring-map.json");
if (!data) { console.error("❌ search-wiring-map.json missing — run gap-closure:evidence"); process.exit(1); }
const ok = data.consumerCount >= MIN_CONSUMERS;
console.log(`${ok ? "✅" : "❌"} Search: ${data.consumerCount} consumers (min ${MIN_CONSUMERS}), ${data.resultDomains.length} domains`);
process.exit(ok ? 0 : 1);
