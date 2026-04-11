// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Subsystem Barrel Export & Facade
// ═══════════════════════════════════════════════════════════════

export { ProcessScheduler, PriorityBand, BAND_CONFIG, type ProcessControlBlock, type ThreadControlBlock } from "./process-scheduler";
export { MemoryManager, BuddyAllocator, SlabAllocator, type AddressSpace, type VirtualMemoryArea } from "./memory-manager";
export { SitaFilesystem, VirtualFilesystemLayer, type Inode, type MountPoint, type Snapshot } from "./sita-filesystem";
export { DriverManager, type DriverDescriptor, type DeviceDescriptor, type HotPlugEvent } from "./driver-manager";
export { IPCSystem, type IPCMessage, type MessagePort, type SharedMemoryRegion, type CapabilityToken } from "./ipc-system";
export { SYSCALL_TABLE, getSyscallByNumber, getSyscallByName, getSyscallsByCategory, getSyscallStats, type SyscallDefinition } from "./syscall-table";
export { SandboxEngine, TrustRing, RING_CONFIG, type SeccompProfile } from "./sandbox-engine";
export { CodeVerificationService, type SigningKey, type BootChainAttestation, type VerificationRecord } from "./code-verification";
export { CapabilityPermissionSystem, type SitaCapabilityToken, type LinuxCapability } from "./capability-permission-system";
export { CryptoSubsystem, type CryptoKey, type LUKS2Config, type TPMSealedObject } from "./crypto-subsystem";
export { AppIsolationManager, type AppSandbox, type CgroupLimits } from "./app-isolation";

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

/**
 * KernelSubsystem — Facade aggregating all kernel architecture
 * and security model services into a single entry point.
 */
export class KernelSubsystem {
  readonly scheduler: ProcessScheduler;
  readonly vmm: MemoryManager;
  readonly vfs: VirtualFilesystemLayer;
  readonly drivers: DriverManager;
  readonly ipc: IPCSystem;
  readonly sandbox: SandboxEngine;
  readonly codeVerification: CodeVerificationService;
  readonly permissions: CapabilityPermissionSystem;
  readonly crypto: CryptoSubsystem;
  readonly appIsolation: AppIsolationManager;

  private _bootedAt: number;

  constructor(opts?: { tpmAvailable?: boolean }) {
    this.scheduler = new ProcessScheduler();
    this.vmm = new MemoryManager();
    this.vfs = new VirtualFilesystemLayer();
    this.drivers = new DriverManager();
    this.ipc = new IPCSystem();
    this.sandbox = new SandboxEngine();
    this.codeVerification = new CodeVerificationService();
    this.permissions = new CapabilityPermissionSystem();
    this.crypto = new CryptoSubsystem(opts?.tpmAvailable ?? true);
    this.appIsolation = new AppIsolationManager();
    this._bootedAt = Date.now();

    // Construct boot chain attestation
    this.codeVerification.constructBootChain(
      opts?.tpmAvailable ?? true,
      true // secure boot enabled
    );
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
    };
  }
}
