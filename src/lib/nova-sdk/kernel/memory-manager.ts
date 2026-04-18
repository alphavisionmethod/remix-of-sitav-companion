// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Memory Manager
// Simulated page-based allocation with per-process accounting
// and virtual address space abstraction
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
  addressSpaces: number;
  pageTableSwitches: number;
}

// ── Address Space Abstraction ────────────────────────────────

export interface VirtualMapping {
  virtualStart: number;    // virtual page number
  physicalStart: number;   // physical page number
  pageCount: number;
  flags: MemoryFlags;
  label: string;
}

export interface AddressSpace {
  pid: number;
  pageTableRoot: number;       // simulated CR3 — PML4 base
  mappings: VirtualMapping[];
  heapStart: number;
  heapEnd: number;
  stackTop: number;
  stackBottom: number;
  createdAt: number;
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

  // Address space tracking
  private addressSpaces = new Map<number, AddressSpace>(); // pid → AddressSpace
  private nextPageTableRoot = 0x1000; // simulated PML4 base addresses
  private activeAddressSpace: number | null = null; // current CR3 (pid)
  private pageTableSwitches = 0;

  // ── Address Space Management ──────────────────────────────

  /** Create an isolated virtual address space for a process */
  createAddressSpace(pid: number): AddressSpace {
    const pageTableRoot = this.nextPageTableRoot;
    this.nextPageTableRoot += 0x1000; // each PML4 is 4KB-aligned

    const as: AddressSpace = {
      pid,
      pageTableRoot,
      mappings: [],
      heapStart: 0x600000,     // conventional heap start
      heapEnd: 0x600000,
      stackTop: 0x7FFFFFFFE000,
      stackBottom: 0x7FFFFFFFE000 - 0x200000, // 2MB stack
      createdAt: Date.now(),
    };

    this.addressSpaces.set(pid, as);
    console.log(`[Kernel:Memory] Created address space for PID ${pid} (CR3=0x${pageTableRoot.toString(16)})`);
    return as;
  }

  /** Simulate page table switch (like loading CR3) */
  switchAddressSpace(pid: number): boolean {
    const as = this.addressSpaces.get(pid);
    if (!as) {
      console.error(`[Kernel:Memory] No address space for PID ${pid}`);
      return false;
    }

    if (this.activeAddressSpace === pid) return true; // already active

    this.activeAddressSpace = pid;
    this.pageTableSwitches++;

    // In a real OS this would:
    // 1. Flush TLB (or use PCID to avoid flush)
    // 2. Load CR3 with new PML4 base
    // 3. INVLPG for specific pages if needed
    return true;
  }

  /** Get active address space */
  getActiveAddressSpace(): AddressSpace | null {
    if (this.activeAddressSpace === null) return null;
    return this.addressSpaces.get(this.activeAddressSpace) || null;
  }

  /** Add a virtual mapping to an address space */
  addMapping(pid: number, mapping: Omit<VirtualMapping, "physicalStart">): VirtualMapping | null {
    const as = this.addressSpaces.get(pid);
    if (!as) return null;

    // Allocate physical pages
    if (this.nextFreePage + mapping.pageCount > MAX_PAGES) return null;

    const fullMapping: VirtualMapping = {
      ...mapping,
      physicalStart: this.nextFreePage,
    };

    as.mappings.push(fullMapping);
    this.nextFreePage += mapping.pageCount;

    const current = this.processPages.get(pid) || 0;
    this.processPages.set(pid, current + mapping.pageCount);

    return fullMapping;
  }

  /** Destroy address space on process termination */
  destroyAddressSpace(pid: number): boolean {
    const as = this.addressSpaces.get(pid);
    if (!as) return false;

    // Free all virtual mappings' physical pages
    this.regions = this.regions.filter(r => r.pid !== pid);
    this.processPages.delete(pid);
    this.addressSpaces.delete(pid);

    if (this.activeAddressSpace === pid) {
      this.activeAddressSpace = null;
    }

    console.log(`[Kernel:Memory] Destroyed address space for PID ${pid}`);
    return true;
  }

  /** Get address space for a process */
  getAddressSpace(pid: number): AddressSpace | undefined {
    return this.addressSpaces.get(pid);
  }

  // ── Physical Page Allocation ──────────────────────────────

  /** Allocate pages for a process */
  allocate(pid: number, pageCount: number, opts?: { flags?: Partial<MemoryFlags>; label?: string; guardPages?: boolean }): MemoryRegion | null {
    if (pageCount <= 0) return null;

    const totalNeeded = pageCount + (opts?.guardPages ? 2 : 0);
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
      addressSpaces: this.addressSpaces.size,
      pageTableSwitches: this.pageTableSwitches,
    };
  }

  /** Check if utilization is at warning/critical thresholds */
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
    this.addressSpaces.clear();
    this.nextPageTableRoot = 0x1000;
    this.activeAddressSpace = null;
    this.pageTableSwitches = 0;
  }
}

export const MemoryManager = new MemoryManagerClass();
