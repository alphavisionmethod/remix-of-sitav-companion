// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Bundles Service
// Assembles ProofBundle from multiple receipts
// ═══════════════════════════════════════════════════════════════

import type { ProofPack, TypedReceipt } from "@/packages/proof-model";

function computeChainHash(receipts: TypedReceipt[]): string {
  const combined = receipts.map((r) => r.hash).join(":");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  return `chain:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export function assembleProofBundle(params: {
  intentId: string;
  tenantId: string;
  domain: string;
  receipts: TypedReceipt[];
  relatedEntities?: string[];
}): ProofPack {
  const chainHash = computeChainHash(params.receipts);

  return {
    id: crypto.randomUUID(),
    intentId: params.intentId,
    tenantId: params.tenantId,
    generatedAt: new Date().toISOString(),
    chainHash,
    receipts: params.receipts,
    summary: generateBundleSummary(params.receipts),
    domain: params.domain,
    relatedEntities: params.relatedEntities || [],
  };
}

function generateBundleSummary(receipts: TypedReceipt[]): string {
  const types = receipts.map((r) => r.type);
  const uniqueTypes = [...new Set(types)];
  return `Proof bundle with ${receipts.length} receipts (${uniqueTypes.join(", ")})`;
}

export function validateBundle(bundle: ProofPack): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (bundle.receipts.length === 0) errors.push("Bundle contains no receipts");

  // Verify chain continuity
  for (let i = 1; i < bundle.receipts.length; i++) {
    if (bundle.receipts[i].previousHash !== bundle.receipts[i - 1].hash) {
      errors.push(`Chain break at receipt ${i}: expected previousHash "${bundle.receipts[i - 1].hash}", got "${bundle.receipts[i].previousHash}"`);
    }
  }

  // Verify chain hash
  const expectedHash = computeChainHash(bundle.receipts);
  if (bundle.chainHash !== expectedHash) {
    errors.push(`Chain hash mismatch: expected "${expectedHash}", got "${bundle.chainHash}"`);
  }

  return { valid: errors.length === 0, errors };
}

export function mergeBundles(bundles: ProofPack[], intentId: string, tenantId: string): ProofPack {
  const allReceipts = bundles.flatMap((b) => b.receipts);
  const allEntities = [...new Set(bundles.flatMap((b) => b.relatedEntities))];
  const domains = [...new Set(bundles.map((b) => b.domain))];

  return assembleProofBundle({
    intentId,
    tenantId,
    domain: domains.length === 1 ? domains[0] : "cross-domain",
    receipts: allReceipts,
    relatedEntities: allEntities,
  });
}
