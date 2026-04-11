# SITA OS — Userspace & System Services Architecture

## Overview

The userspace layer sits between the kernel (scheduler, VMM, filesystem, IPC, security) and SITA OS applications. It provides the init system, system daemons, package management, logging infrastructure, and configuration management that applications depend on.

## 1. Init System / Service Manager

### Design

Modeled after systemd with simplifications for SITA OS:

- **Dependency DAG**: Services declare dependencies; topological sort determines start order
- **Parallel start**: Services within the same dependency tier start concurrently
- **Boot targets**: 6 ordered targets group services by purpose

### Boot Targets (in order)

| Target | Purpose |
|--------|---------|
| `basic.target` | Watchdog, journal, device manager |
| `filesystem.target` | Filesystems mounted, dm-verity verified |
| `security.target` | TPM, PolicyKit, crypto subsystem |
| `network.target` | Network interfaces, DNS |
| `sita-runtime.target` | SITA sessions, cron, updates |
| `desktop.target` | Desktop surface for user interaction |

### Service Lifecycle

```
inactive → starting → running → stopping → inactive
                 ↓                    ↑
              failed → restarting ────┘
```

- **Watchdog**: Configurable per-service health check interval
- **Restart policy**: `always`, `on-failure`, `never`
- **Max restarts**: 5 attempts with exponential backoff (1s → 30s cap)

## 2. System Daemons

### Canonical Daemons

| Daemon | Target | Critical | Capabilities |
|--------|--------|----------|-------------|
| `sita-watchdogd` | basic | ✓ | CAP_SYS_BOOT, CAP_KILL |
| `sita-journald` | basic | ✓ | CAP_SYSLOG, CAP_DAC_READ_SEARCH |
| `sita-deviced` | basic | ✓ | CAP_SYS_ADMIN, CAP_MKNOD |
| `sita-networkd` | network | ✓ | CAP_NET_ADMIN, CAP_NET_RAW |
| `sita-resolved` | network | | CAP_NET_BIND_SERVICE |
| `sita-sessiond` | sita-runtime | | CAP_SYS_ADMIN, CAP_AUDIT_WRITE |
| `sita-crond` | sita-runtime | | CAP_SETUID, CAP_SETGID |
| `sita-updated` | sita-runtime | | CAP_SYS_ADMIN, CAP_FOWNER |
| `sita-tpmd` | security | | CAP_SYS_ADMIN |
| `sita-polkitd` | security | | (none) |

### Health Model

- Each daemon reports: `healthy`, `degraded`, `unhealthy`, `unknown`
- Critical daemons failing → system enters degraded mode
- All daemons have resource limits (memory, CPU, file descriptors, threads)

## 3. Package Management

### Package Format

```typescript
interface PackageManifest {
  name: string;
  version: string;          // semver
  dependencies: string[];
  checksum: string;         // SHA-256
  signature: string;        // Ed25519
  signingKeyId: string;
  repository: string;
  architecture: "x86_64" | "aarch64" | "noarch";
  priority: "required" | "important" | "standard" | "optional";
}
```

### Operations

- **Install**: Resolve dependency tree → verify signatures → transactional install
- **Upgrade**: Snapshot current → install new → verify → commit (or rollback)
- **Rollback**: Restore previous version from snapshot
- **Remove**: Check reverse dependencies → transactional remove

### Security

- All packages must have valid Ed25519 signatures
- Signing keys must be in the repository's trusted keyring
- Untrusted repositories are rejected by default

## 4. Journal Subsystem

### Design

Complements the application-level `structured-logger.ts`:
- **structured-logger** → application/service logs (JSON, correlation IDs)
- **journal-subsystem** → kernel/daemon/boot logs (syslog priorities, ring buffer)

### Priority Levels (syslog)

| Priority | Level | Description |
|----------|-------|-------------|
| emerg | 0 | System is unusable |
| alert | 1 | Action must be taken immediately |
| crit | 2 | Critical conditions |
| err | 3 | Error conditions |
| warning | 4 | Warning conditions |
| notice | 5 | Normal but significant |
| info | 6 | Informational |
| debug | 7 | Debug-level messages |

### Features

- **Ring buffer**: Configurable max entries (default 10,000), oldest evicted
- **Sources**: kernel, daemon, service, boot, user, audit
- **Boot ID**: Unique per boot session for log correlation
- **Crash dumps**: Recorded with core file path, signal, stack trace
- **Diagnostic snapshots**: On-demand capture of recent logs + system state
- **Log forwarding**: Pluggable forwarding targets

## 5. Configuration Management

### Overlay Hierarchy

```
runtime  (priority 3) — volatile, cleared on reboot
  ↑
user     (priority 2) — per-user preferences
  ↑
system   (priority 1) — admin/policy overrides
  ↑
default  (priority 0) — schema defaults
```

Higher-priority layers override lower ones. `get()` returns the highest-priority value.

### Features

- **Typed schemas**: `string`, `number`, `boolean`, `json` with validation rules
- **Namespaces**: Hierarchical key organization (e.g., `network.dns.servers`)
- **Change tracking**: Every mutation recorded with actor, timestamp, old/new values
- **Atomic updates**: Set/unset are single-operation with validation
- **Diffing**: Compare values across layers for debugging
- **Receipt integration**: Change log serves as audit trail (proof-chain compatible)

## Governance

- This document is the canonical authority for userspace architecture decisions
- Changes require proof-chain recorded approval
- Generated manifest `generated/userspace-services-manifest.json` must stay in sync
