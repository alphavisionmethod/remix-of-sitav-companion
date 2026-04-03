export interface FileIngestionReceipt {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  classificationResult: string;
  sensitivityTier: string;
  extractedEntities: { type: string; value: string; confidence: number }[];
  extractedDates: { label: string; date: string }[];
  processingDurationMs: number;
  ingestedAt: string;
  hash: string;
  linkedWorkflowId?: string;
}
