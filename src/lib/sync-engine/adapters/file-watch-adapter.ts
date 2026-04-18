// ═══════════════════════════════════════════════════════════════
// SITA OS — File Watch Adapter
// Bridges SitaFS file events into the sync daemon
// ═══════════════════════════════════════════════════════════════

import { syncd } from "../syncd";
import { computeObjectHash } from "../sync-object-model";

/** File event types from the OS file watcher */
export type FileEventType = "create" | "update" | "delete" | "rename" | "move";

/** A file system event */
export interface FileEvent {
  type: FileEventType;
  path: string;
  oldPath?: string;
  isDirectory: boolean;
  sizeBytes: number;
  mimeType?: string;
  timestamp: string;
}

/** Sync root — a folder being watched for sync */
export interface SyncRoot {
  path: string;
  namespace: string;
  recursive: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
  enabled: boolean;
}

/** Hydration state for on-demand files */
export type HydrationState =
  | "local-only"
  | "synced-local"
  | "cloud-only"
  | "pinned"
  | "downloading"
  | "upload-pending"
  | "conflict";

/** File hydration entry */
export interface FileHydrationEntry {
  objectId: string;
  path: string;
  state: HydrationState;
  localSizeBytes: number;
  remoteSizeBytes: number;
  lastAccessedAt: string;
  pinnedAt?: string;
}

class FileWatchAdapter {
  private syncRoots: SyncRoot[] = [];
  private pathToObjectId = new Map<string, string>();
  private objectIdToPath = new Map<string, string>();
  private hydrationMap = new Map<string, FileHydrationEntry>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private eventBuffer: FileEvent[] = [];
  private running = false;
  private readonly DEBOUNCE_MS = 300;

  /** Default sync roots */
  private readonly DEFAULT_ROOTS: SyncRoot[] = [
    { path: "/home/user/Documents", namespace: "files.documents", recursive: true, enabled: true,
      excludePatterns: ["*.tmp", "*.swp", ".DS_Store", "Thumbs.db", "~$*"] },
    { path: "/home/user/Photos", namespace: "files.photos", recursive: true, enabled: true,
      includePatterns: ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp", "*.heic", "*.raw"] },
    { path: "/home/user/Media", namespace: "files.media", recursive: true, enabled: false,
      includePatterns: ["*.mp4", "*.mkv", "*.mp3", "*.flac", "*.wav"] },
  ];

  /** Start watching sync roots */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.syncRoots = [...this.DEFAULT_ROOTS];
    console.log(`[FileWatchAdapter] Started watching ${this.syncRoots.filter(r => r.enabled).length} sync roots`);
  }

  /** Stop watching */
  stop(): void {
    this.running = false;
    for (const timer of this.debounceTimers.values()) clearTimeout(timer);
    this.debounceTimers.clear();
  }

  /** Process a file system event */
  handleFileEvent(event: FileEvent): void {
    if (!this.running) return;

    // Find matching sync root
    const root = this.syncRoots.find(r => r.enabled && event.path.startsWith(r.path));
    if (!root) return;

    // Check include/exclude patterns
    if (!this.matchesPatterns(event.path, root)) return;

    // Debounce rapid events for the same path
    const existing = this.debounceTimers.get(event.path);
    if (existing) clearTimeout(existing);

    this.debounceTimers.set(event.path, setTimeout(() => {
      this.debounceTimers.delete(event.path);
      this.processEvent(event, root);
    }, this.DEBOUNCE_MS));
  }

  /** Process a debounced event */
  private processEvent(event: FileEvent, root: SyncRoot): void {
    const relativePath = event.path.replace(root.path, "");

    switch (event.type) {
      case "create": {
        const obj = syncd.upsertObject({
          type: event.isDirectory ? "folder" : "file",
          namespace: root.namespace,
          payload: {
            path: relativePath,
            fullPath: event.path,
            sizeBytes: event.sizeBytes,
            mimeType: event.mimeType ?? "application/octet-stream",
          },
          metadata: {
            fileName: relativePath.split("/").pop(),
            isDirectory: event.isDirectory,
            contentHash: computeObjectHash({ path: event.path, size: event.sizeBytes }),
          },
        });
        this.pathToObjectId.set(event.path, obj.id);
        this.objectIdToPath.set(obj.id, event.path);
        this.updateHydration(obj.id, event.path, "upload-pending", event.sizeBytes);
        break;
      }

      case "update": {
        const objectId = this.pathToObjectId.get(event.path);
        if (objectId) {
          syncd.upsertObject({
            id: objectId,
            type: event.isDirectory ? "folder" : "file",
            namespace: root.namespace,
            payload: {
              path: relativePath,
              fullPath: event.path,
              sizeBytes: event.sizeBytes,
              mimeType: event.mimeType,
            },
            metadata: {
              contentHash: computeObjectHash({ path: event.path, size: event.sizeBytes, time: event.timestamp }),
            },
          });
          this.updateHydration(objectId, event.path, "upload-pending", event.sizeBytes);
        } else {
          // File not tracked yet — treat as create
          this.handleFileEvent({ ...event, type: "create" });
        }
        break;
      }

      case "delete": {
        const objectId = this.pathToObjectId.get(event.path);
        if (objectId) {
          syncd.deleteObject(objectId);
          this.pathToObjectId.delete(event.path);
          this.objectIdToPath.delete(objectId);
          this.hydrationMap.delete(objectId);
        }
        break;
      }

      case "rename":
      case "move": {
        const objectId = event.oldPath ? this.pathToObjectId.get(event.oldPath) : undefined;
        if (objectId && event.oldPath) {
          const newRelativePath = event.path.replace(root.path, "");
          syncd.upsertObject({
            id: objectId,
            type: event.isDirectory ? "folder" : "file",
            namespace: root.namespace,
            payload: {
              path: newRelativePath,
              fullPath: event.path,
              sizeBytes: event.sizeBytes,
              mimeType: event.mimeType,
            },
            metadata: {
              fileName: newRelativePath.split("/").pop(),
              previousPath: event.oldPath,
              renamedAt: event.timestamp,
            },
          });
          this.pathToObjectId.delete(event.oldPath);
          this.pathToObjectId.set(event.path, objectId);
          this.objectIdToPath.set(objectId, event.path);
        }
        break;
      }
    }
  }

  /** Add a sync root */
  addSyncRoot(root: SyncRoot): void {
    this.syncRoots.push(root);
  }

  /** Remove a sync root */
  removeSyncRoot(path: string): void {
    this.syncRoots = this.syncRoots.filter(r => r.path !== path);
  }

  /** Enable/disable a sync root */
  toggleSyncRoot(path: string, enabled: boolean): void {
    const root = this.syncRoots.find(r => r.path === path);
    if (root) root.enabled = enabled;
  }

  /** Get all sync roots */
  getSyncRoots(): SyncRoot[] {
    return [...this.syncRoots];
  }

  /** Get hydration state for a file */
  getHydrationState(objectId: string): FileHydrationEntry | undefined {
    return this.hydrationMap.get(objectId);
  }

  /** Get all hydration entries */
  getAllHydrationEntries(): FileHydrationEntry[] {
    return Array.from(this.hydrationMap.values());
  }

  /** Pin a file for offline access */
  pinFile(objectId: string): void {
    const entry = this.hydrationMap.get(objectId);
    if (entry) {
      entry.state = "pinned";
      entry.pinnedAt = new Date().toISOString();
    }
  }

  /** Unpin a file */
  unpinFile(objectId: string): void {
    const entry = this.hydrationMap.get(objectId);
    if (entry && entry.state === "pinned") {
      entry.state = "synced-local";
      entry.pinnedAt = undefined;
    }
  }

  /** Evict local cache for cloud-only files (LRU) */
  evictLRU(targetFreeBytes: number): string[] {
    const entries = Array.from(this.hydrationMap.values())
      .filter(e => e.state === "synced-local")
      .sort((a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime());

    const evicted: string[] = [];
    let freed = 0;

    for (const entry of entries) {
      if (freed >= targetFreeBytes) break;
      entry.state = "cloud-only";
      freed += entry.localSizeBytes;
      evicted.push(entry.objectId);
    }

    return evicted;
  }

  /** Request hydration (download) of a cloud-only file */
  requestHydration(objectId: string): void {
    const entry = this.hydrationMap.get(objectId);
    if (entry && entry.state === "cloud-only") {
      entry.state = "downloading";
    }
  }

  // ─── Internal Helpers ───────────────────────

  private matchesPatterns(path: string, root: SyncRoot): boolean {
    const fileName = path.split("/").pop() ?? "";

    if (root.excludePatterns?.length) {
      for (const pattern of root.excludePatterns) {
        if (this.globMatch(fileName, pattern)) return false;
      }
    }

    if (root.includePatterns?.length) {
      for (const pattern of root.includePatterns) {
        if (this.globMatch(fileName, pattern)) return true;
      }
      return false;
    }

    return true;
  }

  private globMatch(str: string, pattern: string): boolean {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i");
    return regex.test(str);
  }

  private updateHydration(objectId: string, path: string, state: HydrationState, size: number): void {
    this.hydrationMap.set(objectId, {
      objectId,
      path,
      state,
      localSizeBytes: size,
      remoteSizeBytes: size,
      lastAccessedAt: new Date().toISOString(),
    });
  }
}

/** Singleton file watch adapter */
export const fileWatchAdapter = new FileWatchAdapter();
