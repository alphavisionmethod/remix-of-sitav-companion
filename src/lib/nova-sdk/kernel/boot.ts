// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Boot Sequence Orchestrator
// Initializes all kernel subsystems including HAL, privilege, extensions
// ═══════════════════════════════════════════════════════════════

import { MemoryManager } from "./memory-manager";
import { ProcessTable } from "./process-manager";
import { Scheduler } from "./scheduler";
import { Compositor } from "./compositor";
import { PowerManager } from "./power-manager";
import { PrivilegeEnforcement } from "./privilege";
import { resetRateLimiter, resetMutexes, clearSyscallLog } from "./syscall";
import { WaylandServer } from "./wayland";
import { DriverManager } from "./drivers";
import { ServiceManager } from "../services/service-manager";
import { FileSystemService } from "../services/filesystem-service";
import { WindowServer } from "../services/window-server";
import { InputService } from "../services/input-service";
import { NotificationService } from "../services/notification-service";
import { SettingsService } from "../services/settings-service";
import { PluginRegistry } from "../extensions/plugin-registry";
import { WidgetRegistry } from "../extensions/widget-registry";
import { IntegrationRegistry } from "../extensions/integration-registry";

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
    console.log("║   Apps → SDK → Services → Kernel      ║");
    console.log("║   → Drivers → Hardware                ║");
    console.log("╚════════════════════════════════════════╝");

    // ── Phase 0: Hardware Abstraction Layer ──
    console.log("\n[Kernel] Phase 0 — Initializing HAL / Drivers...");
    this.initSubsystem("DriverManager", () => {
      // initAll is async but drivers are simulated — fire and forget
      DriverManager.initAll().then(results => {
        for (const r of results) {
          console.log(`  ↳ ${r.id}: ${r.status} (${r.ms.toFixed(1)}ms)`);
        }
      });
    });

    const phase0Ms = (performance.now() - this.bootStartTime).toFixed(1);
    console.log(`[Kernel] Phase 0 complete in ${phase0Ms}ms — HAL initialized`);

    // ── Phase 1: Kernel Subsystems ──
    console.log("\n[Kernel] Phase 1 — Booting Kernel Subsystems...");

    this.initSubsystem("PrivilegeEnforcement", () => {
      PrivilegeEnforcement.reset();
    });

    this.initSubsystem("MemoryManager", () => {
      MemoryManager.reset();
      MemoryManager.allocate(0, 256, { label: "kernel:heap", guardPages: true });
      MemoryManager.allocate(0, 64, { label: "kernel:stack", guardPages: true });
      MemoryManager.createAddressSpace(0);
    });

    this.initSubsystem("ProcessTable", () => {
      ProcessTable.reset();
    });

    this.initSubsystem("Scheduler", () => {
      Scheduler.reset();
      Scheduler.start(200);
    });

    this.initSubsystem("Compositor", () => {
      Compositor.reset();
    });

    this.initSubsystem("PowerManager", () => {
      PowerManager.reset();
      PowerManager.start(1000);
    });

    this.initSubsystem("WaylandServer", () => {
      WaylandServer.reset();
      WaylandServer.boot();
    });

    this.initSubsystem("SyscallDispatcher", () => {
      // Initialize syscall subsystem — clear rate limiters, mutexes, logs
      resetRateLimiter();
      resetMutexes();
      clearSyscallLog();
    });

    const kernelMs = (performance.now() - this.bootStartTime).toFixed(1);
    console.log(`[Kernel] Phase 1 complete in ${kernelMs}ms — kernel subsystems operational`);
    console.log(`[Kernel] Privilege enforcement active: Ring 0 (kernel) / Ring 3 (user)`);

    // ── Phase 2: System Services ──
    console.log("\n[Kernel] Phase 2 — Booting System Services...");
    const phase2Start = performance.now();

    ServiceManager.reset();
    ServiceManager.register({ id: "SettingsService", factory: () => SettingsService, dependencies: [], priority: 0, restartPolicy: "always" });
    ServiceManager.register({ id: "FileSystemService", factory: () => FileSystemService, dependencies: ["SettingsService"], priority: 1, restartPolicy: "always" });
    ServiceManager.register({ id: "InputService", factory: () => InputService, dependencies: ["SettingsService"], priority: 2, restartPolicy: "on-failure" });
    ServiceManager.register({ id: "WindowServer", factory: () => WindowServer, dependencies: ["InputService"], priority: 3, restartPolicy: "always" });
    ServiceManager.register({ id: "NotificationService", factory: () => NotificationService, dependencies: ["SettingsService"], priority: 4, restartPolicy: "on-failure" });

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

    // ── Phase 3: Extension Registries ──
    console.log("\n[Kernel] Phase 3 — Initializing Extension System...");
    this.initSubsystem("PluginRegistry", () => {
      PluginRegistry.reset();
      // Register core extension points
      PluginRegistry.registerExtensionPoint({ id: "menubar.items", description: "Add items to the menubar", ownerApp: "system" });
      PluginRegistry.registerExtensionPoint({ id: "settings.sections", description: "Add settings sections", ownerApp: "system" });
      PluginRegistry.registerExtensionPoint({ id: "finder.contextmenu", description: "Add Finder context menu items", ownerApp: "finder" });
      PluginRegistry.registerExtensionPoint({ id: "statusbar.widgets", description: "Add status bar widgets", ownerApp: "system" });
      PluginRegistry.registerExtensionPoint({ id: "dock.actions", description: "Add dock right-click actions", ownerApp: "system" });
      PluginRegistry.registerExtensionPoint({ id: "notification.filters", description: "Filter or transform notifications", ownerApp: "system" });
    });

    this.initSubsystem("WidgetRegistry", () => {
      WidgetRegistry.reset();
    });

    this.initSubsystem("IntegrationRegistry", () => {
      IntegrationRegistry.reset();
    });

    const totalMs = (performance.now() - this.bootStartTime).toFixed(1);
    console.log(`[Kernel] Boot complete in ${totalMs}ms — full stack operational`);
    console.log(`[Kernel] Stack: Apps → SDK → Services → Kernel → Drivers → Hardware`);

    this.booted = true;
    return this.bootLog;
  }

  /** Shutdown all subsystems */
  shutdown(): void {
    if (!this.booted) return;

    console.log("[Kernel] Shutdown initiated...");
    PluginRegistry.reset();
    WidgetRegistry.reset();
    IntegrationRegistry.reset();
    ServiceManager.shutdown();
    WaylandServer.reset();
    PowerManager.stop();
    Scheduler.stop();
    Compositor.reset();
    ProcessTable.reset();
    MemoryManager.reset();
    PrivilegeEnforcement.reset();
    DriverManager.reset();

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
      drivers: DriverManager.getStats(),
      extensions: {
        plugins: PluginRegistry.getStats(),
        widgets: WidgetRegistry.getStats(),
        integrations: IntegrationRegistry.getStats(),
      },
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
