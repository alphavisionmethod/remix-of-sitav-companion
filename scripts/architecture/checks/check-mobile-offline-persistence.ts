#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase Q) — Mobile offline truth
// Asserts mobile is honestly archived AND web IndexedDB persistence exists.
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; webOfflineDbExists: boolean }>(
  "generated/deployment-gap-closure/mobile-offline-truth-map.json"
);
if (!data) {
  console.error("❌ mobile-offline-truth-map.json missing");
  process.exit(1);
}
const ok = data.classification === "honestly-archived" && data.webOfflineDbExists;
console.log(
  `${ok ? "✅" : "❌"} Mobile offline: ${data.classification}, web IndexedDB=${data.webOfflineDbExists}`
);
process.exit(ok ? 0 : 1);
