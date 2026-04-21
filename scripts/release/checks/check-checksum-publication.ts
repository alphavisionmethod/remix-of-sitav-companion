#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
if (!existsSync("src/lib/release/checksum-publication.ts")) issues.push({ severity: "error", area: "checksums", message: "Missing checksum source" });
if (!existsSync("generated/release-checksums.json")) issues.push({ severity: "error", area: "checksums", message: "Missing checksums report" });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "checksum-publication", ok, issues });
console.log(`Checksum publication: ${ok ? "✅" : "❌"}`);
if (!ok) process.exit(1);