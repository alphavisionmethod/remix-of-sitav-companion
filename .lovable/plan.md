
# SITA OS Technical PRD & Frontend Surface Checklist — Part IV Complete Audit

## Audit Methodology
Inspected: `setup-orchestration.ts` (195 lines), `setup-orchestration-engine.ts` (738 lines), `setup-phase-definitions.ts` (475 lines), `OSSetupExperience.tsx` (998 lines), `setup/index.ts` (76 lines, 37 components), `shell-grammar/index.ts` (114 lines), `event-envelope.ts`, `boot-persistence/index.ts`, all page directories, all service directories, all contract directories, and App.tsx (704 routes).

---

## Overall Verdict: ~85% Complete

The **setup system** (Sections 0-16) is ~97% as previously audited. The **broader OS frontend surface inventory** (Sections 17-29) is ~80%. The **PRD/architecture/data-model/service-contract layer** (Sections 7-13) has significant structural gaps.

---

## Sections 0-6: Setup PRD & Architecture — ✅ 97%

All previously audited. No regressions. 40-phase orchestration engine, 21 screens, 37 reusable components, emotional arc, wow moments, reflection copy, deferred completion — all confirmed present.

## Section 7: State Machine Design — ✅ 95%

**Global session states**: Implemented in `getGlobalSetupState()` (line 694): `boot_preparing`, `machine_foundation_in_progress`, `user_setup_in_progress`, `setup_ready_for_arrival`, `completed`, `completed_with_deferred_items`, `resumed_from_restart`. Missing: `not_started`, `awaiting_user_input`, `validating`, `processing`, `restarting_for_continuation`, `degraded_continueable`, `blocked_requires_resolution` as explicit global states (they exist as per-phase states).

**Per-stage lifecycle**: 12-state machine in `SetupPhaseStatus`: idle, preparing, active, validating, syncing, success, warning, degraded, blocked, skipped, resumed, completed. ✅ Full. Valid transition map enforced at runtime.

**Transition rules**: ✅ Stage advances only when RESOLVED_STATUSES met. Skipped emits completion. Failed routes to retry/blocked. Rollback resets downstream. Resume reconciles.

## Section 8: Data Models — ⚠️ 70%

**SetupSession**: ✅ Defined at `setup-orchestration.ts` lines 158-176. Has: id, userId, deviceId, startedAt, updatedAt, currentPhaseId, phaseStates, completedPhases, skippedPhases, rollbackStack, branchPath, hardwareCapabilities, interrupted, interruptionReason, resumable, completionPct, backgroundTasks.

**HardwareCapabilities (CapabilityProfile)**: ✅ Defined with hasCamera, hasBiometric, hasGeolocation, screenSize, connectionType, storageAvailable, notificationsSupported, performanceTier. Missing: hasTPM, hasSecureEnclave, biometricTypes[], hasMicrophone, hasBattery, batteryLevel, hasCellular, hasEthernet, displayClass, hardwareWarnings[].

**Missing as standalone typed contracts**:
- ❌ SecurityBaseline (exists conceptually in SecureFoundationStep but not as a typed data model)
- ❌ OwnershipProfile (ownership stored as string in state, not structured)
- ❌ IdentityProfile (auth data exists but not typed as setup contract)
- ❌ RestoreProfile (restore stored loosely)
- ❌ AccessProfile (access stored loosely)
- ❌ PrivacyProfile (privacy selections stored as array, not structured model)
- ❌ StarterProfile (quick identity stored loosely)
- ❌ WorldModel (world model data stored in state, not typed)
- ❌ UseModeProfile (mode stored as string)
- ❌ TrustProfile (trust stored loosely)
- ❌ AdvisorProfile (advisor activation stored loosely)
- ❌ ConnectionProfile (connections stored loosely)
- ❌ FirstWinProfile (first win stored loosely)
- ❌ ArrivalSummary (summary built inline, not typed)

## Section 9: Service Contracts — ⚠️ 50%

Services exist as implementations but most lack formal typed contracts:
- ✅ `BootPersistenceService` — formal class with typed interface
- ✅ `SetupOrchestrationEngine` — full formal class
- ⚠️ `HardwareCapabilityService` — detection inline in engine, no standalone service
- ⚠️ `SecurityFoundationService` — SecureFoundationStep handles it inline
- ⚠️ `NetworkSetupService` — NetworkSetupStep handles it inline
- ⚠️ `UpdateReadinessService` — DeviceReadinessStep handles it inline
- ❌ No standalone `WorldModelService`, `TrustCalibrationService`, `AdvisorRecommendationEngine`, `ConnectionRecommendationEngine`, `FirstWinRecommendationEngine`, `SetupSummaryBuilder` as formal service contracts
- All logic exists but is embedded in step components rather than extracted as services

## Section 10: Event Model — ❌ 15%

- ✅ `EventEnvelope` contract exists at `src/packages/contracts/core/event-envelope.ts`
- ✅ Phase transition listeners exist in the orchestration engine
- ❌ No setup-specific event taxonomy (setup_session_started, stage_entered, stage_completed, etc.)
- ❌ No event emission from setup steps
- ❌ No event payloads with sessionId, stageId, capability profile, branch context
- ❌ No event bus integration for setup lifecycle

## Section 11: Persistence & Resume — ✅ 90%

- ✅ Checkpoint after every phase via `pushRollbackPoint`
- ✅ `persistToLocalStorage()` / `loadFromLocalStorage()` / `restoreFromSnapshot()`
- ✅ SessionStorage + LocalStorage + Supabase persistence (via `useSetupOrchestration`)
- ✅ 24h session expiry
- ✅ Resume from interrupted state
- ✅ `markInterrupted()` with reason
- ⚠️ No explicit checkpoint-per-named-stage policy (checkpoints happen on completion, but no checkpoint after specific named stages like "after locale selection")
- ⚠️ Deferred items tracked but not with full schema (itemId, itemType, label, reasonSkipped, urgency, etc.)

## Section 12: Error & Fallback — ✅ 85%

- ✅ Retry, skip, blocked, degraded, warning states
- ✅ Calm wording in statusUX
- ✅ RecoveryStateCard component
- ✅ AdvancedDetailsDisclosure
- ⚠️ No formal error category taxonomy (machine capability issue, security baseline issue, etc. — handled case-by-case)

## Section 13: Handoff Contracts — ⚠️ 60%

- ✅ `finishSetup()` in OSSetupExperience persists to `user_memory` table
- ✅ Desktop transition choreography passes to desktop
- ✅ Deferred items build from state
- ❌ No typed `DesktopHandoffPayload` contract
- ❌ No typed `BoardroomHandoffPayload` contract
- ❌ No typed `TrustCenterHandoffPayload` contract
- ❌ Handoff is done via loose state passing, not structured contracts

## Sections 14-15: Epic Backlog & Delivery Sequence — ⚠️ Not formalized

All 15 epics are **implemented** but not documented as a formal backlog. The code IS the backlog. No formal epic tracking or delivery sequence document exists — but implementation covers all epics.

## Section 16: QA Framework — ⚠️ 40%

- ✅ Unit tests exist (`tests/integration/service-flows.test.ts`, `tests/setup/`)
- ⚠️ No dedicated setup E2E test file
- ❌ No formal acceptance criteria document
- ❌ No interruption recovery test
- ❌ No degraded hardware path test
- ❌ No accessibility test for setup

---

## Sections 17-28: Frontend Surface Inventory — ✅ 88%

### Section 18: Core Shell Surfaces — ✅ 95%
- ✅ Desktop shell (`DesktopSurface`, `DesktopPage`)
- ✅ Web shell (`ShellLayout`)
- ✅ Admin mission-control shell (200+ admin pages)
- ✅ Mobile trust companion (`src/pages/mobile/` — 9 pages)
- ✅ Command palette (shell-grammar, `commandPalette: true`)
- ✅ Timeline/activity (`ActivityStream`)
- ✅ Notifications (`NotificationCenter`, `NotificationPanel`)
- ✅ Lock screen (`LockScreen`)
- ✅ Welcome state (`WelcomeStateComposer`, `PostArrivalDesktop`)
- ✅ Global search (`SearchPage` — cross-domain with filters)
- ✅ Settings (`SettingsPage`, `settings/`)
- ✅ Deferred completion (`DeferredCompletionCenter`)
- ✅ Proof/receipts (`ProofCenter`)
- ✅ Approvals (`ApprovalsCenter`, `ApprovalChamber`)
- ⚠️ Calm/focus mode — shell grammar defines `focus` mode but no dedicated surface page

### Section 19: Business OS — ✅ 95%
15 business pages: LeadsInbox, OpportunitiesCenter, CustomersPage, BusinessOverview, BusinessBoardroom, CommunicationsCenter, CollectionsCommandCenter, InvoicesCollections, QuotesWorkspace, PlaybookBuilder, RevenueAutopilot, RevenueForecast, RevenueImpactDashboard, BusinessProof, AutopilotHub.
- ✅ CRM, leads, opportunities, follow-ups, communications, proposals, revenue
- ⚠️ Missing: explicit callback queue, at-risk surface, lost/revive, relationship graph, intake/booking triage, team handoff queue, capacity-to-cash board (some covered within existing pages)

### Section 20: Finance OS — ✅ 90%
13 money pages: MoneyOverview, BillsWorkspace, CashTiming, MoneyBoardroom, SubscriptionsWaste, ReservesSavings, ReceivablesObligations, MoneyApprovals, MoneyDocuments, MoneyProof, MoneySettings, TaxEstimator, InvestmentOffice.
- ✅ Bills, spending, reserves, receivables, approvals, documents, proof
- ⚠️ Missing: explicit safe-to-spend summary, savings focus view, budget/goal planning workspace

### Section 21: Concierge/Household — ✅ 95%
16 concierge pages: ConciergeOverview, HouseholdCommandCenter, HouseholdTasks, FamilyCalendar, FamilyBoardroom, GroceryPlanning, SchoolActivities, AppointmentsPrep, EventsGifts, ServiceProviders, TravelPlanning, ConciergeFiles, ConciergeProof, ConciergeSettings, ConciergeWorkflows, MonthGridCalendar.
- ✅ Comprehensive household coverage

### Section 22: Communication Layer — ✅ 75%
- ✅ `CommunicationsPage`, `business/CommunicationsCenter`
- ⚠️ Missing: unified inbox, email summary surface, follow-up detection, approve-before-send queue, send-later queue, communication analytics

### Section 23: Files/Documents/Uploads — ✅ 80%
8 files pages: FilesOverview, FilesAll, FilesSearch, FilesReview, FilesProcessing, FilesSensitive, FilesMemoryReview, FilesSettings. Plus `DocumentEditor`, `MediaWorkspace`, `NotesWorkspace`.
- ✅ File browser, search, sensitive files, processing/OCR, document editor
- ✅ Workspace pages: DocsWorkspace, SheetsWorkspace, SlidesWorkspace
- ⚠️ Missing: drag-and-drop upload zone component, batch upload UI, camera capture, upload progress/failure recovery UI, version history, file metadata panel

### Section 24: Boardroom & Mission Control — ✅ 90%
- ✅ `Boardroom`, `boardroom/BoardroomHistory`, `boardroom/BoardroomReplay`
- ✅ `business/BusinessBoardroom`, `money/MoneyBoardroom`, `concierge/FamilyBoardroom`
- ✅ `DailyPulse`
- ✅ `MissionControlHome`, `PlatformTruthDashboard`, 200+ admin pages
- ⚠️ Missing: combined life/work Boardroom, weekly Boardroom

### Section 25: Trust/Proof/Approvals — ✅ 90%
- ✅ `TrustCenter`, `ProofCenter`, `ApprovalsCenter`, `ApprovalChamber`
- ✅ `PermissionsCenter`, `business/BusinessProof`, `money/MoneyProof`, `concierge/ConciergeProof`
- ⚠️ Missing: dedicated reversible-actions center, denial/refusal history

### Section 26: Search/Command/Navigation — ✅ 85%
- ✅ `SearchPage` — cross-domain search with filters
- ✅ Shell grammar with command palette, navigation sections, display modes
- ✅ `KeyboardShortcuts` component
- ⚠️ Missing: command history page, action simulation preview, natural language search

### Section 27: Settings/Identity — ✅ 80%
- ✅ `SettingsPage`, `UserProfilePage`, notification settings, Google connected accounts
- ⚠️ Missing: dedicated accessibility settings page, device settings page, trusted device manager, environment switcher, backup/restore center

### Section 28: Mobile Trust Companion — ✅ 85%
9 mobile pages: MobileHome, MobileApprovals, MobileApprovalDetail, MobileBoardroom, MobileProof, MobileReceiptDetail, MobileAlerts, MobileSettings, MobileWorkflowDetail.
- ⚠️ Missing: secure device enrollment, emergency halt, file/image handoff

### Section 29: Design System — ✅ 90%
- ✅ Shell grammar (frames, lanes, density, display modes, domain themes)
- ✅ Design tokens in tailwind config
- ✅ Trust-state color system, warning vs critical
- ✅ Motion tokens, reduced-motion via `useReducedMotion`
- ✅ Proof-visible UI primitives
- ⚠️ Missing: formal radii system documentation, upload states standards

---

## Summary Table

| Area | Score | Action Needed |
|------|-------|---------------|
| Setup PRD & philosophy | 97% | None |
| State machine | 95% | Add missing global states |
| Data models | 70% | **Create typed profile contracts** |
| Service contracts | 50% | **Extract services from components** |
| Event model | 15% | **Create setup event taxonomy** |
| Persistence/resume | 90% | Minor schema enrichment |
| Error/fallback | 85% | None critical |
| Handoff contracts | 60% | **Create typed handoff payloads** |
| QA framework | 40% | Add E2E tests |
| Shell surfaces | 95% | Add focus mode page |
| Business OS | 95% | Minor |
| Finance OS | 90% | Minor |
| Concierge | 95% | None |
| Communication | 75% | Add unified inbox surfaces |
| Files/docs | 80% | Add upload UX components |
| Boardroom | 90% | Add weekly Boardroom |
| Trust/proof | 90% | Minor |
| Search/command | 85% | Minor |
| Settings/identity | 80% | Add settings sub-pages |
| Mobile companion | 85% | Minor |
| Design system | 90% | Minor |

**Overall: ~85%**

---

## Implementation Plan

### Priority 1: Typed Data Models (Section 8)
Create `src/packages/contracts/specialized/setup-data-models.ts` with all 15 typed profiles:
- `CapabilityProfileFull` (extend existing `HardwareCapabilities` with hasTPM, hasSecureEnclave, biometricTypes[], batteryLevel, displayClass, hardwareWarnings[])
- `SecurityBaseline`, `OwnershipProfile`, `IdentityProfile`, `RestoreProfile`, `AccessProfile`, `PrivacyProfile`, `StarterProfile`, `WorldModel`, `UseModeProfile`, `TrustProfile`, `AdvisorProfile`, `ConnectionProfile`, `FirstWinProfile`, `ArrivalSummary`

### Priority 2: Typed Handoff Contracts (Section 13)
Create `src/packages/contracts/specialized/setup-handoff-contracts.ts`:
- `DesktopHandoffPayload`, `BoardroomHandoffPayload`, `TrustCenterHandoffPayload`, `CompletionCenterHandoffPayload`
- Wire into `OSSetupExperience.finishSetup()`

### Priority 3: Setup Event Taxonomy (Section 10)
Create `src/packages/contracts/specialized/setup-events.ts`:
- Define ~25 setup event types with typed payloads
- Create `SetupEventEmitter` utility
- Wire into orchestration engine phase transitions

### Priority 4: Service Contract Extraction (Section 9)
Create thin service interfaces at `src/lib/services/setup/`:
- `HardwareCapabilityService`, `SecurityFoundationService`, `WorldModelService`, `TrustCalibrationService`, `AdvisorRecommendationEngine`, `ConnectionRecommendationEngine`, `FirstWinRecommendationEngine`, `SetupSummaryBuilder`
- Each wraps existing logic from step components into a formal service

### Priority 5: Missing Frontend Surfaces
- `src/pages/CalmFocusMode.tsx` — dedicated focus/calm surface
- `src/pages/WeeklyBoardroom.tsx` — weekly Boardroom view
- `src/pages/settings/AccessibilitySettings.tsx`, `DeviceSettings.tsx`, `TrustedDeviceManager.tsx`
- `src/pages/CommunicationInbox.tsx` — unified communication inbox

### Files to Create
- `src/packages/contracts/specialized/setup-data-models.ts`
- `src/packages/contracts/specialized/setup-handoff-contracts.ts`
- `src/packages/contracts/specialized/setup-events.ts`
- `src/lib/services/setup/index.ts` (service barrel)
- `src/lib/services/setup/hardware-capability-service.ts`
- `src/lib/services/setup/world-model-service.ts`
- `src/lib/services/setup/trust-calibration-service.ts`
- `src/lib/services/setup/advisor-recommendation-engine.ts`
- `src/lib/services/setup/connection-recommendation-engine.ts`
- `src/lib/services/setup/first-win-recommendation-engine.ts`
- `src/lib/services/setup/setup-summary-builder.ts`
- `src/pages/CalmFocusMode.tsx`
- `src/pages/WeeklyBoardroom.tsx`
- `src/pages/settings/AccessibilitySettings.tsx`
- `src/pages/settings/DeviceSettings.tsx`
- `src/pages/settings/TrustedDeviceManager.tsx`
- `src/pages/CommunicationInbox.tsx`

### Files to Edit
- `src/packages/contracts/specialized/setup-orchestration.ts` — extend `HardwareCapabilities`
- `src/lib/engines/setup-orchestration-engine.ts` — emit events on transitions, use typed profiles
- `src/components/sita/OSSetupExperience.tsx` — wire typed handoff payload to `finishSetup()`
- `src/App.tsx` — add routes for new pages

### Risk
Low-medium. Data models and event taxonomy are additive. Service extraction wraps existing logic. New pages are thin. Core architecture remains untouched.
