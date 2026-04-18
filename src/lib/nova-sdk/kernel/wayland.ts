// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Wayland Protocol Simulator
// Models a Wayland-like display protocol: clients, globals,
// frame callbacks, buffer negotiation, surface commits
// ═══════════════════════════════════════════════════════════════

export interface WaylandGlobal {
  name: number;
  interface: string;
  version: number;
  bindCount: number;
  description: string;
}

export type WaylandBufferFormat =
  | "argb8888" | "xrgb8888" | "rgb565"
  | "abgr8888" | "nv12" | "yuyv"
  | "argb2101010" | "xrgb2101010";

export interface WaylandShmPool {
  poolId: number;
  size: number;      // bytes
  usedBytes: number;
  bufferCount: number;
  format: WaylandBufferFormat;
}

export interface WaylandSurface {
  surfaceId: number;
  clientId: number;
  committed: boolean;
  damageRects: number;
  attachedBuffer: number | null;
  frameCallbackPending: boolean;
  subsurfaces: number;
  role: "toplevel" | "popup" | "subsurface" | "cursor" | "none";
  title: string;
}

export interface WaylandClient {
  clientId: number;
  pid: number;
  appId: string;
  connectedAt: number;        // timestamp ms
  objectCount: number;        // wl_resource count
  surfaces: number[];         // surfaceId list
  boundGlobals: string[];     // interfaces bound
  framesSubmitted: number;
  framesDropped: number;
  lastFrameTime: number;      // ms
  frameRate: number;           // computed fps
  shmPools: WaylandShmPool[];
  protocol: "core" | "xdg-shell" | "xdg-decoration" | "wp-viewporter";
  negotiatedFormats: WaylandBufferFormat[];
  bytesTransferred: number;
}

export interface WaylandFrameEvent {
  clientId: number;
  surfaceId: number;
  timestamp: number;
  latencyUs: number;
  presented: boolean;
  format: WaylandBufferFormat;
  
}

export interface WaylandStats {
  totalClients: number;
  totalSurfaces: number;
  totalGlobals: number;
  globalBinds: number;
  totalFramesSubmitted: number;
  totalFramesDropped: number;
  avgFrameRate: number;
  totalShmPools: number;
  totalShmBytes: number;
  activeFormats: WaylandBufferFormat[];
  protocolVersion: string;
  compositorName: string;
}

// ── Wayland Compositor Server ────────────────────────────────

class WaylandServerClass {
  private clients = new Map<number, WaylandClient>();
  private surfaces = new Map<number, WaylandSurface>();
  private globals: WaylandGlobal[] = [];
  private frameLog: WaylandFrameEvent[] = [];
  private nextClientId = 1;
  private nextSurfaceId = 1;
  private nextGlobalName = 1;
  private nextPoolId = 1;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  /** Initialize with standard Wayland globals */
  boot(): void {
    this.globals = [];
    this.registerGlobal("wl_compositor", 5, "Core surface/region factory");
    this.registerGlobal("wl_subcompositor", 1, "Subsurface management");
    this.registerGlobal("wl_shm", 1, "Shared memory buffer allocation");
    this.registerGlobal("wl_output", 4, "Display output advertisement");
    this.registerGlobal("wl_seat", 8, "Input device group (pointer/keyboard/touch)");
    this.registerGlobal("wl_data_device_manager", 3, "Clipboard & DnD negotiation");
    this.registerGlobal("xdg_wm_base", 5, "XDG shell — toplevel/popup management");
    this.registerGlobal("zxdg_decoration_manager_v1", 1, "Server-side decoration negotiation");
    this.registerGlobal("wp_viewporter", 1, "Surface cropping/scaling");
    this.registerGlobal("wp_fractional_scale_manager_v1", 1, "Fractional scaling protocol");
    this.registerGlobal("wp_linux_dmabuf_v1", 4, "DMA-BUF buffer import (GPU zero-copy)");
    this.registerGlobal("wp_presentation_feedback", 1, "Presentation timing feedback");
    this.registerGlobal("zwp_linux_explicit_synchronization_v1", 1, "Explicit buffer sync fences");
    this.registerGlobal("ext_session_lock_manager_v1", 1, "Screen lock protocol");

    // Start simulation tick
    this.startSimulation();
    console.log(`[Kernel:Wayland] Server booted — ${this.globals.length} globals registered`);
  }

  private registerGlobal(iface: string, version: number, description: string): void {
    this.globals.push({
      name: this.nextGlobalName++,
      interface: iface,
      version,
      bindCount: 0,
      description,
    });
  }

  /** Connect a client (called when an app process starts) */
  connectClient(pid: number, appId: string): number {
    const clientId = this.nextClientId++;
    const formats = this.negotiateFormats();
    const client: WaylandClient = {
      clientId,
      pid,
      appId,
      connectedAt: Date.now(),
      objectCount: 2,  // wl_display + wl_registry
      surfaces: [],
      boundGlobals: [],
      framesSubmitted: 0,
      framesDropped: 0,
      lastFrameTime: 0,
      frameRate: 0,
      shmPools: [],
      protocol: "xdg-shell",
      negotiatedFormats: formats,
      bytesTransferred: 0,
    };

    // Auto-bind essential globals
    for (const g of this.globals) {
      if (["wl_compositor", "wl_shm", "xdg_wm_base", "wl_seat"].includes(g.interface)) {
        client.boundGlobals.push(g.interface);
        client.objectCount++;
        g.bindCount++;
      }
    }

    // Auto-create an shm pool
    const pool: WaylandShmPool = {
      poolId: this.nextPoolId++,
      size: 1920 * 1080 * 4 * 3, // triple-buffered at 1080p
      usedBytes: 1920 * 1080 * 4, // one buffer allocated
      bufferCount: 1,
      format: formats[0],
    };
    client.shmPools.push(pool);

    this.clients.set(clientId, client);
    console.log(`[Kernel:Wayland] Client ${clientId} connected (PID ${pid}, "${appId}")`);
    return clientId;
  }

  /** Disconnect a client */
  disconnectClient(clientId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    // Remove surfaces
    for (const sid of client.surfaces) {
      this.surfaces.delete(sid);
    }
    this.clients.delete(clientId);
    console.log(`[Kernel:Wayland] Client ${clientId} disconnected`);
  }

  /** Create a surface for a client */
  createSurface(clientId: number, role: WaylandSurface["role"] = "toplevel", title = ""): number {
    const client = this.clients.get(clientId);
    if (!client) return -1;

    const surfaceId = this.nextSurfaceId++;
    const surface: WaylandSurface = {
      surfaceId,
      clientId,
      committed: false,
      damageRects: 0,
      attachedBuffer: null,
      frameCallbackPending: false,
      subsurfaces: 0,
      role,
      title: title || client.appId,
    };
    this.surfaces.set(surfaceId, surface);
    client.surfaces.push(surfaceId);
    client.objectCount += 3; // wl_surface + xdg_surface + xdg_toplevel

    // Bind xdg-decoration if toplevel
    if (role === "toplevel" && !client.boundGlobals.includes("zxdg_decoration_manager_v1")) {
      client.boundGlobals.push("zxdg_decoration_manager_v1");
      const g = this.globals.find(g => g.interface === "zxdg_decoration_manager_v1");
      if (g) g.bindCount++;
    }

    return surfaceId;
  }

  /** Submit a frame (wl_surface.commit with frame callback) */
  submitFrame(clientId: number, surfaceId: number): void {
    const client = this.clients.get(clientId);
    const surface = this.surfaces.get(surfaceId);
    if (!client || !surface) return;

    const now = performance.now();
    const latency = client.lastFrameTime > 0 ? (now - client.lastFrameTime) * 1000 : 16666;
    const dropped = latency > 20000; // >20ms = dropped

    surface.committed = true;
    surface.damageRects++;
    surface.frameCallbackPending = false;
    client.framesSubmitted++;
    if (dropped) client.framesDropped++;
    client.lastFrameTime = now;
    client.bytesTransferred += 1920 * 1080 * 4; // one buffer

    // Compute rolling fps
    if (client.framesSubmitted > 2) {
      const elapsed = (now - client.connectedAt) / 1000;
      client.frameRate = Math.round((client.framesSubmitted / elapsed) * 10) / 10;
    }

    const event: WaylandFrameEvent = {
      clientId,
      surfaceId,
      timestamp: now,
      latencyUs: Math.round(latency),
      presented: !dropped,
      format: client.negotiatedFormats[0],
    };
    this.frameLog.push(event);
    if (this.frameLog.length > 200) this.frameLog.splice(0, 100);
  }

  /** Get recent frame events */
  getFrameLog(count = 20): WaylandFrameEvent[] {
    return this.frameLog.slice(-count);
  }

  /** Negotiate buffer formats (simulates wl_shm.format events) */
  private negotiateFormats(): WaylandBufferFormat[] {
    const base: WaylandBufferFormat[] = ["argb8888", "xrgb8888"];
    const extended: WaylandBufferFormat[] = ["rgb565", "abgr8888", "argb2101010", "nv12"];
    // Each client gets base + random subset of extended
    const extra = extended.filter(() => Math.random() > 0.5);
    return [...base, ...extra];
  }

  /** Simulation tick — auto-submit frames for connected clients */
  private startSimulation(): void {
    if (this.tickInterval) return;

    // Seed some demo clients
    this.seedDemoClients();

    this.tickInterval = setInterval(() => {
      for (const [, client] of this.clients) {
        // Each client submits ~60fps worth of frames per tick
        for (const sid of client.surfaces) {
          if (Math.random() > 0.3) { // 70% chance each tick
            this.submitFrame(client.clientId, sid);
          }
        }
      }
    }, 500);
  }

  private seedDemoClients(): void {
    const demos = [
      { pid: 120, appId: "sita-desktop", surfaces: [{ role: "toplevel" as const, title: "Desktop Shell" }] },
      { pid: 145, appId: "sita-panel", surfaces: [{ role: "toplevel" as const, title: "System Panel" }, { role: "popup" as const, title: "Notification Popup" }] },
      { pid: 200, appId: "nova-terminal", surfaces: [{ role: "toplevel" as const, title: "Terminal" }] },
      { pid: 218, appId: "nova-files", surfaces: [{ role: "toplevel" as const, title: "File Manager" }] },
      { pid: 235, appId: "nova-browser", surfaces: [{ role: "toplevel" as const, title: "Browser" }, { role: "popup" as const, title: "Download Dialog" }] },
      { pid: 260, appId: "nova-settings", surfaces: [{ role: "toplevel" as const, title: "Settings" }] },
      { pid: 275, appId: "nova-code", surfaces: [{ role: "toplevel" as const, title: "Code Editor" }, { role: "subsurface" as const, title: "Minimap Overlay" }] },
    ];

    for (const d of demos) {
      const cid = this.connectClient(d.pid, d.appId);
      for (const s of d.surfaces) {
        this.createSurface(cid, s.role, s.title);
      }
      // Simulate some initial frames
      const client = this.clients.get(cid);
      if (client) {
        client.framesSubmitted = Math.floor(Math.random() * 5000) + 500;
        client.framesDropped = Math.floor(client.framesSubmitted * (Math.random() * 0.03));
        client.frameRate = 55 + Math.random() * 10;
        client.bytesTransferred = client.framesSubmitted * 1920 * 1080 * 4;
      }
    }
  }

  /** Get all clients */
  listClients(): WaylandClient[] {
    return Array.from(this.clients.values());
  }

  /** Get all surfaces */
  listSurfaces(): WaylandSurface[] {
    return Array.from(this.surfaces.values());
  }

  /** Get registered globals */
  listGlobals(): WaylandGlobal[] {
    return [...this.globals];
  }

  /** Get aggregate stats */
  getStats(): WaylandStats {
    const clients = this.listClients();
    const allFormats = new Set<WaylandBufferFormat>();
    let totalFrames = 0, totalDropped = 0, totalShm = 0, totalShmBytes = 0, fpsSum = 0;

    for (const c of clients) {
      totalFrames += c.framesSubmitted;
      totalDropped += c.framesDropped;
      fpsSum += c.frameRate;
      for (const f of c.negotiatedFormats) allFormats.add(f);
      for (const p of c.shmPools) {
        totalShm++;
        totalShmBytes += p.size;
      }
    }

    return {
      totalClients: clients.length,
      totalSurfaces: this.surfaces.size,
      totalGlobals: this.globals.length,
      globalBinds: this.globals.reduce((s, g) => s + g.bindCount, 0),
      totalFramesSubmitted: totalFrames,
      totalFramesDropped: totalDropped,
      avgFrameRate: clients.length > 0 ? Math.round((fpsSum / clients.length) * 10) / 10 : 0,
      totalShmPools: totalShm,
      totalShmBytes,
      activeFormats: Array.from(allFormats),
      protocolVersion: "wayland-1.22.0",
      compositorName: "Nova Compositor (Wayland)",
    };
  }

  /** Stop simulation and reset */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  reset(): void {
    this.stop();
    this.clients.clear();
    this.surfaces.clear();
    this.globals = [];
    this.frameLog = [];
    this.nextClientId = 1;
    this.nextSurfaceId = 1;
    this.nextGlobalName = 1;
    this.nextPoolId = 1;
  }
}

export const WaylandServer = new WaylandServerClass();
