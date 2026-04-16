#!/usr/bin/env node
// SITA OS — Master Dossier Conformance Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const dossier = readJsonSafe<any>("generated/master-dossier-conformance.json");
if (!dossier) { console.log("⚠️ master-dossier-conformance.json not found — skipping"); process.exit(0); }
const sections = dossier.sections || dossier.entries || [];
let complete = 0;
for (const section of sections) {
  if (section.status === "complete" || section.complete) { complete++; }
  else { vc.add("master-dossier-conformance.json", "incomplete-section", `Section "${section.name || section.id}" is incomplete`, "warning"); }
}
console.log(`  📋 ${complete}/${sections.length} dossier sections complete`);
vc.report("check-master-dossier-conformance");
vc.exitIfErrors();
