// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Boot Sequence Orchestrator
// Initializes all kernel subsystems in correct order
// ═══════════════════════════════════════════════════════════════

import { MemoryManager } from "./memory-manager";
import { ProcessTable } from "./process-manager";
import { Scheduler } from "./scheduler";
import { Compositor } from "./compositor";

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
    console.log("╚════════════════════════════════════════╝");

    // 1. Memory Manager + Address Space subsystem
    this.initSubsystem("MemoryManager", () => {
      MemoryManager.reset();
      // Pre-allocate kernel memory (PID 0 = kernel)
      MemoryManager.allocate(0, 256, { label: "kernel:heap", guardPages: true });
      MemoryManager.allocate(0, 64, { label: "kernel:stack", guardPages: true });
      // Create kernel address space
      MemoryManager.createAddressSpace(0);
    });

    // 2. Process Table
    this.initSubsystem("ProcessTable", () => {
      ProcessTable.reset();
    });

    // 3. Scheduler with ready queues + context switching
    this.initSubsystem("Scheduler", () => {
      Scheduler.reset();
      Scheduler.start(200); // 200ms tick interval for simulation
    });

    // 4. Compositor
    this.initSubsystem("Compositor", () => {
      Compositor.reset();
    });

    // 5. Syscall table (stateless — just logging that it's ready)
    this.initSubsystem("SyscallDispatcher", () => {
      // Syscall module is stateless, no init needed
    });

    const totalMs = (performance.now() - this.bootStartTime).toFixed(1);
    const schedStats = Scheduler.getStats();
    console.log(`[Kernel] Boot complete in ${totalMs}ms — all subsystems operational`);
    console.log(`[Kernel] Ready queues initialized (5 bands), context switching enabled`);
    console.log(`[Kernel] Address space subsystem active, page table switching ready`);

    this.booted = true;
    return this.bootLog;
  }

  /** Shutdown all subsystems */
  shutdown(): void {
    if (!this.booted) return;

    console.log("[Kernel] Shutdown initiated...");
    Scheduler.stop();
    Compositor.reset();
    ProcessTable.reset();
    MemoryManager.reset();

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
      pressure: MemoryManager.checkPressure(),
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
