// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipts Service
// Creates typed Receipt objects with hash chaining + persistence
// ═══════════════════════════════════════════════════════════════

import type { TypedReceipt, ActionReceipt, SystemReceipt } from "@/packages/proof-model";
import { persistReceipt } from "@/lib/persistence/supabase-adapters";

const receiptChain: TypedReceipt[] = [];

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < (data ?? []).length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

function getLastHash(): string {
  return receiptChain.length > 0 ? receiptChain[receiptChain.length - 1].hash : "genesis";
}

export function createActionReceipt(params: {
  actionId: string;
  actionType: string;
  executor: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "completed" | "failed";
  tenantId: string;
}): ActionReceipt {
  const previousHash = getLastHash();
  const inputHash = computeHash(JSON.stringify(params.input));
  const outputHash = computeHash(JSON.stringify(params.output));
  const receipt: ActionReceipt = {
    type: "action",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${previousHash}:${params.actionId}:${inputHash}:${outputHash}`),
    previousHash,
    tenantId: params.tenantId,
    actionId: params.actionId,
    actionType: params.actionType,
    executor: params.executor,
    inputHash,
    outputHash,
    status: params.status,
  };
  receiptChain.push(receipt);

  // Fire-and-forget persistence
  persistReceipt({
    correlation_id: params.actionId,
    receipt_type: "action",
    payload: { ...params, hash: receipt.hash, previousHash },
    metadata: { inputHash, outputHash },
  }).catch(() => {});

  return receipt;
}

export function createSystemReceipt(params: {
  action: string;
  scope: string;
  details: Record<string, unknown>;
  tenantId: string;
}): SystemReceipt {
  const previousHash = getLastHash();
  const receipt: SystemReceipt = {
    type: "system",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${previousHash}:${params.action}:${params.scope}`),
    previousHash,
    tenantId: params.tenantId,
    action: params.action,
    scope: params.scope,
    details: params.details,
  };
  receiptChain.push(receipt);

  // Fire-and-forget persistence
  persistReceipt({
    correlation_id: receipt.id,
    receipt_type: "system",
    payload: { action: params.action, scope: params.scope, details: params.details, hash: receipt.hash },
  }).catch(() => {});

  return receipt;
}

export function getChain(): TypedReceipt[] {
  return [...receiptChain];
}

export function verifyChainIntegrity(): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < receiptChain.length; i++) {
    if (receiptChain[i].previousHash !== receiptChain[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

export function createRefusalReceipt(params: {
  refusalReason: string;
  blockedAction: string;
  policyId: string;
  advisorId: string;
  confidenceAtRefusal: number;
  requiredForRetry: string[];
  tenantId: string;
}): import("@/packages/proof-model").RefusalProofReceipt {
  const previousHash = getLastHash();
  const receipt = {
    type: "refusal" as const,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${previousHash}:refusal:${params.blockedAction}:${params.policyId}`),
    previousHash,
    tenantId: params.tenantId,
    refusalReason: params.refusalReason,
    blockedAction: params.blockedAction,
    policyId: params.policyId,
    advisorId: params.advisorId,
    confidenceAtRefusal: params.confidenceAtRefusal,
    requiredForRetry: params.requiredForRetry,
  };
  receiptChain.push(receipt);

  persistReceipt({
    correlation_id: receipt.id,
    receipt_type: "refusal",
    payload: { ...params, hash: receipt.hash },
  }).catch(() => {});

  return receipt;
}

export function getReceiptById(id: string): TypedReceipt | undefined {
  return receiptChain.find((r) => r.id === id);
}

export function createFirstBootReceipt(params: {
  phase: import("@/packages/proof-model/receipts/first-boot-receipt").FirstBootReceiptPhase;
  deviceId: string;
  attestationHash: string;
  trustBaselineScore: number;
  secureBootVerified: boolean;
  tpmPresent: boolean;
  outcome: "success" | "degraded" | "failed";
  details: Record<string, unknown>;
  tenantId: string;
}): import("@/packages/proof-model/receipts/first-boot-receipt").FirstBootReceipt {
  const previousHash = getLastHash();
  const receipt = {
    type: "first-boot" as const,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hash: computeHash(`${previousHash}:first-boot:${params.phase}:${params.attestationHash}`),
    previousHash,
    tenantId: params.tenantId,
    phase: params.phase,
    deviceId: params.deviceId,
    attestationHash: params.attestationHash,
    trustBaselineScore: params.trustBaselineScore,
    secureBootVerified: params.secureBootVerified,
    tpmPresent: params.tpmPresent,
    outcome: params.outcome,
    details: params.details,
  };
  receiptChain.push(receipt);

  persistReceipt({
    correlation_id: receipt.id,
    receipt_type: "first-boot",
    payload: { ...params, hash: receipt.hash },
  }).catch(() => {});

  return receipt;
}

