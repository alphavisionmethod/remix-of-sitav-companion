// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Model: First-Boot Receipt
// Receipt type for first-boot lifecycle events
// ═══════════════════════════════════════════════════════════════

import type { BaseReceiptFields } from "./base";

export type FirstBootReceiptPhase =
  | "hardware-detection"
  | "secure-foundation"
  | "trust-baseline"
  | "key-generation"
  | "vault-initialization"
  | "network-connectivity"
  | "runtime-bootstrap"
  | "proof-chain-genesis"
  | "provisioning-complete";

export interface FirstBootReceipt extends BaseReceiptFields {
  type: "first-boot";
  phase: FirstBootReceiptPhase;
  deviceId: string;
  attestationHash: string;
  trustBaselineScore: number; // 0-100
  secureBootVerified: boolean;
  tpmPresent: boolean;
  outcome: "success" | "degraded" | "failed";
  details: Record<string, unknown>;
}
