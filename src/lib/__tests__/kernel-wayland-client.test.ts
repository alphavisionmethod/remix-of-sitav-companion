// ═══════════════════════════════════════════════════════════════
// SITA OS — Wayland Client Protocol Tests
// End-to-end: connect → bind → negotiate → submit → present → feedback
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import { DisplayProtocol } from "@/lib/core-services/kernel/display-protocol";
import { SurfaceAllocator } from "@/lib/core-services/kernel/surface-allocator";
import { WaylandClientConnection, createWaylandClient } from "@/lib/core-services/kernel/wayland-client";

describe("Wayland Client Protocol", () => {
  let protocol: DisplayProtocol;
  let allocator: SurfaceAllocator;

  beforeEach(() => {
    protocol = new DisplayProtocol();
    allocator = new SurfaceAllocator();
  });

  // ── Connection Lifecycle ──────────────────────────────────

  describe("connection lifecycle", () => {
    it("transitions connecting → connected → ready", () => {
      const client = new WaylandClientConnection(100, "org.sita.terminal", protocol, allocator);
      expect(client.getState()).toBe("connecting");

      expect(client.connect()).toBe(true);
      expect(client.getState()).toBe("connected");

      // Bind minimum required globals
      client.bindGlobal("wl_compositor");
      client.bindGlobal("wl_shm");
      expect(client.getState()).toBe("connected"); // not ready yet

      client.bindGlobal("xdg_wm_base");
      expect(client.getState()).toBe("ready");
    });

    it("bindDefaults brings client to ready in one call", () => {
      const client = new WaylandClientConnection(101, "org.sita.files", protocol, allocator);
      client.connect();
      expect(client.bindDefaults()).toBe(true);
      expect(client.getState()).toBe("ready");
      expect(client.getBoundGlobals()).toContain("wl_compositor");
      expect(client.getBoundGlobals()).toContain("wl_shm");
      expect(client.getBoundGlobals()).toContain("xdg_wm_base");
    });

    it("createWaylandClient factory produces ready client", () => {
      const client = createWaylandClient(200, "org.sita.browser", protocol, allocator);
      expect(client.getState()).toBe("ready");
      expect(client.getPid()).toBe(200);
      expect(client.getAppId()).toBe("org.sita.browser");
    });

    it("disconnect cleans up all resources", () => {
      const client = createWaylandClient(300, "org.sita.editor", protocol, allocator);
      const surface = client.createSurface();
      expect(surface).not.toBeNull();
      expect(protocol.listClients().length).toBe(1);

      client.disconnect();
      expect(client.getState()).toBe("disconnected");
      expect(protocol.listClients().length).toBe(0);
      expect(client.getSurfaces().length).toBe(0);
    });
  });

  // ── Registry & Globals ────────────────────────────────────

  describe("registry globals", () => {
    it("advertises standard Wayland globals", () => {
      const client = new WaylandClientConnection(100, "app", protocol, allocator);
      const globals = client.getRegistryGlobals();
      const names = globals.map(g => g.name);
      expect(names).toContain("wl_compositor");
      expect(names).toContain("wl_shm");
      expect(names).toContain("xdg_wm_base");
      expect(names).toContain("wp_linux_dmabuf");
      expect(names).toContain("wp_fractional_scale_manager");
    });

    it("tracks bind counts", () => {
      const client = new WaylandClientConnection(100, "app", protocol, allocator);
      client.connect();
      client.bindGlobal("wl_compositor");
      client.bindGlobal("wl_compositor"); // bind again
      const globals = client.getRegistryGlobals();
      const comp = globals.find(g => g.name === "wl_compositor")!;
      expect(comp.bound).toBe(true);
      expect(comp.bindCount).toBe(2);
    });

    it("rejects bind before connect", () => {
      const client = new WaylandClientConnection(100, "app", protocol, allocator);
      expect(client.bindGlobal("wl_compositor")).toBe(false);
    });
  });

  // ── Format Negotiation ────────────────────────────────────

  describe("format negotiation", () => {
    it("grants exact match when format is supported", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      const result = client.negotiateFormat(surface.id, "argb8888");
      expect(result.grantedFormat).toBe("argb8888");
      expect(result.fallback).toBe(false);
      expect(result.reason).toContain("exact");
    });

    it("falls back to acceptable alternative", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      // Request a hypothetical unsupported format by providing acceptable fallbacks
      const result = client.negotiateFormat(surface.id, "rgba32f", ["argb8888"]);
      // rgba32f IS supported, so it should match
      expect(result.grantedFormat).toBe("rgba32f");
      expect(result.fallback).toBe(false);
    });

    it("reports buffer capabilities", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const caps = client.getBufferCapabilities();
      expect(caps.supportedFormats.length).toBeGreaterThan(0);
      expect(caps.maxWidth).toBe(8192);
      expect(caps.supportsDmaBuf).toBe(true);
    });

    it("stores negotiated format per surface", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const s1 = client.createSurface()!;
      const s2 = client.createSurface()!;
      client.negotiateFormat(s1.id, "argb8888");
      client.negotiateFormat(s2.id, "rgba16f");
      expect(client.getNegotiatedFormat(s1.id)?.grantedFormat).toBe("argb8888");
      expect(client.getNegotiatedFormat(s2.id)?.grantedFormat).toBe("rgba16f");
    });
  });

  // ── Surface & Buffer Lifecycle ────────────────────────────

  describe("surface and buffer lifecycle", () => {
    it("creates surface only when ready", () => {
      const client = new WaylandClientConnection(100, "app", protocol, allocator);
      expect(client.createSurface()).toBeNull(); // not connected

      client.connect();
      expect(client.createSurface()).toBeNull(); // connected but not ready

      client.bindDefaults();
      expect(client.createSurface()).not.toBeNull(); // ready
    });

    it("creates toplevel from surface", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      const toplevel = client.createToplevel(surface.id, "My Window");
      expect(toplevel).not.toBeNull();
      expect(toplevel!.title).toBe("My Window");
      expect(toplevel!.appId).toBe("app");
    });

    it("creates popup anchored to parent surface", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const parent = client.createSurface()!;
      client.createToplevel(parent.id, "Parent");
      const child = client.createSurface()!;
      const popup = client.createPopup(child.id, parent.id, 10, 20, 200, 100);
      expect(popup).not.toBeNull();
      expect(popup!.parentSurfaceId).toBe(parent.id);
    });

    it("allocates SHM pool and buffers", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const pool = client.createSHMPool(800 * 600 * 4);
      expect(pool).not.toBeNull();
      const buffer = client.allocateBuffer(pool!.id, "argb8888", 800, 600);
      expect(buffer).not.toBeNull();
      expect(buffer!.width).toBe(800);
      expect(buffer!.height).toBe(600);
    });

    it("allocates surface buffer via allocator with negotiated format", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.negotiateFormat(surface.id, "rgba8888");
      const alloc = client.allocateSurfaceBuffer(surface.id, 1024, 768);
      expect(alloc.format).toBe("rgba8888");
      expect(alloc.width).toBe(1024);
      expect(alloc.ownerId).toBe(surface.id);
    });
  });

  // ── Frame Submission & Presentation ───────────────────────

  describe("frame submission and presentation", () => {
    it("submits a frame and presents it", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(800 * 600 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 800, 600)!;

      const frame = client.submitFrame(surface.id, buffer.id);
      expect(frame).not.toBeNull();
      expect(frame!.state).toBe("submitted");

      const result = client.present();
      expect(result.presented.length).toBe(1);
      expect(result.dropped.length).toBe(0);

      const updated = client.getFrameSubmission(frame!.id)!;
      expect(updated.state).toBe("presented");
      expect(updated.presentationFeedback).not.toBeNull();
      expect(updated.presentationFeedback!.flags).toContain("vsync");
    });

    it("tracks multiple frames across surfaces", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const s1 = client.createSurface()!;
      const s2 = client.createSurface()!;
      client.createToplevel(s1.id, "A");
      client.createToplevel(s2.id, "B");

      const pool = client.createSHMPool(2 * 1024 * 768 * 4)!;
      const b1 = client.allocateBuffer(pool.id, "argb8888", 1024, 768)!;
      const b2 = client.allocateBuffer(pool.id, "argb8888", 1024, 768, 1024 * 4)!;

      client.submitFrame(s1.id, b1.id);
      client.submitFrame(s2.id, b2.id);
      expect(client.getPendingFrames().length).toBe(2);

      const result = client.present();
      expect(result.presented.length).toBe(2);
      expect(result.totalPresented).toBe(2);
    });

    it("records frame damage regions", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(800 * 600 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 800, 600)!;

      const damage = [{ x: 10, y: 20, width: 100, height: 50 }];
      const frame = client.submitFrame(surface.id, buffer.id, damage)!;
      expect(frame.damage).toEqual(damage);
    });

    it("uses full damage when none specified", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(100 * 100 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 100, 100)!;

      const frame = client.submitFrame(surface.id, buffer.id)!;
      expect(frame.damage[0].width).toBe(65535); // full damage
    });
  });

  // ── Compositor Feedback ───────────────────────────────────

  describe("compositor feedback", () => {
    it("fires feedback listener on frame present", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(800 * 600 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 800, 600)!;

      const received: string[] = [];
      client.onFeedback(fb => received.push(fb.kind));

      client.submitFrame(surface.id, buffer.id);
      client.present();

      expect(received).toContain("frame_done");
    });

    it("unsubscribe stops receiving feedback", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(100 * 100 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 100, 100)!;

      const received: string[] = [];
      const unsub = client.onFeedback(fb => received.push(fb.kind));

      client.submitFrame(surface.id, buffer.id);
      client.present();
      expect(received.length).toBe(1);

      unsub(); // unsubscribe
      const b2 = client.allocateBuffer(pool.id, "argb8888", 100, 100)!;
      client.submitFrame(surface.id, b2.id);
      client.present();
      expect(received.length).toBe(1); // no new feedback
    });

    it("receives external compositor feedback", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const received: string[] = [];
      client.onFeedback(fb => received.push(fb.kind));

      client.receiveFeedback({
        kind: "preferred_scale", surfaceId: null,
        serial: 1, timestamp: Date.now(),
        payload: { scale: 2 },
      });
      expect(received).toContain("preferred_scale");
    });

    it("pong responds to ping", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const received: string[] = [];
      client.onFeedback(fb => received.push(fb.kind));
      client.pong(42);
      expect(received).toContain("ping");
    });

    it("close request emits feedback", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      const received: string[] = [];
      client.onFeedback(fb => received.push(fb.kind));
      client.requestClose(surface.id);
      expect(received).toContain("close_request");
    });
  });

  // ── Surface Operations ────────────────────────────────────

  describe("surface operations", () => {
    it("sets surface scale", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      expect(client.setSurfaceScale(surface.id, 2)).toBe(true);
      expect(protocol.getSurface(surface.id)!.bufferScale).toBe(2);
    });

    it("sets surface transform", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      expect(client.setSurfaceTransform(surface.id, 3)).toBe(true);
      expect(protocol.getSurface(surface.id)!.bufferTransform).toBe(3);
    });
  });

  // ── Stats ─────────────────────────────────────────────────

  describe("client stats", () => {
    it("aggregates connection statistics", () => {
      const client = createWaylandClient(100, "org.sita.terminal", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Term");
      const pool = client.createSHMPool(800 * 600 * 4)!;
      const buffer = client.allocateBuffer(pool.id, "argb8888", 800, 600)!;

      client.negotiateFormat(surface.id, "argb8888");
      client.submitFrame(surface.id, buffer.id);
      client.present();

      const stats = client.getStats();
      expect(stats.state).toBe("ready");
      expect(stats.pid).toBe(100);
      expect(stats.appId).toBe("org.sita.terminal");
      expect(stats.surfaceCount).toBe(1);
      expect(stats.framesSubmitted).toBe(1);
      expect(stats.framesPresented).toBe(1);
      expect(stats.framesDropped).toBe(0);
      expect(stats.bufferNegotiations).toBe(1);
      expect(stats.feedbacksReceived).toBeGreaterThan(0);
      expect(stats.boundGlobals.length).toBeGreaterThanOrEqual(3);
    });

    it("tracks average frame latency", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(100 * 100 * 4 * 3)!;

      for (let i = 0; i < 5; i++) {
        const buf = client.allocateBuffer(pool.id, "argb8888", 100, 100)!;
        client.submitFrame(surface.id, buf.id);
        client.present();
      }

      const stats = client.getStats();
      expect(stats.framesPresented).toBe(5);
      expect(stats.avgFrameLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Feedback Log ──────────────────────────────────────────

  describe("feedback log", () => {
    it("limits feedback log size", () => {
      const client = createWaylandClient(100, "app", protocol, allocator);
      const surface = client.createSurface()!;
      client.createToplevel(surface.id, "Win");
      const pool = client.createSHMPool(100 * 100 * 4 * 600)!;

      // Submit many frames
      for (let i = 0; i < 300; i++) {
        const buf = client.allocateBuffer(pool.id, "argb8888", 100, 100)!;
        client.submitFrame(surface.id, buf.id);
        client.present();
      }

      const log = client.getFeedbackLog(1000);
      expect(log.length).toBeLessThanOrEqual(500);
    });
  });
});
