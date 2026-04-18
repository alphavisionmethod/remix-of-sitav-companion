// ═══════════════════════════════════════════════════════════════
// SITA OS — Transfer Optimizer
// Compression, dedup, chunking, resumable uploads, prefetch
// ═══════════════════════════════════════════════════════════════

export type CompressionAlgo = "none" | "gzip" | "brotli" | "lz4";
export type TransferClass = "critical" | "interactive" | "bulk" | "background" | "prefetch";

export interface ChunkedTransfer { id: string; objectId: string; totalChunks: number; completedChunks: number; chunkSizeBytes: number; totalSizeBytes: number; status: "active" | "paused" | "completed" | "failed"; resumeToken?: string; startedAt: string; lastChunkAt?: string; }
export interface DeduplicationResult { objectId: string; fingerprint: string; isDuplicate: boolean; existingObjectId?: string; savedBytes: number; }
export interface TransferOptimization { originalSizeBytes: number; optimizedSizeBytes: number; compression: CompressionAlgo; deduplicated: boolean; chunked: boolean; savings: number; savingsPercent: number; }
export interface PrefetchCandidate { objectId: string; namespace: string; confidence: number; reason: string; sizeBytes: number; scheduledAt?: string; }

class TransferOptimizerEngine {
  private activeTransfers = new Map<string, ChunkedTransfer>();
  private dedupIndex = new Map<string, string>(); // fingerprint -> objectId
  private prefetchQueue: PrefetchCandidate[] = [];
  private stats = { totalBytesTransferred: 0, totalBytesSaved: 0, totalChunkedTransfers: 0, totalDeduplications: 0, compressionRatio: 0.65 };

  selectCompression(mimeType: string, sizeBytes: number): CompressionAlgo {
    if (sizeBytes < 1024) return "none";
    if (["image/jpeg", "image/png", "video/mp4", "audio/mpeg", "application/zip"].some(m => mimeType.startsWith(m))) return "none";
    if (sizeBytes > 10485760) return "lz4";
    if (sizeBytes > 1048576) return "brotli";
    return "gzip";
  }

  optimizeTransfer(objectId: string, data: ArrayBuffer | string, mimeType: string, fingerprint: string): TransferOptimization {
    const originalSize = typeof data === "string" ? data.length : data.byteLength;
    const existing = this.dedupIndex.get(fingerprint);
    if (existing && existing !== objectId) {
      this.stats.totalDeduplications++;
      return { originalSizeBytes: originalSize, optimizedSizeBytes: 0, compression: "none", deduplicated: true, chunked: false, savings: originalSize, savingsPercent: 100 };
    }
    this.dedupIndex.set(fingerprint, objectId);
    const compression = this.selectCompression(mimeType, originalSize);
    const ratio = compression === "none" ? 1 : compression === "lz4" ? 0.75 : compression === "brotli" ? 0.6 : 0.7;
    const optimizedSize = Math.round(originalSize * ratio);
    const savings = originalSize - optimizedSize;
    this.stats.totalBytesSaved += savings;
    this.stats.totalBytesTransferred += optimizedSize;
    return { originalSizeBytes: originalSize, optimizedSizeBytes: optimizedSize, compression, deduplicated: false, chunked: originalSize > 5242880, savings, savingsPercent: Math.round((savings / originalSize) * 100) };
  }

  startChunkedTransfer(objectId: string, totalSizeBytes: number, chunkSizeBytes = 1048576): ChunkedTransfer {
    const transfer: ChunkedTransfer = { id: `ct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, objectId, totalChunks: Math.ceil(totalSizeBytes / chunkSizeBytes), completedChunks: 0, chunkSizeBytes, totalSizeBytes, status: "active", resumeToken: `rt_${Math.random().toString(36).slice(2, 12)}`, startedAt: new Date().toISOString() };
    this.activeTransfers.set(transfer.id, transfer);
    this.stats.totalChunkedTransfers++;
    return transfer;
  }

  completeChunk(transferId: string): boolean {
    const t = this.activeTransfers.get(transferId);
    if (!t || t.status !== "active") return false;
    t.completedChunks++;
    t.lastChunkAt = new Date().toISOString();
    if (t.completedChunks >= t.totalChunks) t.status = "completed";
    return true;
  }

  pauseTransfer(transferId: string): void { const t = this.activeTransfers.get(transferId); if (t) t.status = "paused"; }
  resumeTransfer(transferId: string): void { const t = this.activeTransfers.get(transferId); if (t && t.status === "paused") t.status = "active"; }

  addPrefetchCandidate(objectId: string, namespace: string, confidence: number, reason: string, sizeBytes: number): void {
    if (!this.prefetchQueue.find(p => p.objectId === objectId)) {
      this.prefetchQueue.push({ objectId, namespace, confidence, reason, sizeBytes });
      this.prefetchQueue.sort((a, b) => b.confidence - a.confidence);
      if (this.prefetchQueue.length > 100) this.prefetchQueue = this.prefetchQueue.slice(0, 80);
    }
  }

  getPrefetchCandidates(limit = 10): PrefetchCandidate[] { return this.prefetchQueue.slice(0, limit); }
  getActiveTransfers(): ChunkedTransfer[] { return Array.from(this.activeTransfers.values()).filter(t => t.status === "active"); }
  getStats() { return { ...this.stats, activeTransfers: this.getActiveTransfers().length, dedupEntries: this.dedupIndex.size, prefetchQueue: this.prefetchQueue.length }; }
}

export const transferOptimizer = new TransferOptimizerEngine();
