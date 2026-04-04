#!/usr/bin/env node
// SITA OS — Prompt 9 Conformance Check
import * as fs from "fs";
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const promptIndex = readJsonSafe<any>("generated/prompt-index.json");
if (!promptIndex) { console.error("❌ prompt-index.json not found"); process.exit(1); }
const prompts = promptIndex.prompts || promptIndex.entries || [];
for (const prompt of prompts) {
  const id = prompt.id || prompt.promptId;
  if (!prompt.template && !prompt.content) {
    vc.add("prompt-index.json", "no-template", `Prompt "${id}" has no template/content`, "warning");
  }
  if (!prompt.category && !prompt.domain) {
    vc.add("prompt-index.json", "no-category", `Prompt "${id}" has no category`, "warning");
  }
}
console.log(`  💬 ${prompts.length} prompts in index`);
vc.report("check-prompt9-readiness");
vc.exitIfErrors();
