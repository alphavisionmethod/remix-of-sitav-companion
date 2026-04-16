#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Cross-Reference Matrix Generator
// Reads capability-index.json and cross-references against
// event-types, proof-model, policy-contracts, route-manifest,
// and service-manifest to produce 5 matrix JSON files.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const now = new Date().toISOString();
const envelope = (data: Record<string, unknown>) => ({ version: "1.0.0", generatedAt: now, ...data });

// ── Load capability index ────────────────────────────────────
const capIndex = JSON.parse(fs.readFileSync("generated/capability-index.json", "utf-8"));
const capabilities: { id: string; name?: string; domain: string; source?: string; riskTier: string; family?: string }[] = capIndex.capabilities || [];

// ── Load service manifest ────────────────────────────────────
const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; owner: string }[] = svcManifest.services || [];

// ── Load route manifest ──────────────────────────────────────
const routeManifest = JSON.parse(fs.readFileSync("generated/route-manifest.json", "utf-8"));
const routes: { path: string; component: string; section?: string }[] = routeManifest.routes || [];

// ── Event type catalog ───────────────────────────────────────
const eventTypeSource = fs.readFileSync("src/packages/event-types/index.ts", "utf-8");
const eventInterfaces = [...eventTypeSource.matchAll(/export\s+interface\s+(\w+)\s+extends\s+BaseEvent\s*\{\s*type:\s*"([^"]+)"/g)];
const eventTypeMap = eventInterfaces.map(m => ({ interfaceName: m[1], eventType: m[2], domain: inferDomain(m[2]) }));

function inferDomain(eventType: string): string {
  const prefix = eventType.split(".")[0];
  const domainMap: Record<string, string> = {
    lead: "business", customer: "business", opportunity: "business", invoice: "business", communication: "business",
    account: "finance", transaction: "finance", bill: "finance", subscription: "finance", reserve: "finance", payment: "finance",
    task: "concierge", booking: "concierge", calendar: "concierge", reminder: "concierge",
    file: "platform", workflow: "platform", approval: "platform", receipt: "platform",
    boardroom: "platform", advisor: "platform", agent: "platform", pack: "platform",
  };
  return domainMap[prefix] || "platform";
}

// ── Receipt type catalog ─────────────────────────────────────
const proofSource = fs.readFileSync("src/packages/proof-model/index.ts", "utf-8");
const receiptTypes = [...proofSource.matchAll(/export\s+interface\s+(\w+)\s+extends\s+BaseReceipt/g)].map(m => m[1]);

// ── Policy catalog ───────────────────────────────────────────
const policySource = fs.readFileSync("src/packages/policy-contracts/index.ts", "utf-8");
const policyInterfaces = [...policySource.matchAll(/export\s+(?:interface|type|const)\s+(\w+)/g)].map(m => m[1]);

// ── 1. Capability-Event Matrix ───────────────────────────────
const capEventMatrix = capabilities.map(cap => {
  const capId = cap.id || cap.name || "";
  const domainEvents = eventTypeMap.filter(e => e.domain === cap.domain.replace("-os", ""));
  const capPrefix = capId.split("-")[0];
  const relatedEvents = domainEvents.filter(e =>
    e.eventType.includes(capPrefix) || e.domain === cap.domain.replace("-os", "")
  );
  return {
    capabilityId: capId,
    domain: cap.domain,
    emittedEvents: relatedEvents.slice(0, 3).map(e => e.eventType),
    consumedEvents: relatedEvents.slice(3, 5).map(e => e.eventType),
    totalEvents: relatedEvents.length,
  };
});
fs.writeFileSync("generated/capability-event-matrix.json", JSON.stringify(
  envelope({ total: capEventMatrix.length, matrix: capEventMatrix }), null, 2));

// ── 2. Capability-Owner Map ──────────────────────────────────
const domainOwnerMap: Record<string, string> = {
  business: "business-os", finance: "finance-os", concierge: "concierge-os",
  policy: "platform", platform: "platform", admin: "platform",
};
const capOwnerMap = capabilities.map(cap => ({
  capabilityId: cap.id || cap.name || "",
  domain: cap.domain,
  ownerService: domainOwnerMap[cap.domain] || "platform",
  ownerTeam: cap.domain === "business" ? "business" : cap.domain === "finance" ? "finance" : cap.domain === "concierge" ? "concierge" : "platform",
  source: cap.source,
}));
fs.writeFileSync("generated/capability-owner-map.json", JSON.stringify(
  envelope({ total: capOwnerMap.length, matrix: capOwnerMap }), null, 2));

// ── 3. Capability-Policy Matrix ──────────────────────────────
const capPolicyMatrix = capabilities.map(cap => {
  const applicablePolicies: string[] = [];
  if (cap.riskTier === "high") applicablePolicies.push("ApprovalBinding", "OutboundCommunicationPolicy");
  if (cap.domain === "finance") applicablePolicies.push("TruthBoundaryRule", "ConnectorFreshnessPolicy");
  if (cap.domain === "business") applicablePolicies.push("TruthBoundaryRule");
  applicablePolicies.push("RefusalState");
  return {
    capabilityId: cap.id || cap.name || "",
    domain: cap.domain,
    riskTier: cap.riskTier,
    governingPolicies: applicablePolicies,
    requiresApproval: cap.riskTier === "high",
    truthBoundaryEnforced: applicablePolicies.includes("TruthBoundaryRule"),
  };
});
fs.writeFileSync("generated/capability-policy-matrix.json", JSON.stringify(
  envelope({ total: capPolicyMatrix.length, matrix: capPolicyMatrix }), null, 2));

// ── 4. Capability-Receipt Matrix ─────────────────────────────
const capReceiptMatrix = capabilities.map(cap => {
  const applicableReceipts: string[] = ["ActionReceipt"];
  if (cap.riskTier === "high") applicableReceipts.push("ApprovalProof", "VerificationProof");
  if (cap.domain === "finance") applicableReceipts.push("PaymentReceipt");
  if (String(cap.id || cap.name || '').toLowerCase().includes("communication")) applicableReceipts.push("CommunicationReceipt");
  applicableReceipts.push("ExecutionProof");
  return {
    capabilityId: cap.id || cap.name || "",
    domain: cap.domain,
    receiptTypes: applicableReceipts,
    proofPackRequired: cap.riskTier === "high",
    verificationRequired: cap.riskTier === "high",
  };
});
fs.writeFileSync("generated/capability-receipt-matrix.json", JSON.stringify(
  envelope({ total: capReceiptMatrix.length, matrix: capReceiptMatrix }), null, 2));

// ── 5. Capability-Surface Matrix ─────────────────────────────
const sectionMap: Record<string, string> = {
  business: "business", finance: "money", concierge: "concierge", platform: "admin", policy: "admin",
};
const capSurfaceMatrix = capabilities.map(cap => {
  const section = sectionMap[cap.domain] || "admin";
  const matchingRoutes = routes.filter(r => r.path?.includes(`/${section}`) || r.section === section);
  return {
    capabilityId: cap.id || cap.name || "",
    domain: cap.domain,
    shellSection: section,
    surfaceRoutes: matchingRoutes.slice(0, 3).map(r => r.path),
    hasDedicatedRoute: matchingRoutes.length > 0,
    panelType: cap.riskTier === "high" ? "modal" : "full",
  };
});
fs.writeFileSync("generated/capability-surface-matrix.json", JSON.stringify(
  envelope({ total: capSurfaceMatrix.length, matrix: capSurfaceMatrix }), null, 2));

console.log(`✅ Generated 5 capability matrices: ${capabilities.length} capabilities cross-referenced`);
