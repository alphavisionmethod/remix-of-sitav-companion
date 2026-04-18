// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Surface Buffer Allocator
// Manages GPU/CPU surface memory allocation, buffer pools,
// double/triple buffering, format negotiation, and DMA-BUF.
// ═══════════════════════════════════════════════════════════════

// ── Surface Format ────────────────────────────────────────────

export type SurfacePixelFormat = "argb8888" | "xrgb8888" | "rgba8888" | "rgb888" | "rgb565" | "rgba16f" | "rgba32f";
export type SurfaceMemoryType = "cpu" | "gpu" | "dma-buf" | "shared";
export type BufferingMode = "single" | "double" | "triple";
export type AllocationStrategy = "pool" | "on-demand" | "slab";

// ── Surface Buffer ────────────────────────────────────────────

export interface SurfaceAllocation {
  id: string;
  width: number;
  height: number;
  format: SurfacePixelFormat;
  stride: number;            // bytes per row
  size: number;              // total bytes
  memoryType: SurfaceMemoryType;
  alignment: number;         // cache line alignment
  // Lifecycle
  inUse: boolean;
  ownerId: string | null;    // surface or window ID
  poolId: string | null;
  // DMA-BUF
  dmaBufFd: number | null;
  dmaBufOffset: number;
  dmaBufModifier: bigint | null;  // format modifier
  // Timing
  allocatedAt: number;
  lastUsedAt: number;
}

// ── Buffer Pool ───────────────────────────────────────────────

export interface BufferPool {
  id: string;
  name: string;
  format: SurfacePixelFormat;
  width: number;
  height: number;
  memoryType: SurfaceMemoryType;
  bufferingMode: BufferingMode;
  maxBuffers: number;
  bufferIds: string[];
  freeBufferIds: string[];
  hitCount: number;
  missCount: number;
  createdAt: number;
}

// ── Format Capabilities ───────────────────────────────────────

export interface FormatCapability {
  format: SurfacePixelFormat;
  bitsPerPixel: number;
  hasAlpha: boolean;
  isFloat: boolean;
  supportsBlend: boolean;
  supportsSampling: boolean;
  supportsRenderTarget: boolean;
  supportsScanout: boolean;
  memoryTypes: SurfaceMemoryType[];
}

const FORMAT_CAPS: Record<SurfacePixelFormat, FormatCapability> = {
  argb8888: { format: "argb8888", bitsPerPixel: 32, hasAlpha: true, isFloat: false, supportsBlend: true, supportsSampling: true, supportsRenderTarget: true, supportsScanout: true, memoryTypes: ["cpu", "gpu", "dma-buf", "shared"] },
  xrgb8888: { format: "xrgb8888", bitsPerPixel: 32, hasAlpha: false, isFloat: false, supportsBlend: false, supportsSampling: true, supportsRenderTarget: true, supportsScanout: true, memoryTypes: ["cpu", "gpu", "dma-buf", "shared"] },
  rgba8888: { format: "rgba8888", bitsPerPixel: 32, hasAlpha: true, isFloat: false, supportsBlend: true, supportsSampling: true, supportsRenderTarget: true, supportsScanout: true, memoryTypes: ["cpu", "gpu", "dma-buf", "shared"] },
  rgb888:   { format: "rgb888", bitsPerPixel: 24, hasAlpha: false, isFloat: false, supportsBlend: false, supportsSampling: true, supportsRenderTarget: false, supportsScanout: false, memoryTypes: ["cpu", "shared"] },
  rgb565:   { format: "rgb565", bitsPerPixel: 16, hasAlpha: false, isFloat: false, supportsBlend: false, supportsSampling: true, supportsRenderTarget: false, supportsScanout: true, memoryTypes: ["cpu", "gpu"] },
  rgba16f:  { format: "rgba16f", bitsPerPixel: 64, hasAlpha: true, isFloat: true, supportsBlend: true, supportsSampling: true, supportsRenderTarget: true, supportsScanout: false, memoryTypes: ["gpu", "dma-buf"] },
  rgba32f:  { format: "rgba32f", bitsPerPixel: 128, hasAlpha: true, isFloat: true, supportsBlend: true, supportsSampling: true, supportsRenderTarget: true, supportsScanout: false, memoryTypes: ["gpu"] },
};

// ── Allocator Stats ───────────────────────────────────────────

export interface SurfaceAllocatorStats {
  totalAllocations: number;
  activeAllocations: number;
  totalBytes: number;
  activeBytes: number;
  poolCount: number;
  poolHitRate: number;
  cpuAllocations: number;
  gpuAllocations: number;
  dmaBufAllocations: number;
  peakBytes: number;
  formatsInUse: SurfacePixelFormat[];
}

// ── Surface Allocator Implementation ──────────────────────────

export class SurfaceAllocator {
  private allocations: Map<string, SurfaceAllocation> = new Map();
  private pools: Map<string, BufferPool> = new Map();
  private nextId = 1;
  private nextFd = 100;
  private totalAllocatedBytes = 0;
  private peakBytes = 0;
  private poolHits = 0;
  private poolMisses = 0;

  // ── Allocation ────────────────────────────────────────────

  allocate(config: {
    width: number; height: number; format: SurfacePixelFormat;
    memoryType?: SurfaceMemoryType; ownerId?: string;
    alignment?: number;
  }): SurfaceAllocation {
    const format = config.format;
    const caps = FORMAT_CAPS[format];
    const memType = config.memoryType ?? "cpu";
    if (!caps.memoryTypes.includes(memType)) {
      throw new Error(`Format ${format} does not support memory type ${memType}`);
    }

    const alignment = config.alignment ?? 64; // Cache-line aligned
    const bytesPerPixel = caps.bitsPerPixel / 8;
    const rawStride = config.width * bytesPerPixel;
    const stride = Math.ceil(rawStride / alignment) * alignment;
    const size = stride * config.height;

    const alloc: SurfaceAllocation = {
      id: `alloc-${this.nextId++}`,
      width: config.width, height: config.height,
      format, stride, size, memoryType: memType,
      alignment, inUse: true,
      ownerId: config.ownerId ?? null, poolId: null,
      dmaBufFd: memType === "dma-buf" ? this.nextFd++ : null,
      dmaBufOffset: 0, dmaBufModifier: null,
      allocatedAt: Date.now(), lastUsedAt: Date.now(),
    };

    this.allocations.set(alloc.id, alloc);
    this.totalAllocatedBytes += size;
    this.peakBytes = Math.max(this.peakBytes, this.getActiveBytes());
    return alloc;
  }

  free(id: string): boolean {
    const alloc = this.allocations.get(id);
    if (!alloc) return false;

    // Return to pool if pooled
    if (alloc.poolId) {
      const pool = this.pools.get(alloc.poolId);
      if (pool) {
        alloc.inUse = false;
        alloc.ownerId = null;
        pool.freeBufferIds.push(id);
        return true;
      }
    }

    this.allocations.delete(id);
    return true;
  }

  // ── Buffer Pool Management ────────────────────────────────

  createPool(config: {
    name: string; format: SurfacePixelFormat;
    width: number; height: number;
    memoryType?: SurfaceMemoryType;
    bufferingMode?: BufferingMode;
    preAllocate?: number;
  }): BufferPool {
    const id = `pool-${this.nextId++}`;
    const mode = config.bufferingMode ?? "double";
    const maxBuffers = mode === "single" ? 1 : mode === "double" ? 2 : 3;
    const pool: BufferPool = {
      id, name: config.name, format: config.format,
      width: config.width, height: config.height,
      memoryType: config.memoryType ?? "cpu",
      bufferingMode: mode, maxBuffers,
      bufferIds: [], freeBufferIds: [],
      hitCount: 0, missCount: 0, createdAt: Date.now(),
    };

    // Pre-allocate buffers
    const preAlloc = config.preAllocate ?? maxBuffers;
    for (let i = 0; i < Math.min(preAlloc, maxBuffers); i++) {
      const alloc = this.allocate({
        width: config.width, height: config.height,
        format: config.format, memoryType: pool.memoryType,
      });
      alloc.poolId = id;
      alloc.inUse = false;
      pool.bufferIds.push(alloc.id);
      pool.freeBufferIds.push(alloc.id);
    }

    this.pools.set(id, pool);
    return pool;
  }

  acquireFromPool(poolId: string, ownerId?: string): SurfaceAllocation | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    // Try free buffer
    if (pool.freeBufferIds.length > 0) {
      const allocId = pool.freeBufferIds.shift()!;
      const alloc = this.allocations.get(allocId);
      if (alloc) {
        alloc.inUse = true;
        alloc.ownerId = ownerId ?? null;
        alloc.lastUsedAt = Date.now();
        pool.hitCount++;
        this.poolHits++;
        return alloc;
      }
    }

    // Allocate new if under max
    if (pool.bufferIds.length < pool.maxBuffers) {
      const alloc = this.allocate({
        width: pool.width, height: pool.height,
        format: pool.format, memoryType: pool.memoryType,
        ownerId,
      });
      alloc.poolId = poolId;
      pool.bufferIds.push(alloc.id);
      pool.missCount++;
      this.poolMisses++;
      return alloc;
    }

    pool.missCount++;
    this.poolMisses++;
    return null;
  }

  releaseToPool(allocId: string): boolean {
    const alloc = this.allocations.get(allocId);
    if (!alloc || !alloc.poolId) return false;
    const pool = this.pools.get(alloc.poolId);
    if (!pool) return false;
    alloc.inUse = false;
    alloc.ownerId = null;
    if (!pool.freeBufferIds.includes(allocId)) {
      pool.freeBufferIds.push(allocId);
    }
    return true;
  }

  destroyPool(poolId: string): boolean {
    const pool = this.pools.get(poolId);
    if (!pool) return false;
    for (const bufId of pool.bufferIds) {
      const alloc = this.allocations.get(bufId);
      if (alloc) alloc.poolId = null;
      this.allocations.delete(bufId);
    }
    this.pools.delete(poolId);
    return true;
  }

  // ── Format Negotiation ────────────────────────────────────

  getFormatCapabilities(format: SurfacePixelFormat): FormatCapability {
    return FORMAT_CAPS[format];
  }

  getSupportedFormats(memoryType?: SurfaceMemoryType): SurfacePixelFormat[] {
    return Object.entries(FORMAT_CAPS)
      .filter(([_, caps]) => !memoryType || caps.memoryTypes.includes(memoryType))
      .map(([fmt]) => fmt as SurfacePixelFormat);
  }

  negotiateFormat(requirements: {
    needsAlpha?: boolean; needsFloat?: boolean;
    needsBlend?: boolean; needsScanout?: boolean;
    memoryType?: SurfaceMemoryType;
  }): SurfacePixelFormat | null {
    for (const [fmt, caps] of Object.entries(FORMAT_CAPS)) {
      if (requirements.needsAlpha && !caps.hasAlpha) continue;
      if (requirements.needsFloat && !caps.isFloat) continue;
      if (requirements.needsBlend && !caps.supportsBlend) continue;
      if (requirements.needsScanout && !caps.supportsScanout) continue;
      if (requirements.memoryType && !caps.memoryTypes.includes(requirements.memoryType)) continue;
      return fmt as SurfacePixelFormat;
    }
    return null;
  }

  // ── Queries ───────────────────────────────────────────────

  getAllocation(id: string): SurfaceAllocation | undefined { return this.allocations.get(id); }
  getPool(id: string): BufferPool | undefined { return this.pools.get(id); }
  listPools(): BufferPool[] { return Array.from(this.pools.values()); }

  private getActiveBytes(): number {
    let total = 0;
    for (const a of this.allocations.values()) {
      if (a.inUse) total += a.size;
    }
    return total;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): SurfaceAllocatorStats {
    const active = Array.from(this.allocations.values()).filter(a => a.inUse);
    const formatsInUse = [...new Set(active.map(a => a.format))];
    const totalHits = this.poolHits + this.poolMisses;
    return {
      totalAllocations: this.allocations.size,
      activeAllocations: active.length,
      totalBytes: this.totalAllocatedBytes,
      activeBytes: active.reduce((s, a) => s + a.size, 0),
      poolCount: this.pools.size,
      poolHitRate: totalHits > 0 ? this.poolHits / totalHits : 0,
      cpuAllocations: active.filter(a => a.memoryType === "cpu").length,
      gpuAllocations: active.filter(a => a.memoryType === "gpu").length,
      dmaBufAllocations: active.filter(a => a.memoryType === "dma-buf").length,
      peakBytes: this.peakBytes,
      formatsInUse,
    };
  }
}
