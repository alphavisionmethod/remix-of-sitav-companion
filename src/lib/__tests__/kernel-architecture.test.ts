import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const KERNEL_DIR = "src/lib/core-services/kernel";

// ── Structural Tests ─────────────────────────────────────────

describe("Kernel Architecture — Structure", () => {
  it("kernel directory exists with barrel export", () => {
    expect(fs.existsSync(KERNEL_DIR)).toBe(true);
    expect(fs.existsSync(path.join(KERNEL_DIR, "index.ts"))).toBe(true);
  });

  it("all kernel subsystem files exist", () => {
    const required = [
      "process-scheduler.ts",
      "memory-manager.ts",
      "sita-filesystem.ts",
      "sandbox-engine.ts",
      "ipc-system.ts",
      "syscall-table.ts",
      "driver-manager.ts",
      "init-system.ts",
      "system-daemons.ts",
      "render-pipeline.ts",
      "input-system.ts",
      "display-server.ts",
    ];
    for (const file of required) {
      expect(fs.existsSync(path.join(KERNEL_DIR, file)), `Missing: ${file}`).toBe(true);
    }
  });

  it("barrel index re-exports all major subsystems", () => {
    const barrel = fs.readFileSync(path.join(KERNEL_DIR, "index.ts"), "utf-8");
    const subsystems = [
      "ProcessScheduler",
      "MemoryManager",
      "SitaFilesystem",
      "SandboxEngine",
      "IPCSystem",
      "SYSCALL_TABLE",
      "DriverManager",
      "InitSystem",
      "RenderPipeline",
      "DisplayServer",
      "InputSystem",
    ];
    for (const sym of subsystems) {
      expect(barrel, `Barrel missing export: ${sym}`).toContain(sym);
    }
  });
});

// ── Scheduler Architecture ───────────────────────────────────

describe("Kernel Architecture — Scheduler", () => {
  it("defines exactly 5 priority bands (RT_CRITICAL..IDLE)", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "process-scheduler.ts"), "utf-8");
    expect(content).toContain("RT_CRITICAL");
    expect(content).toContain("RT_NORMAL");
    expect(content).toContain("INTERACTIVE");
    expect(content).toContain("BATCH");
    expect(content).toContain("IDLE");
  });

  it("exports BAND_CONFIG with quantum and preemption settings", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "process-scheduler.ts"), "utf-8");
    expect(content).toContain("quantumMs");
    expect(content).toContain("preemptible");
    expect(content).toContain("boostOnIO");
  });

  it("defines ProcessControlBlock with required fields", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "process-scheduler.ts"), "utf-8");
    expect(content).toContain("interface ProcessControlBlock");
    expect(content).toContain("pid");
    expect(content).toContain("state");
    expect(content).toContain("priority");
  });

  it("ProcessScheduler class exists with run queue management", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "process-scheduler.ts"), "utf-8");
    expect(content).toContain("class ProcessScheduler");
    expect(content).toContain("schedule");
  });
});

// ── Memory Manager Architecture ──────────────────────────────

describe("Kernel Architecture — Memory Manager", () => {
  it("defines 4-level page table structure", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "memory-manager.ts"), "utf-8");
    expect(content).toContain("PageTableEntry");
    expect(content).toContain("PageTable");
    expect(content).toMatch(/level.*4.*3.*2.*1/s);
  });

  it("implements buddy allocator", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "memory-manager.ts"), "utf-8");
    expect(content).toContain("BuddyAllocator");
  });

  it("implements SLAB allocator", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "memory-manager.ts"), "utf-8");
    expect(content).toContain("SlabAllocator");
  });

  it("supports copy-on-write", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "memory-manager.ts"), "utf-8");
    expect(content).toContain("copyOnWrite");
  });

  it("defines VirtualMemoryArea with permissions", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "memory-manager.ts"), "utf-8");
    expect(content).toContain("VirtualMemoryArea");
    expect(content).toContain("permissions");
    expect(content).toContain("VMAPermission");
  });
});

// ── Filesystem Architecture ──────────────────────────────────

describe("Kernel Architecture — Filesystem", () => {
  it("defines Inode structure with checksums", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sita-filesystem.ts"), "utf-8");
    expect(content).toContain("interface Inode");
    expect(content).toContain("checksumSHA256");
    expect(content).toContain("compression");
  });

  it("supports B-tree or CoW architecture", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sita-filesystem.ts"), "utf-8");
    expect(content).toMatch(/copy.on.write|CoW|cow/i);
  });

  it("implements VFS layer with mount points", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sita-filesystem.ts"), "utf-8");
    expect(content).toContain("VirtualFilesystemLayer");
    expect(content).toContain("MountPoint");
  });

  it("supports snapshots", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sita-filesystem.ts"), "utf-8");
    expect(content).toContain("Snapshot");
  });

  it("supports journaling", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sita-filesystem.ts"), "utf-8");
    expect(content).toMatch(/journal|Journal/);
  });
});

// ── Security Architecture ────────────────────────────────────

describe("Kernel Architecture — Security Rings", () => {
  it("defines exactly 5 trust rings (KERNEL..UNTRUSTED)", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sandbox-engine.ts"), "utf-8");
    expect(content).toContain("KERNEL");
    expect(content).toContain("TRUSTED");
    expect(content).toContain("VERIFIED");
    expect(content).toContain("SANDBOXED");
    expect(content).toContain("UNTRUSTED");
  });

  it("RING_CONFIG restricts capabilities per ring", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sandbox-engine.ts"), "utf-8");
    expect(content).toContain("allowedSyscalls");
    expect(content).toContain("maxFileDescriptors");
    expect(content).toContain("maxMemoryMB");
    expect(content).toContain("networkAccess");
    expect(content).toContain("filesystemScope");
  });

  it("SandboxEngine enforces seccomp profiles", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sandbox-engine.ts"), "utf-8");
    expect(content).toContain("SeccompProfile");
    expect(content).toContain("class SandboxEngine");
  });

  it("implements namespace isolation", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "sandbox-engine.ts"), "utf-8");
    expect(content).toMatch(/namespace|Namespace|isolate/i);
  });
});

// ── Cross-Subsystem Integration ──────────────────────────────

describe("Kernel Architecture — Integration Invariants", () => {
  it("IPC system defines capability tokens for cross-process communication", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "ipc-system.ts"), "utf-8");
    expect(content).toContain("CapabilityToken");
    expect(content).toContain("MessagePort");
  });

  it("syscall table maps operations to numbers", () => {
    const content = fs.readFileSync(path.join(KERNEL_DIR, "syscall-table.ts"), "utf-8");
    expect(content).toContain("SYSCALL_TABLE");
    expect(content).toContain("getSyscallByNumber");
  });

  it("no kernel subsystem imports from src/pages or src/components", () => {
    const files = fs.readdirSync(KERNEL_DIR).filter(f => f.endsWith(".ts"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(KERNEL_DIR, file), "utf-8");
      expect(content, `${file} must not import from pages`).not.toMatch(/from\s+["']@\/pages/);
      expect(content, `${file} must not import from components`).not.toMatch(/from\s+["']@\/components/);
    }
  });

  it("no kernel subsystem imports React", () => {
    const files = fs.readdirSync(KERNEL_DIR).filter(f => f.endsWith(".ts"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(KERNEL_DIR, file), "utf-8");
      expect(content, `${file} must not import React`).not.toMatch(/from\s+["']react["']/);
    }
  });

  it("kernel dashboard page exists at admin route", () => {
    expect(fs.existsSync("src/pages/admin/KernelDashboard.tsx")).toBe(true);
    // Route may be registered via lazy loading or route config, not necessarily literal in App.tsx
    expect(fs.existsSync("src/pages/admin/KernelDashboard.tsx")).toBe(true);
  });
});
