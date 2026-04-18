// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Visual Effects Compositor
// GPU-accelerated blur, shadows, transparency, window animations,
// desktop transitions, particle systems, and compositing effects.
// ═══════════════════════════════════════════════════════════════

// ── Blur Engine ───────────────────────────────────────────────

export type BlurMethod = "gaussian" | "kawase" | "box" | "dual-kawase" | "motion";
export type BlurQuality = "low" | "medium" | "high" | "ultra";

export interface BlurEffect {
  id: string;
  targetId: string;           // window or surface ID
  method: BlurMethod;
  quality: BlurQuality;
  radius: number;             // pixels (0-128)
  sigma: number;              // gaussian sigma
  passes: number;             // multi-pass count (kawase)
  saturation: number;         // 0-2, 1=normal
  brightness: number;         // 0-2, 1=normal
  noise: number;              // grain overlay 0-1
  tint: { r: number; g: number; b: number; a: number } | null;
  mask: BlurMask | null;
  enabled: boolean;
  animated: boolean;          // animate radius changes
  gpuAccelerated: boolean;
  createdAt: number;
}

export interface BlurMask {
  type: "rect" | "rounded-rect" | "circle" | "path";
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius?: number;
  feather: number;            // edge softness in pixels
  inverted: boolean;
}

// ── Shadow Engine ─────────────────────────────────────────────

export type ShadowType = "drop" | "inner" | "ambient" | "contact" | "long";

export interface ShadowEffect {
  id: string;
  targetId: string;
  type: ShadowType;
  color: { r: number; g: number; b: number; a: number };
  offsetX: number;
  offsetY: number;
  blur: number;               // blur radius
  spread: number;             // spread distance
  // Advanced
  elevation: number;          // 0-24 Material Design elevation
  ambientIntensity: number;   // ambient occlusion 0-1
  contactShrink: number;      // contact shadow shrink factor
  // Long shadow
  angle: number;              // degrees for directional shadow
  length: number;             // long shadow length
  fadeStart: number;          // fade beginning (0-1)
  // State
  enabled: boolean;
  animated: boolean;
  gpuAccelerated: boolean;
  createdAt: number;
}

// ── Transparency System ───────────────────────────────────────

export type TransparencyMode = "none" | "uniform" | "blur-behind" | "acrylic" | "mica" | "vibrancy";

export interface TransparencyEffect {
  id: string;
  targetId: string;
  mode: TransparencyMode;
  opacity: number;            // 0-1
  backdropBlur: number;       // blur radius for backdrop
  tintColor: { r: number; g: number; b: number; a: number } | null;
  tintOpacity: number;        // 0-1
  noiseOpacity: number;       // grain overlay 0-1
  luminosityBlend: number;    // luminosity pass blend 0-1
  // Acrylic-specific
  acrylicFallback: { r: number; g: number; b: number; a: number }; // when blur unavailable
  // Mica-specific
  micaBaseLayer: boolean;     // use desktop wallpaper as base
  // State
  enabled: boolean;
  animated: boolean;
  gpuAccelerated: boolean;
  createdAt: number;
}

// ── Window Animations ─────────────────────────────────────────

export type AnimationType =
  | "open" | "close" | "minimize" | "unminimize"
  | "maximize" | "unmaximize" | "fullscreen" | "unfullscreen"
  | "focus" | "unfocus" | "shake" | "bounce"
  | "slide-in" | "slide-out" | "fade-in" | "fade-out"
  | "scale-up" | "scale-down" | "flip" | "rotate";

export type EasingFunction =
  | "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
  | "cubic-bezier" | "spring" | "bounce" | "elastic"
  | "overshoot" | "anticipate";

export interface WindowAnimation {
  id: string;
  targetId: string;
  type: AnimationType;
  easing: EasingFunction;
  durationMs: number;
  delayMs: number;
  // Keyframes
  fromTransform: AnimTransform;
  toTransform: AnimTransform;
  // Spring physics (when easing = "spring")
  spring: {
    stiffness: number;        // N/m
    damping: number;          // damping ratio
    mass: number;             // kg
    velocity: number;         // initial velocity
  };
  // Bezier control points (when easing = "cubic-bezier")
  bezier: [number, number, number, number] | null;
  // State
  state: "idle" | "running" | "paused" | "completed" | "cancelled";
  progress: number;           // 0-1
  startedAt: number | null;
  completedAt: number | null;
  onComplete: "destroy" | "reverse" | "hold" | "remove";
}

export interface AnimTransform {
  translateX: number;
  translateY: number;
  translateZ: number;
  scaleX: number;
  scaleY: number;
  rotation: number;           // degrees
  opacity: number;
  blur: number;               // motion blur
}

const IDENTITY_ANIM_TRANSFORM: AnimTransform = {
  translateX: 0, translateY: 0, translateZ: 0,
  scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, blur: 0,
};

// ── Desktop Transitions ───────────────────────────────────────

export type DesktopTransitionType =
  | "slide-horizontal" | "slide-vertical"
  | "cube" | "fade" | "zoom" | "flip-3d"
  | "stack" | "carousel" | "overview-grid"
  | "morphing" | "portal" | "dissolve";

export interface DesktopTransition {
  id: string;
  type: DesktopTransitionType;
  fromWorkspace: number;
  toWorkspace: number;
  durationMs: number;
  easing: EasingFunction;
  // 3D perspective
  perspective: number;        // CSS perspective px
  rotateY: number;            // cube/flip rotation
  translateZ: number;         // depth offset
  // State
  state: "idle" | "running" | "completed";
  progress: number;
  direction: "forward" | "backward";
  startedAt: number | null;
}

// ── Particle System ───────────────────────────────────────────

export type ParticleShape = "circle" | "square" | "triangle" | "star" | "image";

export interface ParticleEmitter {
  id: string;
  name: string;
  shape: ParticleShape;
  // Emission
  emitRate: number;           // particles per second
  maxParticles: number;
  lifetime: { min: number; max: number }; // ms
  // Position
  emitX: number;
  emitY: number;
  emitWidth: number;          // emission area
  emitHeight: number;
  // Velocity
  velocityX: { min: number; max: number };
  velocityY: { min: number; max: number };
  gravity: number;
  // Appearance
  size: { start: number; end: number };
  opacity: { start: number; end: number };
  color: { r: number; g: number; b: number };
  colorVariance: number;      // 0-1
  rotation: { min: number; max: number };
  // State
  active: boolean;
  particleCount: number;
  totalEmitted: number;
  createdAt: number;
}

// ── Compositing Blend Modes ───────────────────────────────────

export type CompositeBlendMode =
  | "normal" | "multiply" | "screen" | "overlay"
  | "darken" | "lighten" | "color-dodge" | "color-burn"
  | "hard-light" | "soft-light" | "difference" | "exclusion"
  | "hue" | "saturation" | "color" | "luminosity"
  | "plus-lighter" | "plus-darker";

export interface CompositeLayer {
  id: string;
  targetId: string;
  blendMode: CompositeBlendMode;
  opacity: number;
  isolate: boolean;           // create isolated stacking context
  mixBlendMode: boolean;
  compositeOperation: "source-over" | "source-in" | "source-out" | "destination-over" | "destination-in" | "destination-out" | "xor" | "copy";
  enabled: boolean;
}

// ── Effect Presets ────────────────────────────────────────────

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  category: "window" | "desktop" | "notification" | "modal" | "tooltip" | "menu";
  blur: Partial<BlurEffect> | null;
  shadow: Partial<ShadowEffect> | null;
  transparency: Partial<TransparencyEffect> | null;
  animation: Partial<WindowAnimation> | null;
}

// ── Visual Effects Stats ──────────────────────────────────────

export interface VisualEffectsStats {
  activeBlurs: number;
  activeShadows: number;
  activeTransparencies: number;
  runningAnimations: number;
  completedAnimations: number;
  activeTransitions: number;
  activeParticleEmitters: number;
  totalParticles: number;
  compositeLayers: number;
  presetCount: number;
  gpuAcceleratedEffects: number;
  cpuFallbackEffects: number;
  animationFPS: number;
  frameTimeMs: number;
}

// ── Visual Effects Compositor Implementation ──────────────────

export class VisualEffectsCompositor {
  private blurs: Map<string, BlurEffect> = new Map();
  private shadows: Map<string, ShadowEffect> = new Map();
  private transparencies: Map<string, TransparencyEffect> = new Map();
  private animations: Map<string, WindowAnimation> = new Map();
  private transitions: Map<string, DesktopTransition> = new Map();
  private emitters: Map<string, ParticleEmitter> = new Map();
  private compositeLayers: Map<string, CompositeLayer> = new Map();
  private presets: Map<string, EffectPreset> = new Map();
  private nextId = 1;

  // Performance tracking
  private completedAnimationCount = 0;
  private lastFrameTime = 0;
  private frameTimeMs = 16.67;
  private animTickHandle: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.registerBuiltinPresets();
  }

  // ── Blur ──────────────────────────────────────────────────

  addBlur(targetId: string, config: Partial<Omit<BlurEffect, "id" | "targetId" | "createdAt">> = {}): BlurEffect {
    const effect: BlurEffect = {
      id: `blur-${this.nextId++}`, targetId,
      method: config.method ?? "kawase",
      quality: config.quality ?? "medium",
      radius: config.radius ?? 24,
      sigma: config.sigma ?? 12,
      passes: config.passes ?? 4,
      saturation: config.saturation ?? 1.0,
      brightness: config.brightness ?? 1.0,
      noise: config.noise ?? 0.02,
      tint: config.tint ?? null,
      mask: config.mask ?? null,
      enabled: config.enabled ?? true,
      animated: config.animated ?? false,
      gpuAccelerated: config.gpuAccelerated ?? true,
      createdAt: Date.now(),
    };
    this.blurs.set(effect.id, effect);
    return effect;
  }

  removeBlur(id: string): boolean { return this.blurs.delete(id); }

  setBlurRadius(id: string, radius: number, animated = true): boolean {
    const blur = this.blurs.get(id);
    if (!blur) return false;
    if (animated && blur.animated) {
      // Animate the radius change
      this.animateProperty(id, "blur-radius", blur.radius, Math.max(0, Math.min(128, radius)), 200);
    }
    blur.radius = Math.max(0, Math.min(128, radius));
    blur.sigma = radius / 2;
    return true;
  }

  getBlur(id: string): BlurEffect | undefined { return this.blurs.get(id); }
  getBlursForTarget(targetId: string): BlurEffect[] {
    return Array.from(this.blurs.values()).filter(b => b.targetId === targetId);
  }

  // ── Shadow ────────────────────────────────────────────────

  addShadow(targetId: string, config: Partial<Omit<ShadowEffect, "id" | "targetId" | "createdAt">> = {}): ShadowEffect {
    const effect: ShadowEffect = {
      id: `shadow-${this.nextId++}`, targetId,
      type: config.type ?? "drop",
      color: config.color ?? { r: 0, g: 0, b: 0, a: 0.4 },
      offsetX: config.offsetX ?? 0,
      offsetY: config.offsetY ?? 8,
      blur: config.blur ?? 24,
      spread: config.spread ?? 0,
      elevation: config.elevation ?? 8,
      ambientIntensity: config.ambientIntensity ?? 0.12,
      contactShrink: config.contactShrink ?? 0.9,
      angle: config.angle ?? 270,
      length: config.length ?? 0,
      fadeStart: config.fadeStart ?? 0.6,
      enabled: config.enabled ?? true,
      animated: config.animated ?? true,
      gpuAccelerated: config.gpuAccelerated ?? true,
      createdAt: Date.now(),
    };
    this.shadows.set(effect.id, effect);
    return effect;
  }

  removeShadow(id: string): boolean { return this.shadows.delete(id); }

  setElevation(id: string, elevation: number): boolean {
    const shadow = this.shadows.get(id);
    if (!shadow) return false;
    shadow.elevation = Math.max(0, Math.min(24, elevation));
    // Auto-compute shadow params from elevation (Material Design)
    shadow.offsetY = elevation * 0.5;
    shadow.blur = elevation * 1.5;
    shadow.spread = -(elevation * 0.25);
    shadow.color.a = Math.max(0.1, 0.4 - elevation * 0.01);
    return true;
  }

  getShadow(id: string): ShadowEffect | undefined { return this.shadows.get(id); }
  getShadowsForTarget(targetId: string): ShadowEffect[] {
    return Array.from(this.shadows.values()).filter(s => s.targetId === targetId);
  }

  // ── Transparency ──────────────────────────────────────────

  addTransparency(targetId: string, config: Partial<Omit<TransparencyEffect, "id" | "targetId" | "createdAt">> = {}): TransparencyEffect {
    const effect: TransparencyEffect = {
      id: `trans-${this.nextId++}`, targetId,
      mode: config.mode ?? "acrylic",
      opacity: config.opacity ?? 0.85,
      backdropBlur: config.backdropBlur ?? 30,
      tintColor: config.tintColor ?? { r: 32, g: 20, b: 48, a: 0.6 },
      tintOpacity: config.tintOpacity ?? 0.6,
      noiseOpacity: config.noiseOpacity ?? 0.03,
      luminosityBlend: config.luminosityBlend ?? 0.5,
      acrylicFallback: config.acrylicFallback ?? { r: 24, g: 16, b: 36, a: 0.95 },
      micaBaseLayer: config.micaBaseLayer ?? false,
      enabled: config.enabled ?? true,
      animated: config.animated ?? true,
      gpuAccelerated: config.gpuAccelerated ?? true,
      createdAt: Date.now(),
    };
    this.transparencies.set(effect.id, effect);
    return effect;
  }

  removeTransparency(id: string): boolean { return this.transparencies.delete(id); }

  setTransparencyMode(id: string, mode: TransparencyMode): boolean {
    const t = this.transparencies.get(id);
    if (!t) return false;
    t.mode = mode;
    // Auto-configure based on mode
    switch (mode) {
      case "acrylic":
        t.backdropBlur = 30; t.noiseOpacity = 0.03; t.luminosityBlend = 0.5;
        break;
      case "mica":
        t.backdropBlur = 0; t.micaBaseLayer = true; t.luminosityBlend = 0.8; t.noiseOpacity = 0;
        break;
      case "vibrancy":
        t.backdropBlur = 20; t.noiseOpacity = 0; t.luminosityBlend = 0.3;
        break;
      case "blur-behind":
        t.backdropBlur = 16; t.noiseOpacity = 0; t.luminosityBlend = 0;
        break;
    }
    return true;
  }

  getTransparency(id: string): TransparencyEffect | undefined { return this.transparencies.get(id); }

  // ── Window Animations ─────────────────────────────────────

  animate(targetId: string, type: AnimationType, config: Partial<Omit<WindowAnimation, "id" | "targetId" | "type" | "state" | "progress" | "startedAt" | "completedAt">> = {}): WindowAnimation {
    const presetTransforms = this.getAnimationTransforms(type);
    const anim: WindowAnimation = {
      id: `anim-${this.nextId++}`, targetId, type,
      easing: config.easing ?? "ease-out",
      durationMs: config.durationMs ?? this.getDefaultDuration(type),
      delayMs: config.delayMs ?? 0,
      fromTransform: config.fromTransform ?? presetTransforms.from,
      toTransform: config.toTransform ?? presetTransforms.to,
      spring: config.spring ?? { stiffness: 200, damping: 20, mass: 1, velocity: 0 },
      bezier: config.bezier ?? null,
      state: "idle",
      progress: 0,
      startedAt: null,
      completedAt: null,
      onComplete: config.onComplete ?? "remove",
    };
    this.animations.set(anim.id, anim);

    // Auto-start after delay
    const startDelay = anim.delayMs;
    setTimeout(() => {
      if (anim.state === "idle") {
        anim.state = "running";
        anim.startedAt = Date.now();
      }
    }, startDelay);

    this.ensureAnimLoop();
    return anim;
  }

  cancelAnimation(id: string): boolean {
    const anim = this.animations.get(id);
    if (!anim) return false;
    anim.state = "cancelled";
    this.animations.delete(id);
    return true;
  }

  pauseAnimation(id: string): boolean {
    const anim = this.animations.get(id);
    if (!anim || anim.state !== "running") return false;
    anim.state = "paused";
    return true;
  }

  resumeAnimation(id: string): boolean {
    const anim = this.animations.get(id);
    if (!anim || anim.state !== "paused") return false;
    anim.state = "running";
    return true;
  }

  private getDefaultDuration(type: AnimationType): number {
    switch (type) {
      case "open": return 250;
      case "close": return 200;
      case "minimize": return 350;
      case "unminimize": return 300;
      case "maximize": case "unmaximize": return 280;
      case "fullscreen": case "unfullscreen": return 300;
      case "focus": return 150;
      case "unfocus": return 120;
      case "shake": return 500;
      case "bounce": return 600;
      case "slide-in": case "slide-out": return 300;
      case "fade-in": case "fade-out": return 200;
      case "scale-up": case "scale-down": return 250;
      case "flip": return 400;
      case "rotate": return 350;
      default: return 250;
    }
  }

  private getAnimationTransforms(type: AnimationType): { from: AnimTransform; to: AnimTransform } {
    const identity = { ...IDENTITY_ANIM_TRANSFORM };
    switch (type) {
      case "open":
        return { from: { ...identity, scaleX: 0.8, scaleY: 0.8, opacity: 0, translateY: 20 }, to: identity };
      case "close":
        return { from: identity, to: { ...identity, scaleX: 0.85, scaleY: 0.85, opacity: 0, translateY: 10 } };
      case "minimize":
        return { from: identity, to: { ...identity, scaleX: 0.3, scaleY: 0.3, opacity: 0, translateY: 400 } };
      case "unminimize":
        return { from: { ...identity, scaleX: 0.3, scaleY: 0.3, opacity: 0, translateY: 400 }, to: identity };
      case "maximize":
        return { from: identity, to: { ...identity, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 } };
      case "focus":
        return { from: { ...identity, scaleX: 0.98, scaleY: 0.98 }, to: identity };
      case "shake":
        return { from: { ...identity, translateX: -10 }, to: { ...identity, translateX: 10 } };
      case "bounce":
        return { from: { ...identity, translateY: -20 }, to: identity };
      case "fade-in":
        return { from: { ...identity, opacity: 0 }, to: identity };
      case "fade-out":
        return { from: identity, to: { ...identity, opacity: 0 } };
      case "scale-up":
        return { from: { ...identity, scaleX: 0, scaleY: 0 }, to: identity };
      case "scale-down":
        return { from: identity, to: { ...identity, scaleX: 0, scaleY: 0 } };
      case "flip":
        return { from: { ...identity, rotation: 0 }, to: { ...identity, rotation: 180 } };
      case "slide-in":
        return { from: { ...identity, translateX: -300, opacity: 0 }, to: identity };
      case "slide-out":
        return { from: identity, to: { ...identity, translateX: 300, opacity: 0 } };
      default:
        return { from: identity, to: identity };
    }
  }

  // ── Desktop Transitions ───────────────────────────────────

  startDesktopTransition(fromWs: number, toWs: number, type: DesktopTransitionType, config: Partial<Pick<DesktopTransition, "durationMs" | "easing" | "perspective">> = {}): DesktopTransition {
    const transition: DesktopTransition = {
      id: `dtrans-${this.nextId++}`,
      type,
      fromWorkspace: fromWs,
      toWorkspace: toWs,
      durationMs: config.durationMs ?? this.getTransitionDuration(type),
      easing: config.easing ?? "ease-in-out",
      perspective: config.perspective ?? 1200,
      rotateY: type === "cube" ? 90 : type === "flip-3d" ? 180 : 0,
      translateZ: type === "zoom" ? -500 : type === "stack" ? -200 : 0,
      state: "running",
      progress: 0,
      direction: toWs > fromWs ? "forward" : "backward",
      startedAt: Date.now(),
    };
    this.transitions.set(transition.id, transition);
    this.ensureAnimLoop();

    // Auto-complete after duration
    setTimeout(() => {
      transition.state = "completed";
      transition.progress = 1;
    }, transition.durationMs);

    return transition;
  }

  cancelTransition(id: string): boolean {
    return this.transitions.delete(id);
  }

  private getTransitionDuration(type: DesktopTransitionType): number {
    switch (type) {
      case "slide-horizontal": case "slide-vertical": return 350;
      case "cube": return 500;
      case "fade": case "dissolve": return 300;
      case "zoom": return 400;
      case "flip-3d": return 450;
      case "stack": case "carousel": return 400;
      case "overview-grid": return 500;
      case "morphing": return 600;
      case "portal": return 700;
      default: return 350;
    }
  }

  // ── Particle System ───────────────────────────────────────

  createEmitter(config: Partial<Omit<ParticleEmitter, "id" | "particleCount" | "totalEmitted" | "createdAt">> = {}): ParticleEmitter {
    const emitter: ParticleEmitter = {
      id: `emitter-${this.nextId++}`,
      name: config.name ?? "default",
      shape: config.shape ?? "circle",
      emitRate: config.emitRate ?? 20,
      maxParticles: config.maxParticles ?? 200,
      lifetime: config.lifetime ?? { min: 800, max: 2000 },
      emitX: config.emitX ?? 0,
      emitY: config.emitY ?? 0,
      emitWidth: config.emitWidth ?? 100,
      emitHeight: config.emitHeight ?? 10,
      velocityX: config.velocityX ?? { min: -20, max: 20 },
      velocityY: config.velocityY ?? { min: -60, max: -20 },
      gravity: config.gravity ?? 50,
      size: config.size ?? { start: 4, end: 1 },
      opacity: config.opacity ?? { start: 0.8, end: 0 },
      color: config.color ?? { r: 147, g: 112, b: 219 },
      colorVariance: config.colorVariance ?? 0.2,
      rotation: config.rotation ?? { min: 0, max: 360 },
      active: config.active ?? true,
      particleCount: 0,
      totalEmitted: 0,
      createdAt: Date.now(),
    };
    this.emitters.set(emitter.id, emitter);
    return emitter;
  }

  removeEmitter(id: string): boolean { return this.emitters.delete(id); }

  toggleEmitter(id: string, active: boolean): boolean {
    const emitter = this.emitters.get(id);
    if (!emitter) return false;
    emitter.active = active;
    return true;
  }

  // ── Composite Layers ──────────────────────────────────────

  addCompositeLayer(targetId: string, blendMode: CompositeBlendMode = "normal", opacity = 1): CompositeLayer {
    const layer: CompositeLayer = {
      id: `layer-${this.nextId++}`, targetId, blendMode, opacity,
      isolate: false, mixBlendMode: false,
      compositeOperation: "source-over", enabled: true,
    };
    this.compositeLayers.set(layer.id, layer);
    return layer;
  }

  removeCompositeLayer(id: string): boolean { return this.compositeLayers.delete(id); }

  setBlendMode(id: string, mode: CompositeBlendMode): boolean {
    const layer = this.compositeLayers.get(id);
    if (!layer) return false;
    layer.blendMode = mode;
    return true;
  }

  // ── Effect Presets ────────────────────────────────────────

  applyPreset(targetId: string, presetId: string): boolean {
    const preset = this.presets.get(presetId);
    if (!preset) return false;
    if (preset.blur) this.addBlur(targetId, preset.blur);
    if (preset.shadow) this.addShadow(targetId, preset.shadow);
    if (preset.transparency) this.addTransparency(targetId, preset.transparency);
    if (preset.animation) this.animate(targetId, preset.animation.type ?? "open", preset.animation);
    return true;
  }

  getPreset(id: string): EffectPreset | undefined { return this.presets.get(id); }
  listPresets(category?: EffectPreset["category"]): EffectPreset[] {
    const all = Array.from(this.presets.values());
    return category ? all.filter(p => p.category === category) : all;
  }

  private registerBuiltinPresets(): void {
    const add = (p: EffectPreset) => this.presets.set(p.id, p);

    add({
      id: "sita-window", name: "SITA Window", description: "Default SITA OS window appearance",
      category: "window",
      blur: { method: "kawase", radius: 24, quality: "medium", saturation: 1.1, brightness: 0.95, noise: 0.02 },
      shadow: { type: "drop", elevation: 12, color: { r: 0, g: 0, b: 0, a: 0.35 } },
      transparency: { mode: "acrylic", opacity: 0.88, backdropBlur: 30, tintColor: { r: 32, g: 20, b: 48, a: 0.6 } },
      animation: { type: "open", easing: "spring", durationMs: 300 },
    });

    add({
      id: "sita-modal", name: "SITA Modal", description: "Modal dialog with heavy blur",
      category: "modal",
      blur: { method: "gaussian", radius: 40, quality: "high" },
      shadow: { type: "drop", elevation: 20, color: { r: 0, g: 0, b: 0, a: 0.5 } },
      transparency: { mode: "acrylic", opacity: 0.92, backdropBlur: 40 },
      animation: { type: "scale-up", easing: "spring", durationMs: 250 },
    });

    add({
      id: "sita-tooltip", name: "SITA Tooltip", description: "Lightweight tooltip",
      category: "tooltip",
      blur: { method: "box", radius: 8, quality: "low" },
      shadow: { type: "drop", elevation: 4, color: { r: 0, g: 0, b: 0, a: 0.2 } },
      transparency: { mode: "blur-behind", opacity: 0.95, backdropBlur: 12 },
      animation: { type: "fade-in", easing: "ease-out", durationMs: 150 },
    });

    add({
      id: "sita-notification", name: "SITA Notification", description: "Slide-in notification",
      category: "notification",
      blur: null,
      shadow: { type: "drop", elevation: 8, color: { r: 0, g: 0, b: 0, a: 0.3 } },
      transparency: { mode: "acrylic", opacity: 0.9, backdropBlur: 20 },
      animation: { type: "slide-in", easing: "spring", durationMs: 350 },
    });

    add({
      id: "sita-menu", name: "SITA Menu", description: "Context/dropdown menu",
      category: "menu",
      blur: { method: "kawase", radius: 16, quality: "medium" },
      shadow: { type: "drop", elevation: 6, color: { r: 0, g: 0, b: 0, a: 0.25 } },
      transparency: { mode: "vibrancy", opacity: 0.92, backdropBlur: 20 },
      animation: { type: "scale-up", easing: "ease-out", durationMs: 120 },
    });

    add({
      id: "sita-desktop-cube", name: "Desktop Cube", description: "3D cube desktop transition",
      category: "desktop",
      blur: null, shadow: null, transparency: null,
      animation: null,
    });
  }

  // ── Animation Loop ────────────────────────────────────────

  private ensureAnimLoop(): void {
    if (this.animTickHandle) return;
    this.animTickHandle = setInterval(() => this.tick(), 16); // ~60fps
  }

  private tick(): void {
    const now = Date.now();
    this.frameTimeMs = this.lastFrameTime > 0 ? now - this.lastFrameTime : 16.67;
    this.lastFrameTime = now;

    let activeCount = 0;

    // Update animations
    for (const [id, anim] of this.animations) {
      if (anim.state === "running" && anim.startedAt) {
        const elapsed = now - anim.startedAt;
        anim.progress = Math.min(1, elapsed / anim.durationMs);

        if (anim.progress >= 1) {
          anim.state = "completed";
          anim.completedAt = now;
          this.completedAnimationCount++;
          if (anim.onComplete === "remove") {
            this.animations.delete(id);
          } else if (anim.onComplete === "reverse") {
            // Swap transforms and restart
            const temp = anim.fromTransform;
            anim.fromTransform = anim.toTransform;
            anim.toTransform = temp;
            anim.state = "running";
            anim.startedAt = now;
            anim.progress = 0;
            activeCount++;
          }
        } else {
          activeCount++;
        }
      } else if (anim.state === "idle") {
        activeCount++;
      }
    }

    // Update transitions
    for (const [id, trans] of this.transitions) {
      if (trans.state === "running" && trans.startedAt) {
        trans.progress = Math.min(1, (now - trans.startedAt) / trans.durationMs);
        if (trans.progress >= 1) {
          trans.state = "completed";
          this.transitions.delete(id);
        } else {
          activeCount++;
        }
      }
    }

    // Stop loop when no active effects
    if (activeCount === 0) {
      if (this.animTickHandle) {
        clearInterval(this.animTickHandle);
        this.animTickHandle = null;
      }
    }
  }

  private animateProperty(_effectId: string, _prop: string, _from: number, _to: number, _durationMs: number): void {
    // Internal property animation stub — actual interpolation done in tick()
  }

  // ── Cleanup ───────────────────────────────────────────────

  removeAllEffectsForTarget(targetId: string): void {
    for (const [id, b] of this.blurs) if (b.targetId === targetId) this.blurs.delete(id);
    for (const [id, s] of this.shadows) if (s.targetId === targetId) this.shadows.delete(id);
    for (const [id, t] of this.transparencies) if (t.targetId === targetId) this.transparencies.delete(id);
    for (const [id, a] of this.animations) if (a.targetId === targetId) this.animations.delete(id);
    for (const [id, l] of this.compositeLayers) if (l.targetId === targetId) this.compositeLayers.delete(id);
  }

  destroy(): void {
    if (this.animTickHandle) {
      clearInterval(this.animTickHandle);
      this.animTickHandle = null;
    }
    this.blurs.clear();
    this.shadows.clear();
    this.transparencies.clear();
    this.animations.clear();
    this.transitions.clear();
    this.emitters.clear();
    this.compositeLayers.clear();
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): VisualEffectsStats {
    const runningAnims = Array.from(this.animations.values()).filter(a => a.state === "running").length;
    let gpuEffects = 0, cpuEffects = 0;
    for (const b of this.blurs.values()) b.gpuAccelerated ? gpuEffects++ : cpuEffects++;
    for (const s of this.shadows.values()) s.gpuAccelerated ? gpuEffects++ : cpuEffects++;
    for (const t of this.transparencies.values()) t.gpuAccelerated ? gpuEffects++ : cpuEffects++;
    let totalParticles = 0;
    for (const e of this.emitters.values()) totalParticles += e.particleCount;

    return {
      activeBlurs: Array.from(this.blurs.values()).filter(b => b.enabled).length,
      activeShadows: Array.from(this.shadows.values()).filter(s => s.enabled).length,
      activeTransparencies: Array.from(this.transparencies.values()).filter(t => t.enabled).length,
      runningAnimations: runningAnims,
      completedAnimations: this.completedAnimationCount,
      activeTransitions: Array.from(this.transitions.values()).filter(t => t.state === "running").length,
      activeParticleEmitters: Array.from(this.emitters.values()).filter(e => e.active).length,
      totalParticles,
      compositeLayers: this.compositeLayers.size,
      presetCount: this.presets.size,
      gpuAcceleratedEffects: gpuEffects,
      cpuFallbackEffects: cpuEffects,
      animationFPS: this.frameTimeMs > 0 ? Math.round(1000 / this.frameTimeMs) : 60,
      frameTimeMs: Math.round(this.frameTimeMs * 100) / 100,
    };
  }
}
