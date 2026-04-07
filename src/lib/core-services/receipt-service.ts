// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt Service (Durable)
// Hash-chained cryptographic proof generation with durable
// persistence to sita_receipts via Supabase
// Canonical contracts: ReceiptType from contracts
// ═══════════════════════════════════════════════════════════════

import type { ReceiptType as CanonicalReceiptType } from "@/packages/contracts";
import { persistReceipt, fetchReceipts } from "@/lib/persistence/supabase-adapters";

export type { CanonicalReceiptType };

/** Local receipt types (domain-specific extensions) */
export type ServiceReceiptType = "execution-summary" | "approval-record" | "refusal" | "verification-proof" | "verification-failure";

export interface Receipt {
  id: string;
  correlationId: string;
  receiptType: ServiceReceiptType;
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
  private persistenceEnabled = true;
  private persistenceErrors = 0;

  /** Create a placeholder receipt BEFORE execution begins */
  async createPlaceholder(
    correlationId: string,
    capabilityId: string,
    envelopeId?: string
  ): Promise<Receipt> {
    const receipt = await this.createReceipt(correlationId, "execution-summary", {
      capabilityId,
      placeholderStatus: "pending",
    }, { capabilityId, envelopeId });
    // Override status to pending (placeholder)
    receipt.status = "valid"; // placeholder is valid but data.placeholderStatus tracks lifecycle
    return receipt;
  }

  /** Transition a placeholder receipt to executing */
  markExecuting(receiptId: string): boolean {
    const receipt = this.receipts.find(r => r.id === receiptId);
    if (!receipt) return false;
    receipt.data = { ...receipt.data, placeholderStatus: "executing" };
    receipt.updatedAt = Date.now();
    return true;
  }

  /** Finalize a receipt after execution completes */
  async finalizeReceipt(
    receiptId: string,
    result: Record<string, unknown>,
    finalStatus: "completed" | "failed" = "completed"
  ): Promise<Receipt | null> {
    const receipt = this.receipts.find(r => r.id === receiptId);
    if (!receipt) return null;
    receipt.data = {
      ...receipt.data,
      ...result,
      placeholderStatus: finalStatus,
      finalizedAt: Date.now(),
    };
    receipt.updatedAt = Date.now();
    return receipt;
  }

  async createReceipt(
    correlationId: string,
    receiptType: ServiceReceiptType,
    data: Record<string, unknown>,
    options?: { capabilityId?: string; envelopeId?: string; domain?: string }
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

    // In-memory append (hot chain for hash verification)
    this.receipts.push(receipt);

    // Durable persistence (fire-and-forget, non-blocking)
    if (this.persistenceEnabled) {
      persistReceipt({
        correlation_id: correlationId,
        receipt_type: receiptType,
        capability_id: options?.capabilityId,
        domain: options?.domain,
        payload: {
          ...data,
          hash,
          previousHash,
          sequenceNumber,
          envelopeId: options?.envelopeId,
        },
        metadata: {
          receipt_id: receipt.id,
          status: receipt.status,
          created_at: receipt.createdAt,
        },
      }).catch((err) => {
        this.persistenceErrors++;
        console.error("[receipt-service] persistence failed:", err);
      });
    }

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

  /** Hydrate in-memory receipt chain from durable storage */
  async hydrate(opts?: { limit?: number }): Promise<number> {
    try {
      const persisted = await fetchReceipts({ limit: opts?.limit ?? 500 });
      let loaded = 0;

      for (const p of persisted) {
        const existsInMemory = this.receipts.some(r => r.id === p.payload?.receipt_id);
        if (!existsInMemory) {
          const receipt: Receipt = {
            id: (p.payload?.receipt_id as string) ?? p.id,
            correlationId: p.correlation_id,
            receiptType: p.receipt_type as ServiceReceiptType,
            capabilityId: p.capability_id,
            envelopeId: p.payload?.envelopeId as string | undefined,
            data: p.payload ?? {},
            hash: (p.payload?.hash as string) ?? "",
            previousHash: (p.payload?.previousHash as string) ?? null,
            sequenceNumber: (p.payload?.sequenceNumber as number) ?? 0,
            status: (p.metadata?.status as "valid") ?? "valid",
            createdAt: new Date(p.created_at).getTime(),
          };
          this.receipts.push(receipt);
          loaded++;
        }
      }

      // Update sequence counter
      if (this.receipts.length > 0) {
        this.sequenceCounter = Math.max(
          this.sequenceCounter,
          ...this.receipts.map(r => r.sequenceNumber)
        );
      }

      return loaded;
    } catch (err) {
      console.error("[receipt-service] hydration failed:", err);
      return 0;
    }
  }

  getReceipts(): Receipt[] {
    return [...this.receipts];
  }

  getReceiptsByCorrelation(correlationId: string): Receipt[] {
    return this.receipts.filter((r) => r.correlationId === correlationId);
  }

  getReceiptsByType(receiptType: ServiceReceiptType): Receipt[] {
    return this.receipts.filter((r) => r.receiptType === receiptType);
  }

  getChainLength(): number {
    return this.receipts.length;
  }

  /** Get persistence health status */
  getPersistenceHealth(): { enabled: boolean; errors: number; chainLength: number } {
    return {
      enabled: this.persistenceEnabled,
      errors: this.persistenceErrors,
      chainLength: this.receipts.length,
    };
  }

  /** Enable/disable persistence */
  setPersistence(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createReceiptService(): ReceiptService {
  return new ReceiptService();
}
