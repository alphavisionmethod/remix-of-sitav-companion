
The user wants the entire 15-point platform maturity manifest implemented "100% real, no stubs, wow." Given the conversation history, ~70% of these items already exist as real code (verified across previous turns: Sovereign AI Gateway, kill-switch registry, runbooks, app platform, mobile contracts, electron runtime, OS image builder Phases 1-6, security fabric, etc.). The honest gap is roughly 30% — and a chunk of *that* gap is hard-blocked by external secrets (APNs key, Sentry DSN, FCM JSON) the user has not provided.

So this plan must do three things:
1. Audit each of the 15 points against what's already shipped (so I don't rebuild what exists).
2. Ship every item that can ship with code alone — no stubs, real wiring.
3. Honestly mark items blocked on external secrets/credentials with a one-click activation path (not pretend they work).

Let me run the audit fast, then present a tight execution plan.

## Audit (against verified shipped state)

| # | Area | Already shipped | Real gap |
|---|---|---|---|
| 1 | Native mobile | Capacitor config, plugins, native bridges (push/biometric/secure-storage/deeplinks/background), `ios-templates/`, `ios-bootstrap.yml` macos-14 workflow | Android bootstrap workflow + templates; activation runbook |
| 2 | Observability | `initSentry`, `initErrorMonitoring`, fetch interceptor, APM exporter, uptime heartbeat, observability registry, incident model | Sentry release-tag CI step; sourcemap upload; alert-routing edge function; incident dashboard route wiring |
| 3 | Kill switches | 14 canonical switches, enforcement map, dependency graph, runbooks RB-001..RB-019, dual-approval | `KS-PAYMENTS-AUTH` (P0 gap from memory); rollback drill script |
| 4 | App platform | DB-backed catalog, 17 store modules, ingest functions, trust tiers, manifest signing, install state | Update channel manifest endpoint + UI |
| 5 | Desktop | Electron main.cjs, security fabric (7 layers), license-gateway, ASAR integrity | CI build matrix (linux/darwin/win32) + updater server endpoint + crash upload edge fn |
| 6 | Appliance/OS | Phases 1-6 shipped: ISO builder, dm-verity, LUKS2+TPM, A/B partitions, sita-updated, installer, recovery, preflight | Nothing critical — all shipped |
| 7 | Security maturity | Device trust, session-threat-detector, secure-memory-vault, AI output firewall, audit log, dual-approval | Secret rotation runbook + edge fn; audit-log export edge fn |
| 8 | Admin simplification | AdminControlPlaneShell, 12 domains, 5 owner workflows | Already done — no work |
| 9 | Truth discipline | Manifest Truth Framework, 120+ registries, "It's Real" gate, golden paths | Add `nativeAndroidProjectGenerated` + Sentry-DSN-bound warnings to gate |
| 10 | Collaboration | Draft autosave, session restore, mobile offline sync, CRDT not needed for current scope | Conflict-resolution UI surface for sync queue |
| 11 | AI maturity | Sovereign Gateway, budget enforcement, fallback chain, receipts, prompt families, REX loop | Already mature — no work |
| 12 | Developer maturity | Nova SDK, plugin/widget/integration registries, golden-path smoke, full-render tests | Preview-env runbook doc |
| 13 | Enterprise deployment | IaC in `infra/`, OS-artifact pipeline, regional strategy in ARQ_PLAN_FINAL | Backup-restore drill script + DR test runbook |
| 14 | Experience polish | Unified search, app launcher, store install, notifications, freshness indicators, Master First-Use Spec (29 screens) | Already polished — no work |
| 15 | "Most advanced" combo | All 7 sub-items above either shipped or gap identified | Aggregate readiness scorecard page |

## Real gap to close this turn

### Batch A — Android native runtime (parity with iOS)
- `android-templates/app/src/main/` → `AndroidManifest.xml` with all permissions + intent filters, `strings.xml`, `colors.xml`, `themes.xml`, splash, adaptive icon, `network_security_config.xml`, `data_extraction_rules.xml`
- `android-templates/app/build.gradle` + `proguard-rules.pro` + `google-services.json.template`
- `.github/workflows/android-bootstrap.yml` — `ubuntu-latest` runner: `npx cap add android` → overlay templates → `./gradlew assembleDebug` → upload APK or open PR
- `scripts/release/android/build-android.sh` — signed AAB build for Play Store (validates `ANDROID_KEYSTORE`, `KEY_ALIAS`)
- `scripts/android/bootstrap.sh` — local Linux/Mac path
- `docs/android/ANDROID_NATIVE_RUNTIME.md`

### Batch B — Production observability hardening
- `.github/workflows/sentry-release.yml` — on every deploy: tag release with git SHA, upload sourcemaps
- `supabase/functions/alert-router/index.ts` — receives signals, routes to Slack/email/PagerDuty per severity (uses existing notification infra)
- `src/pages/admin/IncidentDashboardPage.tsx` — wires existing `incident_classifications` + `kill_switch_audit_log` into a live operator view at `/admin/incidents/dashboard` (route may exist; verify and wire)
- `src/lib/observability/release-tag.ts` — single source of truth for release tag (used by Sentry init + APM exporter)

### Batch C — KS-PAYMENTS-AUTH (closes P0 from remediation memory)
- Migration: insert switch metadata into `automation_kill_switches` registry (not `automation_kill_switches` runtime — the registry table)
- `src/lib/control-plane/kill-switch-registry.ts` — add 15th switch: `KS-PAYMENTS-AUTH` (target: payment-auth, severe, dual-approval, runbook RB-005-AUTH)
- Add enforcement points + runtime consequence + runbook `infra/runbooks/RB-005-AUTH.md`

### Batch D — Desktop CI maturity
- `.github/workflows/desktop-build.yml` — matrix: ubuntu/macos/windows; uses `@electron/packager`; uploads .tar.gz/.zip/.dmg-zip artifacts; signs on macos+windows when certs present
- `supabase/functions/desktop-update-manifest/index.ts` — serves signed update manifests by channel (mirrors `os-update-manifest` pattern)
- `supabase/functions/crash-report-ingest/index.ts` — receives Electron crash dumps, stores in `user-files` bucket under `crashes/`, raises incident if rate threshold exceeded

### Batch E — Security maturity closeout
- `supabase/functions/audit-log-export/index.ts` — admin-gated, returns time-windowed audit log as NDJSON for SIEM ingestion
- `supabase/functions/secret-rotation-orchestrator/index.ts` — coordinates rotation of VAPID/Twilio/AI keys; emits receipts
- `infra/runbooks/RB-SECRET-ROTATION.md`

### Batch F — Truth discipline + collaboration + DR
- Update `scripts/architecture/checks/check-mobile-build-pipeline.ts`: add `nativeAndroidProjectGenerated` boolean
- Update `scripts/architecture/checks/check-its-real-gate.ts`: add Sentry-DSN warning (warn, not block)
- `scripts/db/backup-restore-drill.ts` — exercises `pg_dump` → restore-to-staging → verify row counts → emit receipt
- `infra/runbooks/RB-DR-RESTORE.md`
- `src/components/sync/SyncConflictResolver.tsx` — UI surface for the existing `sync-conflict-policy.ts` `manual-merge` resolver

### Batch G — Aggregate readiness scorecard
- `src/pages/admin/PlatformReadinessScorecard.tsx` at `/admin/readiness` — pulls the 15-point manifest live from generated reports; one row per area; status badge (real/blocked-on-secret/in-progress); links to evidence file. This is the "wow" surface the user can show stakeholders.
- `generated/platform-readiness-manifest.json` regenerated by new script `scripts/architecture/generate-platform-readiness.ts`

### Honest deferrals (one-click activation when user provides credentials)
| Capability | Blocker | Activation |
|---|---|---|
| APNs push | Apple Developer Program ($99/yr) | Add `APNS_*` secrets → uncomment 2 lines in `App.entitlements` → re-run ios-bootstrap |
| FCM push | Firebase service account JSON | Add `FCM_SERVICE_ACCOUNT_JSON` → drop `google-services.json` → re-run android-bootstrap |
| Sentry release tracking | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | Add both secrets → next deploy auto-tags |
| Slack/PagerDuty alerts | webhook URLs | Add to alert-router config |
| TestFlight upload | App Store Connect API key | Add `ASC_*` secrets → release-ios.yml proceeds |
| Play Store upload | Google Play service account | Add `PLAY_SERVICE_ACCOUNT_JSON` → release-android.yml proceeds |
| Desktop code signing (macOS/Windows) | Developer ID + Authenticode certs | Add cert + password secrets → desktop-build.yml signs |

These are documented in a single new artifact: `/mnt/documents/SITA OS Activation Checklist.md` — every secret, where to get it, what unlocks.

## Acceptance
| Check | Target |
|---|---|
| Android bootstrap workflow + templates parity with iOS | ✅ |
| KS-PAYMENTS-AUTH registered + enforced + runbook | ✅ |
| Sentry release-tag + sourcemap CI step | ✅ |
| Desktop CI matrix (3 platforms) + updater + crash ingest edge fns | ✅ |
| Audit-log export + secret-rotation orchestrator edge fns | ✅ |
| Backup-restore drill script + DR runbook | ✅ |
| Sync conflict resolver UI | ✅ |
| `/admin/readiness` scorecard wired to live registries | ✅ |
| Pipeline gate honestly tracks Android + Sentry status | ✅ |
| Activation Checklist artifact published | ✅ |
| Zero stubs — every file is real, every function ships | ✅ |
| Honest deferrals listed with one-click activation paths | ✅ |

After this ships: every one of the user's 15 points is either ✅ live or 🔑 one-secret-away with a clear activation runbook. No invented work, no fake files, no broken promises.
