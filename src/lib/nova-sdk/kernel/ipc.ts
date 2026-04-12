// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Inter-Process Communication (IPC) Subsystem
// Capability-based message passing, shared memory, event channels
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

export type IPCCapability =
  | "ipc.send"
  | "ipc.receive"
  | "ipc.broadcast"
  | "ipc.sharedmem.create"
  | "ipc.sharedmem.read"
  | "ipc.sharedmem.write"
  | "ipc.event.subscribe"
  | "ipc.event.publish";

export interface IPCMessage {
  id: string;
  fromPid: number;
  toPid: number;
  channel: string;
  payload: unknown;
  timestamp: number;
  replyTo?: string;
  ttlMs?: number;
  priority: "normal" | "high" | "realtime";
}

export interface IPCPort {
  id: string;
  ownerPid: number;
  channel: string;
  capabilities: IPCCapability[];
  createdAt: number;
  messageCount: number;
  bytesTransferred: number;
}

export interface SharedMemoryRegion {
  id: string;
  name: string;
  ownerPid: number;
  sizeBytes: number;
  data: ArrayBuffer;
  accessList: Map<number, "read" | "readwrite">;
  createdAt: number;
  lastAccess: number;
  accessCount: number;
  locked: boolean;
  lockHolder: number | null;
}

export interface EventChannel {
  id: string;
  name: string;
  ownerPid: number;
  subscribers: Map<number, EventSubscription>;
  eventCount: number;
  createdAt: number;
  lastEvent: number;
  maxSubscribers: number;
}

export interface EventSubscription {
  pid: number;
  handler: (event: IPCEvent) => void;
  filter?: string;
  priority: number;
  subscribedAt: number;
  eventsReceived: number;
}

export interface IPCEvent {
  channelId: string;
  eventType: string;
  payload: unknown;
  sourcePid: number;
  timestamp: number;
  sequenceNumber: number;
}

export interface IPCStats {
  totalMessages: number;
  totalBytes: number;
  activePorts: number;
  sharedRegions: number;
  eventChannels: number;
  totalSubscriptions: number;
  messagesPerSecond: number;
  droppedMessages: number;
  pendingMessages: number;
}

// ── Message Queue ──────────────────────────────────────────────

class MessageQueue {
  private queues = new Map<number, IPCMessage[]>();
  private maxQueueSize = 256;
  private dropped = 0;

  enqueue(pid: number, message: IPCMessage): boolean {
    if (!this.queues.has(pid)) this.queues.set(pid, []);
    const q = this.queues.get(pid)!;
    if (q.length >= this.maxQueueSize) {
      this.dropped++;
      return false;
    }
    // Priority insertion
    if (message.priority === "realtime") {
      q.unshift(message);
    } else if (message.priority === "high") {
      const insertIdx = q.findIndex(m => m.priority === "normal");
      if (insertIdx >= 0) q.splice(insertIdx, 0, message);
      else q.push(message);
    } else {
      q.push(message);
    }
    return true;
  }

  dequeue(pid: number): IPCMessage | null {
    const q = this.queues.get(pid);
    if (!q || q.length === 0) return null;
    return q.shift()!;
  }

  peek(pid: number): IPCMessage | null {
    const q = this.queues.get(pid);
    return q?.[0] ?? null;
  }

  pending(pid: number): number {
    return this.queues.get(pid)?.length ?? 0;
  }

  totalPending(): number {
    let total = 0;
    for (const q of this.queues.values()) total += q.length;
    return total;
  }

  getDropped(): number { return this.dropped; }

  clearPid(pid: number): void {
    this.queues.delete(pid);
  }

  reset(): void {
    this.queues.clear();
    this.dropped = 0;
  }
}

// ── IPC Manager ────────────────────────────────────────────────

let nextId = 1;
function genId(prefix: string): string {
  return `${prefix}-${(nextId++).toString(36)}`;
}

class IPCManagerClass {
  private ports = new Map<string, IPCPort>();
  private sharedMemory = new Map<string, SharedMemoryRegion>();
  private eventChannels = new Map<string, EventChannel>();
  private messageQueue = new MessageQueue();
  private capabilityGrants = new Map<number, Set<IPCCapability>>();
  private messageLog: IPCMessage[] = [];
  private maxLog = 200;
  private totalMessages = 0;
  private totalBytes = 0;
  private rateWindow: number[] = [];

  // ── Capability Grants ──────────────────────────────────────

  grantCapability(pid: number, cap: IPCCapability): void {
    if (!this.capabilityGrants.has(pid)) this.capabilityGrants.set(pid, new Set());
    this.capabilityGrants.get(pid)!.add(cap);
  }

  grantAll(pid: number): void {
    const all: IPCCapability[] = [
      "ipc.send", "ipc.receive", "ipc.broadcast",
      "ipc.sharedmem.create", "ipc.sharedmem.read", "ipc.sharedmem.write",
      "ipc.event.subscribe", "ipc.event.publish",
    ];
    for (const cap of all) this.grantCapability(pid, cap);
  }

  hasCapability(pid: number, cap: IPCCapability): boolean {
    return this.capabilityGrants.get(pid)?.has(cap) ?? false;
  }

  revokeAll(pid: number): void {
    this.capabilityGrants.delete(pid);
  }

  // ── Port Management ────────────────────────────────────────

  createPort(pid: number, channel: string, caps: IPCCapability[] = ["ipc.send", "ipc.receive"]): IPCPort {
    const port: IPCPort = {
      id: genId("port"),
      ownerPid: pid,
      channel,
      capabilities: caps,
      createdAt: Date.now(),
      messageCount: 0,
      bytesTransferred: 0,
    };
    this.ports.set(port.id, port);
    return port;
  }

  closePort(portId: string): void {
    this.ports.delete(portId);
  }

  // ── Message Passing ────────────────────────────────────────

  send(fromPid: number, toPid: number, channel: string, payload: unknown, options?: { priority?: IPCMessage["priority"]; replyTo?: string; ttlMs?: number }): { success: boolean; messageId?: string; error?: string } {
    if (!this.hasCapability(fromPid, "ipc.send")) {
      return { success: false, error: "EPERM: ipc.send capability required" };
    }

    const payloadStr = JSON.stringify(payload);
    const bytes = payloadStr.length * 2; // rough UTF-16 estimate

    const msg: IPCMessage = {
      id: genId("msg"),
      fromPid,
      toPid,
      channel,
      payload,
      timestamp: Date.now(),
      priority: options?.priority ?? "normal",
      replyTo: options?.replyTo,
      ttlMs: options?.ttlMs,
    };

    const enqueued = this.messageQueue.enqueue(toPid, msg);
    if (!enqueued) {
      return { success: false, error: "EAGAIN: recipient queue full" };
    }

    this.totalMessages++;
    this.totalBytes += bytes;
    this.rateWindow.push(Date.now());
    this.messageLog.push(msg);
    if (this.messageLog.length > this.maxLog) this.messageLog.shift();

    // Update port stats
    for (const port of this.ports.values()) {
      if (port.ownerPid === fromPid && port.channel === channel) {
        port.messageCount++;
        port.bytesTransferred += bytes;
      }
    }

    return { success: true, messageId: msg.id };
  }

  receive(pid: number): IPCMessage | null {
    if (!this.hasCapability(pid, "ipc.receive")) return null;
    const msg = this.messageQueue.dequeue(pid);
    if (msg?.ttlMs && Date.now() - msg.timestamp > msg.ttlMs) {
      return this.receive(pid); // Skip expired, try next
    }
    return msg;
  }

  broadcast(fromPid: number, channel: string, payload: unknown): { delivered: number; dropped: number } {
    if (!this.hasCapability(fromPid, "ipc.broadcast")) return { delivered: 0, dropped: 0 };
    
    let delivered = 0;
    let dropped = 0;
    const targetPids = new Set<number>();
    for (const port of this.ports.values()) {
      if (port.channel === channel && port.ownerPid !== fromPid) {
        targetPids.add(port.ownerPid);
      }
    }

    for (const toPid of targetPids) {
      const result = this.send(fromPid, toPid, channel, payload);
      if (result.success) delivered++;
      else dropped++;
    }

    return { delivered, dropped };
  }

  pendingCount(pid: number): number {
    return this.messageQueue.pending(pid);
  }

  // ── Shared Memory ──────────────────────────────────────────

  createSharedRegion(ownerPid: number, name: string, sizeBytes: number): SharedMemoryRegion | null {
    if (!this.hasCapability(ownerPid, "ipc.sharedmem.create")) return null;
    if (sizeBytes <= 0 || sizeBytes > 16 * 1024 * 1024) return null; // Max 16MB

    const region: SharedMemoryRegion = {
      id: genId("shm"),
      name,
      ownerPid,
      sizeBytes,
      data: new ArrayBuffer(sizeBytes),
      accessList: new Map([[ownerPid, "readwrite"]]),
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      locked: false,
      lockHolder: null,
    };
    this.sharedMemory.set(region.id, region);
    return region;
  }

  grantSharedAccess(regionId: string, pid: number, mode: "read" | "readwrite"): boolean {
    const region = this.sharedMemory.get(regionId);
    if (!region) return false;
    region.accessList.set(pid, mode);
    return true;
  }

  readShared(regionId: string, pid: number, offset: number, length: number): Uint8Array | null {
    if (!this.hasCapability(pid, "ipc.sharedmem.read")) return null;
    const region = this.sharedMemory.get(regionId);
    if (!region || !region.accessList.has(pid)) return null;
    if (offset + length > region.sizeBytes) return null;
    region.lastAccess = Date.now();
    region.accessCount++;
    return new Uint8Array(region.data, offset, length);
  }

  writeShared(regionId: string, pid: number, offset: number, data: Uint8Array): boolean {
    if (!this.hasCapability(pid, "ipc.sharedmem.write")) return false;
    const region = this.sharedMemory.get(regionId);
    if (!region) return false;
    const access = region.accessList.get(pid);
    if (access !== "readwrite") return false;
    if (region.locked && region.lockHolder !== pid) return false;
    if (offset + data.length > region.sizeBytes) return false;
    new Uint8Array(region.data).set(data, offset);
    region.lastAccess = Date.now();
    region.accessCount++;
    return true;
  }

  lockRegion(regionId: string, pid: number): boolean {
    const region = this.sharedMemory.get(regionId);
    if (!region || region.locked) return false;
    region.locked = true;
    region.lockHolder = pid;
    return true;
  }

  unlockRegion(regionId: string, pid: number): boolean {
    const region = this.sharedMemory.get(regionId);
    if (!region || !region.locked || region.lockHolder !== pid) return false;
    region.locked = false;
    region.lockHolder = null;
    return true;
  }

  destroySharedRegion(regionId: string, pid: number): boolean {
    const region = this.sharedMemory.get(regionId);
    if (!region || region.ownerPid !== pid) return false;
    this.sharedMemory.delete(regionId);
    return true;
  }

  // ── Event Channels ─────────────────────────────────────────

  createEventChannel(ownerPid: number, name: string, maxSubscribers = 64): EventChannel | null {
    if (!this.hasCapability(ownerPid, "ipc.event.publish")) return null;

    const channel: EventChannel = {
      id: genId("evt"),
      name,
      ownerPid,
      subscribers: new Map(),
      eventCount: 0,
      createdAt: Date.now(),
      lastEvent: 0,
      maxSubscribers,
    };
    this.eventChannels.set(channel.id, channel);
    return channel;
  }

  subscribe(channelId: string, pid: number, handler: (event: IPCEvent) => void, options?: { filter?: string; priority?: number }): boolean {
    if (!this.hasCapability(pid, "ipc.event.subscribe")) return false;
    const channel = this.eventChannels.get(channelId);
    if (!channel) return false;
    if (channel.subscribers.size >= channel.maxSubscribers) return false;

    channel.subscribers.set(pid, {
      pid,
      handler,
      filter: options?.filter,
      priority: options?.priority ?? 0,
      subscribedAt: Date.now(),
      eventsReceived: 0,
    });
    return true;
  }

  unsubscribe(channelId: string, pid: number): boolean {
    const channel = this.eventChannels.get(channelId);
    if (!channel) return false;
    return channel.subscribers.delete(pid);
  }

  publish(channelId: string, sourcePid: number, eventType: string, payload: unknown): { delivered: number } {
    if (!this.hasCapability(sourcePid, "ipc.event.publish")) return { delivered: 0 };
    const channel = this.eventChannels.get(channelId);
    if (!channel) return { delivered: 0 };

    channel.eventCount++;
    channel.lastEvent = Date.now();

    const event: IPCEvent = {
      channelId,
      eventType,
      payload,
      sourcePid,
      timestamp: Date.now(),
      sequenceNumber: channel.eventCount,
    };

    let delivered = 0;
    // Sort subscribers by priority (higher first)
    const sorted = [...channel.subscribers.values()].sort((a, b) => b.priority - a.priority);

    for (const sub of sorted) {
      if (sub.filter && !eventType.startsWith(sub.filter)) continue;
      try {
        sub.handler(event);
        sub.eventsReceived++;
        delivered++;
      } catch {
        // Subscriber handler error — skip
      }
    }

    this.totalMessages += delivered;
    return { delivered };
  }

  destroyEventChannel(channelId: string, pid: number): boolean {
    const channel = this.eventChannels.get(channelId);
    if (!channel || channel.ownerPid !== pid) return false;
    this.eventChannels.delete(channelId);
    return true;
  }

  // ── Process Cleanup ────────────────────────────────────────

  cleanupProcess(pid: number): void {
    // Remove ports
    for (const [id, port] of this.ports) {
      if (port.ownerPid === pid) this.ports.delete(id);
    }
    // Remove shared memory regions owned by this process
    for (const [id, region] of this.sharedMemory) {
      if (region.ownerPid === pid) this.sharedMemory.delete(id);
      else region.accessList.delete(pid);
    }
    // Remove event channel subscriptions and owned channels
    for (const [id, channel] of this.eventChannels) {
      channel.subscribers.delete(pid);
      if (channel.ownerPid === pid) this.eventChannels.delete(id);
    }
    // Clear message queue
    this.messageQueue.clearPid(pid);
    // Revoke capabilities
    this.revokeAll(pid);
  }

  // ── Stats & Diagnostics ────────────────────────────────────

  getStats(): IPCStats {
    const now = Date.now();
    // Clean rate window (last 1 second)
    this.rateWindow = this.rateWindow.filter(t => now - t < 1000);

    let totalSubscriptions = 0;
    for (const ch of this.eventChannels.values()) totalSubscriptions += ch.subscribers.size;

    return {
      totalMessages: this.totalMessages,
      totalBytes: this.totalBytes,
      activePorts: this.ports.size,
      sharedRegions: this.sharedMemory.size,
      eventChannels: this.eventChannels.size,
      totalSubscriptions,
      messagesPerSecond: this.rateWindow.length,
      droppedMessages: this.messageQueue.getDropped(),
      pendingMessages: this.messageQueue.totalPending(),
    };
  }

  getMessageLog(): readonly IPCMessage[] {
    return this.messageLog;
  }

  getPorts(): IPCPort[] {
    return Array.from(this.ports.values());
  }

  getSharedRegions(): SharedMemoryRegion[] {
    return Array.from(this.sharedMemory.values());
  }

  getEventChannels(): EventChannel[] {
    return Array.from(this.eventChannels.values());
  }

  reset(): void {
    this.ports.clear();
    this.sharedMemory.clear();
    this.eventChannels.clear();
    this.messageQueue.reset();
    this.capabilityGrants.clear();
    this.messageLog = [];
    this.totalMessages = 0;
    this.totalBytes = 0;
    this.rateWindow = [];
    nextId = 1;
  }
}

export const IPCManager = new IPCManagerClass();
