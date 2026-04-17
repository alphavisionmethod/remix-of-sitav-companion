#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Schema Integrity Check
// Asserts every MANIFEST_REGISTRY entry has all required fields.
// Bound by registry entries that declare this script as validator.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import { MANIFEST_REGISTRY } from "../../../src/lib/truth-manifests/manifest-registry";

const vc = new ViolationCollector();

const REQUIRED_FIELDS = [
  "id",
  "path",
  "class",
  "authority",
  "owner",
  "description",
  "sourceInputs",
  "ciGate",
  "runtimeConsequence",
  "releaseConsequence",
] as const;

const VALID_CLASSES = new Set(["structural", "contract", "runtime", "compliance", "informational"]);
const VALID_AUTHORITIES = new Set(["authoritative", "derived", "informational"]);

let checked = 0;
for (const entry of MANIFEST_REGISTRY) {
  const id = (entry as any).id ?? "<unknown>";
  checked++;

  for (const field of REQUIRED_FIELDS) {
    const value = (entry as any)[field];
    if (value === undefined || value === null || value === "") {
      vc.add(id, "missing-required-field", `Manifest entry "${id}" is missing required field "${field}"`);
    }
  }

  if (Array.isArray((entry as any).sourceInputs) && (entry as any).sourceInputs.length === 0) {
    vc.add(id, "empty-source-inputs", `Manifest entry "${id}" has empty sourceInputs[]`);
  }

  if (!VALID_CLASSES.has((entry as any).class)) {
    vc.add(id, "invalid-class", `Manifest entry "${id}" has invalid class "${(entry as any).class}"`);
  }

  if (!VALID_AUTHORITIES.has((entry as any).authority)) {
    vc.add(id, "invalid-authority", `Manifest entry "${id}" has invalid authority "${(entry as any).authority}"`);
  }

  // Authoritative entries must declare a validator
  if ((entry as any).authority === "authoritative" && !(entry as any).validator) {
    vc.add(id, "authoritative-without-validator", `Authoritative entry "${id}" must declare a validator script`);
  }
}

console.log(`📐 Manifest Schema Integrity`);
console.log(`   entries checked: ${checked}`);
console.log(`   required fields: ${REQUIRED_FIELDS.length}`);

vc.report("check-manifest-schema-integrity");
vc.exitIfErrors();
