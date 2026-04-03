// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt Service
// Hash-chained cryptographic proof generation
// ═══════════════════════════════════════════════════════════════

export type ReceiptType = "execution-summary" | "approval-record" | "refusal" | "verification-proof" | "verification-failure";

export interface Receipt {
  id: string;
  correlationId: string;
  receiptType: ReceiptType;
  capabilityId?: string;
  envelopeId?: string;
  data: Record<string, unknown>;
  hash: string;
  previousHash: string | null;
  sequenceNumber: number;
  status: "valid" | "tampered" | "superseded";
  createdAt: number;
}

export interface ProofPack {
  id: string;
  correlationId: string;
  receipts: Receipt[];
  chainValid: boolean;
  createdAt: number;
}

// ── Hash Utilities ──────────────────────────────────────────────────────────

async function computeHash(data: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback: simple deterministic hash for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

// ── Receipt Service Class ───────────────────────────────────────────────────

export class ReceiptService {
  private receipts: Receipt[] = [];
  private sequenceCounter = 0;

  async createReceipt(
    correlationId: string,
    receiptType: ReceiptType,
    data: Record<string, unknown>,
    options?: { capabilityId?: string; envelopeId?: string }
  ): Promise<Receipt> {
    const previousHash =
      this.receipts.length > 0
        ? this.receipts[this.receipts.length - 1].hash
        : null;

    const sequenceNumber = ++this.sequenceCounter;
    const hashInput = JSON.stringify({
      correlationId,
      receiptType,
      data,
      previousHash,
      sequenceNumber,
      timestamp: Date.now(),
    });

    const hash = await computeHash(hashInput);

    const receipt: Receipt = {
      id: crypto.randomUUID(),
      correlationId,
      receiptType,
      capabilityId: options?.capabilityId,
      envelopeId: options?.envelopeId,
      data,
      hash,
      previousHash,
      sequenceNumber,
      status: "valid",
      createdAt: Date.now(),
    };

    this.receipts.push(receipt);
    return receipt;
  }

  async verifyChain(receipts?: Receipt[]): Promise<{ valid: boolean; brokenAt?: number }> {
    const chain = receipts || this.receipts;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].previousHash !== chain[i - 1].hash) {
        return { valid: false, brokenAt: i };
      }
    }
    return { valid: true };
  }

  async generateProofPack(correlationId: string): Promise<ProofPack> {
    const related = this.receipts.filter((r) => r.correlationId === correlationId);
    const chainResult = await this.verifyChain(related);

    return {
      id: crypto.randomUUID(),
      correlationId,
      receipts: related,
      chainValid: chainResult.valid,
      createdAt: Date.now(),
    };
  }

  getReceipts(): Receipt[] {
    return [...this.receipts];
  }

  getReceiptsByCorrelation(correlationId: string): Receipt[] {
    return this.receipts.filter((r) => r.correlationId === correlationId);
  }

  getReceiptsByType(receiptType: ReceiptType): Receipt[] {
    return this.receipts.filter((r) => r.receiptType === receiptType);
  }

  getChainLength(): number {
    return this.receipts.length;
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createReceiptService(): ReceiptService {
  return new ReceiptService();
}
