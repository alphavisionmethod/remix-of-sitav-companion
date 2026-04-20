

## Wave 12.6 — App Platform Lifecycle Closure

### PART 1 — Canonical Systems To Preserve and Extend

| System | Path | Status |
|---|---|---|
| App Manifest Schema (Zod) | `src/lib/app-platform/manifest-schema.ts` | Canonical, 18 fields |
| Package Schema (Zod) | `src/lib/app-platform/package-schema.ts` | Canonical, ed25519 signed |
| Install State | `src/lib/app-platform/install-state.ts` | Canonical, 9 statuses |
| Launch Resolver | `src/lib/app-platform/launch-resolver.ts` | Canonical, 7 strategies |
| Runtime Probe | `src/lib/app-platform/runtime.ts` | Canonical |
| Trust Resolver | `src/lib/app-platform/trust.ts` | Canonical, 5 badges |
| Permission Engine | `src/lib/app-platform/permission-engine.ts` | Canonical |
| Permissions Keys | `src/lib/app-platform/permissions.ts` | Canonical, 15 keys |
| Runtime Boundaries | `src/lib/app-platform/runtime-boundaries.ts` | Canonical, 5 targets |
| Sandbox | `src/lib/app-platform/sandbox.ts` | Canonical |
| App Host API | `src/lib/app-platform/host-api.ts` | Canonical |
| App SDK | `src/lib/app-platform/sdk.ts` | Canonical |
| DB Adapter | `src/lib/app-platform/db-app-adapter.ts` | Canonical |
| Recovery Manager | `src/lib/app-platform/app-recovery-manager.ts` | Canonical, localStorage |
| Mock Catalog | `src/lib/app-platform/catalog.ts` | Canonical, 45+ apps |
| Catalog Service | `src/lib/services/app-store/catalog.service.ts` | Canonical, DB-backed |
| Install Service | `src/lib/services/app-store/install.service.ts` | Canonical, DB-backed |
| Launch Service | `src/lib/services/app-store/launch.service.ts` | Canonical |
| Permissions Service | `src/lib/services/app-store/permissions.service.ts` | Canonical |
| Update Service | `src/lib/services/app-store/update.service.ts` | Canonical |
| Edge: app-install | `supabase/functions/app-install/index.ts` | Deployed |
| Edge: app-uninstall | `supabase/functions/app-uninstall/index.ts` | Deployed |
| Edge: app-update-check | `supabase/functions/app-update-check/index.ts` | Deployed |
| Edge: app-launch-resolve | `supabase/functions/app-launch-resolve/index.ts` | Deployed |
| Edge: app-permissions-sync | `supabase/functions/app-permissions-sync/index.ts` | Deployed |

### PART 2 — Duplicates To Consolidate

| Duplicate | Canonical | Action |
|---|---|---|
| `src/domains/apps/types.ts` (AppDefinition with separate AppInstallStatus) | `src/lib/app-platform/install-state.ts` (InstallStatus) | Keep both — AppDefinition is UI-facing, InstallStatus is engine-facing. Already bridged via `db-app-adapter.ts`. No action needed. |
| `InstalledAppRow` in `install-state.ts` vs `install.service.ts` | `install.service.ts` is DB-shaped, `install-state.ts` is engine-shaped | Keep both — they serve different layers. Document the distinction. |

No true duplicates found. The two-layer design (engine types vs service types vs UI types) is intentional.

### PART 3 — Missing Files To Create

#### 3A. Lifecycle State Machine (`src/lib/app-platform/app-lifecycle-state-machine.ts`)

Typed state machine with 17 states and explicit transition table:

```text
DISCOVERED → AVAILABLE → INSTALL_PENDING → INSTALLING → INSTALLED
INSTALLED → LAUNCH_PENDING → RUNNING → FOCUSED / BACKGROUNDED / SUSPENDED
INSTALLED → UPDATE_AVAILABLE → UPDATING → INSTALLED
RUNNING → CRASHED → RECOVERING → RUNNING / ERROR
INSTALLED → REMOVAL_PENDING → REMOVING → REMOVED
```

Each transition defines: `from`, `to`, `requiredChecks`, `persistenceRequired`, `receiptRequired`, `adminVisible`.

#### 3B. Lifecycle Manager (`src/lib/app-platform/app-lifecycle-manager.ts`)

Canonical orchestrator consuming existing services. Methods:

- `discoverApp(appId)` — catalog lookup
- `installApp(appId)` — delegates to `installService.install()`
- `launchApp(appId)` — delegates to `launchService`
- `focusApp(appId)` / `backgroundApp(appId)` / `suspendApp(appId)` / `resumeApp(appId)` — window manager events
- `detectCrash(appId, error)` — delegates to `app-recovery-manager.ts`
- `recoverApp(appId)` — delegates to `acceptAppRecovery()`
- `checkForUpdate(appId)` — delegates to `updateService.check()`
- `removeApp(appId)` — delegates to `installService.uninstall()`
- `getLifecycleStatus(appId)` — derives from install state + recovery state
- `emitLifecycleReceipt(appId, transition)` — logs to `app_lifecycle_events` table (if exists) or localStorage

Each method validates transitions via the state machine before executing.

#### 3C. Install Registry (`src/lib/app-platform/app-install-registry.ts`)

Wraps `installService` + `catalogService` + `app-recovery-manager` into a single queryable registry:

- `getInstallRecord(appId)` — combined catalog + install + recovery state
- `listInstalled()` — all installed apps with health/recovery status
- `getAppHealth(appId)` — install status + crash count + last launch + recovery offer

#### 3D. Permission Ledger (`src/lib/app-platform/app-permission-ledger.ts`)

Append-only in-memory ledger (persisted to localStorage, optionally to DB via `permissionsService`):

- `recordGrant(appId, permissionKey, actor, trustTier)`
- `recordDenial(appId, permissionKey, actor, reason)`
- `recordRevocation(appId, permissionKey, actor)`
- `getHistory(appId)` — all permission events
- `getEffectiveGrants(appId)` — current grant state
- `exportAudit()` — full ledger for support/operator review

#### 3E. Trust Tier Policy (`src/lib/app-platform/app-trust-tier-policy.ts`)

Maps trust tiers to lifecycle restrictions:

- `first_party`: auto-install, all permissions auto-granted, no removal prompt
- `trusted`: install allowed, high-risk permissions require consent
- `standard`: install allowed, all permissions require consent
- `restricted`: install requires admin approval, sandbox-only

#### 3F. Upgrade Policy (`src/lib/app-platform/app-upgrade-policy.ts`)

- `canUpgrade(from, to)` — semver compatibility check
- `requiresDataMigration(from, to)` — major version → true
- `isAutoUpdateAllowed(trustLevel, channel)` — first_party+stable → auto, else manual

#### 3G. Uninstall Cleanup (`src/lib/app-platform/app-uninstall-cleanup.ts`)

- `cleanupAppData(appId)` — removes localStorage keys matching `sita-app-state:{appId}:*`
- `cleanupCrashState(appId)` — delegates to `declineAppRecovery()`
- `cleanupPermissions(appId)` — logs revocation to permission ledger

#### 3H. App Observability (`src/lib/app-platform/app-observability.ts`)

- `getAppMetrics(appId)` — launch count, crash count, last launch, time since install
- `getSystemHealth()` — total installed, crashed, recovering, blocked counts
- `exportDiagnostics(appId)` — support bundle for a single app

#### 3I. App Support Bundle (`src/lib/app-platform/app-support-bundle.ts`)

- `generateBundle(appId)` — collects: install record, permission history, crash snapshots, lifecycle events, runtime capabilities, manifest
- `generateSystemBundle()` — all apps summary for operator

#### 3J. App Window Policy (`src/lib/app-platform/app-window-policy.ts`)

Maps app class + trust tier to window behavior:

- `internal`: full shell integration, multi-window allowed
- `web-app`/`wrapped-app`: single window, embedded webview
- `native`: Electron-only, delegate to host
- `restricted`: sandboxed iframe, no IPC

#### 3K. Contracts Package (`src/packages/app-contracts/index.ts`)

Barrel re-exporting all types from `@/lib/app-platform/` for external consumers:

- `AppLifecycleState`, `AppLifecycleTransition`
- `InstallRecord`, `PermissionLedgerEntry`
- `TrustTierPolicy`, `UpgradePolicy`
- `AppSupportBundle`

### PART 4 — Generated Proof Artifacts

All placed in `generated/app-lifecycle-closure/`:

| Artifact | Content |
|---|---|
| `lifecycle-state-matrix.json` | All 17 states × valid transitions |
| `install-state-coverage.json` | Per-app install state + health |
| `permission-enforcement-report.json` | Permission keys × trust tier × enforcement |
| `trust-tier-audit.json` | Per-app trust tier + restrictions |
| `runtime-compatibility-matrix.json` | Per-app × surface compatibility |
| `recovery-closure.json` | Crash/recovery path per app type |
| `upgrade-compatibility-report.json` | Version upgrade rules |
| `supportability-report.json` | Support bundle coverage |
| `window-policy-matrix.json` | Per-app-class window behavior |

Update existing `generated/app-lifecycle-closure.json` and `generated/app-permission-audit.json` with richer data.

Mirror key artifacts to `public/generated/app-lifecycle-closure/`.

### PART 5 — Validators

| Script | Gate | Blocking |
|---|---|---|
| `scripts/app-platform/check-app-identity-closure.ts` | Every app has canonical identity, no duplicate IDs | BLOCK |
| `scripts/app-platform/check-app-lifecycle-coverage.ts` | State machine coverage, handler existence | BLOCK |
| `scripts/app-platform/check-app-permission-enforcement.ts` | Permission declarations + ledger coverage | Advisory |
| `scripts/app-platform/check-app-runtime-compatibility.ts` | Runtime claims match runtime authority | Advisory |
| `scripts/app-platform/check-app-recovery-closure.ts` | Crash/recovery path exists | Advisory |
| `scripts/app-platform/check-app-supportability.ts` | Support bundle coverage | Advisory |

Wire the 2 BLOCK gates into `check-os-release-readiness.ts`.

### PART 6 — Barrel and Wiring Updates

**Files to modify**:

- `src/lib/app-platform/index.ts` — add exports for lifecycle manager, install registry, permission ledger, trust tier policy, upgrade policy, uninstall cleanup, observability, support bundle, window policy
- `src/lib/app-platform/app-recovery-manager.ts` — no changes needed (already complete)
- `scripts/architecture/checks/check-os-release-readiness.ts` — register 2 new BLOCK gates

### PART 7 — What This Does NOT Do

- No new database migrations (all persistence uses existing `installed_apps`, `app_permission_grants`, `app_permissions_overrides` tables + localStorage)
- No new edge functions (existing 5 edge functions cover install/uninstall/update/launch/permissions)
- No UI changes (lifecycle manager is consumed by existing services)
- No duplication of existing services

### PART 8 — Implementation Order

1. State machine + trust tier policy + upgrade policy + window policy (pure types, no dependencies)
2. Permission ledger + uninstall cleanup (localStorage-backed)
3. Install registry + lifecycle manager (wires existing services)
4. Observability + support bundle (reads from registry)
5. Contracts package (barrel)
6. Generated artifacts + validators
7. Barrel update + aggregator wiring

### Deployment Closure Checklist

- [ ] One canonical lifecycle state machine with 17 states and explicit transitions
- [ ] Lifecycle manager orchestrates all transitions through state machine validation
- [ ] Install registry unifies catalog + install + recovery into single query surface
- [ ] Permission ledger records all grant/deny/revoke events with timestamps
- [ ] Trust tier policy enforces install/permission restrictions per trust level
- [ ] Upgrade policy validates version compatibility
- [ ] Uninstall cleanup removes app data, crash state, and permission records
- [ ] Observability provides per-app and system-wide health metrics
- [ ] Support bundle generates redacted diagnostic packages
- [ ] Window policy maps app class to window behavior
- [ ] 9 generated proof artifacts in `generated/app-lifecycle-closure/`
- [ ] 6 validators with 2 BLOCK gates wired into release aggregator
- [ ] Zero duplicates — all new code extends existing canonical services

