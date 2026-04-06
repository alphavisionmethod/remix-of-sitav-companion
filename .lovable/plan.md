

# Playwright Full Behavioral Proof Layer — Implementation Plan

## Current State

**What exists:**
- 10 test files in `tests/e2e/customer-journey/` — all shallow route-load checks (goto → networkidle → body length > 50)
- `helpers/auth.ts` — login/logout/ensureAuthenticated
- `helpers/selectors.ts` — SEL constants (auth, nav, files, boardroom, connectors, settings, admin, states)
- `reporters/journey-reporter.ts` — structured JSON output with journey_key/mode extraction
- `playwright.config.ts` — single chromium project, journey reporter wired
- No: global setup/teardown, navigation helper, journey-recorder helper, mode helper, assertions helper, evidence helper, fixtures, per-domain selectors, split spec files, degraded tests

**Gap summary:** The spec demands ~40 files. We have ~14. Existing tests verify "page loads" only — no button clicks, form fills, state checks, mode switching, degraded handling, or evidence capture. No reusable helpers beyond auth.

## Plan

### Phase 1 — Infrastructure Files (8 new files)

| File | Purpose |
|---|---|
| `tests/e2e/global.setup.ts` | Verify base URL reachable, create auth state file via login for session reuse |
| `tests/e2e/global.teardown.ts` | Clean up auth state file |
| `tests/e2e/helpers/navigation.ts` | `navigateTo(page, route)`, `waitForRoute(page)`, `assertRouteLoaded(page)` — wraps goto + networkidle + no-error checks |
| `tests/e2e/helpers/journey-recorder.ts` | `JourneyRecorder` class — accumulates step results, emits structured JSON matching the reporter schema, attachable to test fixtures |
| `tests/e2e/helpers/mode.ts` | `switchToDemo(page)`, `switchToLive(page)`, `getCurrentMode(page)`, `assertModeBadge(page, mode)` — localStorage toggle + UI verification |
| `tests/e2e/helpers/assertions.ts` | `assertRouteLoaded`, `assertButtonClickable`, `assertCardVisible`, `assertTableRowExists`, `assertDemoBadge`, `assertLiveBadge`, `assertDegradedBanner`, `assertNoErrorState`, `assertUploadSucceeded`, `assertEmptyStateHonest` |
| `tests/e2e/helpers/evidence.ts` | `captureEvidence(page, label)` — screenshot + console errors + network failures, saved to `test-results/evidence/` |
| `tests/e2e/fixtures/test-users.ts` | Test user config (email, password, role from env vars), operator user support |

### Phase 2 — Selector Files (6 new files)

Split domain-specific selectors from the monolithic `selectors.ts`:

| File | Selectors |
|---|---|
| `tests/e2e/selectors/common.ts` | Re-exports from existing SEL + adds SIDEBAR, TOAST, LOADING, ERROR, EMPTY, MODE_TOGGLE |
| `tests/e2e/selectors/auth.ts` | LOGIN_EMAIL, LOGIN_PASSWORD, LOGIN_SUBMIT, SIGNUP, SIGN_OUT |
| `tests/e2e/selectors/files.ts` | FILES_PAGE, FILE_UPLOAD, FILE_LIST, FILE_ITEM |
| `tests/e2e/selectors/assistant.ts` | ADVISOR_PAGE, CHAT_INPUT, CHAT_SEND, CHAT_RESPONSE, DEGRADED_BANNER |
| `tests/e2e/selectors/boardroom.ts` | BOARDROOM_PAGE, SUMMARY_AREA, REFRESH, SLIDE_CARD |
| `tests/e2e/selectors/connectors.ts` | CONNECTORS_PAGE, SERVICE_CARD, CONNECT_BTN, STATUS_BADGE |
| `tests/e2e/selectors/admin.ts` | AI_RUNTIME, TEAM, CJ_REPORT, LAUNCH_TRUTH, ADMIN_NAV |

### Phase 3 — Split Spec Files (behavioral depth)

Replace shallow monolithic specs with split per-journey specs that test actual interactions:

**Auth (2 files):**
- `auth/sign-in-primary.spec.ts` — login form visible, fill + submit, lands on authenticated route, no auth loop on refresh
- `auth/sign-out-primary.spec.ts` — sign out button works, redirects to login, protected route blocked

**Core surfaces (5 files):**
- `dashboard/dashboard-load-primary.spec.ts` — loads, primary cards render, sidebar nav visible, no fatal error
- `files/files-upload-primary.spec.ts` — loads, upload button clickable, upload action (or honest degraded), file appears in list
- `assistant/assistant-chat-primary.spec.ts` — loads, input visible, send button works, response appears (or honest demo/degraded state)
- `boardroom/boardroom-summary-view-primary.spec.ts` — loads, summary renders, mode label visible, refresh works
- `connectors/connected-services-open-primary.spec.ts` — loads, service cards visible, status badges render, planned states labeled

**Settings + Admin (4 files):**
- `settings/settings-account-open-primary.spec.ts` — loads, account controls visible, identity states render
- `admin/runtime-truth-open-primary.spec.ts` — loads, dashboard widgets render
- `admin/customer-journey-report-open-primary.spec.ts` — loads, executive stats visible
- `admin/ai-team-open-primary.spec.ts` — loads, team cards/widgets render
- `admin/launch-truth-open-primary.spec.ts` — loads, readiness indicators visible

**Mode comparison (3 files):**
- `demo-vs-real/boardroom-demo-vs-real.spec.ts` — switch to demo → verify demo badge, switch to live → verify live state, content differs
- `demo-vs-real/assistant-demo-vs-real.spec.ts` — demo mode shows demo indicator, live mode shows real/degraded
- `demo-vs-real/connected-services-demo-vs-real.spec.ts` — demo shows all connected, live shows real statuses

**Degraded (2 files):**
- `degraded/assistant-provider-missing.spec.ts` — in live mode without provider, honest degraded state shown
- `degraded/connectors-unavailable.spec.ts` — disconnected connectors show honest status

### Phase 4 — Config Updates

- `playwright.config.ts`: add `globalSetup`, `globalTeardown`, `storageState` for session reuse, add `customer-journey` project with `testDir: ./tests/e2e/customer-journey`
- Update screenshot config: `screenshot: "on"` for P0 tests (evidence capture)

### Phase 5 — Remove Old Monolithic Specs

Delete the 10 shallow `tests/e2e/customer-journey/*.spec.ts` files (auth.spec.ts, files.spec.ts, etc.) since they're replaced by the split per-journey files with actual behavioral depth.

## Key Design Decisions

- **Session reuse via globalSetup**: Login once, save storageState, reuse across tests — faster, fewer auth calls
- **Evidence capture**: Every P0 test calls `captureEvidence` on failure automatically via the assertions helper
- **Mode switching**: Tests use localStorage manipulation + page reload, matching the app's `DataModeContext` implementation
- **Journey annotations**: All tests keep `[journey:key] [mode:mode]` in titles for the reporter to parse

## Files Summary

| Category | Count | Files |
|---|---|---|
| Infrastructure helpers | 8 | global.setup, global.teardown, navigation, journey-recorder, mode, assertions, evidence, test-users |
| Selector files | 7 | common, auth, files, assistant, boardroom, connectors, admin |
| Journey specs | 16 | 2 auth + 5 core + 4 admin/settings + 3 mode comparison + 2 degraded |
| Config update | 1 | playwright.config.ts |
| Deleted | 10 | Old shallow monolithic specs |
| **Total new** | **31** | |

## No database migration needed
Pure test infrastructure — TypeScript files only.

