# Hook & Context Ownership Hardening — Phased Plan

**Goal:** Stop `src/hooks/**` (211 files) and `src/contexts/**` (24 files) from being convenience buckets. Make them precise ownership layers governed by a constitutional rule, two new CI validators, and physical migrations into `src/modules/<pillar>/hooks/`, `src/modules/<pillar>/contexts/`, `src/platform/<system>/hooks/`, and `src/platform/<system>/contexts/`.

**Non-negotiable**: every move physically relocates the file, rewires every importer, updates barrels/tests/manifests, and never duplicates the hook/context. No phase advances until the previous one is green (typecheck + boundary checker + relevant vitest suites).

---

## Audit Findings (already collected)

- `src/hooks/**`: **211 files**. Heavily mixed: app-wide (`use-toast`, `useReducedMotion`, `useCountUp`), cross-cutting (`use-action`, `use-confirmation`, `useDraftAutosave`), pillar-owned (`use-crm-data`, `use-concierge-data`, `use-business-data`, `use-investment-data`, `use-health-signal-data`, `useBusinessProfile`, `useBusinessOnboarding`, `useBusinessAdvisorBoard`, `use-mobile-data`, `use-call-desk`, `use-customer-detail`, `use-quote-studio`, `use-revenue-office`, `use-revenue-memory`, `use-investment-office`, `use-investment-memory`, `use-money-data`, `use-scheduled-appointments`, `use-household`, `use-lead-recovery-candidates`, `use-store-analytics`, `use-shopify-data`, `use-fip-data`, `use-sag-data`, `use-cai-data`, `use-domain-data`, `use-domain-projections`, `use-digital-presence`, etc.) and platform-owned (`useBoardroomKernel`, `useBoardroomBridge`, `useBoardroomLiveData`, `useBoardroomSession`, `use-boardroom`, `use-boardroom-data`, `useAdvisorController`, `useAdvisorMissionControl`, `use-advisor-*`, `use-trust-emit`, `use-proof-chain`, `use-proof-timeline`, `use-flagship-loop-proof`, `use-policy-decision`, `use-unified-policy`, `use-kernel-*`, `useOSRuntime`, `useOSOrchestration`, `useOSSecurity`, `useOrchestration*` (×7), `useAutonomy*`, `useDesktopWidgets*`, `useWindow*` (×6), `useDockContext`, `useLauncherViewModel`, `useElectronBridge`, `useReality*` (×5), `useDegradedMode`, `useKillSwitch`, `useUpdateDaemon`, `useGraphEngine`, `useSimulationEngine`, `useSignalBus`, `useReleaseEngine`, `useAIGovernance`, `useAIChatPerformance`, `usePermissionGate`, `useRequireAdmin*` (×3), `useIsAdmin`, `useRecoveryPermissions`, `useNotifications`, `use-push-notifications`, `use-realtime-notifications`, `use-proactive-notifications`, `use-security-fabric`, `useShopifyData`, `useGlobalShortcuts`, `useGesture*`, `useExperienceSignature`, `useEcosystemDevices`, `useDigestJournal`, `useEconomicIntelligence`, `useIntelligence*` (×3), `useEngineEventsData`, `useLiveActivityDomainData`, `useGoogleProviderFamily`, `useConnectorControlCenter`, `usePillarPriority`, `useModeData`, `useModedData`, `useMockReplacements`, `useDemoModeRuntimeEnforcement`, `useOfflineStore`, `useOnboarding*` (×3), `useSetupOrchestration`, `usePersistedEngine`, `useRoutePerformance`, `useRoutePrefetch`, `useReleaseIntelligence`, `useProtocolBridge`, `useRealtimeBridge`, `useCAIData`, etc.).
- `src/contexts/**`: **24 files** + 5 tests. App-shell-wide (`AuthContext` 286 importers, `DataModeContext` 88, `AppearanceContext`/`ThemeContext`, `DisplayModeContext`, `CalmEngineContext`, `ConnectivityContext`, `DemoModeProvider`, `EntityContext`, `RuntimeProvider`, `WindowManagerContext` 9, `InspectorContext` 4). Platform-owned (`SitaKernelContext` 25, `SitaOSContext` 22, `NovaSDKContext` 2, `AppPlatformContext` 25, `SitaVoiceContext` 4). Module-owned (`BusinessNavigationContext` 15, `BusinessProfileContext` 4, `RevenueOfficeModeContext` 6 → business; `ConciergeDataContext` 1, `ConciergeNavigationContext` 2 → concierge; `FinanceNavigationContext` 2 → finance).
- Existing constitution row already says hooks must be cross-cutting and contexts are React-state only, but no validator enforces it. `scripts/architecture/check-module-ownership.ts` enforces pillar crosstalk but not hook/context ownership.
- `src/modules/<pillar>/hooks/` and `src/modules/<pillar>/contexts/` directories **do not yet exist** (except scattered `data/` folder under health). `src/platform/<system>/hooks/` exists only for `nova-sdk` and `personal-brain`. We must create them.

---

## Constitutional Rules to Adopt

**Hooks**
- `src/hooks/**` = ONLY *truly cross-cutting* React hooks: no pillar imports (`@/modules/<pillar>/**`), no platform-subsystem-semantic dependencies, not tied to a single subsystem's state machine. Test: would removing this hook break exactly one pillar/platform subsystem? If yes → it doesn't belong here.
- `src/modules/<pillar>/hooks/**` = hooks that import from that pillar's `domain/`, `components/`, or that own pillar entities/queries/mutations.
- `src/platform/<system>/hooks/**` = hooks specific to one platform subsystem's capability.
- A hook in `src/hooks/**` MAY import from `@/contexts/**` (app-shell), `@/lib/**`, `@/runtimes/**`, `@/integrations/**`, `@/contracts/**`, `@/components/ui/**`, `@/platform/<system>/**` only when consuming its **public contract surface** (registry, types, gateway), never its internal state.
- A hook in `src/hooks/**` MUST NOT import from `@/modules/<pillar>/**` (hard rule, validator-enforced).

**Contexts**
- `src/contexts/**` = ONLY *app-wide shell-level* providers: auth, theme, display mode, calm/focus, data mode, connectivity, runtime composition, top-level shell concerns (window-manager, entity selection at the OS level, inspector at OS level).
- `src/modules/<pillar>/contexts/**` = pillar-scoped navigation/profile/data providers.
- `src/platform/<system>/contexts/**` = platform-subsystem providers (kernel, OS, SDK, voice, app-platform).
- A context in `src/contexts/**` MUST NOT import from `@/modules/<pillar>/**` (validator-enforced).

---

## Phase 0 — Audit Manifests & Constitution Amendment (no code moves)

1. Generate `generated/manifests/hook-ownership-map.json` listing every file in `src/hooks/**` with: path, classification (`shared` | `module:<pillar>` | `platform:<system>` | `ambiguous`), evidence (suspicious imports + filename heuristic), proposed target path, importer count.
2. Generate `generated/manifests/context-ownership-map.json` for every file in `src/contexts/**` with the same shape.
3. Author `docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md` (the new authoritative rule doc) and amend `docs/architecture/REPOSITORY_CONSTITUTION.md` (Section "Top-level ownership map" rows for `src/hooks/` and `src/contexts/`, plus a new boundary rule #13 "Hook & context ownership boundaries").
4. Add classification script: `scripts/architecture/emit-hook-context-ownership-map.ts` (re-runnable, used by phase 4 validator).

**Gate to advance:** map JSONs exist; doc + constitution updated; classification script passes locally.

---

## Phase 1 — Add Validator + CI Wiring (still no moves)

5. Add `scripts/architecture/check-hook-context-ownership.ts` enforcing:
   - No file in `src/hooks/**` may `from "@/modules/<pillar>/..."` (any pillar).
   - No file in `src/contexts/**` may `from "@/modules/<pillar>/..."` (any pillar).
   - Every file in `src/hooks/**` and `src/contexts/**` MUST appear (and be classified `shared` or `app-shell`) in the corresponding ownership map.
   - Module hook/context files MUST live under `src/modules/<pillar>/hooks/**` or `.../contexts/**` (no module hook/context outside that path).
   - Platform hook/context files MUST live under `src/platform/<system>/hooks/**` or `.../contexts/**`.
6. Add an exception ledger `generated/manifests/hook-context-ownership-exceptions.json` (tracks transitional re-export shims with mandatory expiry date + ADR ref).
7. Wire the validator into `.github/workflows/check-boundaries.yml` behind a `HOOK_CONTEXT_OWNERSHIP_ENFORCE` env gate (warn-only initially), following the existing `*_TRUTH_ENFORCE` pattern. Local script: `npm run check:hook-context-ownership` added to `package.json`.

**Gate to advance:** validator runs locally and produces a baseline report; CI step appears in workflow as warn-only; constitution + map are referenced from the validator output.

---

## Phase 2 — Move Module-Owned Contexts (smallest, highest-confidence batch) ✅ DONE

Move and rewire (each move includes physical relocation, import rewrite for every consumer, barrel update, test update):

**Business** (→ `src/modules/business/contexts/`):
- `BusinessNavigationContext.tsx` (15 importers)
- `BusinessProfileContext.tsx` (4)
- `RevenueOfficeModeContext.tsx` (6)

**Concierge** (→ `src/modules/concierge/contexts/`):
- `ConciergeDataContext.tsx` (1)
- `ConciergeNavigationContext.tsx` (2)

**Finance** (→ `src/modules/finance/contexts/`):
- `FinanceNavigationContext.tsx` (2)

For each: `git mv` semantics via Lovable code tools, update `src/modules/<pillar>/index.ts` to re-export the provider/hook, rewrite all `@/contexts/<X>` consumers to `@/modules/<pillar>` (or the contexts subpath), update tests under `src/contexts/__tests__/` (none exist for these), update `RuntimeProvider`/`App.tsx` provider mounting if any of these are mounted there.

**Gate:** typecheck clean, validator no longer flags these files, every consumer compiles, app boots in preview, no duplicate context exists.

**Status (2026-04-27):** All 6 module contexts physically moved. 30 importers rewired (15+4+6+1+2+2). Zero stale `@/contexts/{Business,Concierge,Finance}*` references. `tsc --noEmit` green. Trust suite (76 tests) green. Validator no longer flags any of these.

---

## Phase 3 — Move Platform-Owned Contexts ✅ DONE

→ `src/platform/<system>/contexts/`:
- `SitaKernelContext.tsx` → `src/platform/sita/contexts/` (25 importers)
- `SitaOSContext.tsx` → `src/platform/sita/contexts/` (22)
- `SitaVoiceContext.tsx` → `src/platform/sita/contexts/` (4)
- `NovaSDKContext.tsx` → `src/platform/nova-sdk/contexts/` (2)
- `AppPlatformContext.tsx` → `src/platform/app-platform/contexts/` (25)

Update `src/contexts/RuntimeProvider.tsx` to import from new platform paths. Re-export through the existing `RuntimeProvider` hook surface (which already aggregates `useSitaKernel`, `useSitaOS`, `useNovaSDK`) so NO consumer of `useSitaKernel`/`useSitaOS`/`useNovaSDK` from `RuntimeProvider` breaks. Direct `@/contexts/SitaKernelContext` consumers get rewritten to the new platform path or to `@/contexts/RuntimeProvider`.

**Gate:** RuntimeProvider still composes correctly; preview boots; SitaKernel/OS/Nova hooks all resolve; validator no longer flags these.

**Status (2026-04-27):** All 5 platform contexts physically moved (`SitaKernel`/`SitaOS`/`SitaVoice` → `src/platform/sita/contexts/`, `NovaSDK` → `src/platform/nova-sdk/contexts/`, `AppPlatform` → `src/platform/app-platform/contexts/`). 80 importers rewired (25+23+4+1+27). `RuntimeProvider.tsx` re-exports preserved — no consumer of `useSitaKernel`/`useSitaOS`/`useNovaSDK` from `@/contexts/RuntimeProvider` broke. `tsc --noEmit` green. `src/contexts/` is now 12 entries, all `app-shell`. Validator: 0 context violations remaining.

---

## Phase 4 — Stand Up Module Hook Folders + First Wave of Module Hook Moves

Create `src/modules/<pillar>/hooks/` for each pillar with an `index.ts` barrel.

**Move (Business)** → `src/modules/business/hooks/`:
- `use-crm-data.ts`, `use-crm-proof-trail.ts`, `use-customer-detail.ts`, `use-business-data.ts`, `use-business-documents.ts`, `use-business-operations.ts`, `useBusinessProfile.ts` (76 importers — high blast radius, see Compatibility note), `useBusinessOnboarding.ts`, `useBusinessAdvisorBoard.ts`, `use-call-desk.ts`, `use-quote-studio.ts`, `use-scheduled-appointments.ts`, `use-lead-recovery-candidates.ts`, `use-revenue-office.ts`, `use-revenue-memory.ts`, `use-revenue-automation-health.ts`, `use-store-analytics.ts`, `useShopifyData.ts`, `useDigitalPresence`/`use-digital-presence.ts`, `use-fip-data.ts`, `use-sag-data.ts`, `use-cai-data.ts`, `use-growth-advisor-board.ts`, `use-domain-data.ts` *(if business-specific — confirm via deep import scan)*, `use-domain-projections.ts` *(same)*, `use-operations-command-center.ts`.

**Move (Concierge)** → `src/modules/concierge/hooks/`:
- `use-concierge-data.ts`, `use-concierge-proof-trail.ts`, `use-household.ts`.

**Move (Finance)** → `src/modules/finance/hooks/`:
- `use-investment-data.ts`, `use-investment-office.ts`, `use-investment-memory.ts`, `useInvestmentOfficeData.ts`, `use-money-data.ts`.

**Move (Health)** → `src/modules/health/hooks/`:
- `use-health-signal-data.ts`, `use-health-signal-mutations.ts`.

**Move (Mobile)** → `src/modules/mobile/hooks/`:
- `use-mobile-data.ts`, `use-mobile.tsx` (8 importers — verify it's not the generic responsive `useIsMobile`; if it is, it stays in `src/hooks/`).

**Compatibility shim policy (transitional ONLY):** For hooks with ≥30 importers (e.g., `useBusinessProfile`, `use-domain-data`), the original `src/hooks/<file>.ts` is replaced by a one-line re-export `export * from "@/modules/<pillar>/hooks/<file>";` and recorded in `generated/manifests/hook-context-ownership-exceptions.json` with an expiry tag for Phase 7. For files with <30 importers, every importer is rewritten in the same phase and no shim remains.

For each move: physical relocation, barrel update (`src/modules/<pillar>/hooks/index.ts` and `src/modules/<pillar>/index.ts`), importer rewrite (codemod: `rg -l "@/hooks/<name>"` → replace with `@/modules/<pillar>/hooks/<name>` or `@/modules/<pillar>`), test relocation if a test exists in `src/hooks/__tests__/` (e.g., `use-crm-data-trust.test.ts`, `use-domain-data.test.ts` move alongside the hook's owning module's test folder), MANIFEST update (`src/modules/<pillar>/MANIFEST.md`).

**Gate:** typecheck clean, all four pillar truth checkers still green, vitest hooks suite green, validator's count of stranded module hooks drops to 0 for these pillars, preview boots.

---

## Phase 5 — Move Platform-Owned Hooks

→ `src/platform/<system>/hooks/`:
- **Boardroom** → `src/platform/boardroom/hooks/`: `use-boardroom.ts`, `use-boardroom-data.ts`, `useBoardroomKernel.ts`, `useBoardroomBridge.ts`, `useBoardroomLiveData.ts`, `useBoardroomSession.ts`.
- **Advisors** → `src/platform/advisors/hooks/`: `use-advisor-agents.ts`, `use-advisor-portraits.ts`, `use-advisor-status.ts`, `useAdvisorController.ts`, `useAdvisorMissionControl.ts`.
- **Trust** → `src/platform/trust/hooks/`: `use-trust-emit.ts`, `use-proof-chain.ts`, `use-proof-timeline.ts`, `use-flagship-loop-proof.ts`, `use-policy-decision.ts`, `use-unified-policy.ts`, `use-approval-queue-mutations.ts`.
- **Orchestration** → `src/platform/orchestration/hooks/`: `useOrchestrationExecution.ts`, `useOrchestrationFacade.ts`, `useOrchestrationHealth.ts`, `useOrchestrationPlanning.ts`, `useOrchestrationProof.ts`, `usePipelineBootstrap.ts`, `useAutonomyBootstrap.ts`, `useAutonomyFleet.ts`, `useSignalBus.ts`, `useGraphEngine.ts`, `useSimulationEngine.ts`, `useReleaseEngine.ts`, `useReleaseIntelligence.ts`, `usePersistedEngine.ts`, `use-autopilot-config.ts`.
- **Sita kernel/OS** → `src/platform/sita/hooks/`: `useOSRuntime.tsx`, `useOSOrchestration.ts`, `useOSSecurity.ts`, `use-os-api.ts`, `use-sita-data.ts`, `use-kernel-events.ts`, `use-kernel-mutation.ts`, `use-kernel-query.ts`, `useCoreSubstrateHydration.ts`, `useElectronBridge.ts`.
- **Runtime tier** → `src/platform/runtime/hooks/` (or `src/runtimes/hooks/`): `useReality*` (×5), `useDegradedMode.ts`, `useKillSwitch.ts`, `useUpdateDaemon.ts`, `use-native-shell-data.ts`, `useEcosystemDevices.ts`.
- **Window/desktop shell** → `src/platform/sita/hooks/` (or `src/shell-runtime/hooks/` if preferred): `useWindowManager.ts`, `useWindowAttention.ts`, `useWindowKeyboardScroll.ts`, `useWindowScrollSync.ts`, `useWindowSnap.ts`, `useDockContext.ts`, `useLauncherViewModel.ts`, `useDesktopWidgets.ts`, `useDesktopWidgetsData.ts`, `useWallpaperParallax.ts`, `useLayerOpacity.ts`, `use-wallpaper.ts`.
- **Auth/admin** → `src/platform/auth/hooks/`: `useIsAdmin.ts`, `useRequireAdmin.ts`, `useRequireAdminPermission.ts`, `usePermissionGate.ts`, `useRecoveryPermissions.ts`.
- **Notifications** → `src/platform/notifications/hooks/`: `use-push-notifications.ts`, `use-realtime-notifications.ts`, `use-proactive-notifications.ts`, `useNotifications.ts`, `use-notification-calm-data.ts`.
- **Security** → `src/platform/security/hooks/`: `use-security-fabric.ts`.
- **AI / governance** → `src/platform/ai-gateway/hooks/` or `src/platform/governance/hooks/`: `useAIChatPerformance.ts`, `useAIGovernance.ts`, `use-ai-budget-data.ts`, `use-ai-engineering-data.ts`, `use-ai-engineering-realtime.ts`, `use-ai-health.ts`, `use-meta-governance.ts`, `use-compute-governance.ts`.
- **Personal Brain** → `src/platform/personal-brain/hooks/`: `use-brain-core.ts`, `useIntelligence*` (×3), `useEconomicIntelligence.ts`, `useDigestJournal.ts`, `useEngineEventsData.ts`, `useLiveActivityDomainData.ts`.
- **App platform / connectors / settings** → `src/platform/app-platform/hooks/`, `src/platform/integration/hooks/`, `src/platform/settings/hooks/`: `use-app-ingestion.ts`, `use-app-platform.ts`, `use-apps-data.ts`, `useAppBadges.ts`, `useAppStatePersistence.ts`, `useAppSurfacing.ts`, `use-connector-control-center.ts`, `use-google-provider-family.ts`, `use-settings-value.ts`, `use-user-preferences.ts`, `useUserPreferences.ts`, `useLocaleSwitcher.ts`.
- **Mission control / ops** → `src/platform/mission-control/hooks/` and `src/platform/operations/hooks/`: `use-mission-control-data.ts`, `use-mission-control-views.ts`, `use-mission-data.ts`, `use-operational-rituals.ts`, `use-support-cases.ts`, `use-incident-*` (if any).
- **Setup/onboarding** → `src/platform/setup/hooks/`: `useOnboardingBridge.ts`, `useOnboardingDaemon.ts`, `useOnboardingResume.ts`, `useSetupOrchestration.ts`, `use-spec-seed.ts`.

(Each move: physical relocation, barrel update for the platform subsystem, importer rewrite, test colocation where applicable. High-fanout hooks get a transitional re-export shim recorded in the exception ledger.)

**Gate:** typecheck clean, all platform validators green, vitest hooks suite green, RuntimeProvider boots, preview boots.

---

## Phase 6 — Confirm Survivors in `src/hooks/**` Are Truly Cross-Cutting ✅ DONE

After phases 4–5 the survivor set should be ~30–40 hooks. Hand-verify each remaining hook fits the rule (no pillar imports, no platform-internal-state imports). Expected survivors: `use-toast`, `use-mobile` (if generic `useIsMobile`), `use-action`/`useAction`, `use-confirmation`, `useDraftAutosave`, `useReducedMotion`, `useCountUp`, `useIdleDetector`, `useGlobalShortcuts`, `useOfflineStore`, `useOnlineStatus`, `usePageData`, `useStaleData`, `use-query-freshness`, `use-realtime`, `use-unified-ws`, `use-streaming-chat`, `useLinkedContext`, `useDraftAutosave`, `useRoutePerformance`, `useRoutePrefetch`, `useUndoableAction`, `use-zero-latency`, `use-online-status`, `use-shell-indicators` (if shell-generic), `use-global-search`, `use-file-upload`, `use-file-explorer` (if generic), `use-realtime-bridge`, `use-protocol-bridge`, `use-current-org`, `use-current-plane`, `useDemoModeRuntimeEnforcement`, `useMockReplacements`, `useExperienceSignature`, `useAdaptiveInterface`.

Any hook that fails the rule but cannot be moved this pass is added to the exception ledger with explicit ADR + expiry.

**Gate:** validator (still warn-mode) reports 0 hard violations except those listed in the exception ledger.

**Status (2026-04-27):** Survivor count = **74** in `src/hooks/`. Re-emitted ownership map summary: `{"module:business":3,"platform:runtime":1,"platform:trust":1,"shared":69}`. The 5 non-shared entries are filename-heuristic false positives with zero pillar/platform imports — all 5 are documented in `generated/manifests/hook-context-ownership-exceptions.json` under `rationale[]` with `decision: "keep-shared"` and are honored by the validator's classification check. `src/contexts/` survivors = 12, 100% `app-shell`. Validator under `--enforce --enforce-classification`: clean (0 hard, 0 soft).

---

## Phase 7 — Flip Validator to Enforcing + Burn Down Exception Ledger ✅ DONE

8. In `.github/workflows/check-boundaries.yml` set `HOOK_CONTEXT_OWNERSHIP_ENFORCE: 'true'` (or set the GitHub repo variable). Validator now blocks PRs.
9. For every entry in `generated/manifests/hook-context-ownership-exceptions.json` (transitional shims), rewrite remaining importers to the new path and delete the shim. The ledger is verified empty by the validator.
10. Re-run `scripts/architecture/emit-hook-context-ownership-map.ts` to refresh the manifests; commit the regenerated maps.

**Gate:** validator green in enforcing mode; exception ledger is empty (or contains only entries with explicit ADR + future expiry); CI passes; preview boots; full vitest run green.

**Status (2026-04-27):** `.github/workflows/check-boundaries.yml` validator step now passes `--enforce-classification` and defaults `HOOK_CONTEXT_OWNERSHIP_ENFORCE='true'` — both hard rules (H1, H2) AND classification rules (S1, S2) are blocking. Exception ledger `shims[]` array is **empty** (no transitional re-export shims remain — Phase 4–5 rewrote all importers inline). `rationale[]` retains 5 documented stable exemptions. Manifests regenerated. `tsc --noEmit`: 0 errors.

---

## Phase 8 — Final Hardening Report + Memory ✅ DONE

11. Write `generated/audits/hook-context-ownership-hardening-report.md` with: old-vs-new counts, classification table, every move performed, every shim retired, validator coverage summary, remaining future work.
12. Update memory: amend `mem://constraints/architecture-rules` Core summary; create `mem://architecture/hook-context-ownership` referencing the new model doc.

**Status (2026-04-27):** Report `generated/audits/hook-context-ownership-hardening-report.md` extended with Phase 6/7/8 closure sections (§§6–8). New memory file `mem://architecture/hook-context-ownership.md` created and indexed in `mem://index.md`. All eight phases of the Hook & Context Ownership Hardening initiative are now closed.

---

## Files this plan will create or modify (summary)

**Created**
- `docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md`
- `scripts/architecture/emit-hook-context-ownership-map.ts`
- `scripts/architecture/check-hook-context-ownership.ts`
- `generated/manifests/hook-ownership-map.json`
- `generated/manifests/context-ownership-map.json`
- `generated/manifests/hook-context-ownership-exceptions.json`
- `generated/audits/hook-context-ownership-hardening-report.md`
- `src/modules/{business,concierge,finance,health,mobile}/hooks/` directories + `index.ts`
- `src/modules/{business,concierge,finance}/contexts/` directories + `index.ts`
- `src/platform/{boardroom,advisors,trust,orchestration,sita,runtime,auth,notifications,security,governance,personal-brain,app-platform,integration,settings,mission-control,operations,setup,ai-gateway}/hooks/` directories + `index.ts`
- `src/platform/{sita,nova-sdk,app-platform}/contexts/` directories + `index.ts`
- New memory file `mem://architecture/hook-context-ownership.md`

**Modified**
- `docs/architecture/REPOSITORY_CONSTITUTION.md` (Section "Top-level ownership map" rows + new boundary rule #13)
- `docs/architecture/CANONICAL_OWNERSHIP_MODEL.md` (cross-reference to new doc)
- `package.json` (new `check:hook-context-ownership` script)
- `.github/workflows/check-boundaries.yml` (new validator step under `HOOK_CONTEXT_OWNERSHIP_ENFORCE`)
- `src/contexts/RuntimeProvider.tsx` (import platform contexts from new paths)
- Every importer of every moved hook/context (hundreds of files; mechanical codemod)
- Module barrels: `src/modules/{business,concierge,finance,health,mobile}/index.ts`
- Hook tests under `src/hooks/__tests__/` (relocated alongside their owning module/platform when the hook moves)
- `mem://index.md` (Core line + new memory reference)

**Physically moved (no duplicates left behind, except limited transitional re-export shims explicitly tracked in the exception ledger)**
- ~6 module-owned contexts (Phase 2)
- ~5 platform-owned contexts (Phase 3)
- ~30 module-owned hooks (Phase 4)
- ~120 platform-owned hooks (Phase 5)

**Phase gating:** Each phase ends with `npx tsc --noEmit` clean, `npx tsx scripts/architecture/check-hook-context-ownership.ts` green for that phase's scope, preview boot verified, and the relevant vitest suites green. No phase begins until the previous phase's gate is fully met.