#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L — Warn-level guardrail: manifest truth completeness
import { readJsonSafe } from "../lib/utils";

interface M { governance: Record<string, boolean>; classification: string; generatedArtifactCount: number }
const data = readJsonSafe<M>("generated/deployment-gap-closure/manifest-truth-closure-map.json");
if (!data) { console.warn("⚠ evidence missing"); process.exit(0); }
const missing = Object.entries(data.governance).filter(([, v]) => !v).map(([k]) => k);
const ok = missing.length === 0;
console.log(`${ok ? "✅" : "⚠"} Manifest truth: ${data.classification} (${data.generatedArtifactCount} artifacts)${missing.length ? ` missing: ${missing.join(", ")}` : ""}`);
process.exit(0);
