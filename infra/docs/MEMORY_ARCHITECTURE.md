# SITA OS — Memory Architecture

## Virtual Memory System
- **Address space**: 48-bit virtual, 4-level page tables (PML4 → PDPT → PD → PT)
- **Page sizes**: 4KB (base), 2MB, 1GB (huge pages)
- **Per-process isolation**: separate PML4 root, hardware-enforced

## Allocators
- **Buddy allocator**: physical frame allocation, order 0-10 (4KB-4MB blocks), automatic coalescing
- **SLAB allocator**: kernel object caches (PCB, thread, VMA, IPC message, capability token, file descriptor)

## Features
- **Demand paging**: pages allocated on first access
- **Copy-on-Write**: fork shares pages, copies on write fault
- **ASLR/KASLR**: randomized layouts for all binaries, stack, heap, mmap, kernel
- **NX bit**: all pages default non-executable, explicit +X required
- **Guard pages**: detect stack overflow and buffer overrun
- **Memory tagging**: MTE on ARM64 (future)

## OOM Policy
- Warning at 85% utilization, threshold at 95%
- Actions: compress → kill lowest-priority batch → kill largest
- Protected: PID 1 (init), RT-Critical and RT-Normal bands immune
