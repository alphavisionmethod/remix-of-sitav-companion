

# Implement Userspace & System Services Layer

## What's Missing

The kernel architecture (scheduler, VMM, filesystem, IPC, security) is fully implemented. But the **userspace layer** — the services that sit between the kernel and applications — does not exist yet. Specifically:

- No **init system / service manager** (dependency-ordered service lifecycle)
- No **system daemons** registry (health, watchdog, cron, network)
- No **package management** system (install, verify, update, rollback)
- No **logging/diagnostics infrastructure** at the OS level (journald-equivalent)
- No **configuration management** (typed config store, validation, change tracking)

Existing pieces to build on: `structured-logger.ts` (app-level), `support-diagnostics.ts` (app-level), `self-healing/` (fleet-level), systemd `.service` files (deploy scripts only), `system-updates/` (stub re-export).

## Files to Create (8 new services + 1 doc + 1 manifest + 1 edit)

### Core Userspace Services

| File | Purpose |
|------|---------|
| `src/lib/core-services/kernel/init-system.ts` | **Init System / Service Manager** — dependency graph, ordered boot, service lifecycle (starting → running → stopping → failed → restarting), watchdog timers, target groups (basic.target, network.target, sita-runtime.target) |
| `src/lib/core-services/kernel/system-daemons.ts` | **System Daemon Registry** — canonical daemon definitions: sita-watchdog, sita-cron, sita-networkd, sita-resolved, sita-journald, sita-sessiond, sita-deviced. Each with health probe, restart policy, resource limits |
| `src/lib/core-services/kernel/package-manager.ts` | **Package Management** — package manifest format, dependency resolution, signature verification (reuses code-verification), install/upgrade/rollback transactions, repository management, integrity checking |
| `src/lib/core-services/kernel/journal-subsystem.ts` | **Logging & Diagnostics** — OS-level structured journal (ring buffer, persistent storage, priority filtering), kernel message capture, service log aggregation, log forwarding, crash dump collection, diagnostic snapshots |
| `src/lib/core-services/kernel/config-manager.ts` | **Configuration Management** — typed key-value config store with namespaces, schema validation, change tracking with receipts, atomic updates, overlay hierarchy (default → system → user → runtime), config diffing |

### Documentation & Manifests

| File | Purpose |
|------|---------|
| `infra/docs/USERSPACE_ARCHITECTURE.md` | Full specification: init system design, daemon catalog, package format, journal architecture, config model |
| `generated/userspace-services-manifest.json` | Machine-readable catalog of all system daemons, boot targets, package repositories |

### Wiring

| File | Change |
|------|--------|
| `src/lib/core-services/kernel/index.ts` | Add exports for all 5 new services, wire into `KernelSubsystem` facade as `initSystem`, `daemons`, `packages`, `journal`, `config` |

## Design Decisions

- **Init system** modeled after systemd: dependency DAG with parallel start, but simplified to ~20 service units relevant to SITA OS
- **Package manager** uses the existing `CodeVerificationService` for signature checks — no duplicate crypto
- **Journal** complements the app-level `structured-logger.ts` — journal captures kernel/daemon/boot logs, structured-logger captures application logs
- **Config manager** emits receipts via event bus for audit trail on config changes (follows proof-chain rule)
- All services follow existing pattern: typed interfaces, `getStats()`, event bus integration

## Total: 7 new files + 1 edit

