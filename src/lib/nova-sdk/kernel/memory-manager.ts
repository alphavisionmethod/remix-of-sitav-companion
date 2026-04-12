// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Memory Manager
// Simulated page-based allocation with per-process accounting
// ═══════════════════════════════════════════════════════════════

export const PAGE_SIZE = 4096; // 4KB — matches kernel-architecture-manifest.json
const MAX_PAGES = 262144;      // 1GB total simulated physical memory

export interface MemoryRegion {
  pid: number;
  startPage: number;
  pageCount: number;
  flags: MemoryFlags;
  label?: string;
}

export interface MemoryFlags {
  readable: boolean;
  writable: boolean;
  executable: boolean;
  guard: boolean;       // guard page — triggers fault on access
  copyOnWrite: boolean;
}

export interface MemoryStats {
  totalPages: number;
  allocatedPages: number;
  freePages: number;
  utilizationPercent: number;
  processCount: number;
  regions: number;
  guardPages: number;
}

const DEFAULT_FLAGS: MemoryFlags = {
  readable: true,
  writable: true,
  executable: false,
  guard: false,
  copyOnWrite: false,
};

class MemoryManagerClass {
  private regions: MemoryRegion[] = [];
  private nextFreePage = 0;
  private processPages = new Map<number, number>(); // pid → total pages

  /** Allocate pages for a process */
  allocate(pid: number, pageCount: number, opts?: { flags?: Partial<MemoryFlags>; label?: string; guardPages?: boolean }): MemoryRegion | null {
    if (pageCount <= 0) return null;

    const totalNeeded = pageCount + (opts?.guardPages ? 2 : 0); // guard pages before + after
    if (this.nextFreePage + totalNeeded > MAX_PAGES) {
      console.error(`[Kernel:Memory] OOM — cannot allocate ${totalNeeded} pages (free: ${MAX_PAGES - this.nextFreePage})`);
      return null;
    }

    // Insert leading guard page
    if (opts?.guardPages) {
      this.regions.push({
        pid,
        startPage: this.nextFreePage,
        pageCount: 1,
        flags: { ...DEFAULT_FLAGS, readable: false, writable: false, guard: true },
        label: `guard:${opts.label || "anon"}:start`,
      });
      this.nextFreePage += 1;
    }

    const region: MemoryRegion = {
      pid,
      startPage: this.nextFreePage,
      pageCount,
      flags: { ...DEFAULT_FLAGS, ...opts?.flags },
      label: opts?.label,
    };

    this.regions.push(region);
    this.nextFreePage += pageCount;

    // Insert trailing guard page
    if (opts?.guardPages) {
      this.regions.push({
        pid,
        startPage: this.nextFreePage,
        pageCount: 1,
        flags: { ...DEFAULT_FLAGS, readable: false, writable: false, guard: true },
        label: `guard:${opts.label || "anon"}:end`,
      });
      this.nextFreePage += 1;
    }

    // Track per-process usage
    const current = this.processPages.get(pid) || 0;
    this.processPages.set(pid, current + pageCount);

    console.log(`[Kernel:Memory] Allocated ${pageCount} pages (${(pageCount * PAGE_SIZE / 1024).toFixed(0)}KB) for PID ${pid}${opts?.label ? ` [${opts.label}]` : ""}`);
    return region;
  }

  /** Free all memory for a process */
  free(pid: number): number {
    const before = this.regions.length;
    this.regions = this.regions.filter(r => r.pid !== pid);
    this.processPages.delete(pid);
    const freed = before - this.regions.length;
    if (freed > 0) {
      console.log(`[Kernel:Memory] Freed ${freed} regions for PID ${pid}`);
    }
    return freed;
  }

  /** Get memory usage for a specific process */
  getUsage(pid: number): { pages: number; bytes: number; regions: MemoryRegion[] } {
    const procRegions = this.regions.filter(r => r.pid === pid && !r.flags.guard);
    const pages = this.processPages.get(pid) || 0;
    return { pages, bytes: pages * PAGE_SIZE, regions: procRegions };
  }

  /** Get global memory statistics */
  getStats(): MemoryStats {
    const allocatedPages = Array.from(this.processPages.values()).reduce((s, p) => s + p, 0);
    const guardPages = this.regions.filter(r => r.flags.guard).length;
    return {
      totalPages: MAX_PAGES,
      allocatedPages,
      freePages: MAX_PAGES - this.nextFreePage,
      utilizationPercent: (this.nextFreePage / MAX_PAGES) * 100,
      processCount: this.processPages.size,
      regions: this.regions.length,
      guardPages,
    };
  }

  /** Check if utilization is at warning/critical thresholds (from MEMORY_ARCHITECTURE.md) */
  checkPressure(): "normal" | "warning" | "critical" {
    const util = (this.nextFreePage / MAX_PAGES) * 100;
    if (util >= 95) return "critical";
    if (util >= 85) return "warning";
    return "normal";
  }

  /** Reset all memory (kernel shutdown) */
  reset(): void {
    this.regions = [];
    this.processPages.clear();
    this.nextFreePage = 0;
  }
}

export const MemoryManager = new MemoryManagerClass();
