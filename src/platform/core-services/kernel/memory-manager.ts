// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Virtual Memory Manager
// 4-level page tables, demand paging, CoW, SLAB/buddy allocators
// ═══════════════════════════════════════════════════════════════

// ── Page Table Structures ──────────────────────────────────────

export interface PageTableEntry {
  physicalFrame: number;
  present: boolean;
  writable: boolean;
  userAccessible: boolean;
  writeThrough: boolean;
  cacheDisabled: boolean;
  accessed: boolean;
  dirty: boolean;
  hugePageSize: "4KB" | "2MB" | "1GB";
  noExecute: boolean;
  copyOnWrite: boolean;
  // Protection keys (Intel PKU)
  protectionKey: number;
}

export interface PageTable {
  id: string;
  level: 4 | 3 | 2 | 1; // PML4 → PDPT → PD → PT
  entries: Map<number, PageTableEntry | PageTable>;
}

// ── Virtual Memory Area ────────────────────────────────────────

export type VMAPermission = "read" | "write" | "execute";
export type VMAType = "code" | "data" | "heap" | "stack" | "mmap" | "shared" | "guard" | "vdso";

export interface VirtualMemoryArea {
  id: string;
  startAddress: bigint;
  endAddress: bigint;
  permissions: Set<VMAPermission>;
  type: VMAType;
  backingFile?: string;
  offset: number;
  flags: {
    shared: boolean;
    anonymous: boolean;
    growsDown: boolean; // stack
    locked: boolean;
    dontFork: boolean;
  };
}

// ── Address Space ──────────────────────────────────────────────

export interface AddressSpace {
  pid: number;
  pml4: PageTable;
  vmas: VirtualMemoryArea[];
  totalMapped: number;
  totalResident: number;
  totalShared: number;
  pagesFaulted: number;
  cowPages: number;
}

// ── Physical Frame Allocator (Buddy System) ────────────────────

export class BuddyAllocator {
  private freeLists: Map<number, number[]> = new Map(); // order → [frame numbers]
  private totalFrames: number;
  private allocatedFrames = new Set<number>();

  constructor(totalMemoryMB: number) {
    this.totalFrames = (totalMemoryMB * 1024 * 1024) / 4096;
    // Initialize with max-order blocks
    const maxOrder = 10; // 4MB blocks
    for (let order = 0; order <= maxOrder; order++) {
      this.freeLists.set(order, []);
    }
    // All memory starts as max-order blocks
    const blocksAtMax = Math.floor(this.totalFrames / (1 << maxOrder));
    for (let i = 0; i < blocksAtMax; i++) {
      this.freeLists.get(maxOrder)!.push(i * (1 << maxOrder));
    }
  }

  allocate(order: number = 0): number | null {
    // Find smallest available block >= requested order
    for (let o = order; o <= 10; o++) {
      const list = this.freeLists.get(o)!;
      if (list.length > 0) {
        const frame = list.pop()!;
        // Split larger blocks
        for (let split = o - 1; split >= order; split--) {
          const buddy = frame + (1 << split);
          this.freeLists.get(split)!.push(buddy);
        }
        this.allocatedFrames.add(frame);
        return frame;
      }
    }
    return null; // OOM
  }

  free(frame: number, order: number = 0): void {
    this.allocatedFrames.delete(frame);
    // Try to merge with buddy
    let currentFrame = frame;
    let currentOrder = order;
    while (currentOrder < 10) {
      const buddy = currentFrame ^ (1 << currentOrder);
      const buddyList = this.freeLists.get(currentOrder)!;
      const buddyIdx = buddyList.indexOf(buddy);
      if (buddyIdx !== -1) {
        buddyList.splice(buddyIdx, 1);
        currentFrame = Math.min(currentFrame, buddy);
        currentOrder++;
      } else {
        break;
      }
    }
    this.freeLists.get(currentOrder)!.push(currentFrame);
  }

  getStats() {
    let freeFrames = 0;
    for (const [order, list] of this.freeLists) {
      freeFrames += list.length * (1 << order);
    }
    return {
      totalFrames: this.totalFrames,
      allocatedFrames: this.allocatedFrames.size,
      freeFrames,
      utilizationPercent: (this.allocatedFrames.size / this.totalFrames) * 100,
    };
  }
}

// ── SLAB Allocator (for kernel objects) ────────────────────────

export interface SlabCache {
  name: string;
  objectSize: number;
  objectsPerSlab: number;
  totalSlabs: number;
  freeObjects: number;
  allocatedObjects: number;
}

export class SlabAllocator {
  private caches = new Map<string, SlabCache>();

  createCache(name: string, objectSize: number): SlabCache {
    const objectsPerSlab = Math.floor(4096 / objectSize);
    const cache: SlabCache = {
      name,
      objectSize,
      objectsPerSlab,
      totalSlabs: 1,
      freeObjects: objectsPerSlab,
      allocatedObjects: 0,
    };
    this.caches.set(name, cache);
    return cache;
  }

  allocate(cacheName: string): boolean {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;
    if (cache.freeObjects === 0) {
      // Grow: add new slab
      cache.totalSlabs++;
      cache.freeObjects += cache.objectsPerSlab;
    }
    cache.freeObjects--;
    cache.allocatedObjects++;
    return true;
  }

  free(cacheName: string): boolean {
    const cache = this.caches.get(cacheName);
    if (!cache || cache.allocatedObjects === 0) return false;
    cache.freeObjects++;
    cache.allocatedObjects--;
    return true;
  }

  getStats(): SlabCache[] {
    return Array.from(this.caches.values());
  }
}

// ── OOM Policy ─────────────────────────────────────────────────

export type OOMAction = "kill-lowest-batch" | "kill-largest" | "deny-allocation" | "compress";

export interface OOMPolicy {
  thresholdPercent: number;
  warningPercent: number;
  actions: OOMAction[];
  protectedPids: Set<number>; // Never kill (init, security monitor)
  neverKillBands: number[];   // RT-Critical processes immune
}

// ── Memory Manager ─────────────────────────────────────────────

export class MemoryManager {
  readonly buddy: BuddyAllocator;
  readonly slab: SlabAllocator;
  private addressSpaces = new Map<number, AddressSpace>();
  private oomPolicy: OOMPolicy;
  private _pageFaultCount = 0;
  private _cowFaultCount = 0;

  constructor(totalMemoryMB = 8192) {
    this.buddy = new BuddyAllocator(totalMemoryMB);
    this.slab = new SlabAllocator();

    // Initialize standard SLAB caches
    this.slab.createCache("pcb", 512);
    this.slab.createCache("thread", 256);
    this.slab.createCache("vma", 128);
    this.slab.createCache("page-table-entry", 64);
    this.slab.createCache("ipc-message", 256);
    this.slab.createCache("file-descriptor", 64);
    this.slab.createCache("capability-token", 128);

    this.oomPolicy = {
      thresholdPercent: 95,
      warningPercent: 85,
      actions: ["compress", "kill-lowest-batch", "kill-largest"],
      protectedPids: new Set([1]), // init
      neverKillBands: [0, 1],      // RT-Critical, RT-Normal
    };
  }

  // ── Address Space Management ─────────────────────────────────

  createAddressSpace(pid: number): AddressSpace {
    const pml4: PageTable = { id: `pml4-${pid}`, level: 4, entries: new Map() };
    const space: AddressSpace = {
      pid,
      pml4,
      vmas: [],
      totalMapped: 0,
      totalResident: 0,
      totalShared: 0,
      pagesFaulted: 0,
      cowPages: 0,
    };
    this.addressSpaces.set(pid, space);
    this.slab.allocate("vma");
    return space;
  }

  destroyAddressSpace(pid: number): boolean {
    const space = this.addressSpaces.get(pid);
    if (!space) return false;
    // Free all resident pages
    this.addressSpaces.delete(pid);
    return true;
  }

  // ── Memory Mapping ───────────────────────────────────────────

  mmap(pid: number, size: number, perms: VMAPermission[], type: VMAType, opts?: {
    shared?: boolean;
    backingFile?: string;
    fixed?: bigint;
  }): VirtualMemoryArea | null {
    const space = this.addressSpaces.get(pid);
    if (!space) return null;

    const pages = Math.ceil(size / 4096);
    const startAddr = opts?.fixed ?? BigInt(space.vmas.length * 0x10000 + 0x400000);

    const vma: VirtualMemoryArea = {
      id: `vma-${pid}-${space.vmas.length}`,
      startAddress: startAddr,
      endAddress: startAddr + BigInt(pages * 4096),
      permissions: new Set(perms),
      type,
      backingFile: opts?.backingFile,
      offset: 0,
      flags: {
        shared: opts?.shared ?? false,
        anonymous: !opts?.backingFile,
        growsDown: type === "stack",
        locked: false,
        dontFork: false,
      },
    };

    space.vmas.push(vma);
    space.totalMapped += pages * 4096;
    return vma;
  }

  munmap(pid: number, vmaId: string): boolean {
    const space = this.addressSpaces.get(pid);
    if (!space) return false;
    const idx = space.vmas.findIndex(v => v.id === vmaId);
    if (idx === -1) return false;
    space.vmas.splice(idx, 1);
    return true;
  }

  mprotect(pid: number, vmaId: string, newPerms: VMAPermission[]): boolean {
    const space = this.addressSpaces.get(pid);
    if (!space) return false;
    const vma = space.vmas.find(v => v.id === vmaId);
    if (!vma) return false;
    vma.permissions = new Set(newPerms);
    return true;
  }

  // ── Page Fault Handling ──────────────────────────────────────

  handlePageFault(pid: number, address: bigint, isWrite: boolean): {
    handled: boolean;
    action: "demand-page" | "cow-copy" | "segfault" | "guard-page";
  } {
    this._pageFaultCount++;
    const space = this.addressSpaces.get(pid);
    if (!space) return { handled: false, action: "segfault" };

    const vma = space.vmas.find(v => address >= v.startAddress && address < v.endAddress);
    if (!vma) return { handled: false, action: "segfault" };

    // Guard page hit
    if (vma.type === "guard") return { handled: false, action: "guard-page" };

    // Write to CoW page
    if (isWrite && !vma.permissions.has("write")) {
      // Check if CoW is applicable
      this._cowFaultCount++;
      space.cowPages++;
      const frame = this.buddy.allocate();
      if (frame !== null) {
        space.pagesFaulted++;
        space.totalResident += 4096;
        return { handled: true, action: "cow-copy" };
      }
      return { handled: false, action: "segfault" };
    }

    // Demand page
    const frame = this.buddy.allocate();
    if (frame !== null) {
      space.pagesFaulted++;
      space.totalResident += 4096;
      return { handled: true, action: "demand-page" };
    }

    return { handled: false, action: "segfault" };
  }

  // ── Fork with CoW ────────────────────────────────────────────

  forkAddressSpace(parentPid: number, childPid: number): AddressSpace | null {
    const parent = this.addressSpaces.get(parentPid);
    if (!parent) return null;

    const child = this.createAddressSpace(childPid);
    // Copy VMAs with CoW semantics — no physical pages copied
    for (const vma of parent.vmas) {
      child.vmas.push({
        ...vma,
        id: vma.id.replace(`${parentPid}`, `${childPid}`),
        permissions: new Set(vma.permissions),
        flags: { ...vma.flags },
      });
      // Mark writable pages as CoW in both parent and child
      if (vma.permissions.has("write") && !vma.flags.shared) {
        parent.cowPages++;
        child.cowPages++;
      }
    }
    child.totalMapped = parent.totalMapped;
    return child;
  }

  // ── Stats ────────────────────────────────────────────────────

  getStats() {
    const buddyStats = this.buddy.getStats();
    const slabStats = this.slab.getStats();
    return {
      physical: buddyStats,
      slabCaches: slabStats,
      addressSpaces: this.addressSpaces.size,
      totalPageFaults: this._pageFaultCount,
      totalCowFaults: this._cowFaultCount,
      oomPolicy: {
        threshold: this.oomPolicy.thresholdPercent,
        warning: this.oomPolicy.warningPercent,
      },
    };
  }

  getAddressSpace(pid: number): AddressSpace | undefined {
    return this.addressSpaces.get(pid);
  }
}
