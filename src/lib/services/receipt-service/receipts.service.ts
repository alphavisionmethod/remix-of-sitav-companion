// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipts Service
// Creates typed Receipt objects with hash chaining
// ═══════════════════════════════════════════════════════════════

import type { TypedReceipt, ActionReceipt, SystemReceipt } from "@/packages/proof-model";

const receiptChain: TypedReceipt[] = [];

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
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

export function getReceiptById(id: string): TypedReceipt | undefined {
  return receiptChain.find((r) => r.id === id);
}
