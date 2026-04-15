

# SITA OS — Part 2: Full Platform Infrastructure Plan

## What Exists Already

The project has substantial kernel/OS infrastructure:
- **Kernel layer** (53 files): IPC, scheduler, memory manager, filesystem, sandbox, firewall, DNS, TCP/IP, VPN, display server, compositor, GPU
- **OS daemons** (11 files): settingsd, crashd, healthd, timed, accessibilityd, powerd, wifid, btd, automationd, search-indexer, help-engine
- **SDK layer**: Nova SDK with boot, IPC, drivers, syscalls, scheduler, power, crash resilience
- **Platform services**: Event bus (durable), capability registry, capability-permission system (3-layer), policy engine, init system with boot targets
- **Command Center**: 8-tab dashboard wired to all daemons

## What's Missing (from the 34-point prompt)

Grouped into **6 implementation batches** to stay within size limits per message:

---

### Batch 1: Platform IPC Bus, Identity Scheme, and Capability Catalog (~5 files, ~600 lines)

**1. Platform IPC Bus** — `src/lib/os-services/platform-ipc-bus.ts`
Unified request/response + event stream layer consumed by all daemons. Builds on existing `ipc-system.ts` and `event-bus.ts` but adds: authenticated caller identity, correlation_id, deadline/timeout, versioned schemas, method permissions, streaming for progress, retries.

**2. Global Entity Identity** — `src/lib/os-services/entity-identity.ts`
Canonical ID scheme: `user:`, `service:`, `app:`, `driver:`, `policy:`, `update:`, `device:`, `session:`. Used by IPC, logs, audit, and policy.

**3. Formal Capability Catalog** — `src/lib/os-services/capability-catalog.ts`
Central registry of all capabilities with name, scope, risk level, prompt behavior, audit level, default policy. Backbone for policy engine, settings UI, and audit classification. Extends existing `capability-registry.ts`.

---

### Batch 2: Storage Strategy, Health Graph, Quotas (~4 files, ~500 lines)

**4. Global Data Storage Strategy** — `src/lib/os-services/storage-strategy.ts`
4 storage classes: system config (signed, immutable), state store (mutable runtime), secrets store (encrypted), telemetry store (append-only). Separate integrity/durability rules per class.

**5. Health Dependency Graph** — `src/lib/os-services/health-graph.ts`
Extends `healthd` with dependency DAG (e.g., shieldd→policyd→secretsd), cascading failure analysis, readiness/liveness/degraded/blocked/unsafe states. Answers "what is safe to run if X fails?"

**6. Resource Quotas & Governance** — `src/lib/os-services/quota-governor.ts`
Per-app and per-daemon limits: memory, CPU class, background time, network, disk, log growth. Emergency low-resource behavior. Integrates with powerd.

---

### Batch 3: App Lifecycle, Policy Resolution, Event System, Notifications (~5 files, ~600 lines)

**7. Full App Lifecycle Model** — `src/lib/os-services/app-lifecycle.ts`
20-state model: installed→disabled→quarantined→pending_update→awaiting_permission→suspended→running→crashed→terminated. Integrates with sandbox, permission system, package manager, powerd.

**8. Policy Inheritance & Resolution** — `src/lib/os-services/policy-resolver.ts`
8 policy sources with explicit precedence: platform baseline → hardware constraints → org policy → recovery mode → device profile → mode policy → user prefs → temp overrides. Human-readable explanations ("blocked by work profile policy").

**9. Typed Event Bus** — `src/lib/os-services/os-event-system.ts`
Strongly-typed OS events (network.wifi.connected, shield.threat.detected, battery.profile.changed, etc.) with pub/sub, deduplication, replay, correlation IDs. Wraps existing EventBus.

**10. Notification Classification** — `src/lib/os-services/notification-classifier.ts`
Priority taxonomy (critical→urgent→time-sensitive→normal→passive→silent) and channel classification (security, communication, system, update, battery, app). Integrates with calm mode and focus schedules.

---

### Batch 4: Diagnostics, Recovery, Time Integrity, Networking Policy (~5 files, ~550 lines)

**11. Diagnostic Bundle System** — `src/lib/os-services/diagnostic-bundle.ts`
Export-quality bundles: system info, build/version, hardware profile, update state, boot history, driver inventory, service health, recent logs, crash dumps, policy snapshot, network diagnostics. Privacy redaction.

**12. Recovery Granularity** — `src/lib/os-services/recovery-levels.ts`
8 repair levels: restart service → reset subsystem → restore last-good config → disable problematic driver/app → rollback update → safe mode → reinstall without data loss → factory reset. Progressive escalation.

**13. Secure Clock / Time Integrity** — extends `timed.ts`
Add authenticated time sync verification, fallback policies for invalid time, cert validation awareness, replay-resistant time assumptions.

**14. Networking Policy Matrix** — `src/lib/os-services/network-policy-matrix.ts`
Policy matrix across 5 dimensions: interface type, network trust, app trust, session type, mode. Produces decisions: auto VPN, allow background sync, allow updates, allow tethering, etc.

---

### Batch 5: ABI/Versioning, Migration, Settings Registry, Audio, External Devices (~5 files, ~500 lines)

**15. ABI & Versioning Strategy** — `src/lib/os-services/abi-versioning.ts`
Version tracking for: IPC methods, manifests, policies, package format, service configs, database schema. Compatibility checks and deprecation warnings.

**16. Upgrade Migration Layer** — `src/lib/os-services/migration-engine.ts`
Migrations for: configs, databases, app manifests, policy bundles, driver mappings, secrets, user settings, audit schema. Atomic, resumable, rollback-safe with pre/post hooks.

**17. Full Settings Registry** — extends `settingsd.ts`
Add: deep-link IDs, searchable metadata, policy lock state, range validation, migration handlers, change observers. Powers settings app, command palette, search.

**18. Audio Stack** — `src/lib/os-services/audiod.ts`
Audio server: input/output routing, per-app volume, Bluetooth audio profiles, hotplug devices, microphone permissions.

**19. External Device Framework** — `src/lib/os-services/deviced.ts`
Framework for: printers, cameras, removable drives, controllers, docks, displays. Auto-mount policy, encryption awareness, safe eject, malware scan hooks.

---

### Batch 6: Command Center Upgrade + Remaining Systems (~3 files, ~700 lines)

**20-27. Additional Systems** — small modules in `src/lib/os-services/`:
- `release-lifecycle.ts`: canary→nightly→beta→RC→stable→hotfix with promotion criteria and crash-rate gates
- `slo-targets.ts`: SLOs for boot, update, crash rate, WiFi reconnect, suspend/resume, battery drain, app launch
- `recommendation-ranker.ts`: Confidence scores, suppression, cooldowns, relevance windows, "why am I seeing this?"
- `localization-infra.ts`: Language packs, RTL, locale-aware formatting, IME support
- `signing-trust-chain.ts`: Source→CI→artifact→signing→repository→client validation, key rotation

**28. Command Center v2** — Rewrite `OS01PlatformCommandCenter.tsx` (~800 lines)
Add new tabs/sections wired to all new systems: IPC Bus Monitor, Health Dependency Graph, App Lifecycle Manager, Policy Resolver Inspector, Quota Dashboard, Diagnostic Bundle Export, Recovery Console, Network Policy Matrix, and Release/SLO Dashboard. Beautiful glassmorphic cards with sparklines and live status indicators.

---

## Summary

| Batch | Files | ~Lines | Key Systems |
|-------|-------|--------|-------------|
| 1 | 3 | 600 | IPC Bus, Entity Identity, Capability Catalog |
| 2 | 3 | 500 | Storage Strategy, Health Graph, Quotas |
| 3 | 4 | 600 | App Lifecycle, Policy Resolver, Events, Notifications |
| 4 | 4 | 550 | Diagnostics, Recovery, Time Integrity, Network Policy |
| 5 | 5 | 500 | ABI, Migration, Settings, Audio, Devices |
| 6 | 8+1 | 700 | Release, SLOs, Ranker, i18n, Signing, Command Center v2 |
| **Total** | **~28 files** | **~3,450** | All 34 missing systems |

## Technical Notes
- All new services follow existing daemon pattern (singleton class export)
- All integrate with existing EventBus for cross-system communication
- All use entity identity scheme for consistent logging
- Command Center v2 maintains existing 8 tabs and adds new sections
- No new routes needed — everything wires into existing `/admin/os-platform`
- Zero external dependencies added

