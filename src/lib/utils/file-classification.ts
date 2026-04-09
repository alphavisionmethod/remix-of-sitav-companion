// ═══════════════════════════════════════════════════════════════
// SITA OS — File Classification Utilities
// Pure functions, no service dependency
// ═══════════════════════════════════════════════════════════════

export {
  classifyFile,
  detectSensitivity,
  extractDeadlines,
} from "@/lib/core-services/file-ingestion";

export type {
  FileClassification,
  SensitivityLevel,
} from "@/lib/core-services/file-ingestion";
