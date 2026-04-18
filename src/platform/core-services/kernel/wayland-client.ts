// ═══════════════════════════════════════════════════════════════
// SITA OS — Wayland-Like Client Protocol Layer
// Formal client-side API for applications to negotiate surfaces,
// submit frame buffers, and receive compositor feedback through
// a structured protocol modeled after the Wayland wire protocol.
// ═══════════════════════════════════════════════════════════════

import type { DisplayProtocol, ProtocolClient, ProtocolSurface, ProtocolBuffer, SHMPool, XDGToplevel, XDGPopup, BufferFormat, ProtocolEvent } from "./display-protocol";
import type { SurfaceAllocator, SurfaceAllocation, SurfacePixelFormat } from "./surface-allocator";

// ── Registry & Global Objects ─────────────────────────────────

export type WlGlobalName =
  | "wl_compositor" | "wl_shm" | "wl_seat" | "wl_output"
  | "xdg_wm_base" | "wl_data_device_manager"
  | "wp_viewporter" | "wp_fractional_scale_manager"
  | "wp_linux_dmabuf" | "zwp_text_input_manager";

export interface WlGlobal {
  name: WlGlobalName;
  version: number;
  bound: boolean;
  bindCount: number;
}

export interface WlRegistryState {
  globals: Map<WlGlobalName, WlGlobal>;
  boundInterfaces: Set<WlGlobalName>;
}

// ── Format Negotiation ────────────────────────────────────────

export interface FormatNegotiationResult {
  requestedFormat: SurfacePixelFormat;
  grantedFormat: SurfacePixelFormat;
  fallback: boolean;
  reason: string;
  modifiers: bigint[];
}

export interface BufferCapabilities {
  supportedFormats: SurfacePixelFormat[];
  supportedModifiers: Map<SurfacePixelFormat, bigint[]>;
  maxWidth: number;
  maxHeight: number;
  supportsLinearLayout: boolean;
  supportsTiledLayout: boolean;
  supportsDmaBuf: boolean;
}

// ── Frame Submission ──────────────────────────────────────────

export type FrameState = "pending" | "submitted" | "composited" | "presented" | "dropped";

export interface FrameSubmission {
  id: string;
  surfaceId: string;
  bufferId: string;
  damage: Array<{ x: number; y: number; width: number; height: number }>;
  transform: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  scale: number;
  state: FrameState;
  submittedAt: number;
  compositedAt: number | null;
  presentedAt: number | null;
  presentationFeedback: PresentationFeedback | null;
}

// ── Compositor Feedback ───────────────────────────────────────

export type FeedbackKind =
  | "frame_done"         // frame callback fired
  | "buffer_released"    // buffer returned to client
  | "configure"          // compositor requests resize
  | "close_request"      // compositor wants window closed
  | "ping"               // responsiveness check
  | "enter_output"       // surface entered a new output
  | "leave_output"       // surface left an output
  | "preferred_scale"    // compositor suggests scale factor
  | "sync_output"        // VSync / presentation timing
  | "error";             // protocol error

export interface CompositorFeedback {
  kind: FeedbackKind;
  surfaceId: string | null;
  serial: number;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface PresentationFeedback {
  tvSecHi: number;       // upper 32 bits of presentation timestamp
  tvSecLo: number;       // lower 32 bits
  tvNsec: number;        // nanosecond fraction
  refresh: number;       // output refresh interval (ns)
  seqHi: number;         // MSC high bits
  seqLo: number;         // MSC low bits
  flags: PresentationFlag[];
}

export type PresentationFlag =
  | "vsync"              // presented at vblank
  | "hw_clock"           // timestamp from hardware clock
  | "hw_completion"      // completion from hardware
  | "zero_copy";         // zero-copy scanout achieved

// ── Client Connection Lifecycle ───────────────────────────────

export type ConnectionState = "connecting" | "connected" | "ready" | "suspended" | "disconnecting" | "disconnected" | "error";

export interface ClientConnectionStats {
  state: ConnectionState;
  pid: number;
  appId: string;
  connectedAt: number;
  surfaceCount: number;
  framesSubmitted: number;
  framesPresented: number;
  framesDropped: number;
  avgFrameLatencyMs: number;
  bufferNegotiations: number;
  feedbacksReceived: number;
  errorsEncountered: number;
  boundGlobals: string[];
}

// ── Wayland Client Connection ─────────────────────────────────

export class WaylandClientConnection {
  // Internal identity
  private pid: number;
  private appId: string;
  private state: ConnectionState = "connecting";

  // Protocol objects
  private protocolClient: ProtocolClient | null = null;
  private registry: WlRegistryState;
  private surfaces: Map<string, ProtocolSurface> = new Map();
  private shmPools: Map<string, SHMPool> = new Map();
  private buffers: Map<string, ProtocolBuffer> = new Map();
  private toplevels: Map<string, XDGToplevel> = new Map();
  private popups: Map<string, XDGPopup> = new Map();

  // Frame tracking
  private frameSubmissions: Map<string, FrameSubmission> = new Map();
  private feedbackLog: CompositorFeedback[] = [];
  private nextFrameId = 1;
  private totalSubmitted = 0;
  private totalPresented = 0;
  private totalDropped = 0;
  private frameTimes: number[] = [];

  // Buffer negotiation
  private negotiatedFormats: Map<string, FormatNegotiationResult> = new Map();
  private negotiationCount = 0;

  // Feedback listeners
  private feedbackListeners: Array<(fb: CompositorFeedback) => void> = [];
  private nextSerial = 1;

  // References to kernel subsystems
  private protocol: DisplayProtocol;
  private allocator: SurfaceAllocator;

  constructor(
    pid: number,
    appId: string,
    protocol: DisplayProtocol,
    allocator: SurfaceAllocator,
  ) {
    this.pid = pid;
    this.appId = appId;
    this.protocol = protocol;
    this.allocator = allocator;

    // Initialize registry with advertised globals
    this.registry = {
      globals: new Map([
        ["wl_compositor", { name: "wl_compositor", version: 6, bound: false, bindCount: 0 }],
        ["wl_shm", { name: "wl_shm", version: 1, bound: false, bindCount: 0 }],
        ["wl_seat", { name: "wl_seat", version: 9, bound: false, bindCount: 0 }],
        ["wl_output", { name: "wl_output", version: 4, bound: false, bindCount: 0 }],
        ["xdg_wm_base", { name: "xdg_wm_base", version: 6, bound: false, bindCount: 0 }],
        ["wl_data_device_manager", { name: "wl_data_device_manager", version: 3, bound: false, bindCount: 0 }],
        ["wp_viewporter", { name: "wp_viewporter", version: 1, bound: false, bindCount: 0 }],
        ["wp_fractional_scale_manager", { name: "wp_fractional_scale_manager", version: 1, bound: false, bindCount: 0 }],
        ["wp_linux_dmabuf", { name: "wp_linux_dmabuf", version: 4, bound: false, bindCount: 0 }],
        ["zwp_text_input_manager", { name: "zwp_text_input_manager", version: 3, bound: false, bindCount: 0 }],
      ]),
      boundInterfaces: new Set(),
    };
  }

  // ── Connection Lifecycle ──────────────────────────────────

  connect(): boolean {
    if (this.state !== "connecting") return false;
    this.protocolClient = this.protocol.connectClient(this.pid, this.appId);
    if (!this.protocolClient) {
      this.state = "error";
      return false;
    }
    this.state = "connected";
    return true;
  }

  /**
   * Bind required globals — transitions to "ready" when minimum
   * interfaces (wl_compositor, wl_shm, xdg_wm_base) are bound.
   */
  bindGlobal(name: WlGlobalName): boolean {
    if (this.state !== "connected" && this.state !== "ready") return false;
    const global = this.registry.globals.get(name);
    if (!global) return false;
    global.bound = true;
    global.bindCount++;
    this.registry.boundInterfaces.add(name);

    // Check if ready
    const required: WlGlobalName[] = ["wl_compositor", "wl_shm", "xdg_wm_base"];
    if (required.every(r => this.registry.boundInterfaces.has(r))) {
      this.state = "ready";
    }
    return true;
  }

  /**
   * Convenience: bind all required globals in one call.
   */
  bindDefaults(): boolean {
    return (
      this.bindGlobal("wl_compositor") &&
      this.bindGlobal("wl_shm") &&
      this.bindGlobal("xdg_wm_base") &&
      this.bindGlobal("wl_seat") &&
      this.bindGlobal("wl_output")
    );
  }

  disconnect(): void {
    if (!this.protocolClient) return;
    this.state = "disconnecting";
    // Clean up all surfaces
    for (const surfId of this.surfaces.keys()) {
      this.protocol.destroySurface(surfId);
    }
    this.protocol.disconnectClient(this.protocolClient.id);
    this.surfaces.clear();
    this.shmPools.clear();
    this.buffers.clear();
    this.toplevels.clear();
    this.popups.clear();
    this.frameSubmissions.clear();
    this.protocolClient = null;
    this.state = "disconnected";
  }

  // ── Format Negotiation ────────────────────────────────────

  getBufferCapabilities(): BufferCapabilities {
    const formats: SurfacePixelFormat[] = [
      "argb8888", "xrgb8888", "rgba8888", "rgb888", "rgb565", "rgba16f", "rgba32f",
    ];
    const modifiers = new Map<SurfacePixelFormat, bigint[]>();
    for (const f of formats) {
      modifiers.set(f, [BigInt(0)]); // LINEAR modifier
    }
    return {
      supportedFormats: formats,
      supportedModifiers: modifiers,
      maxWidth: 8192,
      maxHeight: 8192,
      supportsLinearLayout: true,
      supportsTiledLayout: true,
      supportsDmaBuf: true,
    };
  }

  negotiateFormat(
    surfaceId: string,
    preferred: SurfacePixelFormat,
    acceptable: SurfacePixelFormat[] = [],
  ): FormatNegotiationResult {
    this.negotiationCount++;
    const caps = this.getBufferCapabilities();
    const allAcceptable = [preferred, ...acceptable];

    for (const fmt of allAcceptable) {
      if (caps.supportedFormats.includes(fmt)) {
        const result: FormatNegotiationResult = {
          requestedFormat: preferred,
          grantedFormat: fmt,
          fallback: fmt !== preferred,
          reason: fmt === preferred ? "exact match" : `fallback from ${preferred}`,
          modifiers: [BigInt(0)],
        };
        this.negotiatedFormats.set(surfaceId, result);
        return result;
      }
    }

    // Fallback to compositor default
    const result: FormatNegotiationResult = {
      requestedFormat: preferred,
      grantedFormat: "argb8888",
      fallback: true,
      reason: "compositor default — no acceptable format matched",
      modifiers: [BigInt(0)],
    };
    this.negotiatedFormats.set(surfaceId, result);
    return result;
  }

  // ── Surface & Toplevel Creation ───────────────────────────

  createSurface(): ProtocolSurface | null {
    if (this.state !== "ready" || !this.protocolClient) return null;
    const surface = this.protocol.createSurface(this.protocolClient.id);
    if (surface) this.surfaces.set(surface.id, surface);
    return surface;
  }

  createToplevel(surfaceId: string, title: string): XDGToplevel | null {
    if (!this.surfaces.has(surfaceId)) return null;
    const toplevel = this.protocol.createXDGToplevel(surfaceId, title, this.appId);
    if (toplevel) this.toplevels.set(surfaceId, toplevel);
    return toplevel;
  }

  createPopup(surfaceId: string, parentSurfaceId: string, x: number, y: number, w: number, h: number): XDGPopup | null {
    if (!this.surfaces.has(surfaceId) || !this.surfaces.has(parentSurfaceId)) return null;
    const popup = this.protocol.createXDGPopup(surfaceId, parentSurfaceId, x, y, w, h);
    if (popup) this.popups.set(surfaceId, popup);
    return popup;
  }

  // ── Buffer Allocation ─────────────────────────────────────

  createSHMPool(size: number): SHMPool | null {
    if (!this.protocolClient) return null;
    const pool = this.protocol.createSHMPool(this.protocolClient.id, size);
    if (pool) this.shmPools.set(pool.id, pool);
    return pool;
  }

  allocateBuffer(
    poolId: string,
    format: BufferFormat,
    width: number,
    height: number,
    stride?: number,
  ): ProtocolBuffer | null {
    const computedStride = stride ?? width * 4;
    const buffer = this.protocol.createBuffer(poolId, format, width, height, computedStride);
    if (buffer) this.buffers.set(buffer.id, buffer);
    return buffer;
  }

  /**
   * High-level: allocate a surface buffer via the surface allocator
   * with proper format negotiation and alignment.
   */
  allocateSurfaceBuffer(
    surfaceId: string,
    width: number,
    height: number,
    format: SurfacePixelFormat = "argb8888",
  ): SurfaceAllocation {
    const negotiated = this.negotiatedFormats.get(surfaceId);
    const finalFormat = negotiated?.grantedFormat ?? format;
    return this.allocator.allocate({
      width, height, format: finalFormat, ownerId: surfaceId,
    });
  }

  // ── Frame Submission ──────────────────────────────────────

  /**
   * Submit a frame for compositing. This is the core render loop entry:
   * 1. Attach buffer to surface
   * 2. Record damage regions
   * 3. Commit surface
   * 4. Request frame callback
   */
  submitFrame(
    surfaceId: string,
    bufferId: string,
    damage?: Array<{ x: number; y: number; width: number; height: number }>,
    opts?: { transform?: FrameSubmission["transform"]; scale?: number },
  ): FrameSubmission | null {
    if (!this.surfaces.has(surfaceId)) return null;
    if (!this.buffers.has(bufferId) && !this.protocol.getBuffer(bufferId)) return null;

    // Attach
    if (!this.protocol.attachBuffer(surfaceId, bufferId)) return null;

    // Damage
    const dmg = damage ?? [{ x: 0, y: 0, width: 65535, height: 65535 }]; // full damage

    // Commit
    if (!this.protocol.commitSurface(surfaceId)) return null;

    // Request frame callback for next frame
    this.protocol.requestFrameCallback(surfaceId);

    const submission: FrameSubmission = {
      id: `frame-${this.nextFrameId++}`,
      surfaceId, bufferId,
      damage: dmg,
      transform: opts?.transform ?? 0,
      scale: opts?.scale ?? 1,
      state: "submitted",
      submittedAt: Date.now(),
      compositedAt: null,
      presentedAt: null,
      presentationFeedback: null,
    };
    this.frameSubmissions.set(submission.id, submission);
    this.totalSubmitted++;
    return submission;
  }

  /**
   * Simulate compositor presenting all pending frames
   * (drives frame callbacks on the protocol layer).
   */
  present(): PresentResult {
    // Fire all frame callbacks
    this.protocol.sendFrameCallbacks();

    const presented: string[] = [];
    const dropped: string[] = [];
    const now = Date.now();

    for (const [id, frame] of this.frameSubmissions) {
      if (frame.state === "submitted") {
        // Check if surface still exists and buffer was composited
        const surface = this.protocol.getSurface(frame.surfaceId);
        if (surface && surface.commitState === "displayed") {
          frame.state = "presented";
          frame.compositedAt = now - 2; // simulate ~2ms compositing
          frame.presentedAt = now;
          frame.presentationFeedback = this.generatePresentationFeedback(now);
          this.totalPresented++;
          this.frameTimes.push(now - frame.submittedAt);
          if (this.frameTimes.length > 120) this.frameTimes = this.frameTimes.slice(-60);
          presented.push(id);

          // Emit feedback
          this.emitFeedback({
            kind: "frame_done", surfaceId: frame.surfaceId,
            serial: this.nextSerial++, timestamp: now,
            payload: { frameId: id, latencyMs: now - frame.submittedAt },
          });
        } else {
          frame.state = "dropped";
          this.totalDropped++;
          dropped.push(id);
        }
      }
    }

    // Clean up old completed/dropped frames (keep last 32)
    const entries = Array.from(this.frameSubmissions.entries());
    if (entries.length > 64) {
      const toRemove = entries.slice(0, entries.length - 32);
      for (const [id] of toRemove) {
        const f = this.frameSubmissions.get(id);
        if (f && (f.state === "presented" || f.state === "dropped")) {
          this.frameSubmissions.delete(id);
        }
      }
    }

    return { presented, dropped, totalPresented: this.totalPresented, totalDropped: this.totalDropped };
  }

  // ── Compositor Feedback ───────────────────────────────────

  onFeedback(listener: (fb: CompositorFeedback) => void): () => void {
    this.feedbackListeners.push(listener);
    return () => {
      this.feedbackListeners = this.feedbackListeners.filter(l => l !== listener);
    };
  }

  /**
   * Respond to a compositor ping (responsiveness check).
   */
  pong(serial: number): void {
    if (!this.protocolClient) return;
    this.protocol.pongClient(this.protocolClient.id, serial);
    this.emitFeedback({
      kind: "ping", surfaceId: null,
      serial, timestamp: Date.now(),
      payload: { responded: true },
    });
  }

  /**
   * Acknowledge a configure event from the compositor.
   */
  ackConfigure(surfaceId: string, serial: number): boolean {
    const toplevel = this.toplevels.get(surfaceId);
    if (!toplevel) return false;
    toplevel.configured = true;
    return true;
  }

  /**
   * Inject feedback externally (used by compositor to notify client).
   */
  receiveFeedback(feedback: CompositorFeedback): void {
    this.emitFeedback(feedback);
  }

  // ── Surface Operations ────────────────────────────────────

  setSurfaceScale(surfaceId: string, scale: number): boolean {
    const surface = this.protocol.getSurface(surfaceId);
    if (!surface) return false;
    surface.bufferScale = scale;
    return true;
  }

  setSurfaceTransform(surfaceId: string, transform: ProtocolSurface["bufferTransform"]): boolean {
    const surface = this.protocol.getSurface(surfaceId);
    if (!surface) return false;
    surface.bufferTransform = transform;
    return true;
  }

  requestClose(surfaceId: string): void {
    this.emitFeedback({
      kind: "close_request", surfaceId,
      serial: this.nextSerial++, timestamp: Date.now(),
      payload: {},
    });
  }

  // ── Queries ───────────────────────────────────────────────

  getState(): ConnectionState { return this.state; }
  getPid(): number { return this.pid; }
  getAppId(): string { return this.appId; }

  getRegistryGlobals(): WlGlobal[] {
    return Array.from(this.registry.globals.values());
  }

  getBoundGlobals(): WlGlobalName[] {
    return Array.from(this.registry.boundInterfaces);
  }

  getSurfaces(): ProtocolSurface[] {
    return Array.from(this.surfaces.values());
  }

  getFrameSubmission(id: string): FrameSubmission | undefined {
    return this.frameSubmissions.get(id);
  }

  getPendingFrames(): FrameSubmission[] {
    return Array.from(this.frameSubmissions.values()).filter(f => f.state === "submitted");
  }

  getFeedbackLog(limit = 50): CompositorFeedback[] {
    return this.feedbackLog.slice(-limit);
  }

  getNegotiatedFormat(surfaceId: string): FormatNegotiationResult | undefined {
    return this.negotiatedFormats.get(surfaceId);
  }

  getStats(): ClientConnectionStats {
    const avgLatency = this.frameTimes.length > 0
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      : 0;
    return {
      state: this.state,
      pid: this.pid,
      appId: this.appId,
      connectedAt: this.protocolClient?.connectedAt ?? 0,
      surfaceCount: this.surfaces.size,
      framesSubmitted: this.totalSubmitted,
      framesPresented: this.totalPresented,
      framesDropped: this.totalDropped,
      avgFrameLatencyMs: Math.round(avgLatency * 100) / 100,
      bufferNegotiations: this.negotiationCount,
      feedbacksReceived: this.feedbackLog.length,
      errorsEncountered: this.feedbackLog.filter(f => f.kind === "error").length,
      boundGlobals: Array.from(this.registry.boundInterfaces),
    };
  }

  // ── Internals ─────────────────────────────────────────────

  private emitFeedback(feedback: CompositorFeedback): void {
    this.feedbackLog.push(feedback);
    if (this.feedbackLog.length > 500) this.feedbackLog = this.feedbackLog.slice(-250);
    for (const listener of this.feedbackListeners) {
      try { listener(feedback); } catch { /* swallow */ }
    }
  }

  private generatePresentationFeedback(now: number): PresentationFeedback {
    const sec = Math.floor(now / 1000);
    const nsec = (now % 1000) * 1_000_000;
    return {
      tvSecHi: 0,
      tvSecLo: sec,
      tvNsec: nsec,
      refresh: 16_666_667,     // ~60 Hz in ns
      seqHi: 0,
      seqLo: this.totalPresented,
      flags: ["vsync", "hw_clock"],
    };
  }
}

// ── Present Result ────────────────────────────────────────────

export interface PresentResult {
  presented: string[];   // frame IDs
  dropped: string[];     // frame IDs
  totalPresented: number;
  totalDropped: number;
}

// ── Connection Factory ────────────────────────────────────────

/**
 * Convenience factory: creates a fully-connected, ready-to-use client.
 */
export function createWaylandClient(
  pid: number,
  appId: string,
  protocol: DisplayProtocol,
  allocator: SurfaceAllocator,
): WaylandClientConnection {
  const client = new WaylandClientConnection(pid, appId, protocol, allocator);
  client.connect();
  client.bindDefaults();
  return client;
}
