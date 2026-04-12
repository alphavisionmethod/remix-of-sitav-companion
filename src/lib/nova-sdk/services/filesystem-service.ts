// ═══════════════════════════════════════════════════════════════
// Nova SDK — File System Service
// VFS layer with indexing, search, watch, trash, quotas, MIME
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";

export interface FSNode {
  path: string;
  name: string;
  type: "file" | "directory" | "symlink";
  size: number;
  mime: string;
  permissions: FSPermissions;
  owner: number; // PID
  createdAt: number;
  modifiedAt: number;
  content?: string | ArrayBuffer;
  children?: Map<string, FSNode>;
  deleted?: boolean; // soft-delete (trash)
}

export interface FSPermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  ownerOnly: boolean;
}

export interface MountPoint {
  path: string;
  label: string;
  readOnly: boolean;
  quota: number; // bytes, 0 = unlimited
  used: number;
}

export type FSWatchCallback = (event: "create" | "modify" | "delete" | "rename", path: string) => void;

const MIME_MAP: Record<string, string> = {
  txt: "text/plain", md: "text/markdown", json: "application/json",
  js: "application/javascript", ts: "application/typescript",
  html: "text/html", css: "text/css", xml: "text/xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
  pdf: "application/pdf", zip: "application/zip",
  mp3: "audio/mpeg", wav: "audio/wav", mp4: "video/mp4",
};

class FileSystemServiceClass implements SystemService {
  id = "FileSystemService";
  status: ServiceStatus = "stopped";

  private root: FSNode;
  private mounts = new Map<string, MountPoint>();
  private watchers = new Map<string, Set<FSWatchCallback>>();
  private searchIndex = new Map<string, Set<string>>(); // trigram → paths
  private totalFiles = 0;
  private totalDirs = 0;

  constructor() {
    this.root = this.createDir("/", 0);
  }

  boot(): void {
    this.status = "starting";
    // Create default mount points
    this.mount("/home", "Home", false, 256 * 1024 * 1024);
    this.mount("/tmp", "Temporary", false, 64 * 1024 * 1024);
    this.mount("/system", "System", true, 0);
    this.mount("/apps", "Applications", true, 0);

    // Create default directories
    this.mkdir("/home/Desktop", 0);
    this.mkdir("/home/Documents", 0);
    this.mkdir("/home/Downloads", 0);
    this.mkdir("/home/Pictures", 0);
    this.mkdir("/home/Music", 0);
    this.mkdir("/home/.trash", 0);
    this.mkdir("/system/preferences", 0);
    this.mkdir("/system/fonts", 0);
    this.mkdir("/system/sounds", 0);
    this.mkdir("/tmp/cache", 0);

    this.status = "running";
  }

  shutdown(): void {
    this.watchers.clear();
    this.status = "stopped";
  }

  // ── Mount Management ──

  mount(path: string, label: string, readOnly: boolean, quota: number): void {
    this.mounts.set(path, { path, label, readOnly, quota, used: 0 });
    this.mkdir(path, 0);
  }

  getMounts(): MountPoint[] {
    return [...this.mounts.values()];
  }

  // ── File Operations ──

  createFile(path: string, content: string | ArrayBuffer, ownerPid: number): FSNode | null {
    const mount = this.getMountForPath(path);
    if (mount?.readOnly) return null;

    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    const name = path.substring(path.lastIndexOf("/") + 1);
    const parent = this.resolve(parentPath);
    if (!parent || parent.type !== "directory") return null;

    const size = typeof content === "string" ? content.length : content.byteLength;
    if (mount && mount.quota > 0 && mount.used + size > mount.quota) return null;

    const node: FSNode = {
      path, name, type: "file", size,
      mime: this.detectMime(name),
      permissions: { read: true, write: true, execute: false, ownerOnly: false },
      owner: ownerPid,
      createdAt: Date.now(), modifiedAt: Date.now(),
      content,
    };

    parent.children!.set(name, node);
    if (mount) mount.used += size;
    this.totalFiles++;
    this.indexNode(node);
    this.notifyWatchers("create", path);
    return node;
  }

  readFile(path: string): FSNode | null {
    const node = this.resolve(path);
    if (!node || node.type !== "file" || node.deleted) return null;
    return node;
  }

  writeFile(path: string, content: string | ArrayBuffer): boolean {
    const node = this.resolve(path);
    if (!node || node.type !== "file") return false;

    const mount = this.getMountForPath(path);
    if (mount?.readOnly) return false;

    const oldSize = node.size;
    const newSize = typeof content === "string" ? content.length : content.byteLength;
    if (mount && mount.quota > 0 && mount.used - oldSize + newSize > mount.quota) return false;

    node.content = content;
    node.size = newSize;
    node.modifiedAt = Date.now();
    if (mount) mount.used += newSize - oldSize;
    this.notifyWatchers("modify", path);
    return true;
  }

  deleteFile(path: string, permanent = false): boolean {
    if (permanent) return this.removeNode(path);
    return this.moveToTrash(path);
  }

  // ── Directory Operations ──

  mkdir(path: string, ownerPid: number): FSNode | null {
    const parts = path.split("/").filter(Boolean);
    let current = this.root;

    for (const part of parts) {
      if (!current.children) current.children = new Map();
      if (!current.children.has(part)) {
        const newDir = this.createDir(`${current.path === "/" ? "" : current.path}/${part}`, ownerPid);
        current.children.set(part, newDir);
        this.totalDirs++;
      }
      current = current.children.get(part)!;
    }
    return current;
  }

  listDir(path: string): FSNode[] {
    const node = this.resolve(path);
    if (!node || node.type !== "directory" || !node.children) return [];
    return [...node.children.values()].filter(n => !n.deleted);
  }

  // ── Search ──

  search(query: string, basePath = "/"): FSNode[] {
    const lq = query.toLowerCase();
    const results: FSNode[] = [];
    this.walkTree(this.resolve(basePath) || this.root, (node) => {
      if (!node.deleted && node.name.toLowerCase().includes(lq)) {
        results.push(node);
      }
    });
    return results;
  }

  // ── Watch API ──

  watch(path: string, callback: FSWatchCallback): () => void {
    if (!this.watchers.has(path)) this.watchers.set(path, new Set());
    this.watchers.get(path)!.add(callback);
    return () => this.watchers.get(path)?.delete(callback);
  }

  // ── Trash ──

  moveToTrash(path: string): boolean {
    const node = this.resolve(path);
    if (!node) return false;
    node.deleted = true;
    node.modifiedAt = Date.now();
    this.notifyWatchers("delete", path);
    return true;
  }

  restoreFromTrash(path: string): boolean {
    const node = this.resolve(path);
    if (!node || !node.deleted) return false;
    node.deleted = false;
    node.modifiedAt = Date.now();
    this.notifyWatchers("create", path);
    return true;
  }

  emptyTrash(): number {
    let count = 0;
    this.walkTree(this.root, (node) => {
      if (node.deleted) { count++; }
    });
    // Actually remove deleted nodes
    this.pruneDeleted(this.root);
    return count;
  }

  // ── MIME Detection ──

  detectMime(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return MIME_MAP[ext] || "application/octet-stream";
  }

  // ── Stats ──

  getStats() {
    return {
      totalFiles: this.totalFiles,
      totalDirs: this.totalDirs,
      mountCount: this.mounts.size,
      watcherCount: this.watchers.size,
      indexSize: this.searchIndex.size,
    };
  }

  getDiagnostics() {
    return {
      ...this.getStats(),
      mounts: [...this.mounts.values()].map(m => ({
        path: m.path,
        label: m.label,
        readOnly: m.readOnly,
        usage: m.quota > 0 ? `${((m.used / m.quota) * 100).toFixed(1)}%` : "unlimited",
      })),
    };
  }

  reset(): void {
    this.root = this.createDir("/", 0);
    this.mounts.clear();
    this.watchers.clear();
    this.searchIndex.clear();
    this.totalFiles = 0;
    this.totalDirs = 0;
    this.status = "stopped";
  }

  // ── Private ──

  private resolve(path: string): FSNode | null {
    if (path === "/") return this.root;
    const parts = path.split("/").filter(Boolean);
    let current = this.root;
    for (const part of parts) {
      if (!current.children?.has(part)) return null;
      current = current.children.get(part)!;
    }
    return current;
  }

  private createDir(path: string, owner: number): FSNode {
    return {
      path, name: path.split("/").pop() || "/",
      type: "directory", size: 0, mime: "inode/directory",
      permissions: { read: true, write: true, execute: true, ownerOnly: false },
      owner, createdAt: Date.now(), modifiedAt: Date.now(),
      children: new Map(),
    };
  }

  private getMountForPath(path: string): MountPoint | undefined {
    let best: MountPoint | undefined;
    for (const [mountPath, mount] of this.mounts) {
      if (path.startsWith(mountPath) && (!best || mountPath.length > best.path.length)) {
        best = mount;
      }
    }
    return best;
  }

  private indexNode(node: FSNode): void {
    const name = node.name.toLowerCase();
    for (let i = 0; i <= name.length - 3; i++) {
      const trigram = name.substring(i, i + 3);
      if (!this.searchIndex.has(trigram)) this.searchIndex.set(trigram, new Set());
      this.searchIndex.get(trigram)!.add(node.path);
    }
  }

  private walkTree(node: FSNode, cb: (n: FSNode) => void): void {
    cb(node);
    if (node.children) {
      for (const child of node.children.values()) this.walkTree(child, cb);
    }
  }

  private pruneDeleted(node: FSNode): void {
    if (!node.children) return;
    for (const [name, child] of node.children) {
      if (child.deleted) {
        node.children.delete(name);
      } else {
        this.pruneDeleted(child);
      }
    }
  }

  private removeNode(path: string): boolean {
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    const name = path.substring(path.lastIndexOf("/") + 1);
    const parent = this.resolve(parentPath);
    if (!parent?.children?.has(name)) return false;
    parent.children.delete(name);
    this.notifyWatchers("delete", path);
    return true;
  }

  private notifyWatchers(event: "create" | "modify" | "delete" | "rename", path: string): void {
    // Notify exact path watchers
    this.watchers.get(path)?.forEach(cb => { try { cb(event, path); } catch {} });
    // Notify parent directory watchers
    const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
    this.watchers.get(parentPath)?.forEach(cb => { try { cb(event, path); } catch {} });
  }
}

export const FileSystemService = new FileSystemServiceClass();
