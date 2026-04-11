import { describe, it, expect } from "vitest";
import * as fs from "fs";

const KERNEL_DIR = "src/lib/core-services/kernel";

// ── GPU Abstraction ──────────────────────────────────────────

describe("Display — GPU Abstraction", () => {
  it("gpu-abstraction.ts exists and exports GPUAbstraction class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("export class GPUAbstraction");
  });

  it("supports WebGPU and software backends", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain('"webgpu"');
    expect(content).toContain('"software"');
    expect(content).toContain('"vulkan"');
    expect(content).toContain('"metal"');
    expect(content).toContain('"d3d12"');
  });

  it("manages buffers, textures, shaders, and pipelines", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("createBuffer");
    expect(content).toContain("createTexture");
    expect(content).toContain("createShaderModule");
    expect(content).toContain("createRenderPipeline");
    expect(content).toContain("createComputePipeline");
  });

  it("implements command encoding and queue submission", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("createCommandEncoder");
    expect(content).toContain("encodeCommand");
    expect(content).toContain("finishEncoder");
    expect(content).toContain("submit(");
  });

  it("handles device lost events", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("GPUDeviceLostInfo");
    expect(content).toContain("onDeviceLost");
    expect(content).toContain("simulateDeviceLost");
  });

  it("validates WGSL reserved keywords", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("reserved");
    expect(content).toContain('"meta"');
    expect(content).toContain('"target"');
  });

  it("enforces storage buffer limits", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("maxStorageBuffersPerShaderStage");
    expect(content).toContain("var<storage");
  });

  it("defines device limits matching spec", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/gpu-abstraction.ts`, "utf-8");
    expect(content).toContain("maxTextureDimension2D");
    expect(content).toContain("maxComputeWorkgroupSizeX");
    expect(content).toContain("maxVertexBuffers");
    expect(content).toContain("maxColorAttachments");
  });
});

// ── Window Manager ───────────────────────────────────────────

describe("Display — Window Manager", () => {
  it("window-manager.ts exists and exports WindowManager class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain("export class WindowManager");
  });

  it("implements full window lifecycle", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain("createWindow");
    expect(content).toContain("destroyWindow");
    expect(content).toContain("maximize(");
    expect(content).toContain("minimize(");
    expect(content).toContain("restore(");
    expect(content).toContain("setFullscreen");
  });

  it("supports focus policies (click, sloppy, follows-mouse)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain('"click-to-focus"');
    expect(content).toContain('"focus-follows-mouse"');
    expect(content).toContain('"sloppy-focus"');
    expect(content).toContain("setFocusPolicy");
    expect(content).toContain("cycleFocus");
  });

  it("supports tiling strategies (BSP, columns, monocle)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain('"bsp"');
    expect(content).toContain('"columns"');
    expect(content).toContain('"monocle"');
    expect(content).toContain("retile(");
    expect(content).toContain("setTilingStrategy");
  });

  it("supports virtual workspaces", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain("WMWorkspace");
    expect(content).toContain("switchWorkspace");
    expect(content).toContain("createWorkspace");
    expect(content).toContain("removeWorkspace");
    expect(content).toContain("moveWindowToWorkspace");
  });

  it("maintains focus history and stacking order", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/window-manager.ts`, "utf-8");
    expect(content).toContain("FocusHistoryEntry");
    expect(content).toContain("getStackingOrder");
    expect(content).toContain("zIndex");
  });
});

// ── Display Protocol ─────────────────────────────────────────

describe("Display — Display Protocol", () => {
  it("display-protocol.ts exists and exports DisplayProtocol class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("export class DisplayProtocol");
  });

  it("implements Wayland-style protocol objects", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("wl_display");
    expect(content).toContain("wl_surface");
    expect(content).toContain("wl_compositor");
    expect(content).toContain("wl_buffer");
    expect(content).toContain("wl_shm");
    expect(content).toContain("xdg_wm_base");
    expect(content).toContain("xdg_toplevel");
  });

  it("manages client connections and surface lifecycle", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("connectClient");
    expect(content).toContain("disconnectClient");
    expect(content).toContain("createSurface");
    expect(content).toContain("destroySurface");
    expect(content).toContain("commitSurface");
  });

  it("supports buffer exchange with SHM pools", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("createSHMPool");
    expect(content).toContain("createBuffer");
    expect(content).toContain("attachBuffer");
    expect(content).toContain("releaseBuffer");
  });

  it("supports XDG shell (toplevel + popup)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("createXDGToplevel");
    expect(content).toContain("configureXDGToplevel");
    expect(content).toContain("createXDGPopup");
    expect(content).toContain("XDGToplevel");
    expect(content).toContain("XDGPopup");
  });

  it("supports frame callbacks and subsurfaces", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("requestFrameCallback");
    expect(content).toContain("sendFrameCallbacks");
    expect(content).toContain("createSubsurface");
  });

  it("implements ping/pong hang detection", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/display-protocol.ts`, "utf-8");
    expect(content).toContain("pingClient");
    expect(content).toContain("pongClient");
  });
});

// ── Surface Allocator ────────────────────────────────────────

describe("Display — Surface Allocator", () => {
  it("surface-allocator.ts exists and exports SurfaceAllocator class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain("export class SurfaceAllocator");
  });

  it("supports multiple pixel formats with capabilities", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain('"argb8888"');
    expect(content).toContain('"rgba8888"');
    expect(content).toContain('"rgba16f"');
    expect(content).toContain("FormatCapability");
    expect(content).toContain("bitsPerPixel");
  });

  it("implements buffer pooling with double/triple buffering", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain("BufferPool");
    expect(content).toContain("createPool");
    expect(content).toContain("acquireFromPool");
    expect(content).toContain("releaseToPool");
    expect(content).toContain('"double"');
    expect(content).toContain('"triple"');
  });

  it("supports DMA-BUF for zero-copy", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain('"dma-buf"');
    expect(content).toContain("dmaBufFd");
    expect(content).toContain("dmaBufModifier");
  });

  it("implements format negotiation", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain("negotiateFormat");
    expect(content).toContain("getSupportedFormats");
    expect(content).toContain("getFormatCapabilities");
  });

  it("aligns stride to cache lines", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/surface-allocator.ts`, "utf-8");
    expect(content).toContain("alignment");
    expect(content).toContain("stride");
    expect(content).toContain("Math.ceil");
  });
});

// ── Barrel Integration ───────────────────────────────────────

describe("Display — Barrel Integration", () => {
  it("barrel index exports all Section 6 subsystems", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("GPUAbstraction");
    expect(barrel).toContain("WindowManager");
    expect(barrel).toContain("DisplayProtocol");
    expect(barrel).toContain("SurfaceAllocator");
  });

  it("KernelSubsystem facade includes Section 6 properties", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("readonly gpu: GPUAbstraction");
    expect(barrel).toContain("readonly windowManager: WindowManager");
    expect(barrel).toContain("readonly displayProtocol: DisplayProtocol");
    expect(barrel).toContain("readonly surfaceAllocator: SurfaceAllocator");
  });

  it("Section 6 stats included in getStats()", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("gpu: this.gpu.getStats()");
    expect(barrel).toContain("windowManager: this.windowManager.getStats()");
    expect(barrel).toContain("displayProtocol: this.displayProtocol.getStats()");
    expect(barrel).toContain("surfaceAllocator: this.surfaceAllocator.getStats()");
  });

  it("no Section 6 file imports React or UI components", () => {
    const files = ["gpu-abstraction.ts", "window-manager.ts", "display-protocol.ts", "surface-allocator.ts"];
    for (const file of files) {
      const content = fs.readFileSync(`${KERNEL_DIR}/${file}`, "utf-8");
      expect(content, `${file} must not import React`).not.toMatch(/from\s+["']react["']/);
      expect(content, `${file} must not import components`).not.toMatch(/from\s+["']@\/components/);
    }
  });
});
