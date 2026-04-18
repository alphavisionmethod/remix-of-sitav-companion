// ═══════════════════════════════════════════════════════════════
// Nova Kernel — CPU Privilege Ring Enforcement
// Simulates x86_64 Ring 0 (Kernel) / Ring 3 (User) transitions,
// pointer validation, hardware access control, and violation audit
// ═══════════════════════════════════════════════════════════════

import { ProcessTable, type CPUContext } from "./process-manager";
import { MemoryManager } from "./memory-manager";

// ── Privilege Levels ─────────────────────────────────────────

export type PrivilegeLevel = 0 | 1 | 2 | 3;

// Only 0 and 3 are actively used (like real x86_64)
export const RING_KERNEL: PrivilegeLevel = 0;
export const RING_USER: PrivilegeLevel = 3;

// ── Memory Layout Constants ─────────────────────────────────

const KERNEL_SPACE_START = 0xFFFF800000000000; // upper half = kernel
const KERNEL_SPACE_END   = 0xFFFFFFFFFFFFFFFF;
const USER_SPACE_START   = 0x0000000000000000;
const USER_SPACE_END     = 0x00007FFFFFFFFFFF; // lower half = user

// Stack layout per process
const DEFAULT_KERNEL_STACK_TOP    = 0xFFFF80007FFE0000;
const DEFAULT_KERNEL_STACK_BOTTOM = 0xFFFF80007FFC0000;
const DEFAULT_USER_STACK_TOP      = 0x00007FFFFFFFE000;
const DEFAULT_USER_STACK_BOTTOM   = 0x00007FFFFFFC0000;

// ── Violation Types ─────────────────────────────────────────

export type ViolationType =
  | "ring3-kernel-pointer"
  | "ring3-hardware-access"
  | "ring3-privileged-instruction"
  | "ring3-write-readonly"
  | "ring3-execute-noexec"
  | "invalid-pointer-range"
  | "null-pointer"
  | "stack-overflow"
  | "segment-fault";

export interface PrivilegeViolation {
  timestamp: number;
  pid: number;
  type: ViolationType;
  attemptedAddress: number;
  currentCPL: PrivilegeLevel;
  requiredCPL: PrivilegeLevel;
  instruction: string;
  detail: string;
}

// ── Ring Transition Event ───────────────────────────────────

export type RingTransitionType = "user-to-kernel" | "kernel-to-user" | "syscall-entry" | "syscall-exit" | "interrupt" | "iret";

export interface RingTransition {
  timestamp: number;
  pid: number;
  type: RingTransitionType;
  fromRing: PrivilegeLevel;
  toRing: PrivilegeLevel;
  rip: number;
  rsp: number;
  latencyUs: number;
}

// ── Saved Kernel/User State for Ring Transitions ────────────

interface SavedRingState {
  userContext: CPUContext | null;
  kernelContext: CPUContext | null;
  userStackPointer: number;
  kernelStackPointer: number;
}

// ── Privilege Enforcement Engine ────────────────────────────

const MAX_VIOLATIONS = 500;
const MAX_TRANSITIONS = 1000;

class PrivilegeEnforcementClass {
  private violations: PrivilegeViolation[] = [];
  private transitions: RingTransition[] = [];
  private ringStates = new Map<number, SavedRingState>();
  private transitionCounts = new Map<number, number>();
  private totalTransitions = 0;
  private totalViolations = 0;

  // ── Pointer Validation ─────────────────────────────────

  /**
   * Validate a pointer from a process at the given privilege level.
   * Ring 3 processes CANNOT access kernel-space memory.
   * Returns true if valid, false + logs violation if not.
   */
  validatePointer(
    pid: number,
    ptr: number,
    accessType: "read" | "write" | "execute" = "read"
  ): boolean {
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    const cpl = process.context.cpl;

    // Null pointer check
    if (ptr === 0) {
      this.recordViolation({
        timestamp: Date.now(),
        pid,
        type: "null-pointer",
        attemptedAddress: ptr,
        currentCPL: cpl,
        requiredCPL: 0,
        instruction: `${accessType}@0x0`,
        detail: `Null pointer dereference attempt (${accessType})`,
      });
      return false;
    }

    // Ring 3 trying to access kernel space
    if (cpl === 3 && ptr >= KERNEL_SPACE_START) {
      this.recordViolation({
        timestamp: Date.now(),
        pid,
        type: "ring3-kernel-pointer",
        attemptedAddress: ptr,
        currentCPL: 3,
        requiredCPL: 0,
        instruction: `${accessType}@0x${ptr.toString(16)}`,
        detail: `Ring 3 process attempted to ${accessType} kernel memory at 0x${ptr.toString(16).padStart(16, '0')}`,
      });
      return false;
    }

    // Check address space bounds for user processes
    if (cpl === 3 && process.addressSpace) {
      const as = process.addressSpace;
      const inHeap = ptr >= as.heapStart && ptr <= as.heapEnd;
      const inStack = ptr >= as.stackBottom && ptr <= as.stackTop;
      const inUserStack = ptr >= as.userStackBottom && ptr <= as.userStackTop;
      const inCode = ptr >= 0x400000 && ptr < as.heapStart; // code segment

      if (!inHeap && !inStack && !inUserStack && !inCode) {
        this.recordViolation({
          timestamp: Date.now(),
          pid,
          type: "invalid-pointer-range",
          attemptedAddress: ptr,
          currentCPL: cpl,
          requiredCPL: cpl,
          instruction: `${accessType}@0x${ptr.toString(16)}`,
          detail: `Pointer 0x${ptr.toString(16)} outside process address space`,
        });
        return false;
      }
    }

    // Check memory region flags via MemoryManager
    const addrSpace = MemoryManager.getAddressSpace(pid);
    if (addrSpace) {
      for (const mapping of addrSpace.mappings) {
        const mappingStart = mapping.virtualStart * 4096;
        const mappingEnd = mappingStart + mapping.pageCount * 4096;
        if (ptr >= mappingStart && ptr < mappingEnd) {
          // Check write permission
          if (accessType === "write" && !mapping.flags.writable) {
            this.recordViolation({
              timestamp: Date.now(),
              pid,
              type: "ring3-write-readonly",
              attemptedAddress: ptr,
              currentCPL: cpl,
              requiredCPL: 0,
              instruction: `write@0x${ptr.toString(16)}`,
              detail: `Write to read-only memory region "${mapping.label}"`,
            });
            return false;
          }
          // Check execute permission
          if (accessType === "execute" && !mapping.flags.executable) {
            this.recordViolation({
              timestamp: Date.now(),
              pid,
              type: "ring3-execute-noexec",
              attemptedAddress: ptr,
              currentCPL: cpl,
              requiredCPL: 0,
              instruction: `exec@0x${ptr.toString(16)}`,
              detail: `Execute on non-executable region "${mapping.label}"`,
            });
            return false;
          }
          break;
        }
      }
    }

    return true;
  }

  // ── Hardware Access Control ────────────────────────────

  /**
   * Check if a process can access hardware (port I/O, MMIO).
   * Only Ring 0 can touch hardware directly.
   */
  checkHardwareAccess(pid: number): boolean {
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    if (process.context.cpl !== 0) {
      this.recordViolation({
        timestamp: Date.now(),
        pid,
        type: "ring3-hardware-access",
        attemptedAddress: 0,
        currentCPL: process.context.cpl,
        requiredCPL: 0,
        instruction: "IN/OUT (port I/O)",
        detail: `Ring 3 process PID ${pid} attempted direct hardware access — must use syscall`,
      });
      return false;
    }

    return true;
  }

  /**
   * Check if a process can execute a privileged instruction.
   * Ring 3 cannot execute: CLI, STI, HLT, LGDT, LIDT, MOV CRx, WRMSR, etc.
   */
  checkPrivilegedInstruction(pid: number, instruction: string): boolean {
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    const PRIVILEGED_INSTRUCTIONS = [
      "CLI", "STI", "HLT", "LGDT", "LIDT", "LLDT", "LTR",
      "MOV CR0", "MOV CR3", "MOV CR4", "WRMSR", "RDMSR",
      "INVLPG", "INVD", "WBINVD", "SWAPGS",
    ];

    if (process.context.cpl !== 0 && PRIVILEGED_INSTRUCTIONS.includes(instruction.toUpperCase())) {
      this.recordViolation({
        timestamp: Date.now(),
        pid,
        type: "ring3-privileged-instruction",
        attemptedAddress: process.context.rip,
        currentCPL: process.context.cpl,
        requiredCPL: 0,
        instruction,
        detail: `Ring 3 attempted privileged instruction: ${instruction}`,
      });
      return false;
    }

    return true;
  }

  // ── Ring Transitions ──────────────────────────────────

  /**
   * Enter user mode (Ring 0 → Ring 3).
   * Simulates SYSRET / IRETQ instruction.
   * - Saves kernel state
   * - Loads user registers
   * - Sets CPL = 3
   * - Switches to user stack
   */
  enterUserMode(pid: number, entryPoint?: number, userStack?: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    // Must currently be in Ring 0 to transition to Ring 3
    if (process.context.cpl !== 0 && process.privilegeLevel !== 0) {
      console.warn(`[Privilege] PID ${pid} not in Ring 0, cannot enter user mode`);
      return false;
    }

    // Save kernel context
    let state = this.ringStates.get(pid);
    if (!state) {
      state = {
        userContext: null,
        kernelContext: null,
        userStackPointer: process.addressSpace?.userStackTop ?? DEFAULT_USER_STACK_TOP,
        kernelStackPointer: process.addressSpace?.kernelStackTop ?? DEFAULT_KERNEL_STACK_TOP,
      };
      this.ringStates.set(pid, state);
    }

    // Save current (kernel) context
    state.kernelContext = {
      ...process.context,
      registers: [...process.context.registers],
    };

    // Set up user mode context
    const ep = entryPoint ?? process.context.rip;
    const us = userStack ?? state.userStackPointer;

    process.context.cpl = 3;
    process.context.rip = ep;
    process.context.rsp = us;
    process.context.rbp = us;
    // Set IOPL=0 in RFLAGS (Ring 3 cannot do I/O)
    process.context.rflags = (process.context.rflags & ~0x3000) | 0x202; // clear IOPL, set IF
    // Set CS/SS segment selectors for Ring 3
    process.context.cs = 0x2B;  // user code segment selector (Ring 3)
    process.context.ss = 0x23;  // user data segment selector (Ring 3)

    process.privilegeLevel = 3;

    const latency = (performance.now() - start) * 1000; // microseconds
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "kernel-to-user",
      fromRing: 0,
      toRing: 3,
      rip: ep,
      rsp: us,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  /**
   * Return to kernel mode (Ring 3 → Ring 0).
   * Simulates SYSCALL instruction.
   * - Saves user registers to process
   * - Switches to kernel stack
   * - Sets CPL = 0
   */
  returnToKernel(pid: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    let state = this.ringStates.get(pid);
    if (!state) {
      state = {
        userContext: null,
        kernelContext: null,
        userStackPointer: process.addressSpace?.userStackTop ?? DEFAULT_USER_STACK_TOP,
        kernelStackPointer: process.addressSpace?.kernelStackTop ?? DEFAULT_KERNEL_STACK_TOP,
      };
      this.ringStates.set(pid, state);
    }

    // Save user context
    state.userContext = {
      ...process.context,
      registers: [...process.context.registers],
    };
    state.userStackPointer = process.context.rsp;

    // Switch to kernel mode
    process.context.cpl = 0;
    process.context.rsp = state.kernelStackPointer;
    process.context.rbp = state.kernelStackPointer;
    // Set IOPL=3 in RFLAGS (kernel can do I/O)
    process.context.rflags = process.context.rflags | 0x3000 | 0x202;
    // Set CS/SS for Ring 0
    process.context.cs = 0x08;  // kernel code segment
    process.context.ss = 0x10;  // kernel data segment

    process.privilegeLevel = 0;

    const latency = (performance.now() - start) * 1000;
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "user-to-kernel",
      fromRing: 3,
      toRing: 0,
      rip: process.context.rip,
      rsp: process.context.rsp,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  /**
   * Syscall entry — Ring 3 → Ring 0 for syscall handling.
   * Saves user RCX=RIP, R11=RFLAGS (like real SYSCALL instruction).
   */
  syscallEntry(pid: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    // Only Ring 3 processes use syscall
    if (process.context.cpl !== 3) {
      // Kernel-mode process calling syscall — just proceed (no ring switch needed)
      return true;
    }

    let state = this.ringStates.get(pid);
    if (!state) {
      state = {
        userContext: null,
        kernelContext: null,
        userStackPointer: DEFAULT_USER_STACK_TOP,
        kernelStackPointer: DEFAULT_KERNEL_STACK_TOP,
      };
      this.ringStates.set(pid, state);
    }

    // SYSCALL instruction behavior:
    // RCX ← RIP (return address)
    // R11 ← RFLAGS
    process.context.registers[1] = process.context.rip;  // RCX = registers[1]
    process.context.registers[11] = process.context.rflags; // R11 = registers[11]

    // Save full user context
    state.userContext = {
      ...process.context,
      registers: [...process.context.registers],
    };
    state.userStackPointer = process.context.rsp;

    // Switch to kernel
    process.context.cpl = 0;
    process.context.rsp = state.kernelStackPointer;
    process.context.cs = 0x08;
    process.context.ss = 0x10;
    process.context.rflags = process.context.rflags | 0x3000;
    process.privilegeLevel = 0;

    const latency = (performance.now() - start) * 1000;
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "syscall-entry",
      fromRing: 3,
      toRing: 0,
      rip: process.context.rip,
      rsp: process.context.rsp,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  /**
   * Syscall exit — Ring 0 → Ring 3 after syscall handling.
   * Restores user context via SYSRET.
   */
  syscallExit(pid: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    // If process was already Ring 0 (kernel process), no transition needed
    const state = this.ringStates.get(pid);
    if (!state?.userContext) {
      // Kernel-mode process — no ring switch
      return true;
    }

    // SYSRET behavior:
    // RIP ← RCX (saved return address)
    // RFLAGS ← R11
    const savedRip = state.userContext.registers[1]; // RCX
    const savedRflags = state.userContext.registers[11]; // R11

    // Restore user context but keep any return value in RAX (registers[0])
    const returnValue = process.context.registers[0]; // RAX = syscall return value

    process.context = {
      ...state.userContext,
      registers: [...state.userContext.registers],
    };
    process.context.registers[0] = returnValue; // preserve RAX return value
    process.context.rip = savedRip;
    process.context.rflags = savedRflags & ~0x3000; // clear IOPL for Ring 3
    process.context.rsp = state.userStackPointer;
    process.context.cpl = 3;
    process.context.cs = 0x2B;
    process.context.ss = 0x23;
    process.privilegeLevel = 3;

    const latency = (performance.now() - start) * 1000;
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "syscall-exit",
      fromRing: 0,
      toRing: 3,
      rip: process.context.rip,
      rsp: process.context.rsp,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  /**
   * Interrupt entry — forces Ring 3 → Ring 0 on hardware interrupt (e.g., timer).
   */
  interruptEntry(pid: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    if (process.context.cpl === 0) return true; // already in kernel mode

    let state = this.ringStates.get(pid);
    if (!state) {
      state = {
        userContext: null,
        kernelContext: null,
        userStackPointer: DEFAULT_USER_STACK_TOP,
        kernelStackPointer: DEFAULT_KERNEL_STACK_TOP,
      };
      this.ringStates.set(pid, state);
    }

    // Hardware pushes SS, RSP, RFLAGS, CS, RIP onto kernel stack
    state.userContext = {
      ...process.context,
      registers: [...process.context.registers],
    };
    state.userStackPointer = process.context.rsp;

    process.context.cpl = 0;
    process.context.rsp = state.kernelStackPointer;
    process.context.cs = 0x08;
    process.context.ss = 0x10;
    process.privilegeLevel = 0;

    const latency = (performance.now() - start) * 1000;
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "interrupt",
      fromRing: 3,
      toRing: 0,
      rip: process.context.rip,
      rsp: process.context.rsp,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  /**
   * IRET — return from interrupt, Ring 0 → Ring 3.
   */
  iret(pid: number): boolean {
    const start = performance.now();
    const process = ProcessTable.getProcess(pid);
    if (!process) return false;

    const state = this.ringStates.get(pid);
    if (!state?.userContext) return true;

    process.context = {
      ...state.userContext,
      registers: [...state.userContext.registers],
    };
    process.context.rsp = state.userStackPointer;
    process.context.cpl = 3;
    process.context.cs = 0x2B;
    process.context.ss = 0x23;
    process.privilegeLevel = 3;

    const latency = (performance.now() - start) * 1000;
    this.recordTransition({
      timestamp: Date.now(),
      pid,
      type: "iret",
      fromRing: 0,
      toRing: 3,
      rip: process.context.rip,
      rsp: process.context.rsp,
      latencyUs: Math.round(latency * 100) / 100,
    });

    return true;
  }

  // ── Diagnostics ───────────────────────────────────────

  getViolations(count = 50): readonly PrivilegeViolation[] {
    return this.violations.slice(-count);
  }

  getTransitions(count = 50): readonly RingTransition[] {
    return this.transitions.slice(-count);
  }

  getTransitionCount(pid?: number): number {
    if (pid !== undefined) return this.transitionCounts.get(pid) ?? 0;
    return this.totalTransitions;
  }

  getStats() {
    const perProcessViolations = new Map<number, number>();
    for (const v of this.violations) {
      perProcessViolations.set(v.pid, (perProcessViolations.get(v.pid) ?? 0) + 1);
    }

    const transitionsByType: Record<RingTransitionType, number> = {
      "user-to-kernel": 0,
      "kernel-to-user": 0,
      "syscall-entry": 0,
      "syscall-exit": 0,
      "interrupt": 0,
      "iret": 0,
    };
    for (const t of this.transitions) {
      transitionsByType[t.type]++;
    }

    const avgLatency = this.transitions.length > 0
      ? this.transitions.reduce((s, t) => s + t.latencyUs, 0) / this.transitions.length
      : 0;

    return {
      totalViolations: this.totalViolations,
      totalTransitions: this.totalTransitions,
      recentViolations: this.violations.length,
      recentTransitions: this.transitions.length,
      transitionsByType,
      avgTransitionLatencyUs: Math.round(avgLatency * 100) / 100,
      processesWithViolations: perProcessViolations.size,
      ring0Processes: this.countByRing(0),
      ring3Processes: this.countByRing(3),
    };
  }

  private countByRing(ring: PrivilegeLevel): number {
    let count = 0;
    for (const p of ProcessTable.listProcesses()) {
      if (p.state !== "terminated" && p.privilegeLevel === ring) count++;
    }
    return count;
  }

  /** Get the saved ring state for a process */
  getRingState(pid: number): SavedRingState | undefined {
    return this.ringStates.get(pid);
  }

  /** Reset all state */
  reset(): void {
    this.violations = [];
    this.transitions = [];
    this.ringStates.clear();
    this.transitionCounts.clear();
    this.totalTransitions = 0;
    this.totalViolations = 0;
  }

  // ── Internal ──────────────────────────────────────────

  private recordViolation(v: PrivilegeViolation): void {
    this.violations.push(v);
    this.totalViolations++;
    if (this.violations.length > MAX_VIOLATIONS) this.violations.shift();
    console.warn(`[Privilege] VIOLATION: ${v.type} PID=${v.pid} addr=0x${v.attemptedAddress.toString(16)} CPL=${v.currentCPL}`);
  }

  private recordTransition(t: RingTransition): void {
    this.transitions.push(t);
    this.totalTransitions++;
    this.transitionCounts.set(t.pid, (this.transitionCounts.get(t.pid) ?? 0) + 1);
    if (this.transitions.length > MAX_TRANSITIONS) this.transitions.shift();
  }
}

export const PrivilegeEnforcement = new PrivilegeEnforcementClass();
