#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Registry Generator (Phase 21)
// Parses src/packages/advisor-config/index.ts to extract real advisors
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface AdvisorEntry {
  id: string;
  name: string;
  domain: string;
  council: string;
  capabilities: string[];
  defaultModel: string;
  promptFamilyId: string;
  autonomyLevel: string;
  riskTier: string;
  maturity: string;
  confidenceThreshold: number;
  blockedActions: string[];
  requiredInputs: string[];
}

const PROMPT_FAMILY_BY_ID: Record<string, string> = {
  "business-advisor": "business-advisor-system",
  "money-advisor": "money-advisor-system",
  "concierge-advisor": "concierge-advisor-system",
  "strategy-advisor": "strategy-advisor-system",
  "business-scout": "business-advisor-system",
  "money-guardian": "money-advisor-system",
};

const DEFAULT_MODEL_BY_AUTONOMY: Record<string, string> = {
  "L0-observe": "google/gemini-2.5-flash-lite",
  "L1-diagnose": "google/gemini-2.5-flash-lite",
  "L2-recommend": "google/gemini-2.5-flash",
  "L3-draft": "google/gemini-2.5-pro",
  "L4-simulate": "google/gemini-2.5-flash",
  "L5-approval-ready": "google/gemini-2.5-pro",
  "L6-constrained-action": "google/gemini-2.5-pro",
};

const RISK_TIER_BY_AUTONOMY: Record<string, string> = {
  "L0-observe": "R0",
  "L1-diagnose": "R1",
  "L2-recommend": "R1",
  "L3-draft": "R2",
  "L4-simulate": "R2",
  "L5-approval-ready": "R3",
  "L6-constrained-action": "R4",
};

const configFile = "src/packages/advisor-config/index.ts";
const advisors: AdvisorEntry[] = [];

if (fs.existsSync(configFile)) {
  const content = fs.readFileSync(configFile, "utf-8");

  // Extract each advisor object literal from ADVISOR_CONFIGS array
  const arrayMatch = content.match(/ADVISOR_CONFIGS:\s*AdvisorConfig\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (arrayMatch) {
    const arrayBody = arrayMatch[1];
    // Split on top-level `},` then `{` boundaries — find each {...} block
    const objectRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*domain:\s*"([^"]+)",\s*council:\s*"([^"]+)",[\s\S]*?maxAutonomy:\s*"([^"]+)",[\s\S]*?capabilities:\s*\[([^\]]*)\][\s\S]*?confidenceThreshold:\s*([\d.]+),[\s\S]*?blockedActions:\s*\[([^\]]*)\][\s\S]*?requiredInputs:\s*\[([^\]]*)\][\s\S]*?maturity:\s*"([^"]+)"/g;

    let m: RegExpExecArray | null;
    while ((m = objectRegex.exec(arrayBody)) !== null) {
      const id = m[1];
      const autonomy = m[5];
      advisors.push({
        id,
        name: m[2],
        domain: m[3],
        council: m[4],
        capabilities: m[6].split(",").map(s => s.trim().replace(/['"]/g, "")).filter(Boolean),
        defaultModel: DEFAULT_MODEL_BY_AUTONOMY[autonomy] ?? "google/gemini-2.5-flash",
        promptFamilyId: PROMPT_FAMILY_BY_ID[id] ?? `${id}-system`,
        autonomyLevel: autonomy,
        riskTier: RISK_TIER_BY_AUTONOMY[autonomy] ?? "R2",
        maturity: m[10],
        confidenceThreshold: parseFloat(m[7]),
        blockedActions: m[8].split(",").map(s => s.trim().replace(/['"]/g, "")).filter(Boolean),
        requiredInputs: m[9].split(",").map(s => s.trim().replace(/['"]/g, "")).filter(Boolean),
      });
    }
  }

  // Add the two autonomous agent advisors not in ADVISOR_CONFIGS but in the runtime
  if (advisors.length >= 4) {
    advisors.push({
      id: "business-scout",
      name: "Business Scout",
      domain: "business-os",
      council: "customer-facing",
      capabilities: ["opportunity-scouting", "follow-up-detection"],
      defaultModel: "google/gemini-2.5-flash-lite",
      promptFamilyId: "business-advisor-system",
      autonomyLevel: "L2-recommend",
      riskTier: "R1",
      maturity: "beta",
      confidenceThreshold: 0.6,
      blockedActions: ["send-communications"],
      requiredInputs: ["customer-data"],
    });
    advisors.push({
      id: "money-guardian",
      name: "Money Guardian",
      domain: "finance-os",
      council: "customer-facing",
      capabilities: ["anomaly-detection", "subscription-waste", "invoice-aging"],
      defaultModel: "google/gemini-2.5-flash",
      promptFamilyId: "money-advisor-system",
      autonomyLevel: "L2-recommend",
      riskTier: "R2",
      maturity: "beta",
      confidenceThreshold: 0.75,
      blockedActions: ["execute-payment", "modify-account"],
      requiredInputs: ["transaction-data"],
    });
  }
}

const out = {
  version: "2.0.0",
  generatedAt: new Date().toISOString(),
  total: advisors.length,
  advisors,
};

if (!fs.existsSync("generated")) fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/advisor-registry.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated advisor registry: ${advisors.length} advisors with full metadata`);
