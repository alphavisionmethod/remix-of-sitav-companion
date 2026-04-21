#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Provider Webhook Replay Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { PROVIDER_WEBHOOK_REPLAY_POLICIES } from "../../src/lib/integrations/provider-webhook-replay-policy";
import { PROVIDER_IDS } from "../../src/lib/integrations/provider-contract-registry";

const issues: GateIssue[] = [];

const webhookProviders = PROVIDER_IDS.filter((id: string) => PROVIDER_WEBHOOK_REPLAY_POLICIES[id]?.webhookSupported);
const replayCapable = webhookProviders.filter((id: string) => PROVIDER_WEBHOOK_REPLAY_POLICIES[id]?.replaySupported);
console.log(`  📨 ${replayCapable.length}/${webhookProviders.length} webhook providers with replay support`);

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "provider-webhook-replay", ok, issues });
console.log(`Provider webhook replay: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);