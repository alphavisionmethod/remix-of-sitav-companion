// ═══════════════════════════════════════════════════════════════
// SITA OS — File Ingestion Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped, DomainId } from "../_contract-scaffold";

export type IngestionStatus = "queued" | "parsing" | "classifying" | "extracting" | "indexing" | "completed" | "failed";

export type DocumentClassification = "invoice" | "contract" | "receipt" | "statement" | "report" | "correspondence" | "identity" | "tax" | "insurance" | "unknown";

export interface IngestionJob extends Timestamped, TenantScoped {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  status: IngestionStatus;
  classification?: DocumentClassification;
  domain?: DomainId;
  parseResult?: ParseResult;
  extractedData?: Record<string, unknown>;
  errorMessage?: string;
  processingTimeMs: number;
  connectorId?: string;
  sourceSystem?: string;
  retryCount: number;
}

export interface ParseResult {
  textContent: string;
  pageCount: number;
  language: string;
  confidence: number;
  structuredData?: Record<string, unknown>;
  tables?: ParsedTable[];
  keyValuePairs?: { key: string; value: string; confidence: number }[];
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
  confidence: number;
  pageNumber: number;
}

export interface ClassifiedDocument extends BaseContract, TenantScoped {
  jobId: string;
  classification: DocumentClassification;
  confidence: number;
  domain: DomainId;
  extractedEntities: ExtractedEntity[];
  linkedEntityIds: string[];
  searchableText: string;
  tags: string[];
  expiresAt?: string;
}

export interface ExtractedEntity {
  type: "amount" | "date" | "person" | "organization" | "address" | "account" | "reference";
  value: string;
  normalized?: string;
  confidence: number;
  position?: { start: number; end: number };
}
