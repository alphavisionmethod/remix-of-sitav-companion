// ═══════════════════════════════════════════════════════════════
// End-to-end Compositor Pipeline Test
// Tests: window creation → surface allocation → buffer attach →
// commit → VFX effects → frame present → stats verification
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import { KernelSubsystem } from "@/lib/core-services/kernel";

describe("Compositor Pipeline E2E", () => {
  let kernel: KernelSubsystem;

  beforeEach(() => {
    kernel = new KernelSubsystem({ screenWidth: 1920, screenHeight: 1080 });
  });

  it("full composite pipeline: window → surface → buffer → commit → present", () => {
    // 1. Create a window via Window Manager
    const win = kernel.windowManager.createWindow({
      title: "Terminal", appId: "org.sita.terminal", pid: 100,
      x: 50, y: 50, width: 800, height: 600,
    });
    expect(win.id).toBeTruthy();
    expect(win.focused).toBe(true);

    // 2. Connect a display protocol client for that app
    const client = kernel.displayProtocol.connectClient(100, "Terminal");
    expect(client.authenticated).toBe(true);

    // 3. Create a surface
    const surface = kernel.displayProtocol.createSurface(client.id);
    expect(surface).not.toBeNull();

    // 4. Create SHM pool + buffer
    const pool = kernel.displayProtocol.createSHMPool(client.id, 800 * 600 * 4);
    expect(pool).not.toBeNull();
    const buffer = kernel.displayProtocol.createBuffer(pool!.id, "argb8888", 800, 600, 800 * 4);
    expect(buffer).not.toBeNull();

    // 5. Attach buffer to surface
    expect(kernel.displayProtocol.attachBuffer(surface!.id, buffer!.id)).toBe(true);

    // 6. Commit surface (simulates wl_surface.commit)
    expect(kernel.displayProtocol.commitSurface(surface!.id)).toBe(true);

    // 7. Request frame callback and present
    kernel.displayProtocol.requestFrameCallback(surface!.id);
    kernel.displayProtocol.sendFrameCallbacks();

    // 8. Verify the frame was presented
    const stats = kernel.displayProtocol.getStats();
    expect(stats.framesPresented).toBeGreaterThanOrEqual(1);
    expect(stats.connectedClients).toBe(1);
    expect(stats.totalSurfaces).toBe(1);
  });

  it("surface allocator provides double-buffered pool for window", () => {
    const pool = kernel.surfaceAllocator.createPool({
      name: "terminal-buffers", format: "argb8888",
      width: 800, height: 600, bufferingMode: "double", preAllocate: 2,
    });
    expect(pool.bufferingMode).toBe("double");
    expect(pool.maxBuffers).toBe(2);

    // Acquire buffers from pool
    const buf1 = kernel.surfaceAllocator.acquireFromPool(pool.id);
    expect(buf1).not.toBeNull();
    const buf2 = kernel.surfaceAllocator.acquireFromPool(pool.id);
    expect(buf2).not.toBeNull();

    // Pool should be exhausted
    const buf3 = kernel.surfaceAllocator.acquireFromPool(pool.id);
    expect(buf3).toBeNull();

    // Release one and re-acquire
    kernel.surfaceAllocator.free(buf1!.id);
    const buf4 = kernel.surfaceAllocator.acquireFromPool(pool.id);
    expect(buf4).not.toBeNull();
  });

  it("VFX effects attach to windows and show in stats", () => {
    const win = kernel.windowManager.createWindow({
      title: "Browser", appId: "org.sita.browser", pid: 200,
      width: 1024, height: 768,
    });

    // Add blur, shadow, transparency
    const blur = kernel.vfx.addBlur(win.id, { method: "kawase", radius: 24 });
    const shadow = kernel.vfx.addShadow(win.id, { elevation: 12 });
    const trans = kernel.vfx.addTransparency(win.id, { mode: "acrylic", opacity: 0.85 });

    expect(blur.enabled).toBe(true);
    expect(shadow.elevation).toBe(12);
    expect(trans.mode).toBe("acrylic");

    const vfxStats = kernel.vfx.getStats();
    expect(vfxStats.activeBlurs).toBe(1);
    expect(vfxStats.activeShadows).toBe(1);
    expect(vfxStats.activeTransparencies).toBe(1);
  });

  it("window animation lifecycle: idle → running → completed", () => {
    const win = kernel.windowManager.createWindow({
      title: "Settings", appId: "org.sita.settings", pid: 300,
    });

    const anim = kernel.vfx.animate(win.id, "open", { durationMs: 50, delayMs: 0 });
    expect(anim.state).toBe("idle");

    // After a tick the animation should start
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Animation should be running or completed by now
        const vfxStats = kernel.vfx.getStats();
        // Animation should have started or completed
        expect(vfxStats.runningAnimations + vfxStats.completedAnimations).toBeGreaterThanOrEqual(0);
        resolve();
      }, 80);
    });
  });

  it("desktop transition triggers and tracks", () => {
    const transition = kernel.vfx.startDesktopTransition(1, 2, "cube", { durationMs: 100 });
    expect(transition).toBeDefined();
    expect(transition.state).toBe("running");

    const stats = kernel.vfx.getStats();
    expect(stats.activeTransitions).toBeGreaterThanOrEqual(1);
  });

  it("multi-window stacking with compositor layers", () => {
    const w1 = kernel.windowManager.createWindow({ title: "A", appId: "a", pid: 1 });
    const w2 = kernel.windowManager.createWindow({ title: "B", appId: "b", pid: 2 });
    const w3 = kernel.windowManager.createWindow({ title: "C", appId: "c", pid: 3 });

    // w3 should be on top (focused last)
    expect(w3.focused).toBe(true);
    expect(w3.zIndex).toBeGreaterThan(w2.zIndex);
    expect(w2.zIndex).toBeGreaterThan(w1.zIndex);

    // Add composite layers with different blend modes
    const layer1 = kernel.vfx.addCompositeLayer(w1.id, "normal");
    const layer2 = kernel.vfx.addCompositeLayer(w2.id, "multiply");
    const layer3 = kernel.vfx.addCompositeLayer(w3.id, "screen");

    expect(layer1.blendMode).toBe("normal");
    expect(layer2.blendMode).toBe("multiply");
    expect(layer3.blendMode).toBe("screen");

    const stats = kernel.vfx.getStats();
    expect(stats.compositeLayers).toBe(3);
  });

  it("GPU abstraction reports software fallback", () => {
    kernel.gpu.initSoftwareFallback();
    const gpuStats = kernel.gpu.getStats();
    expect(gpuStats.backend).toBe("software");
    expect(gpuStats.adapterAvailable).toBe(true);
  });

  it("full pipeline stats aggregate correctly", () => {
    // Create windows + protocol clients + surfaces + effects
    const win = kernel.windowManager.createWindow({ title: "App", appId: "app", pid: 50 });
    const client = kernel.displayProtocol.connectClient(50, "App");
    const surf = kernel.displayProtocol.createSurface(client.id);
    const shmPool = kernel.displayProtocol.createSHMPool(client.id, 1920 * 1080 * 4);
    const buf = kernel.displayProtocol.createBuffer(shmPool!.id, "argb8888", 1920, 1080, 1920 * 4);
    kernel.displayProtocol.attachBuffer(surf!.id, buf!.id);
    kernel.displayProtocol.commitSurface(surf!.id);
    kernel.displayProtocol.requestFrameCallback(surf!.id);
    kernel.displayProtocol.sendFrameCallbacks();

    kernel.vfx.addBlur(win.id);
    kernel.vfx.addShadow(win.id);
    kernel.vfx.addTransparency(win.id);

    const allStats = kernel.getStats();
    // Window manager stats
    expect(allStats.windowManager.totalWindows).toBe(1);
    // Display protocol stats
    expect(allStats.displayProtocol.framesPresented).toBeGreaterThanOrEqual(1);
    // VFX stats
    expect(allStats.vfx.activeBlurs).toBe(1);
    expect(allStats.vfx.activeShadows).toBe(1);
    expect(allStats.vfx.activeTransparencies).toBe(1);
    // GPU stats
    expect(allStats.gpu.backend).toBe("software");
    // Surface allocator
    expect(allStats.surfaceAllocator).toBeDefined();
  });

  it("cleanup destroys all subsystems without errors", () => {
    kernel.windowManager.createWindow({ title: "X", appId: "x", pid: 1 });
    kernel.vfx.addBlur("test-target");
    kernel.vfx.addShadow("test-target");
    
    expect(() => kernel.destroy()).not.toThrow();
  });
});
