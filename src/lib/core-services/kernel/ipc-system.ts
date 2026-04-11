// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: IPC System
// Capability-based message passing, shared memory, signals
// ═══════════════════════════════════════════════════════════════

// ── Capability Tokens ──────────────────────────────────────────

export interface CapabilityToken {
  id: string;
  type: "send" | "receive" | "shm-read" | "shm-write" | "signal";
  portId: string;
  grantedTo: number; // PID
  grantedBy: number; // PID (0 = kernel)
  createdAt: number;
  expiresAt: number | null;
  revoked: boolean;
}

// ── Message Passing ────────────────────────────────────────────

export type MessagePriority = "urgent" | "normal" | "low";

export interface IPCMessage {
  id: string;
  fromPid: number;
  toPid: number;
  portId: string;
  payload: unknown;
  priority: MessagePriority;
  timestamp: number;
  capabilityId: string;
  requiresReply: boolean;
  replyToId: string | null;
}

export interface MessagePort {
  id: string;
  ownerPid: number;
  name: string;
  capacity: number;
  pending: IPCMessage[];
  subscribers: number[]; // PIDs
}

// ── Shared Memory ──────────────────────────────────────────────

export interface SharedMemoryRegion {
  id: string;
  name: string;
  sizeBytes: number;
  ownerPid: number;
  attachedPids: Map<number, "read" | "read-write">;
  createdAt: number;
  data: ArrayBuffer;
  locked: boolean;
}

// ── Signals ────────────────────────────────────────────────────

export type SignalType =
  | "SIGTERM" | "SIGKILL" | "SIGSTOP" | "SIGCONT"
  | "SIGUSR1" | "SIGUSR2" | "SIGCHLD" | "SIGALRM"
  | "SIGHUP" | "SIGINT" | "SIGPIPE";

export interface SignalRecord {
  signal: SignalType;
  fromPid: number;
  toPid: number;
  timestamp: number;
  handled: boolean;
}

// ── Event Channels ─────────────────────────────────────────────

export interface EventChannel {
  id: string;
  name: string;
  subscribers: Set<number>; // PIDs
  eventCount: number;
}

// ── IPC System ─────────────────────────────────────────────────

export class IPCSystem {
  private ports = new Map<string, MessagePort>();
  private capabilities = new Map<string, CapabilityToken>();
  private sharedRegions = new Map<string, SharedMemoryRegion>();
  private signalLog: SignalRecord[] = [];
  private channels = new Map<string, EventChannel>();
  private nextMsgId = 1;

  // ── Ports & Messages ─────────────────────────────────────────

  createPort(ownerPid: number, name: string, capacity = 256): MessagePort {
    const port: MessagePort = {
      id: `port-${Date.now()}-${name}`,
      ownerPid, name, capacity,
      pending: [],
      subscribers: [ownerPid],
    };
    this.ports.set(port.id, port);
    return port;
  }

  grantCapability(portId: string, type: CapabilityToken["type"], toPid: number, fromPid: number): CapabilityToken {
    const cap: CapabilityToken = {
      id: `cap-${Date.now()}-${this.capabilities.size}`,
      type, portId, grantedTo: toPid, grantedBy: fromPid,
      createdAt: Date.now(), expiresAt: null, revoked: false,
    };
    this.capabilities.set(cap.id, cap);
    return cap;
  }

  revokeCapability(capId: string): boolean {
    const cap = this.capabilities.get(capId);
    if (!cap) return false;
    cap.revoked = true;
    return true;
  }

  send(fromPid: number, portId: string, capabilityId: string, payload: unknown, opts?: {
    priority?: MessagePriority;
    requiresReply?: boolean;
    replyToId?: string;
  }): IPCMessage | null {
    // Validate capability
    const cap = this.capabilities.get(capabilityId);
    if (!cap || cap.revoked || cap.type !== "send" || cap.portId !== portId || cap.grantedTo !== fromPid) {
      return null; // Denied
    }
    if (cap.expiresAt && Date.now() > cap.expiresAt) return null;

    const port = this.ports.get(portId);
    if (!port) return null;
    if (port.pending.length >= port.capacity) return null; // Full

    const msg: IPCMessage = {
      id: `msg-${this.nextMsgId++}`,
      fromPid, toPid: port.ownerPid, portId,
      payload,
      priority: opts?.priority ?? "normal",
      timestamp: Date.now(),
      capabilityId,
      requiresReply: opts?.requiresReply ?? false,
      replyToId: opts?.replyToId ?? null,
    };

    // Insert by priority
    if (msg.priority === "urgent") {
      port.pending.unshift(msg);
    } else {
      port.pending.push(msg);
    }

    return msg;
  }

  receive(pid: number, portId: string): IPCMessage | null {
    const port = this.ports.get(portId);
    if (!port || port.ownerPid !== pid) return null;
    return port.pending.shift() ?? null;
  }

  // ── Shared Memory ────────────────────────────────────────────

  shmCreate(ownerPid: number, name: string, sizeBytes: number): SharedMemoryRegion {
    const region: SharedMemoryRegion = {
      id: `shm-${Date.now()}-${name}`,
      name, sizeBytes, ownerPid,
      attachedPids: new Map([[ownerPid, "read-write"]]),
      createdAt: Date.now(),
      data: new ArrayBuffer(sizeBytes),
      locked: false,
    };
    this.sharedRegions.set(region.id, region);
    return region;
  }

  shmAttach(regionId: string, pid: number, capabilityId: string): boolean {
    const cap = this.capabilities.get(capabilityId);
    if (!cap || cap.revoked) return false;
    if (cap.type !== "shm-read" && cap.type !== "shm-write") return false;

    const region = this.sharedRegions.get(regionId);
    if (!region) return false;

    region.attachedPids.set(pid, cap.type === "shm-write" ? "read-write" : "read");
    return true;
  }

  shmDetach(regionId: string, pid: number): boolean {
    const region = this.sharedRegions.get(regionId);
    if (!region) return false;
    region.attachedPids.delete(pid);
    if (region.attachedPids.size === 0) {
      this.sharedRegions.delete(regionId);
    }
    return true;
  }

  // ── Signals ──────────────────────────────────────────────────

  sendSignal(fromPid: number, toPid: number, signal: SignalType): boolean {
    // SIGKILL and SIGSTOP cannot be caught
    const record: SignalRecord = {
      signal, fromPid, toPid,
      timestamp: Date.now(),
      handled: signal !== "SIGKILL" && signal !== "SIGSTOP",
    };
    this.signalLog.push(record);
    if (this.signalLog.length > 10000) this.signalLog = this.signalLog.slice(-5000);
    return true;
  }

  // ── Event Channels ───────────────────────────────────────────

  createChannel(name: string): EventChannel {
    const ch: EventChannel = { id: `ch-${name}`, name, subscribers: new Set(), eventCount: 0 };
    this.channels.set(ch.id, ch);
    return ch;
  }

  subscribeChannel(channelId: string, pid: number): boolean {
    const ch = this.channels.get(channelId);
    if (!ch) return false;
    ch.subscribers.add(pid);
    return true;
  }

  publishChannel(channelId: string): number {
    const ch = this.channels.get(channelId);
    if (!ch) return 0;
    ch.eventCount++;
    return ch.subscribers.size;
  }

  // ── Stats ────────────────────────────────────────────────────

  getStats() {
    return {
      ports: this.ports.size,
      capabilities: this.capabilities.size,
      activeCapabilities: Array.from(this.capabilities.values()).filter(c => !c.revoked).length,
      sharedRegions: this.sharedRegions.size,
      totalShmBytes: Array.from(this.sharedRegions.values()).reduce((s, r) => s + r.sizeBytes, 0),
      signalsSent: this.signalLog.length,
      eventChannels: this.channels.size,
      pendingMessages: Array.from(this.ports.values()).reduce((s, p) => s + p.pending.length, 0),
    };
  }
}
