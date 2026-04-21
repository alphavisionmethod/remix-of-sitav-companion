#!/usr/bin/env node
import { existsSync } from "node:fs";
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
const issues: GateIssue[] = [];
const src = "src/lib/mobile/mobile-signing_proof.ts".replace("readiness_honesty", "readiness-contract").replace("signing_proof", "signing-provisioning-policy").replace("push_cert_lifecycle", "push-cert-lifecycle").replace("offline_policy", "offline-policy").replace("supportability", "support-pack-builder").replace("platform_compliance", "platform-compliance-map").replace("runtime_proof", "runtime-proof-map").replace("store_review_readiness", "store-review-policy").replace("release_channel_status", "release-channel-map");
if (!existsSync(src)) issues.push({ severity: "error", area: "mobile-signing-proof", message: "Missing source: " + src });
const gen = "generated/mobile-signing-proof.json".replace("readiness-honesty", "readiness-pack").replace("signing-proof", "signing-proof").replace("push-cert-lifecycle", "push-cert-status");
if (!existsSync(gen)) issues.push({ severity: "error", area: "mobile-signing-proof", message: "Missing: " + gen });
const ok = issues.filter(i => i.severity === "error").length === 0;
emitGateReport({ gate: "mobile-signing-proof", ok, issues });
console.log("Mobile signing-proof: " + (ok ? "✅" : "❌"));
if (!ok) process.exit(1);
