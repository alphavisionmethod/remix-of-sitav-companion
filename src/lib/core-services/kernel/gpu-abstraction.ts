// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: GPU Abstraction Layer
// WebGPU-inspired device abstraction with CPU software fallback.
// Manages adapters, devices, command encoders, buffers, textures,
// render/compute pipelines, and shader modules.
// ═══════════════════════════════════════════════════════════════

// ── Backend Detection ─────────────────────────────────────────

export type GPUBackendType = "webgpu" | "software" | "vulkan" | "metal" | "d3d12" | "none";
export type GPUPowerPreference = "low-power" | "high-performance";
export type GPUFeature =
  | "texture-compression-bc" | "texture-compression-astc" | "depth-clip-control"
  | "float32-filterable" | "rg11b10ufloat-renderable" | "bgra8unorm-storage"
  | "timestamp-query" | "indirect-first-instance" | "shader-f16";

export type GPUTextureFormat =
  | "rgba8unorm" | "rgba8unorm-srgb" | "bgra8unorm" | "bgra8unorm-srgb"
  | "rgba16float" | "rgba32float" | "r8unorm" | "rg8unorm"
  | "depth24plus" | "depth24plus-stencil8" | "depth32float";

export type GPUBufferUsage = "vertex" | "index" | "uniform" | "storage" | "copy-src" | "copy-dst" | "indirect" | "map-read" | "map-write";
export type GPUTextureUsage = "sampled" | "storage" | "render-attachment" | "copy-src" | "copy-dst";
export type GPUShaderStage = "vertex" | "fragment" | "compute";

// ── Adapter & Limits ──────────────────────────────────────────

export interface GPUAdapterInfo {
  vendor: string;
  architecture: string;
  device: string;
  description: string;
  driverVersion: string;
  backend: GPUBackendType;
}

export interface GPUDeviceLimits {
  maxTextureDimension2D: number;
  maxTextureArrayLayers: number;
  maxBindGroups: number;
  maxBindingsPerBindGroup: number;
  maxBufferSize: number;
  maxStorageBuffersPerShaderStage: number;
  maxStorageTexturesPerShaderStage: number;
  maxUniformBuffersPerShaderStage: number;
  maxUniformBufferBindingSize: number;
  maxStorageBufferBindingSize: number;
  maxVertexBuffers: number;
  maxVertexAttributes: number;
  maxVertexBufferArrayStride: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeWorkgroupsPerDimension: number;
  maxColorAttachments: number;
}

const DEFAULT_LIMITS: GPUDeviceLimits = {
  maxTextureDimension2D: 8192,
  maxTextureArrayLayers: 256,
  maxBindGroups: 4,
  maxBindingsPerBindGroup: 1000,
  maxBufferSize: 268435456, // 256MB
  maxStorageBuffersPerShaderStage: 8,
  maxStorageTexturesPerShaderStage: 4,
  maxUniformBuffersPerShaderStage: 12,
  maxUniformBufferBindingSize: 65536,
  maxStorageBufferBindingSize: 134217728, // 128MB
  maxVertexBuffers: 8,
  maxVertexAttributes: 16,
  maxVertexBufferArrayStride: 2048,
  maxComputeWorkgroupSizeX: 256,
  maxComputeWorkgroupSizeY: 256,
  maxComputeWorkgroupSizeZ: 64,
  maxComputeWorkgroupsPerDimension: 65535,
  maxColorAttachments: 8,
};

const SOFTWARE_LIMITS: GPUDeviceLimits = {
  ...DEFAULT_LIMITS,
  maxTextureDimension2D: 4096,
  maxBufferSize: 67108864, // 64MB
  maxStorageBufferBindingSize: 33554432, // 32MB
  maxComputeWorkgroupSizeX: 64,
  maxComputeWorkgroupSizeY: 64,
  maxComputeWorkgroupSizeZ: 16,
};

// ── Resource Handles ──────────────────────────────────────────

export interface GPUBufferHandle {
  id: string;
  size: number;
  usage: GPUBufferUsage[];
  mapped: boolean;
  label: string;
  createdAt: number;
}

export interface GPUTextureHandle {
  id: string;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  format: GPUTextureFormat;
  usage: GPUTextureUsage[];
  mipLevelCount: number;
  sampleCount: 1 | 4;
  label: string;
  createdAt: number;
}

export interface GPUShaderModuleHandle {
  id: string;
  code: string;
  language: "wgsl" | "spirv" | "glsl";
  label: string;
  compilationStatus: "pending" | "success" | "error";
  compilationErrors: string[];
  createdAt: number;
}

export interface GPURenderPipelineHandle {
  id: string;
  vertexShader: string;   // shader module ID
  fragmentShader: string; // shader module ID
  topology: "point-list" | "line-list" | "line-strip" | "triangle-list" | "triangle-strip";
  cullMode: "none" | "front" | "back";
  frontFace: "ccw" | "cw";
  depthTest: boolean;
  depthWrite: boolean;
  blendEnabled: boolean;
  label: string;
  createdAt: number;
}

export interface GPUComputePipelineHandle {
  id: string;
  shaderModule: string; // shader module ID
  entryPoint: string;
  label: string;
  createdAt: number;
}

// ── Command Recording ─────────────────────────────────────────

export type GPUCommand =
  | { type: "clear"; color: [number, number, number, number]; target: string }
  | { type: "draw"; pipeline: string; vertexBuffers: string[]; indexBuffer?: string; vertexCount: number; instanceCount: number }
  | { type: "draw-indexed"; pipeline: string; vertexBuffers: string[]; indexBuffer: string; indexCount: number; instanceCount: number }
  | { type: "dispatch"; pipeline: string; workgroupsX: number; workgroupsY: number; workgroupsZ: number }
  | { type: "copy-buffer"; src: string; dst: string; srcOffset: number; dstOffset: number; size: number }
  | { type: "copy-texture"; src: string; dst: string }
  | { type: "set-viewport"; x: number; y: number; width: number; height: number; minDepth: number; maxDepth: number }
  | { type: "set-scissor"; x: number; y: number; width: number; height: number };

export interface GPUCommandEncoder {
  id: string;
  commands: GPUCommand[];
  finished: boolean;
  label: string;
}

// ── Queue Submission ──────────────────────────────────────────

export interface GPUSubmission {
  id: string;
  encoderId: string;
  commandCount: number;
  submittedAt: number;
  completedAt: number | null;
  status: "queued" | "executing" | "completed" | "error";
}

// ── Device Lost Handling ──────────────────────────────────────

export interface GPUDeviceLostInfo {
  reason: "destroyed" | "unknown" | "driver-crash" | "power-event";
  message: string;
  timestamp: number;
}

// ── GPU Stats ─────────────────────────────────────────────────

export interface GPUAbstractionStats {
  backend: GPUBackendType;
  adapterAvailable: boolean;
  deviceActive: boolean;
  features: GPUFeature[];
  bufferCount: number;
  textureCount: number;
  shaderModuleCount: number;
  renderPipelineCount: number;
  computePipelineCount: number;
  totalBufferBytes: number;
  totalTexturePixels: number;
  submissionCount: number;
  completedSubmissions: number;
  errorCount: number;
  deviceLostCount: number;
}

// ── GPU Abstraction Implementation ────────────────────────────

export class GPUAbstraction {
  private backend: GPUBackendType = "none";
  private adapterInfo: GPUAdapterInfo | null = null;
  private limits: GPUDeviceLimits = SOFTWARE_LIMITS;
  private features: Set<GPUFeature> = new Set();
  private deviceActive = false;

  // Resources
  private buffers: Map<string, GPUBufferHandle> = new Map();
  private textures: Map<string, GPUTextureHandle> = new Map();
  private shaderModules: Map<string, GPUShaderModuleHandle> = new Map();
  private renderPipelines: Map<string, GPURenderPipelineHandle> = new Map();
  private computePipelines: Map<string, GPUComputePipelineHandle> = new Map();
  private encoders: Map<string, GPUCommandEncoder> = new Map();
  private submissions: GPUSubmission[] = [];

  private nextId = 1;
  private errorCount = 0;
  private deviceLostCount = 0;
  private lostListeners: Array<(info: GPUDeviceLostInfo) => void> = [];

  constructor() {
    this.detectBackend();
  }

  // ── Backend Detection ─────────────────────────────────────

  private detectBackend(): void {
    // In browser: check navigator.gpu
    if (typeof navigator !== "undefined" && "gpu" in navigator) {
      this.backend = "webgpu";
    } else {
      this.backend = "software";
    }
  }

  async requestAdapter(options: {
    powerPreference?: GPUPowerPreference;
    forceFallback?: boolean;
  } = {}): Promise<boolean> {
    if (options.forceFallback) {
      this.backend = "software";
      this.limits = { ...SOFTWARE_LIMITS };
      this.adapterInfo = {
        vendor: "SITA", architecture: "CPU", device: "Software Rasterizer",
        description: "SITA OS CPU-based GPU fallback", driverVersion: "1.0.0",
        backend: "software",
      };
      return true;
    }

    if (this.backend === "webgpu") {
      // In real impl would do navigator.gpu.requestAdapter()
      // Simulate for kernel model
      this.adapterInfo = {
        vendor: "Generic", architecture: "GPU", device: "WebGPU Adapter",
        description: "WebGPU-compatible GPU", driverVersion: "1.0.0",
        backend: "webgpu",
      };
      this.limits = { ...DEFAULT_LIMITS };
      return true;
    }

    // Fallback to software
    this.backend = "software";
    this.adapterInfo = {
      vendor: "SITA", architecture: "CPU", device: "Software Rasterizer",
      description: "SITA OS CPU-based GPU fallback", driverVersion: "1.0.0",
      backend: "software",
    };
    this.limits = { ...SOFTWARE_LIMITS };
    return true;
  }

  async requestDevice(requiredFeatures: GPUFeature[] = {}, requiredLimits: Partial<GPUDeviceLimits> = {}): Promise<boolean> {
    if (!this.adapterInfo) return false;

    // Validate features
    const supportedFeatures: GPUFeature[] = this.backend === "webgpu"
      ? ["depth-clip-control", "float32-filterable", "timestamp-query"]
      : ["depth-clip-control"];

    for (const feat of requiredFeatures) {
      if (!supportedFeatures.includes(feat)) {
        this.errorCount++;
        return false;
      }
    }

    // Validate limits
    for (const [key, value] of Object.entries(requiredLimits)) {
      const k = key as keyof GPUDeviceLimits;
      if (value !== undefined && value > this.limits[k]) {
        this.errorCount++;
        return false;
      }
    }

    this.features = new Set([...supportedFeatures, ...requiredFeatures]);
    if (requiredLimits) {
      this.limits = { ...this.limits, ...requiredLimits };
    }
    this.deviceActive = true;
    return true;
  }

  getAdapterInfo(): GPUAdapterInfo | null { return this.adapterInfo; }
  getLimits(): GPUDeviceLimits { return { ...this.limits }; }
  getFeatures(): GPUFeature[] { return Array.from(this.features); }
  getBackend(): GPUBackendType { return this.backend; }
  isDeviceActive(): boolean { return this.deviceActive; }

  // ── Buffer Management ─────────────────────────────────────

  createBuffer(size: number, usage: GPUBufferUsage[], label = ""): GPUBufferHandle {
    if (size > this.limits.maxBufferSize) {
      this.errorCount++;
      throw new Error(`Buffer size ${size} exceeds limit ${this.limits.maxBufferSize}`);
    }
    const handle: GPUBufferHandle = {
      id: `buf-${this.nextId++}`, size, usage, mapped: false, label, createdAt: Date.now(),
    };
    this.buffers.set(handle.id, handle);
    return handle;
  }

  destroyBuffer(id: string): boolean {
    return this.buffers.delete(id);
  }

  mapBuffer(id: string): boolean {
    const buf = this.buffers.get(id);
    if (!buf || buf.mapped) return false;
    if (!buf.usage.includes("map-read") && !buf.usage.includes("map-write")) return false;
    buf.mapped = true;
    return true;
  }

  unmapBuffer(id: string): boolean {
    const buf = this.buffers.get(id);
    if (!buf || !buf.mapped) return false;
    buf.mapped = false;
    return true;
  }

  // ── Texture Management ────────────────────────────────────

  createTexture(config: {
    width: number; height: number; format: GPUTextureFormat;
    usage: GPUTextureUsage[]; label?: string;
    depthOrArrayLayers?: number; mipLevelCount?: number; sampleCount?: 1 | 4;
  }): GPUTextureHandle {
    const maxDim = this.limits.maxTextureDimension2D;
    if (config.width > maxDim || config.height > maxDim) {
      this.errorCount++;
      throw new Error(`Texture dimension exceeds limit ${maxDim}`);
    }
    const handle: GPUTextureHandle = {
      id: `tex-${this.nextId++}`, width: config.width, height: config.height,
      depthOrArrayLayers: config.depthOrArrayLayers ?? 1,
      format: config.format, usage: config.usage,
      mipLevelCount: config.mipLevelCount ?? 1,
      sampleCount: config.sampleCount ?? 1,
      label: config.label ?? "", createdAt: Date.now(),
    };
    this.textures.set(handle.id, handle);
    return handle;
  }

  destroyTexture(id: string): boolean {
    return this.textures.delete(id);
  }

  // ── Shader Modules ────────────────────────────────────────

  createShaderModule(code: string, language: "wgsl" | "spirv" | "glsl" = "wgsl", label = ""): GPUShaderModuleHandle {
    const handle: GPUShaderModuleHandle = {
      id: `shader-${this.nextId++}`, code, language, label,
      compilationStatus: "pending", compilationErrors: [],
      createdAt: Date.now(),
    };

    // Validate WGSL reserved keywords
    if (language === "wgsl") {
      const reserved = ["meta", "target", "type", "namespace"];
      const errors: string[] = [];
      for (const kw of reserved) {
        const re = new RegExp(`\\bvar\\s+${kw}\\b|\\b${kw}\\s*:`, "g");
        if (re.test(code)) {
          errors.push(`WGSL reserved keyword used as identifier: '${kw}'`);
        }
      }
      if (errors.length) {
        handle.compilationStatus = "error";
        handle.compilationErrors = errors;
      } else {
        handle.compilationStatus = "success";
      }
    } else {
      handle.compilationStatus = "success";
    }

    this.shaderModules.set(handle.id, handle);
    return handle;
  }

  destroyShaderModule(id: string): boolean {
    return this.shaderModules.delete(id);
  }

  // ── Pipeline Creation ─────────────────────────────────────

  createRenderPipeline(config: {
    vertexShader: string; fragmentShader: string; label?: string;
    topology?: GPURenderPipelineHandle["topology"];
    cullMode?: GPURenderPipelineHandle["cullMode"];
    frontFace?: GPURenderPipelineHandle["frontFace"];
    depthTest?: boolean; depthWrite?: boolean; blendEnabled?: boolean;
  }): GPURenderPipelineHandle {
    const vs = this.shaderModules.get(config.vertexShader);
    const fs = this.shaderModules.get(config.fragmentShader);
    if (!vs || !fs) throw new Error("Shader module not found");
    if (vs.compilationStatus === "error" || fs.compilationStatus === "error") {
      throw new Error("Cannot create pipeline with errored shader");
    }
    const handle: GPURenderPipelineHandle = {
      id: `rpipe-${this.nextId++}`,
      vertexShader: config.vertexShader, fragmentShader: config.fragmentShader,
      topology: config.topology ?? "triangle-list",
      cullMode: config.cullMode ?? "back",
      frontFace: config.frontFace ?? "ccw",
      depthTest: config.depthTest ?? true,
      depthWrite: config.depthWrite ?? true,
      blendEnabled: config.blendEnabled ?? false,
      label: config.label ?? "", createdAt: Date.now(),
    };
    this.renderPipelines.set(handle.id, handle);
    return handle;
  }

  createComputePipeline(shaderModule: string, entryPoint = "main", label = ""): GPUComputePipelineHandle {
    const shader = this.shaderModules.get(shaderModule);
    if (!shader) throw new Error("Shader module not found");
    // Check storage buffer binding limit
    const storageBindCount = (shader.code.match(/var<storage/g) || []).length;
    if (storageBindCount > this.limits.maxStorageBuffersPerShaderStage) {
      throw new Error(`Storage buffer count ${storageBindCount} exceeds limit ${this.limits.maxStorageBuffersPerShaderStage}`);
    }
    const handle: GPUComputePipelineHandle = {
      id: `cpipe-${this.nextId++}`, shaderModule, entryPoint, label, createdAt: Date.now(),
    };
    this.computePipelines.set(handle.id, handle);
    return handle;
  }

  // ── Command Encoding ──────────────────────────────────────

  createCommandEncoder(label = ""): GPUCommandEncoder {
    const encoder: GPUCommandEncoder = {
      id: `enc-${this.nextId++}`, commands: [], finished: false, label,
    };
    this.encoders.set(encoder.id, encoder);
    return encoder;
  }

  encodeCommand(encoderId: string, command: GPUCommand): boolean {
    const enc = this.encoders.get(encoderId);
    if (!enc || enc.finished) return false;
    enc.commands.push(command);
    return true;
  }

  finishEncoder(encoderId: string): boolean {
    const enc = this.encoders.get(encoderId);
    if (!enc || enc.finished) return false;
    enc.finished = true;
    return true;
  }

  // ── Queue Submission ──────────────────────────────────────

  submit(encoderId: string): GPUSubmission {
    const enc = this.encoders.get(encoderId);
    if (!enc || !enc.finished) throw new Error("Encoder not finished");
    const submission: GPUSubmission = {
      id: `sub-${this.nextId++}`, encoderId,
      commandCount: enc.commands.length,
      submittedAt: Date.now(), completedAt: null, status: "queued",
    };
    // Simulate immediate completion for CPU backend
    if (this.backend === "software") {
      submission.status = "completed";
      submission.completedAt = Date.now();
    } else {
      submission.status = "executing";
      // Simulate async completion
      setTimeout(() => {
        submission.status = "completed";
        submission.completedAt = Date.now();
      }, 1);
    }
    this.submissions.push(submission);
    this.encoders.delete(encoderId);
    return submission;
  }

  // ── Device Lost ───────────────────────────────────────────

  onDeviceLost(listener: (info: GPUDeviceLostInfo) => void): void {
    this.lostListeners.push(listener);
  }

  simulateDeviceLost(reason: GPUDeviceLostInfo["reason"] = "unknown"): void {
    this.deviceLostCount++;
    this.deviceActive = false;
    const info: GPUDeviceLostInfo = { reason, message: `Device lost: ${reason}`, timestamp: Date.now() };
    for (const listener of this.lostListeners) {
      try { listener(info); } catch {}
    }
  }

  destroyDevice(): void {
    this.deviceActive = false;
    this.buffers.clear();
    this.textures.clear();
    this.shaderModules.clear();
    this.renderPipelines.clear();
    this.computePipelines.clear();
    this.encoders.clear();
    this.features.clear();
    this.simulateDeviceLost("destroyed");
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): GPUAbstractionStats {
    let totalBufBytes = 0;
    for (const b of this.buffers.values()) totalBufBytes += b.size;
    let totalTexPixels = 0;
    for (const t of this.textures.values()) totalTexPixels += t.width * t.height * t.depthOrArrayLayers;
    return {
      backend: this.backend,
      adapterAvailable: this.adapterInfo !== null,
      deviceActive: this.deviceActive,
      features: Array.from(this.features),
      bufferCount: this.buffers.size,
      textureCount: this.textures.size,
      shaderModuleCount: this.shaderModules.size,
      renderPipelineCount: this.renderPipelines.size,
      computePipelineCount: this.computePipelines.size,
      totalBufferBytes: totalBufBytes,
      totalTexturePixels: totalTexPixels,
      submissionCount: this.submissions.length,
      completedSubmissions: this.submissions.filter(s => s.status === "completed").length,
      errorCount: this.errorCount,
      deviceLostCount: this.deviceLostCount,
    };
  }
}
