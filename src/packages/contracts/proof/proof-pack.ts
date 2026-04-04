// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Contracts: Proof Pack
// Authoritative structured proof bundle
// ═══════════════════════════════════════════════════════════════

import type { ReceiptType } from "../_contract-scaffold";
import type { ProofMetadata } from "./proof-types";

export interface Receipt {
  id: string;
  type: ReceiptType;
  actionId: string;
  tenantId: string;
  timestamp: string;
  data: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export interface ProofBundle {
  id: string;
  intentId: string;
  receipts: Receipt[];
  chainHash: string;
  timestamp: string;
}

export interface ProofPack {
  id: string;
  bundleId: string;
  metadata: ProofMetadata;
  receipts: Receipt[];
  policySnapshotId?: string;
  verificationIds: string[];
  chainHash: string;
  exportable: boolean;
  supportSafe: boolean;
  generatedAt: string;
}
