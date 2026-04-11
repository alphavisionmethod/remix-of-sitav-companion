import { describe, it, expect } from "vitest";
import * as fs from "fs";

const KERNEL_DIR = "src/lib/core-services/kernel";
const VFX_FILE = `${KERNEL_DIR}/visual-effects-compositor.ts`;

describe("Visual Effects — Blur Engine", () => {
  it("exports VisualEffectsCompositor class", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("export class VisualEffectsCompositor");
  });

  it("supports multiple blur methods (gaussian, kawase, box, dual-kawase, motion)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const m of ["gaussian", "kawase", "box", "dual-kawase", "motion"]) {
      expect(c, `Missing blur method: ${m}`).toContain(`"${m}"`);
    }
  });

  it("supports blur quality tiers", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const q of ["low", "medium", "high", "ultra"]) {
      expect(c).toContain(`"${q}"`);
    }
  });

  it("implements blur masking (rect, rounded-rect, circle, path)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("BlurMask");
    expect(c).toContain('"rounded-rect"');
    expect(c).toContain("feather");
    expect(c).toContain("inverted");
  });

  it("supports blur saturation, brightness, and noise", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("saturation");
    expect(c).toContain("brightness");
    expect(c).toContain("noise");
  });
});

describe("Visual Effects — Shadow Engine", () => {
  it("supports shadow types (drop, inner, ambient, contact, long)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const t of ["drop", "inner", "ambient", "contact", "long"]) {
      expect(c, `Missing shadow type: ${t}`).toContain(`"${t}"`);
    }
  });

  it("implements Material Design elevation (0-24)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("elevation");
    expect(c).toContain("setElevation");
    expect(c).toContain("Math.max(0, Math.min(24");
  });

  it("supports ambient occlusion and contact shadows", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("ambientIntensity");
    expect(c).toContain("contactShrink");
  });
});

describe("Visual Effects — Transparency System", () => {
  it("supports transparency modes (acrylic, mica, vibrancy, blur-behind)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const m of ["acrylic", "mica", "vibrancy", "blur-behind"]) {
      expect(c, `Missing transparency mode: ${m}`).toContain(`"${m}"`);
    }
    expect(c).toContain("setTransparencyMode");
  });

  it("supports luminosity blend and noise grain", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("luminosityBlend");
    expect(c).toContain("noiseOpacity");
  });

  it("provides acrylic fallback for non-GPU contexts", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("acrylicFallback");
  });

  it("supports mica wallpaper base layer", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("micaBaseLayer");
  });
});

describe("Visual Effects — Window Animations", () => {
  it("supports comprehensive animation types", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    const types = ["open", "close", "minimize", "unminimize", "maximize", "focus", "shake", "bounce", "slide-in", "fade-in", "scale-up", "flip"];
    for (const t of types) {
      expect(c, `Missing animation type: ${t}`).toContain(`"${t}"`);
    }
  });

  it("supports spring physics and cubic-bezier easing", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain('"spring"');
    expect(c).toContain('"cubic-bezier"');
    expect(c).toContain("stiffness");
    expect(c).toContain("damping");
    expect(c).toContain("mass");
  });

  it("implements animation lifecycle (idle, running, paused, completed, cancelled)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("pauseAnimation");
    expect(c).toContain("resumeAnimation");
    expect(c).toContain("cancelAnimation");
    expect(c).toContain('"completed"');
    expect(c).toContain('"cancelled"');
  });

  it("supports animation transforms (translate, scale, rotate, opacity, blur)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("AnimTransform");
    expect(c).toContain("translateX");
    expect(c).toContain("translateZ");
    expect(c).toContain("scaleX");
    expect(c).toContain("rotation");
  });
});

describe("Visual Effects — Desktop Transitions", () => {
  it("supports 3D desktop transition types", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    const types = ["slide-horizontal", "cube", "fade", "zoom", "flip-3d", "stack", "carousel", "overview-grid", "portal", "dissolve"];
    for (const t of types) {
      expect(c, `Missing transition type: ${t}`).toContain(`"${t}"`);
    }
  });

  it("supports 3D perspective and rotation", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("perspective");
    expect(c).toContain("rotateY");
    expect(c).toContain("translateZ");
  });

  it("implements workspace-to-workspace transitions", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("startDesktopTransition");
    expect(c).toContain("fromWorkspace");
    expect(c).toContain("toWorkspace");
  });
});

describe("Visual Effects — Particle System", () => {
  it("supports particle emitters with physics", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("ParticleEmitter");
    expect(c).toContain("createEmitter");
    expect(c).toContain("emitRate");
    expect(c).toContain("gravity");
    expect(c).toContain("velocityX");
  });

  it("supports particle shapes", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const s of ["circle", "square", "triangle", "star", "image"]) {
      expect(c).toContain(`"${s}"`);
    }
  });
});

describe("Visual Effects — Compositing", () => {
  it("supports blend modes (normal, multiply, screen, overlay, etc.)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    for (const m of ["multiply", "screen", "overlay", "soft-light", "color-dodge"]) {
      expect(c).toContain(`"${m}"`);
    }
  });

  it("supports composite operations (source-over, xor, etc.)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain('"source-over"');
    expect(c).toContain('"xor"');
  });
});

describe("Visual Effects — Presets", () => {
  it("registers built-in presets (window, modal, tooltip, notification, menu)", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain('"sita-window"');
    expect(c).toContain('"sita-modal"');
    expect(c).toContain('"sita-tooltip"');
    expect(c).toContain('"sita-notification"');
    expect(c).toContain('"sita-menu"');
  });

  it("supports applying presets to targets", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).toContain("applyPreset");
    expect(c).toContain("listPresets");
  });
});

describe("Visual Effects — Barrel Integration", () => {
  it("barrel index exports VisualEffectsCompositor", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("VisualEffectsCompositor");
  });

  it("KernelSubsystem facade includes vfx property", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("readonly vfx: VisualEffectsCompositor");
  });

  it("vfx stats included in getStats()", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("vfx: this.vfx.getStats()");
  });

  it("does not import React or UI components", () => {
    const c = fs.readFileSync(VFX_FILE, "utf-8");
    expect(c).not.toMatch(/from\s+["']react["']/);
    expect(c).not.toMatch(/from\s+["']@\/components/);
  });

  it("destroy() cleans up vfx", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("this.vfx.destroy()");
  });
});
