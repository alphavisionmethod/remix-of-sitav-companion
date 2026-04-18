// ═══════════════════════════════════════════════════════════════
// SITA OS — Content Classification Engine
// Data sensitivity, MIME semantics, media strategy, dedup
// ═══════════════════════════════════════════════════════════════

import type { EncryptionClass } from "../sync-object-model";

// ─── Types ────────────────────────────────────────────────────

export type DataSensitivity =
  | "public-metadata"
  | "private-standard"
  | "sensitive-encrypted"
  | "device-local-only"
  | "non-syncable"
  | "regulated-compliance";

export interface ContentClassification {
  mimeType: string;
  mimeCategory: "document" | "image" | "video" | "audio" | "archive" | "code" | "data" | "other";
  sensitivity: DataSensitivity;
  requiredEncryption: EncryptionClass;
  syncPriority: "critical" | "high" | "normal" | "low" | "deferred";
  mediaStrategy: MediaStrategy;
  previewAvailable: boolean;
  thumbnailGeneratable: boolean;
  searchIndexable: boolean;
  deduplicatable: boolean;
  estimatedImportance: number; // 0-1
}

export interface MediaStrategy {
  storeOriginal: boolean;
  generateOptimized: boolean;
  optimizedFormats?: string[];
  generateThumbnail: boolean;
  thumbnailSize?: { width: number; height: number };
  uploadPolicy: "immediate" | "on-charge" | "on-wifi" | "background";
  bandwidthClass: "tiny" | "small" | "medium" | "large" | "huge";
}

export interface FileSemantics {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  classification: ContentClassification;
  xattrs: Record<string, string>;
  permissions?: { readable: boolean; writable: boolean; executable: boolean };
  createdAt: string;
  modifiedAt: string;
  contentFingerprint: string;
}

export interface DuplicateGroup {
  fingerprint: string;
  files: Array<{ objectId: string; path: string; sizeBytes: number; deviceId: string }>;
  totalWastedBytes: number;
  recommendation: "keep-all" | "deduplicate" | "review";
}

export interface ClassificationRule {
  id: string;
  pattern: string; // glob or regex
  mimePattern?: string;
  sensitivity: DataSensitivity;
  requiredEncryption: EncryptionClass;
  syncPriority: ContentClassification["syncPriority"];
  description: string;
}

// ─── MIME Database ────────────────────────────────────────────

const MIME_CATEGORIES: Record<string, ContentClassification["mimeCategory"]> = {
  "application/pdf": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument": "document",
  "text/plain": "document",
  "text/markdown": "document",
  "text/html": "document",
  "text/csv": "data",
  "application/json": "data",
  "application/xml": "data",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "image/heic": "image",
  "image/heif": "image",
  "video/mp4": "video",
  "video/quicktime": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "audio/aac": "audio",
  "application/zip": "archive",
  "application/gzip": "archive",
  "application/x-tar": "archive",
  "text/javascript": "code",
  "text/typescript": "code",
  "application/x-python": "code",
};

const BANDWIDTH_THRESHOLDS = {
  tiny: 10240,         // 10KB
  small: 1048576,      // 1MB
  medium: 10485760,    // 10MB
  large: 104857600,    // 100MB
  huge: Infinity,
};

// ─── Content Classifier ──────────────────────────────────────

class ContentClassifier {
  private customRules: ClassificationRule[] = [];
  private duplicateIndex = new Map<string, Array<{ objectId: string; path: string; sizeBytes: number; deviceId: string }>>();

  // ─── Classification ────────────────────────────────

  classify(fileName: string, mimeType: string, sizeBytes: number): ContentClassification {
    const category = this.getMimeCategory(mimeType);
    const sensitivity = this.determineSensitivity(fileName, mimeType, category);
    const requiredEncryption = this.mapSensitivityToEncryption(sensitivity);
    const bandwidthClass = this.getBandwidthClass(sizeBytes);

    return {
      mimeType,
      mimeCategory: category,
      sensitivity,
      requiredEncryption,
      syncPriority: this.determinePriority(category, sizeBytes, sensitivity),
      mediaStrategy: this.buildMediaStrategy(category, sizeBytes, bandwidthClass),
      previewAvailable: ["document", "image", "code", "data"].includes(category),
      thumbnailGeneratable: ["image", "video", "document"].includes(category),
      searchIndexable: ["document", "code", "data"].includes(category),
      deduplicatable: category !== "other",
      estimatedImportance: this.estimateImportance(category, sizeBytes, fileName),
    };
  }

  classifyFile(file: { name: string; type: string; size: number; lastModified: number }): FileSemantics {
    const classification = this.classify(file.name, file.type, file.size);
    return {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      classification,
      xattrs: {},
      createdAt: new Date(file.lastModified).toISOString(),
      modifiedAt: new Date(file.lastModified).toISOString(),
      contentFingerprint: `fp_${file.name}_${file.size}_${file.lastModified}`,
    };
  }

  // ─── Custom Rules ──────────────────────────────────

  addRule(rule: Omit<ClassificationRule, "id">): ClassificationRule {
    const full: ClassificationRule = { ...rule, id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this.customRules.push(full);
    return full;
  }

  removeRule(ruleId: string): void {
    this.customRules = this.customRules.filter(r => r.id !== ruleId);
  }

  getRules(): ClassificationRule[] {
    return [...this.customRules];
  }

  // ─── Duplicate Detection ───────────────────────────

  registerFingerprint(fingerprint: string, objectId: string, path: string, sizeBytes: number, deviceId: string): void {
    const list = this.duplicateIndex.get(fingerprint) ?? [];
    if (!list.find(f => f.objectId === objectId)) {
      list.push({ objectId, path, sizeBytes, deviceId });
      this.duplicateIndex.set(fingerprint, list);
    }
  }

  findDuplicates(): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    for (const [fingerprint, files] of this.duplicateIndex) {
      if (files.length > 1) {
        const totalWasted = files.slice(1).reduce((sum, f) => sum + f.sizeBytes, 0);
        groups.push({
          fingerprint,
          files: [...files],
          totalWastedBytes: totalWasted,
          recommendation: totalWasted > 10485760 ? "deduplicate" : "review",
        });
      }
    }
    return groups.sort((a, b) => b.totalWastedBytes - a.totalWastedBytes);
  }

  getDuplicateStats() {
    const groups = this.findDuplicates();
    return {
      duplicateGroups: groups.length,
      totalWastedBytes: groups.reduce((sum, g) => sum + g.totalWastedBytes, 0),
      totalDuplicateFiles: groups.reduce((sum, g) => sum + g.files.length - 1, 0),
    };
  }

  // ─── Sensitivity Mapping ───────────────────────────

  getSensitivityLabel(sensitivity: DataSensitivity): string {
    const labels: Record<DataSensitivity, string> = {
      "public-metadata": "Public Metadata",
      "private-standard": "Private",
      "sensitive-encrypted": "Sensitive (Encrypted)",
      "device-local-only": "Device-Local Only",
      "non-syncable": "Non-Syncable",
      "regulated-compliance": "Regulated / Compliance",
    };
    return labels[sensitivity];
  }

  getAllSensitivities(): DataSensitivity[] {
    return ["public-metadata", "private-standard", "sensitive-encrypted", "device-local-only", "non-syncable", "regulated-compliance"];
  }

  // ─── Internal ──────────────────────────────────────

  private getMimeCategory(mimeType: string): ContentClassification["mimeCategory"] {
    if (MIME_CATEGORIES[mimeType]) return MIME_CATEGORIES[mimeType];
    const prefix = mimeType.split("/")[0];
    if (prefix === "image") return "image";
    if (prefix === "video") return "video";
    if (prefix === "audio") return "audio";
    if (prefix === "text") return "document";
    return "other";
  }

  private determineSensitivity(fileName: string, mimeType: string, category: string): DataSensitivity {
    // Check custom rules first
    for (const rule of this.customRules) {
      if (this.matchesPattern(fileName, rule.pattern)) return rule.sensitivity;
      if (rule.mimePattern && mimeType.startsWith(rule.mimePattern)) return rule.sensitivity;
    }

    const lower = fileName.toLowerCase();
    if (lower.includes("password") || lower.includes("secret") || lower.includes(".env") || lower.includes("key.pem")) {
      return "sensitive-encrypted";
    }
    if (lower.includes("tax") || lower.includes("medical") || lower.includes("legal") || lower.includes("ssn")) {
      return "regulated-compliance";
    }
    if (lower.startsWith(".") || lower.includes("cache") || lower.includes("tmp")) {
      return "device-local-only";
    }
    return "private-standard";
  }

  private mapSensitivityToEncryption(sensitivity: DataSensitivity): EncryptionClass {
    const map: Record<DataSensitivity, EncryptionClass> = {
      "public-metadata": "standard",
      "private-standard": "encrypted-at-rest",
      "sensitive-encrypted": "e2ee",
      "device-local-only": "device-bound",
      "non-syncable": "non-syncable",
      "regulated-compliance": "e2ee",
    };
    return map[sensitivity];
  }

  private determinePriority(category: string, sizeBytes: number, sensitivity: DataSensitivity): ContentClassification["syncPriority"] {
    if (sensitivity === "non-syncable" || sensitivity === "device-local-only") return "deferred";
    if (category === "document" && sizeBytes < 1048576) return "critical";
    if (category === "data") return "high";
    if (category === "image" && sizeBytes < 5242880) return "normal";
    if (category === "video" || sizeBytes > 104857600) return "deferred";
    return "normal";
  }

  private buildMediaStrategy(category: string, sizeBytes: number, bandwidthClass: string): MediaStrategy {
    if (category === "image") {
      return {
        storeOriginal: true,
        generateOptimized: sizeBytes > 2097152,
        optimizedFormats: ["webp"],
        generateThumbnail: true,
        thumbnailSize: { width: 256, height: 256 },
        uploadPolicy: sizeBytes > 10485760 ? "on-wifi" : "immediate",
        bandwidthClass: bandwidthClass as MediaStrategy["bandwidthClass"],
      };
    }
    if (category === "video") {
      return {
        storeOriginal: true,
        generateOptimized: true,
        optimizedFormats: ["mp4"],
        generateThumbnail: true,
        thumbnailSize: { width: 320, height: 180 },
        uploadPolicy: "on-charge",
        bandwidthClass: "huge",
      };
    }
    return {
      storeOriginal: true,
      generateOptimized: false,
      generateThumbnail: category === "document",
      thumbnailSize: category === "document" ? { width: 200, height: 280 } : undefined,
      uploadPolicy: sizeBytes > 52428800 ? "on-wifi" : "immediate",
      bandwidthClass: bandwidthClass as MediaStrategy["bandwidthClass"],
    };
  }

  private getBandwidthClass(sizeBytes: number): string {
    for (const [cls, threshold] of Object.entries(BANDWIDTH_THRESHOLDS)) {
      if (sizeBytes <= threshold) return cls;
    }
    return "huge";
  }

  private estimateImportance(category: string, sizeBytes: number, fileName: string): number {
    let score = 0.5;
    if (category === "document") score += 0.2;
    if (category === "data") score += 0.15;
    if (category === "image") score += 0.05;
    if (sizeBytes < 1048576) score += 0.1;
    if (fileName.toLowerCase().includes("important") || fileName.toLowerCase().includes("urgent")) score += 0.15;
    return Math.min(1, score);
  }

  private matchesPattern(fileName: string, pattern: string): boolean {
    const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    try {
      return new RegExp(regex, "i").test(fileName);
    } catch {
      return false;
    }
  }
}

export const contentClassifier = new ContentClassifier();
