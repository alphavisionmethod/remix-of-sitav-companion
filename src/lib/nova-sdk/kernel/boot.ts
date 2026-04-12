// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Boot Sequence Orchestrator
// Initializes all kernel subsystems including privilege enforcement
// ═══════════════════════════════════════════════════════════════

import { MemoryManager } from "./memory-manager";
import { ProcessTable } from "./process-manager";
import { Scheduler } from "./scheduler";
import { Compositor } from "./compositor";
import { PowerManager } from "./power-manager";
import { PrivilegeEnforcement } from "./privilege";
import { WaylandServer } from "./wayland";
import { ServiceManager } from "../services/service-manager";
import { FileSystemService } from "../services/filesystem-service";
import { WindowServer } from "../services/window-server";
import { InputService } from "../services/input-service";
import { NotificationService } from "../services/notification-service";
import { SettingsService } from "../services/settings-service";

export interface BootLogEntry {
  subsystem: string;
  status: "ok" | "error";
  timestampMs: number;
  message: string;
}

class NovaKernelClass {
  private booted = false;
  private bootLog: BootLogEntry[] = [];
  private bootStartTime = 0;

  /** Boot all kernel subsystems in order */
  boot(): BootLogEntry[] {
    if (this.booted) {
      console.warn("[Kernel] Already booted — ignoring duplicate boot()");
      return this.bootLog;
    }

    this.bootStartTime = performance.now();
    this.bootLog = [];

    console.log("╔════════════════════════════════════════╗");
    console.log("║     NOVA KERNEL — BOOT SEQUENCE       ║");
    console.log("║   CPU Privilege Rings: Ring 0 / Ring 3 ║");
    console.log("╚════════════════════════════════════════╝");

    // 1. Privilege Enforcement (must be first — other subsystems depend on it)
    this.initSubsystem("PrivilegeEnforcement", () => {
      PrivilegeEnforcement.reset();
    });

    // 2. Memory Manager + Address Space subsystem
    this.initSubsystem("MemoryManager", () => {
      MemoryManager.reset();
      // Pre-allocate kernel memory (PID 0 = kernel, Ring 0)
      MemoryManager.allocate(0, 256, { label: "kernel:heap", guardPages: true });
      MemoryManager.allocate(0, 64, { label: "kernel:stack", guardPages: true });
      MemoryManager.createAddressSpace(0);
    });

    // 3. Process Table
    this.initSubsystem("ProcessTable", () => {
      ProcessTable.reset();
    });

    // 4. Scheduler with ready queues + privilege-aware context switching
    this.initSubsystem("Scheduler", () => {
      Scheduler.reset();
      Scheduler.start(200);
    });

    // 5. Compositor
    this.initSubsystem("Compositor", () => {
      Compositor.reset();
    });

    // 6. Power Management
    this.initSubsystem("PowerManager", () => {
      PowerManager.reset();
      PowerManager.start(1000);
    });

    // 7. Wayland Protocol Server
    this.initSubsystem("WaylandServer", () => {
      WaylandServer.reset();
      WaylandServer.boot();
    });

    // 8. Syscall table (stateless — just logging that it's ready)
    this.initSubsystem("SyscallDispatcher", () => {
      // Syscall module with ring transition support initialized
    });

    const kernelMs = (performance.now() - this.bootStartTime).toFixed(1);
    console.log(`[Kernel] Phase 1 complete in ${kernelMs}ms — kernel subsystems operational`);
    console.log(`[Kernel] Privilege enforcement active: Ring 0 (kernel) / Ring 3 (user)`);
    console.log(`[Kernel] Syscall dispatcher: Ring 3→0→3 transitions enabled`);
    console.log(`[Kernel] Context switching: privilege-aware with CPL save/restore`);

    // ── Phase 2: System Services ──
    console.log("\n[Kernel] Phase 2 — Booting System Services...");
    const phase2Start = performance.now();

    ServiceManager.reset();
    ServiceManager.register({ id: "SettingsService", factory: () => SettingsService, dependencies: [], priority: 0, restartPolicy: "always" });
    ServiceManager.register({ id: "FileSystemService", factory: () => FileSystemService, dependencies: ["SettingsService"], priority: 1, restartPolicy: "always" });
    ServiceManager.register({ id: "InputService", factory: () => InputService, dependencies: ["SettingsService"], priority: 2, restartPolicy: "on-failure" });
    ServiceManager.register({ id: "WindowServer", factory: () => WindowServer, dependencies: ["InputService"], priority: 3, restartPolicy: "always" });
    ServiceManager.register({ id: "NotificationService", factory: () => NotificationService, dependencies: ["SettingsService"], priority: 4, restartPolicy: "on-failure" });

    // ServiceManager.boot() is async but we fire-and-forget during kernel boot
    ServiceManager.boot().then(serviceLog => {
      for (const entry of serviceLog) {
        this.bootLog.push({
          subsystem: entry.serviceId,
          status: entry.status,
          timestampMs: entry.timestampMs,
          message: entry.message,
        });
      }
      const phase2Ms = (performance.now() - phase2Start).toFixed(1);
      console.log(`[Kernel] Phase 2 complete in ${phase2Ms}ms — system services operational`);
    }).catch(e => {
      console.error("[Kernel] Phase 2 service boot error:", e);
    });

    const totalMs = (performance.now() - this.bootStartTime).toFixed(1);
    console.log(`[Kernel] Boot complete in ${totalMs}ms`);

    this.booted = true;
    return this.bootLog;
  }

  /** Shutdown all subsystems */
  shutdown(): void {
    if (!this.booted) return;

    console.log("[Kernel] Shutdown initiated...");
    ServiceManager.shutdown();
    WaylandServer.reset();
    PowerManager.stop();
    Scheduler.stop();
    Compositor.reset();
    ProcessTable.reset();
    MemoryManager.reset();
    PrivilegeEnforcement.reset();

    this.booted = false;
    this.bootLog = [];
    console.log("[Kernel] Shutdown complete");
  }

  isBooted(): boolean {
    return this.booted;
  }

  getBootLog(): readonly BootLogEntry[] {
    return this.bootLog;
  }

  /** Get combined diagnostics from all subsystems */
  getDiagnostics() {
    return {
      booted: this.booted,
      memory: MemoryManager.getStats(),
      processes: ProcessTable.getStats(),
      scheduler: Scheduler.getStats(),
      compositor: Compositor.getStats(),
      power: PowerManager.getStats(),
      pressure: MemoryManager.checkPressure(),
      privilege: PrivilegeEnforcement.getStats(),
      wayland: WaylandServer.getStats(),
      services: ServiceManager.getStats(),
    };
  }

  private initSubsystem(name: string, init: () => void): void {
    const start = performance.now();
    try {
      init();
      const elapsed = performance.now() - start;
      this.bootLog.push({
        subsystem: name,
        status: "ok",
        timestampMs: elapsed,
        message: `${name} initialized`,
      });
      console.log(`  ✓ ${name} (${elapsed.toFixed(1)}ms)`);
    } catch (e) {
      const elapsed = performance.now() - start;
      this.bootLog.push({
        subsystem: name,
        status: "error",
        timestampMs: elapsed,
        message: `${name} FAILED: ${e}`,
      });
      console.error(`  ✗ ${name} FAILED:`, e);
    }
  }
}

export const NovaKernel = new NovaKernelClass();
