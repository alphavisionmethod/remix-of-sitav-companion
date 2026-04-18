// ═══════════════════════════════════════════════════════════════
// Nova SDK — File System Service
// VFS layer with indexing, search, watch, trash, quotas, MIME
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";

export interface FSVersion {
  version: number;
  content: string;
  savedAt: number;
  size: number;
}

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
  versions?: FSVersion[]; // file history (max 10)
  tags?: Set<string>; // user-assignable labels
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

    // ── Seed sample files so Finder isn't empty ──
    this.mkdir("/home/Projects", 0);

    // Desktop
    this.createFile("/home/Desktop/welcome.txt",
      "Welcome to NovaOS!\n\nThis is your Desktop. Drag files between folders to organize them.\n", 0);
    this.createFile("/home/Desktop/todo.md",
      "# Today\n- [x] Boot NovaOS\n- [ ] Explore Finder\n- [ ] Try drag-and-drop\n- [ ] Check system settings\n", 0);

    // Documents
    this.createFile("/home/Documents/readme.txt",
      "NovaOS Documentation\n====================\nNovaOS is a spatial, intent-driven operating system.\nSee the Settings app for configuration options.\n", 0);
    this.createFile("/home/Documents/meeting-notes.md",
      "# Meeting Notes — Q2 Planning\n\n**Date:** 2026-04-10\n**Attendees:** Nova, Sita\n\n## Agenda\n1. Review Q1 results\n2. Set Q2 OKRs\n3. Budget allocation\n\n## Action Items\n- Finalize roadmap by Friday\n- Schedule design review\n", 0);
    this.createFile("/home/Documents/invoice-march.json",
      JSON.stringify({ id: "INV-2026-031", client: "Acme Corp", amount: 4250, currency: "USD", status: "paid", date: "2026-03-28" }, null, 2), 0);
    this.createFile("/home/Documents/contacts.csv",
      "Name,Email,Phone\nAlice Chen,alice@example.com,+1-555-0101\nBob Martinez,bob@example.com,+1-555-0202\nClara Davis,clara@example.com,+1-555-0303\n", 0);

    // Downloads
    this.createFile("/home/Downloads/report-q1.pdf", "[PDF — Q1 Financial Report]", 0);
    this.createFile("/home/Downloads/presentation.pdf", "[PDF — Product Launch Deck]", 0);
    this.createFile("/home/Downloads/archive.zip", "[ZIP archive]", 0);

    // Pictures
    this.createFile("/home/Pictures/photo-beach.png", "[PNG — beach sunset]", 0);
    this.createFile("/home/Pictures/screenshot-app.png", "[PNG — app screenshot]", 0);
    this.createFile("/home/Pictures/avatar.jpg", "[JPEG — profile avatar]", 0);
    this.createFile("/home/Pictures/diagram.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect fill="#4A90D9" width="200" height="100" rx="12"/></svg>', 0);

    // Music
    this.createFile("/home/Music/ambient-focus.mp3", "[MP3 — ambient focus track]", 0);
    this.createFile("/home/Music/lofi-beats.mp3", "[MP3 — lo-fi beats]", 0);
    this.createFile("/home/Music/notification.wav", "[WAV — notification chime]", 0);

    // Projects
    this.createFile("/home/Projects/index.ts",
      'import { NovaSDK } from "@nova/sdk";\n\nconst app = NovaSDK.createApp("my-app");\napp.mount("#root");\nconsole.log("App started");\n', 0);
    this.createFile("/home/Projects/styles.css",
      ":root {\n  --primary: hsl(210 80% 60%);\n  --bg: hsl(220 15% 8%);\n}\n\nbody {\n  background: var(--bg);\n  color: white;\n  font-family: system-ui;\n}\n", 0);
    this.createFile("/home/Projects/package.json",
      JSON.stringify({ name: "nova-app", version: "1.0.0", main: "index.ts", dependencies: { "@nova/sdk": "^2.0.0" } }, null, 2), 0);

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

    // ── Versioning: snapshot current content before overwriting ──
    if (node.content !== undefined) {
      if (!node.versions) node.versions = [];
      const versionNum = node.versions.length + 1;
      const currentContent = typeof node.content === "string" ? node.content : "[binary]";
      node.versions.push({
        version: versionNum,
        content: currentContent,
        savedAt: Date.now(),
        size: oldSize,
      });
      // Keep only last 10 versions
      if (node.versions.length > 10) {
        node.versions = node.versions.slice(-10);
      }
    }

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

  // ── Move / Rename ──

  move(srcPath: string, destDir: string): boolean {
    const srcNode = this.resolve(srcPath);
    if (!srcNode) return false;
    const destParent = this.resolve(destDir);
    if (!destParent || destParent.type !== "directory") return false;
    // Don't move into self or a subdirectory of self
    if (destDir === srcPath || destDir.startsWith(srcPath + "/")) return false;

    const srcParentPath = srcPath.substring(0, srcPath.lastIndexOf("/")) || "/";
    if (srcParentPath === destDir) return false; // already in target
    const srcParent = this.resolve(srcParentPath);
    if (!srcParent?.children) return false;

    const name = srcNode.name;
    // Remove from old parent
    srcParent.children.delete(name);
    // Update paths recursively
    const newPath = `${destDir === "/" ? "" : destDir}/${name}`;
    this.updatePaths(srcNode, newPath);
    // Insert into new parent
    if (!destParent.children) destParent.children = new Map();
    destParent.children.set(name, srcNode);
    srcNode.modifiedAt = Date.now();

    this.notifyWatchers("rename", srcPath);
    this.notifyWatchers("create", newPath);
    this.notifyWatchers("modify", srcParentPath);
    this.notifyWatchers("modify", destDir);
    return true;
  }

  private updatePaths(node: FSNode, newPath: string): void {
    node.path = newPath;
    if (node.children) {
      for (const [childName, child] of node.children) {
        this.updatePaths(child, `${newPath}/${childName}`);
      }
    }
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
    let totalVersions = 0;
    let totalTags = 0;
    const allTags = new Set<string>();
    this.walkTree(this.root, (node) => {
      if (node.versions) totalVersions += node.versions.length;
      if (node.tags) {
        totalTags += node.tags.size;
        node.tags.forEach(t => allTags.add(t));
      }
    });

    return {
      totalFiles: this.totalFiles,
      totalDirs: this.totalDirs,
      mountCount: this.mounts.size,
      watcherCount: this.watchers.size,
      indexSize: this.searchIndex.size,
      totalVersions,
      totalTags,
      uniqueTags: allTags.size,
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

  // ── File Versioning ──

  getFileHistory(path: string): FSVersion[] {
    const node = this.resolve(path);
    if (!node || node.type !== "file") return [];
    return node.versions ? [...node.versions] : [];
  }

  restoreVersion(path: string, version: number): boolean {
    const node = this.resolve(path);
    if (!node || node.type !== "file" || !node.versions) return false;

    const target = node.versions.find(v => v.version === version);
    if (!target) return false;

    // Save current as a new version before restoring
    this.writeFile(path, target.content);
    return true;
  }

  // ── File Tagging ──

  addTag(path: string, tag: string): boolean {
    const node = this.resolve(path);
    if (!node) return false;
    if (!node.tags) node.tags = new Set();
    node.tags.add(tag);
    node.modifiedAt = Date.now();
    return true;
  }

  removeTag(path: string, tag: string): boolean {
    const node = this.resolve(path);
    if (!node || !node.tags) return false;
    const removed = node.tags.delete(tag);
    if (removed) node.modifiedAt = Date.now();
    return removed;
  }

  getByTag(tag: string): FSNode[] {
    const results: FSNode[] = [];
    this.walkTree(this.root, (node) => {
      if (!node.deleted && node.tags?.has(tag)) results.push(node);
    });
    return results;
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.walkTree(this.root, (node) => {
      node.tags?.forEach(t => tags.add(t));
    });
    return [...tags].sort();
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
