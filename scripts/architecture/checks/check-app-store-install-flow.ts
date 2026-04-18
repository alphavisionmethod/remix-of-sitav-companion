#!/usr/bin/env node
/* eslint-disable no-console */
// Phase V — BLOCK: App Store install flow truth (graduated from warn).
// Asserts canonical real-production-grade classification AND minimum
// consumer adoption + edge function backing.
import { readJsonSafe } from "../lib/utils";

interface InstallTruth {
  status: string;
  classification: string;
  consumerCount: number;
  edgeFunctions: string[];
  installServiceExists: boolean;
}

const MIN_CONSUMERS = 8;       // Phase V baseline: 8 consumers (current)
const MIN_EDGE_FUNCTIONS = 5;  // app-install, -uninstall, -update-check, -manifest-sync, -launch-resolve

const data = readJsonSafe<InstallTruth>("generated/deployment-gap-closure/app-install-truth-map.json");
if (!data) {
  console.error("❌ app-install-truth-map.json missing — run gap-closure:evidence first");
  process.exit(1);
}

const statusOk = data.status === "real-production-grade";
const consumerOk = data.consumerCount >= MIN_CONSUMERS;
const edgeOk = (data.edgeFunctions?.length ?? 0) >= MIN_EDGE_FUNCTIONS;
const svcOk = data.installServiceExists === true;
const ok = statusOk && consumerOk && edgeOk && svcOk;

console.log(
  `${ok ? "✅" : "❌"} App Store install: ${data.status} ` +
  `(${data.consumerCount} consumers ≥ ${MIN_CONSUMERS}, ` +
  `${data.edgeFunctions?.length ?? 0} edge fns ≥ ${MIN_EDGE_FUNCTIONS}, ` +
  `installService=${svcOk})`
);
process.exit(ok ? 0 : 1);
