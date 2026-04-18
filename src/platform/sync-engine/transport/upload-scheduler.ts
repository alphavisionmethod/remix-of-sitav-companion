// ═══════════════════════════════════════════════════════════════
// SITA OS — Upload/Download Scheduler
// Resumable transfers, chunking, priority queue, bandwidth control
// ═══════════════════════════════════════════════════════════════

/** Transfer priority */
export type TransferPriority = "critical" | "high" | "medium" | "low" | "background";

/** Transfer state */
export type TransferState = "queued" | "active" | "paused" | "completed" | "failed" | "cancelled" | "resuming";

/** A managed transfer job */
export interface ManagedTransfer {
  id: string;
  objectId: string;
  namespace: string;
  direction: "upload" | "download";
  priority: TransferPriority;
  state: TransferState;
  totalBytes: number;
  transferredBytes: number;
  /** Chunk-based progress */
  totalChunks: number;
  completedChunks: number;
  currentChunkIndex: number;
  /** Resume support */
  resumeToken?: string;
  checksum: string;
  /** Timing */
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Retry */
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  /** Bandwidth */
  averageBytesPerSecond: number;
  estimatedTimeRemainingMs: number;
}

/** Scheduler configuration */
export interface SchedulerConfig {
  maxConcurrentUploads: number;
  maxConcurrentDownloads: number;
  chunkSizeBytes: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  maxBandwidthBytesPerSecond: number; // 0 = unlimited
  pauseOnMetered: boolean;
  pauseOnLowBattery: boolean;
  lowBatteryThreshold: number;
}

/** Scheduler stats */
export interface SchedulerStats {
  activeUploads: number;
  activeDownloads: number;
  queuedUploads: number;
  queuedDownloads: number;
  completedToday: number;
  failedToday: number;
  totalBytesTransferred: number;
  averageThroughputBps: number;
  isPaused: boolean;
  pauseReason?: string;
}

type TransferProgressHandler = (transfer: ManagedTransfer) => void;

class UploadScheduler {
  private transfers = new Map<string, ManagedTransfer>();
  private config: SchedulerConfig = {
    maxConcurrentUploads: 3,
    maxConcurrentDownloads: 5,
    chunkSizeBytes: 1024 * 1024, // 1 MB
    maxRetries: 5,
    retryBaseDelayMs: 2000,
    maxBandwidthBytesPerSecond: 0,
    pauseOnMetered: false,
    pauseOnLowBattery: true,
    lowBatteryThreshold: 10,
  };

  private isPaused = false;
  private pauseReason?: string;
  private processInterval: ReturnType<typeof setInterval> | null = null;
  private progressHandlers: TransferProgressHandler[] = [];
  private totalBytesTransferred = 0;
  private completedToday = 0;
  private failedToday = 0;

  /** Start the scheduler */
  start(): void {
    this.processInterval = setInterval(() => this.processQueue(), 500);
    console.log("[UploadScheduler] Started");
  }

  /** Stop the scheduler */
  stop(): void {
    if (this.processInterval) clearInterval(this.processInterval);
    this.processInterval = null;
  }

  /** Queue a new transfer */
  queueTransfer(params: {
    objectId: string;
    namespace: string;
    direction: "upload" | "download";
    totalBytes: number;
    checksum: string;
    priority?: TransferPriority;
  }): ManagedTransfer {
    const id = `xfer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const totalChunks = Math.ceil(params.totalBytes / this.config.chunkSizeBytes);
    const priority = params.priority ?? this.inferPriority(params.namespace);

    const transfer: ManagedTransfer = {
      id,
      objectId: params.objectId,
      namespace: params.namespace,
      direction: params.direction,
      priority,
      state: "queued",
      totalBytes: params.totalBytes,
      transferredBytes: 0,
      totalChunks,
      completedChunks: 0,
      currentChunkIndex: 0,
      checksum: params.checksum,
      queuedAt: new Date().toISOString(),
      attemptCount: 0,
      maxAttempts: this.config.maxRetries,
      averageBytesPerSecond: 0,
      estimatedTimeRemainingMs: 0,
    };

    this.transfers.set(id, transfer);
    return transfer;
  }

  /** Pause a specific transfer */
  pauseTransfer(transferId: string): boolean {
    const t = this.transfers.get(transferId);
    if (!t || t.state !== "active") return false;
    t.state = "paused";
    t.resumeToken = `resume_${t.id}_chunk_${t.currentChunkIndex}`;
    return true;
  }

  /** Resume a paused transfer */
  resumeTransfer(transferId: string): boolean {
    const t = this.transfers.get(transferId);
    if (!t || t.state !== "paused") return false;
    t.state = "resuming";
    return true;
  }

  /** Cancel a transfer */
  cancelTransfer(transferId: string): boolean {
    const t = this.transfers.get(transferId);
    if (!t) return false;
    t.state = "cancelled";
    return true;
  }

  /** Pause all transfers */
  pauseAll(reason: string): void {
    this.isPaused = true;
    this.pauseReason = reason;
    for (const t of this.transfers.values()) {
      if (t.state === "active") {
        t.state = "paused";
        t.resumeToken = `resume_${t.id}_chunk_${t.currentChunkIndex}`;
      }
    }
  }

  /** Resume all transfers */
  resumeAll(): void {
    this.isPaused = false;
    this.pauseReason = undefined;
    for (const t of this.transfers.values()) {
      if (t.state === "paused") t.state = "resuming";
    }
  }

  /** Get a transfer by ID */
  getTransfer(transferId: string): ManagedTransfer | undefined {
    return this.transfers.get(transferId);
  }

  /** Get all transfers */
  getAllTransfers(): ManagedTransfer[] {
    return Array.from(this.transfers.values());
  }

  /** Get active transfers */
  getActiveTransfers(): ManagedTransfer[] {
    return this.getAllTransfers().filter(t => t.state === "active");
  }

  /** Get queued transfers */
  getQueuedTransfers(): ManagedTransfer[] {
    return this.getAllTransfers().filter(t => t.state === "queued" || t.state === "resuming");
  }

  /** Get scheduler stats */
  getStats(): SchedulerStats {
    const all = this.getAllTransfers();
    return {
      activeUploads: all.filter(t => t.state === "active" && t.direction === "upload").length,
      activeDownloads: all.filter(t => t.state === "active" && t.direction === "download").length,
      queuedUploads: all.filter(t => (t.state === "queued" || t.state === "resuming") && t.direction === "upload").length,
      queuedDownloads: all.filter(t => (t.state === "queued" || t.state === "resuming") && t.direction === "download").length,
      completedToday: this.completedToday,
      failedToday: this.failedToday,
      totalBytesTransferred: this.totalBytesTransferred,
      averageThroughputBps: this.totalBytesTransferred > 0 ? Math.floor(this.totalBytesTransferred / 60) : 0,
      isPaused: this.isPaused,
      pauseReason: this.pauseReason,
    };
  }

  /** Update config */
  setConfig(config: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Subscribe to transfer progress */
  onProgress(handler: TransferProgressHandler): () => void {
    this.progressHandlers.push(handler);
    return () => { this.progressHandlers = this.progressHandlers.filter(h => h !== handler); };
  }

  /** Clean up completed/cancelled transfers */
  cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThanMs;
    let cleaned = 0;
    for (const [id, t] of this.transfers) {
      if ((t.state === "completed" || t.state === "cancelled") &&
          t.completedAt && new Date(t.completedAt).getTime() < cutoff) {
        this.transfers.delete(id);
        cleaned++;
      }
    }
    return cleaned;
  }

  // ─── Internal ───────────────────────────────

  private processQueue(): void {
    if (this.isPaused) return;

    const active = this.getActiveTransfers();
    const activeUploads = active.filter(t => t.direction === "upload").length;
    const activeDownloads = active.filter(t => t.direction === "download").length;

    // Process queued/resuming transfers
    const pending = this.getQueuedTransfers()
      .sort((a, b) => this.priorityValue(a.priority) - this.priorityValue(b.priority));

    for (const transfer of pending) {
      const isUpload = transfer.direction === "upload";
      const currentActive = isUpload ? activeUploads : activeDownloads;
      const maxConcurrent = isUpload ? this.config.maxConcurrentUploads : this.config.maxConcurrentDownloads;

      if (currentActive >= maxConcurrent) continue;

      this.startTransfer(transfer);
    }
  }

  private startTransfer(transfer: ManagedTransfer): void {
    transfer.state = "active";
    transfer.startedAt = transfer.startedAt ?? new Date().toISOString();
    transfer.attemptCount++;

    // Simulate chunk progress
    this.simulateProgress(transfer);
  }

  private async simulateProgress(transfer: ManagedTransfer): Promise<void> {
    const bytesPerChunk = this.config.chunkSizeBytes;

    while (transfer.currentChunkIndex < transfer.totalChunks && transfer.state === "active") {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100));

      if (transfer.state !== "active") break;

      // Simulate 1% failure rate per chunk
      if (Math.random() < 0.01) {
        transfer.lastError = "Chunk transfer failed: timeout";
        if (transfer.attemptCount >= transfer.maxAttempts) {
          transfer.state = "failed";
          this.failedToday++;
        } else {
          transfer.state = "queued"; // Re-queue for retry
        }
        this.notifyProgress(transfer);
        return;
      }

      transfer.currentChunkIndex++;
      transfer.completedChunks++;
      transfer.transferredBytes = Math.min(transfer.completedChunks * bytesPerChunk, transfer.totalBytes);

      const elapsed = Date.now() - new Date(transfer.startedAt!).getTime();
      transfer.averageBytesPerSecond = elapsed > 0 ? Math.floor(transfer.transferredBytes / (elapsed / 1000)) : 0;
      const remaining = transfer.totalBytes - transfer.transferredBytes;
      transfer.estimatedTimeRemainingMs = transfer.averageBytesPerSecond > 0
        ? Math.floor(remaining / transfer.averageBytesPerSecond * 1000) : 0;

      this.notifyProgress(transfer);
    }

    if (transfer.state === "active" && transfer.completedChunks >= transfer.totalChunks) {
      transfer.state = "completed";
      transfer.completedAt = new Date().toISOString();
      transfer.transferredBytes = transfer.totalBytes;
      this.completedToday++;
      this.totalBytesTransferred += transfer.totalBytes;
      this.notifyProgress(transfer);
    }
  }

  private notifyProgress(transfer: ManagedTransfer): void {
    for (const handler of this.progressHandlers) handler(transfer);
  }

  private inferPriority(namespace: string): TransferPriority {
    if (namespace.startsWith("session.") || namespace.startsWith("device.presence")) return "critical";
    if (namespace.startsWith("settings.")) return "high";
    if (namespace.startsWith("files.documents")) return "medium";
    if (namespace.startsWith("files.photos") || namespace.startsWith("files.media")) return "low";
    return "medium";
  }

  private priorityValue(p: TransferPriority): number {
    switch (p) {
      case "critical": return 0;
      case "high": return 1;
      case "medium": return 2;
      case "low": return 3;
      case "background": return 4;
    }
  }
}

/** Singleton upload scheduler */
export const uploadScheduler = new UploadScheduler();
