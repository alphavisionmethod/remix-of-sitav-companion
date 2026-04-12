// ═══════════════════════════════════════════════════════════════
// SITA OS — SitaFS: Copy-on-Write Filesystem + VFS Layer
// B-tree structure, journaling, snapshots, integrity checksums
// ═══════════════════════════════════════════════════════════════

// ── Inode & Block Structures ───────────────────────────────────

export type FileType = "regular" | "directory" | "symlink" | "device" | "fifo" | "socket";
export type CompressionAlgo = "none" | "lz4" | "zstd";

export interface Inode {
  id: number;
  type: FileType;
  size: number;
  blocks: number[];       // Direct block pointers
  indirectBlock: number | null;
  doubleIndirectBlock: number | null;
  permissions: number;    // Unix-style octal
  uid: number;
  gid: number;
  linkCount: number;
  createdAt: number;
  modifiedAt: number;
  accessedAt: number;
  checksumSHA256: string;
  compression: CompressionAlgo;
  flags: {
    immutable: boolean;
    appendOnly: boolean;
    encrypted: boolean;
    copyOnWrite: boolean;
    noAtime: boolean;
  };
  extendedAttributes: Map<string, string>;
}

export interface DirectoryEntry {
  name: string;
  inodeId: number;
  type: FileType;
}

export interface Block {
  id: number;
  data: Uint8Array;
  refCount: number; // For CoW — shared blocks have refCount > 1
  checksum: string;
}

// ── Journal ────────────────────────────────────────────────────

export type JournalOp = "create" | "write" | "delete" | "rename" | "chmod" | "snapshot" | "mount";

export interface JournalEntry {
  txId: number;
  timestamp: number;
  operation: JournalOp;
  inodeId: number;
  metadata: Record<string, unknown>;
  committed: boolean;
  checksum: string;
}

// ── Snapshot ───────────────────────────────────────────────────

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  rootInodeId: number;
  blockMap: Map<number, number>; // virtual block → physical block at snapshot time
  readOnly: boolean;
  sizeBytes: number;
}

// ── VFS Mount ──────────────────────────────────────────────────

export type FilesystemType = "sitafs" | "ext4" | "fat32" | "tmpfs" | "procfs" | "sysfs" | "devfs";

export interface MountPoint {
  id: string;
  path: string;
  fsType: FilesystemType;
  device: string;
  options: {
    readOnly: boolean;
    noExec: boolean;
    noSuid: boolean;
    noAtime: boolean;
  };
  mountedAt: number;
}

// ── SitaFS Implementation ──────────────────────────────────────

// ── Version History ─────────────────────────────────────────────

export interface FileVersion {
  versionId: string;
  inodeId: number;
  timestamp: number;
  size: number;
  blockData: Uint8Array[]; // Stored block data for this version
  checksum: string;
}

// ── Write Batch ────────────────────────────────────────────────

export interface WriteBatchItem {
  inodeId: number;
  data: Uint8Array;
}

export class WriteBatch {
  private items: WriteBatchItem[] = [];
  private fs: SitaFilesystem;

  constructor(fs: SitaFilesystem) {
    this.fs = fs;
  }

  add(inodeId: number, data: Uint8Array): void {
    this.items.push({ inodeId, data });
  }

  flush(): boolean {
    // Apply all writes, then emit a single batch journal entry
    for (const item of this.items) {
      this.fs.writeFileInternal(item.inodeId, item.data);
    }
    this.fs.journalWritePublic("write", 0, {
      batchSize: this.items.length,
      inodes: this.items.map((i) => i.inodeId),
      type: "batch-flush",
    });
    this.items = [];
    return true;
  }
}

// ── Integrity Check Result ─────────────────────────────────────

export interface IntegrityCheckResult {
  valid: boolean;
  totalBlocks: number;
  checkedBlocks: number;
  corruptedBlocks: number[];
  orphanBlocks: number[];
  directoryErrors: string[];
  durationMs: number;
}

// ── Journal Replay Result ──────────────────────────────────────

export interface JournalReplayResult {
  replayed: number;
  rolledBack: number;
  errors: string[];
}

// ── Crash Recovery Result ──────────────────────────────────────

export interface CrashRecoveryResult {
  journalResult: JournalReplayResult;
  integrityResult: IntegrityCheckResult;
  recoveryTimeMs: number;
}

// ── SitaFS Implementation ──────────────────────────────────────

export class SitaFilesystem {
  private inodes = new Map<number, Inode>();
  private blocks = new Map<number, Block>();
  private directories = new Map<number, DirectoryEntry[]>();
  private journal: JournalEntry[] = [];
  private snapshots = new Map<string, Snapshot>();
  private versionHistory = new Map<number, FileVersion[]>(); // inode → versions
  private nextInodeId = 1;
  private nextBlockId = 1;
  private nextTxId = 1;
  private maxVersions = 10;
  constructor() {
    // Create root inode
    this.createInode("directory", 0o755, 0, 0);
    this.directories.set(1, []);
  }

  // ── File Operations ──────────────────────────────────────────

  createFile(parentInodeId: number, name: string, permissions = 0o644, uid = 0, gid = 0): Inode | null {
    const parent = this.inodes.get(parentInodeId);
    if (!parent || parent.type !== "directory") return null;

    const inode = this.createInode("regular", permissions, uid, gid);
    this.addDirectoryEntry(parentInodeId, { name, inodeId: inode.id, type: "regular" });
    this.journalWrite("create", inode.id, { name, parentInodeId });
    return inode;
  }

  createDirectory(parentInodeId: number, name: string, permissions = 0o755, uid = 0, gid = 0): Inode | null {
    const parent = this.inodes.get(parentInodeId);
    if (!parent || parent.type !== "directory") return null;

    const inode = this.createInode("directory", permissions, uid, gid);
    this.directories.set(inode.id, []);
    this.addDirectoryEntry(parentInodeId, { name, inodeId: inode.id, type: "directory" });
    this.journalWrite("create", inode.id, { name, parentInodeId, isDirectory: true });
    return inode;
  }

  writeFile(inodeId: number, data: Uint8Array): boolean {
    const inode = this.inodes.get(inodeId);
    if (!inode || inode.type !== "regular") return false;
    if (inode.flags.immutable) return false;

    // CoW: if blocks are shared, allocate new ones
    const newBlocks: number[] = [];
    const chunkSize = 4096;
    for (let offset = 0; offset < data.length; offset += chunkSize) {
      const chunk = data.slice(offset, offset + chunkSize);
      const block = this.allocateBlock(chunk);
      newBlocks.push(block.id);
    }

    // Dereference old blocks
    for (const blockId of inode.blocks) {
      this.dereferenceBlock(blockId);
    }

    inode.blocks = newBlocks;
    inode.size = data.length;
    inode.modifiedAt = Date.now();
    inode.checksumSHA256 = this.computeChecksum(data);

    this.journalWrite("write", inodeId, { size: data.length, blocks: newBlocks.length });
    return true;
  }

  readFile(inodeId: number): Uint8Array | null {
    const inode = this.inodes.get(inodeId);
    if (!inode || inode.type !== "regular") return null;

    inode.accessedAt = Date.now();
    // Reconstruct data from blocks
    const chunks: Uint8Array[] = [];
    for (const blockId of inode.blocks) {
      const block = this.blocks.get(blockId);
      if (!block) return null;
      // Verify integrity
      if (block.checksum !== this.computeChecksum(block.data)) {
        console.error(`[SitaFS] Block ${blockId} integrity check failed`);
        return null;
      }
      chunks.push(block.data);
    }

    const result = new Uint8Array(inode.size);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk.slice(0, Math.min(chunk.length, inode.size - offset)), offset);
      offset += chunk.length;
    }
    return result;
  }

  deleteFile(parentInodeId: number, name: string): boolean {
    const entries = this.directories.get(parentInodeId);
    if (!entries) return false;

    const idx = entries.findIndex(e => e.name === name);
    if (idx === -1) return false;

    const entry = entries[idx];
    const inode = this.inodes.get(entry.inodeId);
    if (!inode) return false;

    inode.linkCount--;
    if (inode.linkCount <= 0) {
      // Free blocks
      for (const blockId of inode.blocks) {
        this.dereferenceBlock(blockId);
      }
      this.inodes.delete(entry.inodeId);
    }

    entries.splice(idx, 1);
    this.journalWrite("delete", entry.inodeId, { name, parentInodeId });
    return true;
  }

  rename(oldParent: number, oldName: string, newParent: number, newName: string): boolean {
    const oldEntries = this.directories.get(oldParent);
    if (!oldEntries) return false;

    const idx = oldEntries.findIndex(e => e.name === oldName);
    if (idx === -1) return false;

    const entry = { ...oldEntries[idx], name: newName };
    oldEntries.splice(idx, 1);
    this.addDirectoryEntry(newParent, entry);
    this.journalWrite("rename", entry.inodeId, { oldName, newName, oldParent, newParent });
    return true;
  }

  // ── Snapshots ────────────────────────────────────────────────

  createSnapshot(name: string): Snapshot {
    const blockMap = new Map<number, number>();
    // Increment refcount on all blocks (CoW — shared with snapshot)
    for (const [id, block] of this.blocks) {
      block.refCount++;
      blockMap.set(id, id);
    }

    const snapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      name,
      createdAt: Date.now(),
      rootInodeId: 1,
      blockMap,
      readOnly: true,
      sizeBytes: 0, // Snapshots are nearly free due to CoW
    };

    this.snapshots.set(snapshot.id, snapshot);
    this.journalWrite("snapshot", 0, { snapshotId: snapshot.id, name });
    return snapshot;
  }

  listSnapshots(): Snapshot[] {
    return Array.from(this.snapshots.values());
  }

  // ── Directory Listing ────────────────────────────────────────

  listDirectory(inodeId: number): DirectoryEntry[] | null {
    return this.directories.get(inodeId) ?? null;
  }

  stat(inodeId: number): Inode | undefined {
    return this.inodes.get(inodeId);
  }

  // ── Stats ────────────────────────────────────────────────────

  getStats() {
    return {
      totalInodes: this.inodes.size,
      totalBlocks: this.blocks.size,
      journalEntries: this.journal.length,
      snapshots: this.snapshots.size,
      totalDataBytes: Array.from(this.blocks.values()).reduce((sum, b) => sum + b.data.length, 0),
    };
  }

  getJournal(): JournalEntry[] {
    return [...this.journal];
  }

  // ── Internal ─────────────────────────────────────────────────

  private createInode(type: FileType, permissions: number, uid: number, gid: number): Inode {
    const id = this.nextInodeId++;
    const now = Date.now();
    const inode: Inode = {
      id, type, size: 0, blocks: [],
      indirectBlock: null, doubleIndirectBlock: null,
      permissions, uid, gid, linkCount: 1,
      createdAt: now, modifiedAt: now, accessedAt: now,
      checksumSHA256: "",
      compression: "none",
      flags: { immutable: false, appendOnly: false, encrypted: false, copyOnWrite: true, noAtime: false },
      extendedAttributes: new Map(),
    };
    this.inodes.set(id, inode);
    return inode;
  }

  private allocateBlock(data: Uint8Array): Block {
    const id = this.nextBlockId++;
    const block: Block = {
      id,
      data: new Uint8Array(data),
      refCount: 1,
      checksum: this.computeChecksum(data),
    };
    this.blocks.set(id, block);
    return block;
  }

  private dereferenceBlock(blockId: number): void {
    const block = this.blocks.get(blockId);
    if (!block) return;
    block.refCount--;
    if (block.refCount <= 0) {
      this.blocks.delete(blockId);
    }
  }

  private addDirectoryEntry(parentInodeId: number, entry: DirectoryEntry): void {
    let entries = this.directories.get(parentInodeId);
    if (!entries) {
      entries = [];
      this.directories.set(parentInodeId, entries);
    }
    entries.push(entry);
  }

  private journalWrite(op: JournalOp, inodeId: number, metadata: Record<string, unknown>): void {
    const entry: JournalEntry = {
      txId: this.nextTxId++,
      timestamp: Date.now(),
      operation: op,
      inodeId,
      metadata,
      committed: true,
      checksum: `tx-${this.nextTxId}`,
    };
    this.journal.push(entry);
    // Keep journal bounded
    if (this.journal.length > 10000) {
      this.journal = this.journal.slice(-5000);
    }
  }

  private computeChecksum(data: Uint8Array): string {
    // Simplified checksum — in production would be SHA-256
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data[i]) | 0;
    }
    return `sha256-sim-${Math.abs(hash).toString(16)}`;
  }
}

// ── VFS Layer ──────────────────────────────────────────────────

export class VirtualFilesystemLayer {
  private mounts = new Map<string, MountPoint>();
  private filesystems = new Map<string, SitaFilesystem>();
  private nextMountId = 1;

  constructor() {
    // Mount root SitaFS
    const rootFs = new SitaFilesystem();
    this.mount("/", "sitafs", "/dev/sda2", rootFs);
    // Mount virtual filesystems
    this.mount("/proc", "procfs", "none");
    this.mount("/sys", "sysfs", "none");
    this.mount("/dev", "devfs", "none");
    this.mount("/tmp", "tmpfs", "none");
    this.mount("/boot/efi", "fat32", "/dev/sda1", undefined, { readOnly: true });
  }

  mount(path: string, fsType: FilesystemType, device: string, fs?: SitaFilesystem, opts?: Partial<MountPoint["options"]>): MountPoint {
    const mp: MountPoint = {
      id: `mnt-${this.nextMountId++}`,
      path,
      fsType,
      device,
      options: {
        readOnly: opts?.readOnly ?? false,
        noExec: opts?.noExec ?? false,
        noSuid: opts?.noSuid ?? true,
        noAtime: opts?.noAtime ?? false,
      },
      mountedAt: Date.now(),
    };
    this.mounts.set(path, mp);
    if (fs) this.filesystems.set(path, fs);
    return mp;
  }

  unmount(path: string): boolean {
    if (path === "/") return false; // Can't unmount root
    this.mounts.delete(path);
    this.filesystems.delete(path);
    return true;
  }

  resolve(path: string): { mountPath: string; relativePath: string; fs: SitaFilesystem | null } {
    // Find longest matching mount
    let best = "/";
    for (const mp of this.mounts.keys()) {
      if (path.startsWith(mp) && mp.length > best.length) best = mp;
    }
    return {
      mountPath: best,
      relativePath: path.slice(best.length) || "/",
      fs: this.filesystems.get(best) ?? null,
    };
  }

  listMounts(): MountPoint[] {
    return Array.from(this.mounts.values());
  }

  getFilesystem(mountPath: string): SitaFilesystem | undefined {
    return this.filesystems.get(mountPath);
  }

  getStats() {
    const fsStats: Record<string, ReturnType<SitaFilesystem["getStats"]>> = {};
    for (const [path, fs] of this.filesystems) {
      fsStats[path] = fs.getStats();
    }
    return { mounts: this.mounts.size, filesystems: fsStats };
  }
}
