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

  private _bootedAt: number;

  constructor(opts?: { tpmAvailable?: boolean }) {
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
    this.journal.kernelMsg("notice", "KernelSubsystem initialized — all modules loaded");
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
    };
  }

  destroy(): void {
    this.initSystem.destroy();
  }
}
