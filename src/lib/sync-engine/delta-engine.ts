// ═══════════════════════════════════════════════════════════════
// SITA OS — Delta Sync Engine
// Efficient delta computation for text, JSON, and binary data
// ═══════════════════════════════════════════════════════════════

import { computeObjectHash } from "./sync-object-model";

/** Delta types supported by the engine */
export type DeltaType = "text-patch" | "json-patch" | "chunk-diff" | "metadata-only" | "full-replace";

/** A computed delta between two versions */
export interface SyncDelta {
  id: string;
  objectId: string;
  fromVersion: number;
  toVersion: number;
  deltaType: DeltaType;
  /** The delta operations */
  operations: DeltaOperation[];
  /** Size of the delta in bytes (estimate) */
  deltaSizeBytes: number;
  /** Size of the full content in bytes */
  fullSizeBytes: number;
  /** Savings ratio (0–1, higher = better) */
  savingsRatio: number;
  /** Checksum of the source version */
  sourceChecksum: string;
  /** Checksum of the target version */
  targetChecksum: string;
  /** Timestamp of delta computation */
  computedAt: string;
}

/** Individual delta operation */
export interface DeltaOperation {
  op: "insert" | "delete" | "replace" | "move" | "copy" | "add" | "remove" | "set";
  /** Path for JSON patch operations */
  path?: string;
  /** Position for text/chunk operations */
  position?: number;
  /** Length of affected content */
  length?: number;
  /** New value/content */
  value?: unknown;
  /** Previous value (for rollback) */
  oldValue?: unknown;
}

/** Block-level chunk for large file diffing */
export interface ContentChunk {
  index: number;
  offset: number;
  size: number;
  hash: string;
  data?: ArrayBuffer | string;
}

// ─── Delta Engine ─────────────────────────────────────────────

class DeltaEngine {
  private readonly CHUNK_SIZE = 4096; // 4 KB blocks for binary diffing

  /** Compute a delta between two versions of content */
  computeDelta(
    oldContent: unknown,
    newContent: unknown,
    objectId: string,
    fromVersion: number,
    toVersion: number
  ): SyncDelta {
    const oldType = typeof oldContent;
    const newType = typeof newContent;

    // Choose delta strategy based on content type
    if (oldType === "string" && newType === "string") {
      return this.computeTextDelta(
        oldContent as string, newContent as string,
        objectId, fromVersion, toVersion
      );
    }

    if (oldType === "object" && newType === "object" && oldContent !== null && newContent !== null) {
      return this.computeJsonDelta(
        oldContent as Record<string, unknown>,
        newContent as Record<string, unknown>,
        objectId, fromVersion, toVersion
      );
    }

    // Fallback to full replace
    return this.createFullReplaceDelta(newContent, objectId, fromVersion, toVersion);
  }

  /** Compute text delta using line-based diff */
  computeTextDelta(
    oldText: string,
    newText: string,
    objectId: string,
    fromVersion: number,
    toVersion: number
  ): SyncDelta {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const operations: DeltaOperation[] = [];

    // Simple LCS-based line diff
    const lcs = this.longestCommonSubsequence(oldLines, newLines);
    let oldIdx = 0;
    let newIdx = 0;
    let lcsIdx = 0;

    while (oldIdx < oldLines.length || newIdx < newLines.length) {
      if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx] &&
          newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        // Line is in LCS — no change
        oldIdx++;
        newIdx++;
        lcsIdx++;
      } else if (newIdx < newLines.length && (lcsIdx >= lcs.length || newLines[newIdx] !== lcs[lcsIdx])) {
        operations.push({
          op: "insert",
          position: newIdx,
          value: newLines[newIdx],
        });
        newIdx++;
      } else if (oldIdx < oldLines.length && (lcsIdx >= lcs.length || oldLines[oldIdx] !== lcs[lcsIdx])) {
        operations.push({
          op: "delete",
          position: oldIdx,
          oldValue: oldLines[oldIdx],
        });
        oldIdx++;
      } else {
        break;
      }
    }

    const deltaSize = JSON.stringify(operations).length;
    const fullSize = newText.length;

    return {
      id: `delta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectId,
      fromVersion,
      toVersion,
      deltaType: "text-patch",
      operations,
      deltaSizeBytes: deltaSize,
      fullSizeBytes: fullSize,
      savingsRatio: fullSize > 0 ? Math.max(0, 1 - deltaSize / fullSize) : 0,
      sourceChecksum: computeObjectHash({ text: oldText }),
      targetChecksum: computeObjectHash({ text: newText }),
      computedAt: new Date().toISOString(),
    };
  }

  /** Compute JSON delta using RFC 6902-style JSON Patch */
  computeJsonDelta(
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>,
    objectId: string,
    fromVersion: number,
    toVersion: number
  ): SyncDelta {
    const operations: DeltaOperation[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (!(key in oldObj)) {
        operations.push({ op: "add", path: `/${key}`, value: newVal });
      } else if (!(key in newObj)) {
        operations.push({ op: "remove", path: `/${key}`, oldValue: oldVal });
      } else if (oldStr !== newStr) {
        // Recurse for nested objects
        if (typeof oldVal === "object" && typeof newVal === "object" &&
            oldVal !== null && newVal !== null && !Array.isArray(oldVal) && !Array.isArray(newVal)) {
          const nestedOps = this.computeJsonDelta(
            oldVal as Record<string, unknown>,
            newVal as Record<string, unknown>,
            objectId, fromVersion, toVersion
          ).operations;
          for (const op of nestedOps) {
            operations.push({ ...op, path: `/${key}${op.path ?? ""}` });
          }
        } else {
          operations.push({ op: "replace", path: `/${key}`, value: newVal, oldValue: oldVal });
        }
      }
    }

    const deltaSize = JSON.stringify(operations).length;
    const fullSize = JSON.stringify(newObj).length;

    return {
      id: `delta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectId,
      fromVersion,
      toVersion,
      deltaType: "json-patch",
      operations,
      deltaSizeBytes: deltaSize,
      fullSizeBytes: fullSize,
      savingsRatio: fullSize > 0 ? Math.max(0, 1 - deltaSize / fullSize) : 0,
      sourceChecksum: computeObjectHash(oldObj),
      targetChecksum: computeObjectHash(newObj),
      computedAt: new Date().toISOString(),
    };
  }

  /** Compute block-level chunk diff for large binary content */
  computeChunkDelta(
    oldChunks: ContentChunk[],
    newChunks: ContentChunk[],
    objectId: string,
    fromVersion: number,
    toVersion: number
  ): SyncDelta {
    const oldHashMap = new Map(oldChunks.map((c) => [c.hash, c]));
    const operations: DeltaOperation[] = [];
    let reusedBytes = 0;
    let totalBytes = 0;

    for (const chunk of newChunks) {
      totalBytes += chunk.size;
      if (oldHashMap.has(chunk.hash)) {
        // Block already exists — copy reference
        const oldChunk = oldHashMap.get(chunk.hash)!;
        operations.push({
          op: "copy",
          position: chunk.offset,
          length: chunk.size,
          value: { sourceOffset: oldChunk.offset, hash: chunk.hash },
        });
        reusedBytes += chunk.size;
      } else {
        // New block — needs upload
        operations.push({
          op: "insert",
          position: chunk.offset,
          length: chunk.size,
          value: { hash: chunk.hash, needsUpload: true },
        });
      }
    }

    return {
      id: `delta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectId,
      fromVersion,
      toVersion,
      deltaType: "chunk-diff",
      operations,
      deltaSizeBytes: totalBytes - reusedBytes,
      fullSizeBytes: totalBytes,
      savingsRatio: totalBytes > 0 ? reusedBytes / totalBytes : 0,
      sourceChecksum: oldChunks.map((c) => c.hash).join(":"),
      targetChecksum: newChunks.map((c) => c.hash).join(":"),
      computedAt: new Date().toISOString(),
    };
  }

  /** Apply a delta to reconstruct content */
  applyDelta(oldContent: unknown, delta: SyncDelta): unknown {
    switch (delta.deltaType) {
      case "text-patch":
        return this.applyTextDelta(oldContent as string, delta.operations);
      case "json-patch":
        return this.applyJsonDelta(oldContent as Record<string, unknown>, delta.operations);
      case "full-replace":
        return delta.operations[0]?.value;
      default:
        return oldContent;
    }
  }

  /** Validate a delta can be applied (checksum verification) */
  validateDelta(sourceContent: unknown, delta: SyncDelta): boolean {
    const sourceHash = computeObjectHash(
      typeof sourceContent === "string"
        ? { text: sourceContent }
        : (sourceContent as Record<string, unknown>)
    );
    return sourceHash === delta.sourceChecksum;
  }

  /** Chunk content into fixed-size blocks for binary diff */
  chunkContent(content: string, chunkSize: number = this.CHUNK_SIZE): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      const data = content.slice(i, i + chunkSize);
      chunks.push({
        index: chunks.length,
        offset: i,
        size: data.length,
        hash: computeObjectHash({ chunk: data }),
        data,
      });
    }
    return chunks;
  }

  /** Decide whether to use delta or full upload */
  shouldUseDelta(delta: SyncDelta): boolean {
    // Use delta if savings > 20% and delta is reasonably small
    return delta.savingsRatio > 0.2 && delta.deltaSizeBytes < 5 * 1024 * 1024;
  }

  // ─── Internal Helpers ─────────────────────────

  private applyTextDelta(text: string, ops: DeltaOperation[]): string {
    const lines = text.split("\n");
    // Apply in reverse order to maintain positions
    const sortedOps = [...ops].sort((a, b) => (b.position ?? 0) - (a.position ?? 0));
    for (const op of sortedOps) {
      const pos = op.position ?? 0;
      if (op.op === "insert") {
        lines.splice(pos, 0, String(op.value));
      } else if (op.op === "delete") {
        lines.splice(pos, 1);
      } else if (op.op === "replace") {
        lines[pos] = String(op.value);
      }
    }
    return lines.join("\n");
  }

  private applyJsonDelta(obj: Record<string, unknown>, ops: DeltaOperation[]): Record<string, unknown> {
    const result = structuredClone(obj);
    for (const op of ops) {
      const path = op.path?.split("/").filter(Boolean) ?? [];
      if (path.length === 0) continue;

      let target: any = result;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
        if (!target) break;
      }
      if (!target) continue;

      const key = path[path.length - 1];
      switch (op.op) {
        case "add":
        case "replace":
        case "set":
          target[key] = op.value;
          break;
        case "remove":
          delete target[key];
          break;
      }
    }
    return result;
  }

  private longestCommonSubsequence(a: string[], b: string[]): string[] {
    const m = a.length;
    const n = b.length;
    // Optimize for large inputs
    if (m > 10000 || n > 10000) {
      return this.simpleLCS(a, b);
    }
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const result: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.unshift(a[i - 1]);
        i--; j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return result;
  }

  private simpleLCS(a: string[], b: string[]): string[] {
    // Simplified for very large inputs — just find matching lines
    const bSet = new Set(b);
    return a.filter((line) => bSet.has(line));
  }

  private createFullReplaceDelta(
    content: unknown,
    objectId: string,
    fromVersion: number,
    toVersion: number
  ): SyncDelta {
    const fullSize = JSON.stringify(content).length;
    return {
      id: `delta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectId,
      fromVersion,
      toVersion,
      deltaType: "full-replace",
      operations: [{ op: "replace", value: content }],
      deltaSizeBytes: fullSize,
      fullSizeBytes: fullSize,
      savingsRatio: 0,
      sourceChecksum: "",
      targetChecksum: computeObjectHash(
        typeof content === "object" && content !== null
          ? (content as Record<string, unknown>)
          : { value: content }
      ),
      computedAt: new Date().toISOString(),
    };
  }
}

/** Singleton delta engine */
export const deltaEngine = new DeltaEngine();
