// ═══════════════════════════════════════════════════════════════
// SITA OS — File Ingestion Service
// Secure upload, classification, OCR, extraction, graph linking
// ═══════════════════════════════════════════════════════════════

export type FileClassification = "invoice" | "contract" | "receipt" | "statement" | "tax-document" | "correspondence" | "legal" | "medical" | "identity" | "general";
export type SensitivityLevel = "public" | "internal" | "confidential" | "restricted";
export type IngestionStatus = "uploaded" | "classifying" | "extracting" | "linking" | "completed" | "failed" | "quarantined";

export interface IngestedFile {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  classification: FileClassification;
  sensitivity: SensitivityLevel;
  status: IngestionStatus;
  extractedFields: Record<string, unknown>;
  linkedEntities: string[];
  deadlines: { description: string; date: number }[];
  obligations: string[];
  workflowSuggestions: string[];
  ocrText?: string;
  uploadedAt: number;
  processedAt?: number;
  uploadedBy: string;
  retentionPolicy?: string;
}

export interface IngestionPipeline {
  steps: IngestionStep[];
  currentStep: number;
  fileId: string;
}

interface IngestionStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: Record<string, unknown>;
}

// ── Sensitivity Detection ───────────────────────────────────────

const SENSITIVE_PATTERNS: Record<string, SensitivityLevel> = {
  ssn: "restricted",
  "social security": "restricted",
  "tax id": "restricted",
  ein: "confidential",
  "bank account": "confidential",
  routing: "confidential",
  "credit card": "restricted",
  medical: "restricted",
  hipaa: "restricted",
  passport: "restricted",
  "driver license": "restricted",
  salary: "confidential",
  nda: "confidential",
  confidential: "confidential",
};

export function detectSensitivity(text: string): SensitivityLevel {
  const lower = text.toLowerCase();
  let highest: SensitivityLevel = "public";
  const rank: Record<SensitivityLevel, number> = { public: 0, internal: 1, confidential: 2, restricted: 3 };

  for (const [pattern, level] of Object.entries(SENSITIVE_PATTERNS)) {
    if (lower.includes(pattern) && rank[level] > rank[highest]) {
      highest = level;
    }
  }
  return highest;
}

// ── Classification ──────────────────────────────────────────────

export function classifyFile(filename: string, mimeType: string, textSample: string = ""): FileClassification {
  const lower = (filename + " " + textSample).toLowerCase();
  if (lower.includes("invoice") || lower.includes("inv-")) return "invoice";
  if (lower.includes("contract") || lower.includes("agreement") || lower.includes("nda")) return "contract";
  if (lower.includes("receipt") || lower.includes("payment confirmation")) return "receipt";
  if (lower.includes("statement") || lower.includes("bank statement")) return "statement";
  if (lower.includes("tax") || lower.includes("w-2") || lower.includes("1099") || lower.includes("w-9")) return "tax-document";
  if (lower.includes("letter") || lower.includes("email") || lower.includes("memo")) return "correspondence";
  if (lower.includes("legal") || lower.includes("court") || lower.includes("subpoena")) return "legal";
  if (lower.includes("medical") || lower.includes("prescription") || lower.includes("diagnosis")) return "medical";
  if (lower.includes("passport") || lower.includes("license") || lower.includes("id card")) return "identity";
  return "general";
}

// ── Deadline Extraction ─────────────────────────────────────────

export function extractDeadlines(text: string): { description: string; date: number }[] {
  const deadlines: { description: string; date: number }[] = [];
  const patterns = [
    /due\s*(?:by|on|date)?\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    /(?:payment|renewal|expir(?:y|ation)|deadline)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const parsed = Date.parse(match[1]);
      if (!isNaN(parsed)) {
        deadlines.push({ description: match[0].trim(), date: parsed });
      }
    }
  }
  return deadlines;
}

// ── File Ingestion Service ──────────────────────────────────────

export class FileIngestionService {
  private files = new Map<string, IngestedFile>();

  async ingest(params: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    textContent?: string;
    uploadedBy: string;
  }): Promise<IngestedFile> {
    const id = crypto.randomUUID();
    const text = params.textContent ?? "";

    const classification = classifyFile(params.filename, params.mimeType, text);
    const sensitivity = detectSensitivity(text);
    const deadlines = extractDeadlines(text);

    const workflowSuggestions: string[] = [];
    if (classification === "invoice") workflowSuggestions.push("route-to-approvals", "link-to-customer");
    if (classification === "contract") workflowSuggestions.push("legal-review", "deadline-tracking");
    if (classification === "tax-document") workflowSuggestions.push("tax-filing-workflow", "accountant-review");
    if (deadlines.length > 0) workflowSuggestions.push("deadline-reminder");

    const file: IngestedFile = {
      id,
      filename: params.filename,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      classification,
      sensitivity,
      status: "completed",
      extractedFields: {},
      linkedEntities: [],
      deadlines,
      obligations: [],
      workflowSuggestions,
      ocrText: text,
      uploadedAt: Date.now(),
      processedAt: Date.now(),
      uploadedBy: params.uploadedBy,
      retentionPolicy: sensitivity === "restricted" ? "7-year" : sensitivity === "confidential" ? "5-year" : "standard",
    };

    this.files.set(id, file);
    return file;
  }

  getFile(id: string): IngestedFile | undefined {
    return this.files.get(id);
  }

  getFilesByClassification(classification: FileClassification): IngestedFile[] {
    return Array.from(this.files.values()).filter(f => f.classification === classification);
  }

  getSensitiveFiles(): IngestedFile[] {
    return Array.from(this.files.values()).filter(f => f.sensitivity === "confidential" || f.sensitivity === "restricted");
  }
}
