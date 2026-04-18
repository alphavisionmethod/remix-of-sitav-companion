#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase Q) — draft autosave adoption
// Asserts adoption never regresses below baseline.
import { readJsonSafe } from "../lib/utils";

const MIN_CONSUMERS = 8; // Phase T: CRMNotes, CommunicationsCenter, CRMTasks, CRMCompanies, PolicyEditor, QuotesWorkspace, InvoicesCollections, BusinessSettingsPage
const data = readJsonSafe<{ consumerCount: number; classification: string }>(
  "generated/deployment-gap-closure/autosave-adoption-map.json"
);
if (!data) {
  console.error("❌ autosave-adoption-map.json missing — run gap-closure:evidence");
  process.exit(1);
}
const ok = data.consumerCount >= MIN_CONSUMERS;
console.log(
  `${ok ? "✅" : "❌"} Autosave: ${data.consumerCount} consumers (min ${MIN_CONSUMERS}, ${data.classification})`
);
process.exit(ok ? 0 : 1);
