// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Subsystem Barrel Export & Facade
// ═══════════════════════════════════════════════════════════════

// --- Kernel Architecture ---
export { ProcessScheduler, PriorityBand, BAND_CONFIG, type ProcessControlBlock, type ThreadControlBlock } from "./process-scheduler";
export { MemoryManager, BuddyAllocator, SlabAllocator, type AddressSpace, type VirtualMemoryArea } from "./memory-manager";
export { SitaFilesystem, VirtualFilesystemLayer, type Inode, type MountPoint, type Snapshot } from "./sita-filesystem";
export { DriverManager, type DriverDescriptor, type DeviceDescriptor, type HotPlugEvent } from "./driver-manager";
export { IPCSystem, type IPCMessage, type MessagePort, type SharedMemoryRegion, type CapabilityToken } from "./ipc-system";
export { SYSCALL_TABLE, getSyscallByNumber, getSyscallByName, getSyscallsByCategory, getSyscallStats, type SyscallDefinition } from "./syscall-table";

// --- Security Model ---
export { SandboxEngine, TrustRing, RING_CONFIG, type SeccompProfile } from "./sandbox-engine";
export { CodeVerificationService, type SigningKey, type BootChainAttestation, type VerificationRecord } from "./code-verification";
export { CapabilityPermissionSystem, type SitaCapabilityToken, type LinuxCapability } from "./capability-permission-system";
export { CryptoSubsystem, type CryptoKey, type LUKS2Config, type TPMSealedObject } from "./crypto-subsystem";
export { AppIsolationManager, type AppSandbox, type CgroupLimits } from "./app-isolation";

// --- Userspace & System Services ---
export { InitSystem, type ServiceUnit, type BootTarget } from "./init-system";
export { DaemonRegistry, type DaemonDefinition, type DaemonHealth, type ResourceLimits } from "./system-daemons";
export { PackageManager, type PackageManifest, type InstalledPackage, type Repository, type Transaction } from "./package-manager";
export { JournalSubsystem, type JournalEntry, type JournalPriority, type CrashDump, type DiagnosticSnapshot } from "./journal-subsystem";
export { ConfigManager, type ConfigEntry, type ConfigLayer, type ConfigSchema, type ConfigChangeRecord } from "./config-manager";

// --- Rendering Pipeline ---
export { RenderPipeline, type FrameStats, type PipelineStats, type LayoutNode } from "./render-pipeline";
export { SoftwareRasterizer, type TileBuffer, type Color, type BlendMode, type PixelFormat } from "./software-rasterizer";
export { TileCompositor, type Tile, type TileState, type CompositorLayer, type CompositorStats } from "./tile-compositor";
export { DamageTracker, type Rect, type DamageRegion, type DamageSource, type DamageStats } from "./damage-tracker";
export { VectorRenderer, GlyphAtlas, KerningTable, type VectorPath, type PathCommand, type GradientDef, type StrokeStyle, type GlyphCacheEntry, type PatternDef, type FillStyle, type GlyphAtlasStats } from "./vector-renderer";
export { RenderThreadPool, type WorkItem, type WorkPriority, type RenderThread, type ThreadPoolStats } from "./render-thread-pool";

// --- Rendering Extensions ---
export { AnimationEngine, AnimationGroup, classifyAnimationLayer, type AnimationDef, type AnimationInstance, type AnimationLayer, type KeyframeTrack, type EasingDef } from "./animation-engine";
export { TextLayoutEngine, type TextLayoutResult, type TextStyle, type TextLayoutBox, type PositionedGlyph } from "./text-layout-engine";
export { ImagePipeline, type ImageSource, type SpriteAtlas, type NineSliceInsets, type ScaleFilter } from "./image-pipeline";
export { RenderDebugOverlay, type DebugSnapshot, type DebugOverlayConfig } from "./render-debug-overlay";

// --- Display Server, Input, Scene Graph, Color, Cursor ---
export { DisplayServer, type ManagedWindow, type WindowCreateOptions, type Monitor, type WindowEvent, type DisplayServerStats, type InputRouteResult } from "./display-server";
export { CpuCompositor, type Framebuffer, type SurfaceBuffer, type DisplayOutput, type DisplayMode, type CpuCompositorStats, createFramebuffer, clearFramebuffer, clearRegion } from "./cpu-compositor";
export { InputSystem, type InputEvent, type KeyboardEvent, type MouseEvent, type TouchEvent, type GestureEvent, type HotkeyBinding, type InputSystemStats } from "./input-system";
export { SceneGraph, SceneNode, type SceneNodeProps, type DisplayListEntry, type HitTestResult, type Transform2D, type SceneGraphStats, type SceneInputEvent, type SceneEventHandler } from "./scene-graph";
export { ColorManagement, type ICCProfile, type RGBColor, type HSLColor, type LabColor, type ColorManagementStats } from "./color-management";
export { CursorManager, type CursorImage, type CursorState, type CursorDamage, type SystemCursorShape, type CursorManagerStats } from "./cursor-manager";

// --- Clipboard, Window Effects, Accessibility ---
export { ClipboardManager, type ClipboardEntry, type ClipboardOffer, type ClipboardSelection, type ClipboardMimeType, type DragDropOffer, type DragDropResult, type ClipboardManagerStats } from "./clipboard-manager";
export { WindowEffects, type SnapZone, type SnapConfig, type TileLayout, type TileRegion, type DPMSState, type ScreenLockState, type PowerConfig, type SnapPreview, type WindowEffectsStats } from "./window-effects";
export { AccessibilityRenderer, type A11yRole, type A11yAnnotation, type A11yTreeNode, type FocusRingStyle, type ContrastMode, type AccessibilityConfig, type FocusRingOverlay, type ContrastPalette, type AccessibilityRendererStats } from "./accessibility-renderer";

// --- Networking Stack (Section 5) ---
export { TCPIPStack, type NetworkInterface, type RoutingEntry, type ARPEntry, type TCPConnection, type UDPBinding, type TCPState, type CongestionAlgorithm, type NetworkStackStats } from "./tcp-ip-stack";
export { SocketAPI, type SocketDescriptor, type SocketAddress, type SocketOptions, type SocketDomain, type SocketType, type SocketState, type SocketAPIStats } from "./socket-api";
export { Firewall, type FirewallRule, type FirewallChain, type FirewallAction, type ConnTrackEntry, type RateLimitConfig, type FirewallStats } from "./firewall";
export { VPNManager, type VPNTunnel, type VPNPeer, type SplitTunnelRule, type VPNProtocol, type TunnelState, type VPNStats } from "./vpn-manager";
export { DNSResolver, type DNSRecord, type DNSQuery, type DNSCacheEntry, type DNSUpstream, type DNSOverride, type DNSResolverStats } from "./dns-resolver";

// --- Display Server & Window Manager (Section 6) ---
export { GPUAbstraction, type GPUAdapterInfo, type GPUDeviceLimits, type GPUBufferHandle, type GPUTextureHandle, type GPUShaderModuleHandle, type GPURenderPipelineHandle, type GPUComputePipelineHandle, type GPUCommandEncoder, type GPUCommand, type GPUSubmission, type GPUDeviceLostInfo, type GPUBackendType, type GPUFeature, type GPUTextureFormat, type GPUAbstractionStats } from "./gpu-abstraction";
export { WindowManager, type WMWindow, type WMWorkspace, type WMWindowState, type WMFocusPolicy, type WMStackingMode, type WMTilingStrategy, type TilingNode, type WindowManagerStats } from "./window-manager";
export { DisplayProtocol, type ProtocolClient, type ProtocolSurface, type ProtocolBuffer, type SHMPool, type XDGToplevel, type XDGPopup, type ProtocolEvent, type SurfaceRole, type DisplayProtocolStats } from "./display-protocol";
export { SurfaceAllocator, type SurfaceAllocation, type BufferPool, type FormatCapability, type SurfacePixelFormat, type SurfaceMemoryType, type BufferingMode, type SurfaceAllocatorStats } from "./surface-allocator";

// --- Visual Effects Compositor ---
export { VisualEffectsCompositor, type BlurEffect, type BlurMethod, type BlurQuality, type BlurMask, type ShadowEffect, type ShadowType, type TransparencyEffect, type TransparencyMode, type WindowAnimation, type AnimationType, type EasingFunction, type AnimTransform, type DesktopTransition, type DesktopTransitionType, type ParticleEmitter, type ParticleShape, type CompositeLayer, type CompositeBlendMode, type EffectPreset, type VisualEffectsStats } from "./visual-effects-compositor";

// --- Command Buffer & UI Renderer (CPU Vulkan + High-Level API) ---
export { CommandBuffer, CommandBufferPool, SoftwarePipeline, type DrawCommand, type CommandBufferStats, type Vertex2D, type VertexColor, type Transform2DMatrix, type Fixed16, toFixed16, fromFixed16, fpMul, fpDiv, fpFloor, fpCeil, fpFrac, IDENTITY_TRANSFORM } from "./command-buffer";
export { UIRenderer, CpuBlur, type UIViewProps, type UITextProps, type UIBackground, type UIColor, type UIGradientStop, type UIBoxShadow, type UIBorder, type UIBorderRadii, type BlurConfig, type UIRendererStats } from "./ui-renderer";

// --- View Tree + Layout Engine (Section 5.6) ---
export { ViewTree, ViewNode, ContainerNode, ColumnNode, RowNode, StackNode, TextWidget, ButtonWidget, ImageWidget, SpacerNode, type ViewStyle, type ConstraintDef, type DrawContext, type FlexOptions, type MainAxisAlign, type CrossAxisAlign, type ViewTreeStats } from "./view-tree";
export { LayoutEngine, type LayoutConstraints, type LayoutEngineStats } from "./layout-engine";

// --- Facade imports ---
import { ProcessScheduler } from "./process-scheduler";
import { MemoryManager } from "./memory-manager";
import { VirtualFilesystemLayer } from "./sita-filesystem";
import { DriverManager } from "./driver-manager";
import { IPCSystem } from "./ipc-system";
import { SandboxEngine } from "./sandbox-engine";
import { CodeVerificationService } from "./code-verification";
import { CapabilityPermissionSystem } from "./capability-permission-system";
import { CryptoSubsystem } from "./crypto-subsystem";
import { AppIsolationManager } from "./app-isolation";
import { InitSystem } from "./init-system";
import { DaemonRegistry } from "./system-daemons";
import { PackageManager } from "./package-manager";
import { JournalSubsystem } from "./journal-subsystem";
import { ConfigManager } from "./config-manager";
import { RenderPipeline } from "./render-pipeline";
import { SoftwareRasterizer } from "./software-rasterizer";
import { TileCompositor } from "./tile-compositor";
import { DamageTracker } from "./damage-tracker";
import { VectorRenderer } from "./vector-renderer";
import { RenderThreadPool } from "./render-thread-pool";
import { AnimationEngine } from "./animation-engine";
import { TextLayoutEngine } from "./text-layout-engine";
import { ImagePipeline } from "./image-pipeline";
import { RenderDebugOverlay } from "./render-debug-overlay";
import { DisplayServer } from "./display-server";
import { InputSystem } from "./input-system";
import { SceneGraph } from "./scene-graph";
import { ColorManagement } from "./color-management";
import { CursorManager } from "./cursor-manager";
import { ClipboardManager } from "./clipboard-manager";
import { WindowEffects } from "./window-effects";
import { AccessibilityRenderer } from "./accessibility-renderer";
import { CommandBufferPool } from "./command-buffer";
import { UIRenderer } from "./ui-renderer";
import { ViewTree } from "./view-tree";
import { LayoutEngine } from "./layout-engine";
import { TCPIPStack } from "./tcp-ip-stack";
import { SocketAPI } from "./socket-api";
import { Firewall } from "./firewall";
import { VPNManager } from "./vpn-manager";
import { DNSResolver } from "./dns-resolver";
import { GPUAbstraction } from "./gpu-abstraction";
import { WindowManager } from "./window-manager";
import { DisplayProtocol } from "./display-protocol";
import { SurfaceAllocator } from "./surface-allocator";
import { VisualEffectsCompositor } from "./visual-effects-compositor";

/**
 * KernelSubsystem — Facade aggregating all kernel architecture,
 * security model, and userspace services into a single entry point.
 */
export class KernelSubsystem {
  // Kernel Architecture
  readonly scheduler: ProcessScheduler;
  readonly vmm: MemoryManager;
  readonly vfs: VirtualFilesystemLayer;
  readonly drivers: DriverManager;
  readonly ipc: IPCSystem;

  // Security Model
  readonly sandbox: SandboxEngine;
  readonly codeVerification: CodeVerificationService;
  readonly permissions: CapabilityPermissionSystem;
  readonly crypto: CryptoSubsystem;
  readonly appIsolation: AppIsolationManager;

  // Userspace & System Services
  readonly initSystem: InitSystem;
  readonly daemons: DaemonRegistry;
  readonly packages: PackageManager;
  readonly journal: JournalSubsystem;
  readonly config: ConfigManager;

  // Rendering Pipeline
  readonly renderPipeline: RenderPipeline;
  readonly rasterizer: SoftwareRasterizer;
  readonly compositor: TileCompositor;
  readonly damageTracker: DamageTracker;
  readonly vectorEngine: VectorRenderer;
  readonly renderThreads: RenderThreadPool;

  // Rendering Extensions
  readonly animations: AnimationEngine;
  readonly textLayout: TextLayoutEngine;
  readonly imagePipeline: ImagePipeline;
  readonly renderDebug: RenderDebugOverlay;

  // Display Server, Input, Scene Graph, Color, Cursor
  readonly displayServer: DisplayServer;
  readonly input: InputSystem;
  readonly sceneGraph: SceneGraph;
  readonly colorManagement: ColorManagement;
  readonly cursor: CursorManager;

  // Clipboard, Window Effects, Accessibility
  readonly clipboard: ClipboardManager;
  readonly windowEffects: WindowEffects;
  readonly accessibility: AccessibilityRenderer;

  // Command Buffer & UI Renderer
  readonly commandBufferPool: CommandBufferPool;
  readonly uiRenderer: UIRenderer;

  // View Tree & Layout Engine (Section 5.6)
  readonly viewTree: ViewTree;
  readonly layoutEngine: LayoutEngine;

  // Networking Stack (Section 5)
  readonly tcpip: TCPIPStack;
  readonly sockets: SocketAPI;
  readonly firewall: Firewall;
  readonly vpn: VPNManager;
  readonly dns: DNSResolver;

  // Display Server & Window Manager (Section 6)
  readonly gpu: GPUAbstraction;
  readonly windowManager: WindowManager;
  readonly displayProtocol: DisplayProtocol;
  readonly surfaceAllocator: SurfaceAllocator;

  // Visual Effects Compositor
  readonly vfx: VisualEffectsCompositor;

  private _bootedAt: number;

  constructor(opts?: { tpmAvailable?: boolean; screenWidth?: number; screenHeight?: number; dpiScale?: number }) {
    // Kernel Architecture
    this.scheduler = new ProcessScheduler();
    this.vmm = new MemoryManager();
    this.vfs = new VirtualFilesystemLayer();
    this.drivers = new DriverManager();
    this.ipc = new IPCSystem();

    // Security Model
    this.sandbox = new SandboxEngine();
    this.codeVerification = new CodeVerificationService();
    this.permissions = new CapabilityPermissionSystem();
    this.crypto = new CryptoSubsystem(opts?.tpmAvailable ?? true);
    this.appIsolation = new AppIsolationManager();

    // Userspace & System Services
    this.initSystem = new InitSystem();
    this.daemons = new DaemonRegistry();
    this.packages = new PackageManager();
    this.journal = new JournalSubsystem();
    this.config = new ConfigManager();

    // Rendering Pipeline
    const sw = opts?.screenWidth ?? 1920;
    const sh = opts?.screenHeight ?? 1080;
    this.rasterizer = new SoftwareRasterizer();
    this.damageTracker = new DamageTracker(sw, sh);
    this.compositor = new TileCompositor(sw, sh);
    this.vectorEngine = new VectorRenderer(opts?.dpiScale ?? 1);
    this.renderThreads = new RenderThreadPool();
    this.renderPipeline = new RenderPipeline({ screenWidth: sw, screenHeight: sh, dpiScale: opts?.dpiScale });

    // Rendering Extensions
    this.animations = new AnimationEngine();
    this.textLayout = new TextLayoutEngine();
    this.imagePipeline = new ImagePipeline();
    this.renderDebug = new RenderDebugOverlay();

    // Display Server, Input, Scene Graph, Color, Cursor
    this.displayServer = new DisplayServer([{
      id: "monitor-0", name: "Primary",
      bounds: { x: 0, y: 0, width: sw, height: sh },
      dpiScale: opts?.dpiScale ?? 1, primary: true, refreshHz: 60,
    }]);
    this.input = new InputSystem();
    this.sceneGraph = new SceneGraph();
    this.colorManagement = new ColorManagement();
    this.cursor = new CursorManager();

    // Clipboard, Window Effects, Accessibility
    this.clipboard = new ClipboardManager();
    this.windowEffects = new WindowEffects();
    this.accessibility = new AccessibilityRenderer();

    // Command Buffer & UI Renderer
    this.commandBufferPool = new CommandBufferPool(16);
    this.uiRenderer = new UIRenderer();

    // View Tree & Layout Engine
    this.viewTree = new ViewTree();
    this.layoutEngine = new LayoutEngine();

    // Networking Stack
    this.tcpip = new TCPIPStack();
    this.sockets = new SocketAPI();
    this.firewall = new Firewall();
    this.vpn = new VPNManager();
    this.dns = new DNSResolver();

    // Display Server & Window Manager (Section 6)
    this.gpu = new GPUAbstraction();
    this.windowManager = new WindowManager();
    this.displayProtocol = new DisplayProtocol();
    this.surfaceAllocator = new SurfaceAllocator();

    // Visual Effects Compositor
    this.vfx = new VisualEffectsCompositor();

    // ── Wire subsystems together ────────────────────────────
    // Wire scene graph into render pipeline
    this.renderPipeline.setSceneGraph(this.sceneGraph);

    // Wire cursor + effects into display server
    this.displayServer.setCursorManager(this.cursor);
    this.displayServer.setWindowEffects(this.windowEffects);

    // Wire input system → display server routing
    this.input.addHandler((event) => {
      const result = this.displayServer.routeInputEvent(event);
      return result.handled;
    });

    this._bootedAt = Date.now();

    // Construct boot chain attestation
    this.codeVerification.constructBootChain(
      opts?.tpmAvailable ?? true,
      true // secure boot enabled
    );

    // Register daemon service units with init system
    for (const daemon of this.daemons.getAll()) {
      this.initSystem.register({
        id: daemon.id,
        description: daemon.description,
        dependencies: daemon.dependencies,
        target: daemon.target,
        restartPolicy: daemon.restartPolicy,
        watchdogMs: daemon.watchdogMs,
      });
    }

    // Log boot via journal
    this.journal.kernelMsg("notice", "KernelSubsystem initialized — all modules loaded, rendering pipeline active");
  }

  getStats() {
    return {
      bootedAt: this._bootedAt,
      uptimeMs: Date.now() - this._bootedAt,
      scheduler: this.scheduler.getStats(),
      memory: this.vmm.getStats(),
      filesystem: this.vfs.getStats(),
      drivers: this.drivers.getStats(),
      ipc: this.ipc.getStats(),
      sandbox: this.sandbox.getStats(),
      codeVerification: this.codeVerification.getStats(),
      permissions: this.permissions.getStats(),
      crypto: this.crypto.getStats(),
      appIsolation: this.appIsolation.getStats(),
      initSystem: this.initSystem.getStats(),
      daemons: this.daemons.getStats(),
      packages: this.packages.getStats(),
      journal: this.journal.getStats(),
      config: this.config.getStats(),
      renderPipeline: this.renderPipeline.getStats(),
      rasterizer: this.rasterizer.getStats(),
      compositor: this.compositor.getStats(),
      damageTracker: this.damageTracker.getStats(),
      vectorEngine: this.vectorEngine.getStats(),
      renderThreads: this.renderThreads.getStats(),
      animations: this.animations.getStats(),
      textLayout: this.textLayout.getStats(),
      imagePipeline: this.imagePipeline.getStats(),
      renderDebug: this.renderDebug.getStats(),
      displayServer: this.displayServer.getStats(),
      input: this.input.getStats(),
      sceneGraph: this.sceneGraph.getStats(),
      colorManagement: this.colorManagement.getStats(),
      cursor: this.cursor.getStats(),
      clipboard: this.clipboard.getStats(),
      windowEffects: this.windowEffects.getStats(),
      accessibility: this.accessibility.getStats(),
      commandBufferPool: { pooledCount: this.commandBufferPool.pooledCount },
      uiRenderer: this.uiRenderer.getStats(),
      viewTree: this.viewTree.getStats(),
      layoutEngine: this.layoutEngine.getStats(),
      tcpip: this.tcpip.getStats(),
      sockets: this.sockets.getStats(),
      firewall: this.firewall.getStats(),
      vpn: this.vpn.getStats(),
      dns: this.dns.getStats(),
      gpu: this.gpu.getStats(),
      windowManager: this.windowManager.getStats(),
      displayProtocol: this.displayProtocol.getStats(),
      surfaceAllocator: this.surfaceAllocator.getStats(),
      vfx: this.vfx.getStats(),
    };
  }

  destroy(): void {
    this.initSystem.destroy();
    this.renderPipeline.destroy();
    this.cursor.destroy();
    this.windowEffects.destroy();
    this.vfx.destroy();
  }
}
