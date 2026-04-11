// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Display Protocol
// Wayland-inspired client-server display protocol with surface
// management, frame callbacks, buffer exchange, and subsurfaces.
// ═══════════════════════════════════════════════════════════════

// ── Protocol Object Types ─────────────────────────────────────

export type ProtocolObjectType =
  | "wl_display" | "wl_registry" | "wl_compositor" | "wl_surface"
  | "wl_buffer" | "wl_shm" | "wl_shm_pool" | "wl_seat"
  | "wl_keyboard" | "wl_pointer" | "wl_touch"
  | "wl_output" | "wl_callback" | "wl_region"
  | "xdg_wm_base" | "xdg_surface" | "xdg_toplevel" | "xdg_popup"
  | "wl_subsurface" | "wl_data_device_manager" | "wl_data_device";

export type SurfaceRole = "none" | "xdg_toplevel" | "xdg_popup" | "subsurface" | "cursor" | "dnd-icon";
export type BufferFormat = "argb8888" | "xrgb8888" | "rgba8888" | "rgb888" | "rgb565";
export type SurfaceCommitState = "pending" | "committed" | "displayed";

// ── Protocol Client ───────────────────────────────────────────

export interface ProtocolClient {
  id: string;
  pid: number;
  displayName: string;
  connectedAt: number;
  surfaces: string[];         // surface IDs owned
  shmPools: string[];
  authenticated: boolean;
  protocolVersion: number;
}

// ── Surface ───────────────────────────────────────────────────

export interface ProtocolSurface {
  id: string;
  clientId: string;
  role: SurfaceRole;
  parentSurface: string | null;   // for subsurfaces
  attachedBuffer: string | null;
  pendingBuffer: string | null;
  commitState: SurfaceCommitState;
  damage: Array<{ x: number; y: number; width: number; height: number }>;
  opaqueRegion: Array<{ x: number; y: number; width: number; height: number }>;
  inputRegion: Array<{ x: number; y: number; width: number; height: number }>;
  subsurfaces: string[];
  // Transform
  bufferScale: number;
  bufferTransform: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // wl_output.transform values
  // Frame callback
  frameCallbackPending: boolean;
  lastFrameTime: number;
  framesPresented: number;
  createdAt: number;
}

// ── Buffer (SHM) ──────────────────────────────────────────────

export interface ProtocolBuffer {
  id: string;
  poolId: string;
  format: BufferFormat;
  width: number;
  height: number;
  stride: number;
  offset: number;
  busy: boolean;              // Currently being composited
  released: boolean;
  createdAt: number;
}

export interface SHMPool {
  id: string;
  clientId: string;
  size: number;               // bytes
  fd: number;                 // simulated file descriptor
  buffers: string[];
  createdAt: number;
}

// ── XDG Shell ─────────────────────────────────────────────────

export interface XDGToplevel {
  surfaceId: string;
  title: string;
  appId: string;
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  states: Array<"maximized" | "fullscreen" | "resizing" | "activated" | "tiled-left" | "tiled-right" | "tiled-top" | "tiled-bottom">;
  configured: boolean;
  configureSerial: number;
}

export interface XDGPopup {
  surfaceId: string;
  parentSurfaceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  constraintAdjustment: number;
}

// ── Protocol Events ───────────────────────────────────────────

export type ProtocolEvent =
  | { type: "client_connected"; clientId: string }
  | { type: "client_disconnected"; clientId: string }
  | { type: "surface_created"; surfaceId: string; clientId: string }
  | { type: "surface_committed"; surfaceId: string }
  | { type: "surface_destroyed"; surfaceId: string }
  | { type: "buffer_attached"; surfaceId: string; bufferId: string }
  | { type: "buffer_released"; bufferId: string }
  | { type: "frame_done"; surfaceId: string; timestamp: number }
  | { type: "toplevel_configure"; surfaceId: string; width: number; height: number; states: string[] }
  | { type: "ping"; serial: number }
  | { type: "pong"; serial: number; clientId: string };

// ── Protocol Stats ────────────────────────────────────────────

export interface DisplayProtocolStats {
  connectedClients: number;
  totalSurfaces: number;
  activeSurfaces: number;
  shmPoolCount: number;
  totalShmBytes: number;
  bufferCount: number;
  busyBuffers: number;
  framesPresented: number;
  toplevelCount: number;
  popupCount: number;
  subsurfaceCount: number;
  eventCount: number;
}

// ── Display Protocol Implementation ───────────────────────────

export class DisplayProtocol {
  private clients: Map<string, ProtocolClient> = new Map();
  private surfaces: Map<string, ProtocolSurface> = new Map();
  private buffers: Map<string, ProtocolBuffer> = new Map();
  private shmPools: Map<string, SHMPool> = new Map();
  private toplevels: Map<string, XDGToplevel> = new Map();
  private popups: Map<string, XDGPopup> = new Map();
  private eventLog: ProtocolEvent[] = [];
  private nextId = 1;
  private nextSerial = 1;
  private totalFrames = 0;

  // ── Client Management ─────────────────────────────────────

  connectClient(pid: number, displayName: string): ProtocolClient {
    const id = `client-${this.nextId++}`;
    const client: ProtocolClient = {
      id, pid, displayName, connectedAt: Date.now(),
      surfaces: [], shmPools: [], authenticated: true, protocolVersion: 1,
    };
    this.clients.set(id, client);
    this.emit({ type: "client_connected", clientId: id });
    return client;
  }

  disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    // Cleanup all client resources
    for (const surfId of [...client.surfaces]) this.destroySurface(surfId);
    for (const poolId of [...client.shmPools]) this.destroySHMPool(poolId);
    this.clients.delete(clientId);
    this.emit({ type: "client_disconnected", clientId });
  }

  // ── Surface Management ────────────────────────────────────

  createSurface(clientId: string): ProtocolSurface | null {
    const client = this.clients.get(clientId);
    if (!client) return null;
    const id = `surf-${this.nextId++}`;
    const surface: ProtocolSurface = {
      id, clientId, role: "none", parentSurface: null,
      attachedBuffer: null, pendingBuffer: null,
      commitState: "pending",
      damage: [], opaqueRegion: [], inputRegion: [],
      subsurfaces: [],
      bufferScale: 1, bufferTransform: 0,
      frameCallbackPending: false,
      lastFrameTime: 0, framesPresented: 0,
      createdAt: Date.now(),
    };
    this.surfaces.set(id, surface);
    client.surfaces.push(id);
    this.emit({ type: "surface_created", surfaceId: id, clientId });
    return surface;
  }

  destroySurface(surfaceId: string): boolean {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return false;
    // Release buffer
    if (surface.attachedBuffer) this.releaseBuffer(surface.attachedBuffer);
    // Remove subsurfaces
    for (const subId of surface.subsurfaces) this.destroySurface(subId);
    // Remove toplevels/popups
    this.toplevels.delete(surfaceId);
    this.popups.delete(surfaceId);
    // Remove from client
    const client = this.clients.get(surface.clientId);
    if (client) client.surfaces = client.surfaces.filter(s => s !== surfaceId);
    this.surfaces.delete(surfaceId);
    this.emit({ type: "surface_destroyed", surfaceId });
    return true;
  }

  // ── Buffer Management ─────────────────────────────────────

  createSHMPool(clientId: string, size: number): SHMPool | null {
    const client = this.clients.get(clientId);
    if (!client) return null;
    const id = `pool-${this.nextId++}`;
    const pool: SHMPool = {
      id, clientId, size, fd: this.nextId++, buffers: [], createdAt: Date.now(),
    };
    this.shmPools.set(id, pool);
    client.shmPools.push(id);
    return pool;
  }

  createBuffer(poolId: string, format: BufferFormat, width: number, height: number, stride: number, offset = 0): ProtocolBuffer | null {
    const pool = this.shmPools.get(poolId);
    if (!pool) return null;
    const requiredSize = offset + stride * height;
    if (requiredSize > pool.size) return null;
    const id = `buf-${this.nextId++}`;
    const buffer: ProtocolBuffer = {
      id, poolId, format, width, height, stride, offset,
      busy: false, released: false, createdAt: Date.now(),
    };
    this.buffers.set(id, buffer);
    pool.buffers.push(id);
    return buffer;
  }

  attachBuffer(surfaceId: string, bufferId: string): boolean {
    const surface = this.surfaces.get(surfaceId);
    const buffer = this.buffers.get(bufferId);
    if (!surface || !buffer) return false;
    surface.pendingBuffer = bufferId;
    return true;
  }

  private releaseBuffer(bufferId: string): void {
    const buffer = this.buffers.get(bufferId);
    if (buffer) {
      buffer.busy = false;
      buffer.released = true;
      this.emit({ type: "buffer_released", bufferId });
    }
  }

  private destroySHMPool(poolId: string): void {
    const pool = this.shmPools.get(poolId);
    if (!pool) return;
    for (const bufId of pool.buffers) this.buffers.delete(bufId);
    const client = this.clients.get(pool.clientId);
    if (client) client.shmPools = client.shmPools.filter(p => p !== poolId);
    this.shmPools.delete(poolId);
  }

  // ── Surface Commit ────────────────────────────────────────

  commitSurface(surfaceId: string): boolean {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return false;

    // Release old buffer
    if (surface.attachedBuffer && surface.pendingBuffer !== surface.attachedBuffer) {
      this.releaseBuffer(surface.attachedBuffer);
    }

    // Attach pending buffer
    if (surface.pendingBuffer) {
      surface.attachedBuffer = surface.pendingBuffer;
      surface.pendingBuffer = null;
      const buf = this.buffers.get(surface.attachedBuffer);
      if (buf) {
        buf.busy = true;
        buf.released = false;
      }
      this.emit({ type: "buffer_attached", surfaceId, bufferId: surface.attachedBuffer });
    }

    surface.commitState = "committed";
    surface.damage = []; // Clear damage after commit
    this.emit({ type: "surface_committed", surfaceId });
    return true;
  }

  // ── Frame Callbacks ───────────────────────────────────────

  requestFrameCallback(surfaceId: string): boolean {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return false;
    surface.frameCallbackPending = true;
    return true;
  }

  sendFrameCallbacks(): void {
    const now = Date.now();
    for (const surface of this.surfaces.values()) {
      if (surface.frameCallbackPending && surface.attachedBuffer) {
        surface.frameCallbackPending = false;
        surface.lastFrameTime = now;
        surface.framesPresented++;
        surface.commitState = "displayed";
        this.totalFrames++;
        this.emit({ type: "frame_done", surfaceId: surface.id, timestamp: now });
      }
    }
  }

  // ── XDG Shell ─────────────────────────────────────────────

  createXDGToplevel(surfaceId: string, title: string, appId: string): XDGToplevel | null {
    const surface = this.surfaces.get(surfaceId);
    if (!surface || surface.role !== "none") return null;
    surface.role = "xdg_toplevel";
    const toplevel: XDGToplevel = {
      surfaceId, title, appId,
      minSize: { width: 1, height: 1 },
      maxSize: { width: 0, height: 0 }, // 0 = no max
      states: ["activated"], configured: false,
      configureSerial: this.nextSerial++,
    };
    this.toplevels.set(surfaceId, toplevel);
    return toplevel;
  }

  configureXDGToplevel(surfaceId: string, width: number, height: number, states: XDGToplevel["states"]): boolean {
    const toplevel = this.toplevels.get(surfaceId);
    if (!toplevel) return false;
    toplevel.states = states;
    toplevel.configureSerial = this.nextSerial++;
    toplevel.configured = true;
    this.emit({ type: "toplevel_configure", surfaceId, width, height, states: states as string[] });
    return true;
  }

  createXDGPopup(surfaceId: string, parentSurfaceId: string, x: number, y: number, width: number, height: number): XDGPopup | null {
    const surface = this.surfaces.get(surfaceId);
    const parent = this.surfaces.get(parentSurfaceId);
    if (!surface || !parent || surface.role !== "none") return null;
    surface.role = "xdg_popup";
    surface.parentSurface = parentSurfaceId;
    const popup: XDGPopup = {
      surfaceId, parentSurfaceId, x, y, width, height, constraintAdjustment: 0,
    };
    this.popups.set(surfaceId, popup);
    return popup;
  }

  // ── Subsurfaces ───────────────────────────────────────────

  createSubsurface(surfaceId: string, parentSurfaceId: string): boolean {
    const surface = this.surfaces.get(surfaceId);
    const parent = this.surfaces.get(parentSurfaceId);
    if (!surface || !parent || surface.role !== "none") return false;
    surface.role = "subsurface";
    surface.parentSurface = parentSurfaceId;
    parent.subsurfaces.push(surfaceId);
    return true;
  }

  // ── Ping/Pong (hang detection) ────────────────────────────

  pingClient(clientId: string): number {
    const serial = this.nextSerial++;
    this.emit({ type: "ping", serial });
    return serial;
  }

  pongClient(clientId: string, serial: number): void {
    this.emit({ type: "pong", serial, clientId });
  }

  // ── Queries ───────────────────────────────────────────────

  getClient(id: string): ProtocolClient | undefined { return this.clients.get(id); }
  getSurface(id: string): ProtocolSurface | undefined { return this.surfaces.get(id); }
  getBuffer(id: string): ProtocolBuffer | undefined { return this.buffers.get(id); }
  getToplevel(surfaceId: string): XDGToplevel | undefined { return this.toplevels.get(surfaceId); }
  listClients(): ProtocolClient[] { return Array.from(this.clients.values()); }
  listSurfaces(): ProtocolSurface[] { return Array.from(this.surfaces.values()); }

  // ── Events ────────────────────────────────────────────────

  private emit(event: ProtocolEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > 1000) this.eventLog = this.eventLog.slice(-500);
  }

  getEventLog(limit = 50): ProtocolEvent[] { return this.eventLog.slice(-limit); }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): DisplayProtocolStats {
    let totalShm = 0;
    for (const pool of this.shmPools.values()) totalShm += pool.size;
    return {
      connectedClients: this.clients.size,
      totalSurfaces: this.surfaces.size,
      activeSurfaces: Array.from(this.surfaces.values()).filter(s => s.attachedBuffer).length,
      shmPoolCount: this.shmPools.size,
      totalShmBytes: totalShm,
      bufferCount: this.buffers.size,
      busyBuffers: Array.from(this.buffers.values()).filter(b => b.busy).length,
      framesPresented: this.totalFrames,
      toplevelCount: this.toplevels.size,
      popupCount: this.popups.size,
      subsurfaceCount: Array.from(this.surfaces.values()).filter(s => s.role === "subsurface").length,
      eventCount: this.eventLog.length,
    };
  }
}
