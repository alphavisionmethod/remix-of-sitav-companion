# Kernel Ownership — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

A from-scratch kernel comparable to NT, XNU, or Linux: process scheduler, memory manager, syscall ABI, IPC, security model, filesystem layer, and a hardware-driver loading mechanism — all owned, signed, and shipped by SITA.

## What SITA OS actually does today

- Runs as **userland software** on host operating systems (Linux/macOS/Windows/iOS/Android/web).
- Uses host kernel facilities for processes, memory, networking, files, and devices.
- Provides an **OS-like product experience** (shell, windowing model, app store, system services) — but not OS-substrate ownership.

## Why it's classified, not implemented

Owning a kernel is a multi-year effort requiring driver authorship, security certification, hardware partner programs, and a binary-compatibility regime. None of these exist in the codebase or roadmap.

## Honesty boundary

- ❌ Do not claim "we built a kernel."
- ❌ Do not let any `TierBadge` show "native kernel."
- ✅ It is fine to say "SITA OS is a sovereign AI operating system **platform**."
- ✅ It is fine to describe SITA's runtime tiers (web, desktop, appliance, simulated) — these are documented at `src/platform/architecture/feature-runtime-tier-registry.ts`.
