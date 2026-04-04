// ═══════════════════════════════════════════════════════════════
// SITA OS — Document Signature Service
// E-signature workflow with approval chain integration
// ═══════════════════════════════════════════════════════════════

export type SignatureStatus = "draft" | "pending-signatures" | "partially-signed" | "completed" | "expired" | "voided";

export type SignerStatus = "pending" | "signed" | "declined" | "expired";

export interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  requestedBy: string;
  signers: Signer[];
  status: SignatureStatus;
  message?: string;
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
  voidedAt?: string;
  voidReason?: string;
  metadata: Record<string, unknown>;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  order: number;
  status: SignerStatus;
  signedAt?: string;
  declineReason?: string;
  ipAddress?: string;
}

export interface SignatureAuditEntry {
  id: string;
  requestId: string;
  action: "created" | "viewed" | "signed" | "declined" | "voided" | "expired" | "reminded";
  actorId: string;
  actorName: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export class DocumentSignatureService {
  private requests: Map<string, SignatureRequest> = new Map();
  private auditLog: SignatureAuditEntry[] = [];

  createRequest(documentId: string, documentName: string, requestedBy: string, signers: Omit<Signer, "id" | "status">[], options?: { message?: string; expiresAt?: string }): SignatureRequest {
    const request: SignatureRequest = {
      id: crypto.randomUUID(),
      documentId,
      documentName,
      requestedBy,
      signers: signers.map(s => ({ ...s, id: crypto.randomUUID(), status: "pending" as const })),
      status: "pending-signatures",
      message: options?.message,
      expiresAt: options?.expiresAt,
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    this.requests.set(request.id, request);
    this.logAudit(request.id, "created", requestedBy, requestedBy);
    return request;
  }

  sign(requestId: string, signerId: string, ipAddress?: string): SignatureRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    const signer = request.signers.find(s => s.id === signerId);
    if (!signer || signer.status !== "pending") return null;

    // Check order — ensure previous signers have signed
    const previousSigners = request.signers.filter(s => s.order < signer.order);
    if (previousSigners.some(s => s.status !== "signed")) return null;

    signer.status = "signed";
    signer.signedAt = new Date().toISOString();
    signer.ipAddress = ipAddress;

    const allSigned = request.signers.every(s => s.status === "signed");
    request.status = allSigned ? "completed" : "partially-signed";
    if (allSigned) request.completedAt = new Date().toISOString();

    this.logAudit(requestId, "signed", signerId, signer.name, ipAddress);
    return request;
  }

  decline(requestId: string, signerId: string, reason?: string): SignatureRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    const signer = request.signers.find(s => s.id === signerId);
    if (!signer) return null;

    signer.status = "declined";
    signer.declineReason = reason;
    this.logAudit(requestId, "declined", signerId, signer.name);
    return request;
  }

  void_(requestId: string, voidedBy: string, reason: string): SignatureRequest | null {
    const request = this.requests.get(requestId);
    if (!request || request.status === "completed") return null;

    request.status = "voided";
    request.voidedAt = new Date().toISOString();
    request.voidReason = reason;
    this.logAudit(requestId, "voided", voidedBy, voidedBy);
    return request;
  }

  getRequest(id: string): SignatureRequest | null {
    return this.requests.get(id) ?? null;
  }

  getRequestsByUser(userId: string): SignatureRequest[] {
    return Array.from(this.requests.values()).filter(r => r.requestedBy === userId || r.signers.some(s => s.email === userId));
  }

  getPendingForSigner(signerEmail: string): SignatureRequest[] {
    return Array.from(this.requests.values()).filter(r =>
      r.status === "pending-signatures" || r.status === "partially-signed"
    ).filter(r => r.signers.some(s => s.email === signerEmail && s.status === "pending"));
  }

  getAuditTrail(requestId: string): SignatureAuditEntry[] {
    return this.auditLog.filter(e => e.requestId === requestId);
  }

  private logAudit(requestId: string, action: SignatureAuditEntry["action"], actorId: string, actorName: string, ipAddress?: string) {
    this.auditLog.push({
      id: crypto.randomUUID(),
      requestId,
      action,
      actorId,
      actorName,
      timestamp: new Date().toISOString(),
      ipAddress,
    });
  }
}

export function createDocumentSignature(): DocumentSignatureService {
  return new DocumentSignatureService();
}
