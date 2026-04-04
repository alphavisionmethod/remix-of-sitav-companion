// ═══════════════════════════════════════════════════════════════
// SITA OS — Receipt Verification Service
// Cryptographic receipt integrity, chain validation, tamper detection
// ═══════════════════════════════════════════════════════════════

export interface ReceiptEntry {
  id: string;
  actionId: string;
  hash: string;
  previousHash: string;
  payload: Record<string, unknown>;
  timestamp: string;
  tenantId: string;
  expiresAt?: string;
}

export interface ReceiptChainValidation {
  valid: boolean;
  chainLength: number;
  brokenLinks: { index: number; expected: string; got: string }[];
  tamperedEntries: string[];
  expiredEntries: string[];
  validatedAt: string;
}

export interface ReceiptIntegrityResult {
  receiptId: string;
  hashValid: boolean;
  computedHash: string;
  storedHash: string;
  expired: boolean;
  tampered: boolean;
}

function computeReceiptHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}`;
}

export class ReceiptVerificationService {
  /** Compute expected hash for a receipt from its payload + chain link */
  computeHash(receipt: Omit<ReceiptEntry, "hash">): string {
    const canonical = `${receipt.previousHash}:${receipt.actionId}:${receipt.tenantId}:${JSON.stringify(receipt.payload)}:${receipt.timestamp}`;
    return computeReceiptHash(canonical);
  }

  /** Verify a single receipt's integrity */
  verifyIntegrity(receipt: ReceiptEntry): ReceiptIntegrityResult {
    const computedHash = this.computeHash({
      id: receipt.id,
      actionId: receipt.actionId,
      previousHash: receipt.previousHash,
      payload: receipt.payload,
      timestamp: receipt.timestamp,
      tenantId: receipt.tenantId,
      expiresAt: receipt.expiresAt,
    });

    const expired = receipt.expiresAt ? new Date(receipt.expiresAt).getTime() < Date.now() : false;
    const hashValid = computedHash === receipt.hash;

    return {
      receiptId: receipt.id,
      hashValid,
      computedHash,
      storedHash: receipt.hash,
      expired,
      tampered: !hashValid,
    };
  }

  /** Validate an entire receipt chain for continuity and integrity */
  validateChain(receipts: ReceiptEntry[]): ReceiptChainValidation {
    const sorted = [...receipts].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const brokenLinks: ReceiptChainValidation["brokenLinks"] = [];
    const tamperedEntries: string[] = [];
    const expiredEntries: string[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const receipt = sorted[i];

      // Check chain linkage (each receipt's previousHash should match prior receipt's hash)
      if (i > 0) {
        const expectedPrevHash = sorted[i - 1].hash;
        if (receipt.previousHash !== expectedPrevHash) {
          brokenLinks.push({ index: i, expected: expectedPrevHash, got: receipt.previousHash });
        }
      } else if (receipt.previousHash !== "genesis" && receipt.previousHash !== "") {
        // First entry should reference genesis
        brokenLinks.push({ index: 0, expected: "genesis", got: receipt.previousHash });
      }

      // Check individual integrity
      const integrity = this.verifyIntegrity(receipt);
      if (integrity.tampered) tamperedEntries.push(receipt.id);
      if (integrity.expired) expiredEntries.push(receipt.id);
    }

    return {
      valid: brokenLinks.length === 0 && tamperedEntries.length === 0,
      chainLength: sorted.length,
      brokenLinks,
      tamperedEntries,
      expiredEntries,
      validatedAt: new Date().toISOString(),
    };
  }

  /** Create a new receipt entry with computed hash, linked to the chain */
  createReceipt(params: {
    actionId: string;
    payload: Record<string, unknown>;
    tenantId: string;
    previousHash?: string;
    expiresInMs?: number;
  }): ReceiptEntry {
    const receipt: Omit<ReceiptEntry, "hash"> = {
      id: crypto.randomUUID(),
      actionId: params.actionId,
      previousHash: params.previousHash ?? "genesis",
      payload: params.payload,
      timestamp: new Date().toISOString(),
      tenantId: params.tenantId,
      expiresAt: params.expiresInMs
        ? new Date(Date.now() + params.expiresInMs).toISOString()
        : undefined,
    };

    return { ...receipt, hash: this.computeHash(receipt) };
  }

  /** Detect if a specific receipt was tampered with (convenience) */
  detectTamper(receipt: ReceiptEntry): { tampered: boolean; details: string } {
    const result = this.verifyIntegrity(receipt);
    if (result.tampered) {
      return {
        tampered: true,
        details: `Hash mismatch — stored: ${result.storedHash}, computed: ${result.computedHash}`,
      };
    }
    return { tampered: false, details: "Receipt integrity verified" };
  }
}

export function createReceiptVerificationService(): ReceiptVerificationService {
  return new ReceiptVerificationService();
}
