

# SITA OS — Comprehensive Test Suite Plan

## Current Test State

| Category | Exists | Coverage |
|----------|--------|----------|
| Unit tests (vitest) | 52 files in `src/test/` | Mostly shallow — many just check `toBeDefined()` or `toBeInstanceOf()` |
| E2E tests (playwright) | 7 files in `e2e/` | Good critical-flows coverage, some shallow route-load checks |
| Integration tests | 0 | None |
| Component render tests | 2 (boot-flow, lock-screen) | Nearly zero component coverage |

## What This Plan Delivers

**78 new test files** across 3 tiers, covering the actual logic and components in the repo — not placeholder `expect(true).toBe(true)` tests.

---

## Tier 1 — Unit Tests (Vitest) — 40 new test files

Testing pure logic functions with real inputs/outputs.

### No-Hallucination Engine (6 tests)
| File | Tests |
|------|-------|
| `src/lib/no-hallucination/__tests__/confidence.test.ts` | `createConfidenceEnvelope` with missing inputs, stale data, contradictions, score clamping, risk class mapping |
| `src/lib/no-hallucination/__tests__/staleness.test.ts` | `evaluateStaleness` with fresh/aging/stale/critical sources, domain thresholds, custom overrides |
| `src/lib/no-hallucination/__tests__/grounding.test.ts` | `buildGroundingReport` verbatim vs derived fields, ungrounded claims, ambiguity detection |
| `src/lib/no-hallucination/__tests__/contradiction.test.ts` | `detectContradictions` with matching values, conflicting values, material severity |
| `src/lib/no-hallucination/__tests__/refusal.test.ts` | `evaluateRefusal` thresholds, `createCleanRefusal` output shape |
| `src/lib/no-hallucination/__tests__/truth-boundaries.test.ts` | `getTruthBoundary`, `isDeterministicField`, domain boundary lookups |

### Core Services (8 tests)
| File | Tests |
|------|-------|
| `src/lib/core-services/__tests__/event-bus.test.ts` | Publish/subscribe, wildcard matching, dead-letter queue, replay, tenant scoping |
| `src/lib/core-services/__tests__/policy-engine.test.ts` | Policy evaluation with various risk tiers, amounts, domains; deny/allow/require-approval outcomes |
| `src/lib/core-services/__tests__/workflow-engine.test.ts` | Workflow creation, step execution, status transitions |
| `src/lib/core-services/__tests__/receipt-service.test.ts` | Receipt creation, receipt chain integrity |
| `src/lib/core-services/__tests__/executor-service.test.ts` | Execution chain, single choke point enforcement |
| `src/lib/core-services/__tests__/approval-service.test.ts` | Approval request, dual-approval, timeout |
| `src/lib/core-services/__tests__/search-fabric.test.ts` | Search indexing, query matching, domain filtering |
| `src/lib/core-services/__tests__/fraud-sentinel.test.ts` | Fraud signal detection, risk scoring |

### Capabilities (2 tests)
| File | Tests |
|------|-------|
| `src/lib/capabilities/__tests__/capability-registry.test.ts` | Register, invoke, list, has, overwrite warning, missing capability error |
| `src/lib/capabilities/__tests__/capability-router.test.ts` | Route capability to correct handler based on key |

### Dual Reality (4 tests)
| File | Tests |
|------|-------|
| `src/lib/dual-reality/__tests__/reality-mode-registry.test.ts` | Mode registration, lookup, default mode |
| `src/lib/dual-reality/__tests__/reality-mode-resolver.test.ts` | Resolve mode from context, fallback behavior |
| `src/lib/dual-reality/__tests__/demo-scenario-loader.test.ts` | Load scenario by key, missing scenario handling |
| `src/lib/dual-reality/__tests__/demo-policy-engine.test.ts` | Demo policy evaluation, demo-specific rules |

### Hooks (6 tests)
| File | Tests |
|------|-------|
| `src/hooks/__tests__/use-reality-provider.test.ts` | `resolveByMode` — real data, empty data, demo data, array empty check |
| `src/hooks/__tests__/use-global-search.test.ts` | Search query state, results filtering |
| `src/hooks/__tests__/use-proof-chain.test.ts` | Proof chain building, verification |
| `src/hooks/__tests__/use-brain-core.test.ts` | Brain core message handling, advisor routing |
| `src/hooks/__tests__/use-admin-data.test.ts` | Admin data fetching, CAI hook wiring |
| `src/hooks/__tests__/use-domain-data.test.ts` | Domain data resolution by mode |

### Persistence (4 tests)
| File | Tests |
|------|-------|
| `src/lib/persistence/__tests__/event-bus-persistence.test.ts` | Event serialization, persist call shape |
| `src/lib/persistence/__tests__/policy-engine-persistence.test.ts` | Policy evaluation persistence |
| `src/lib/persistence/__tests__/supabase-adapters.test.ts` | Adapter creation, table mapping |
| `src/lib/persistence/__tests__/persistable.test.ts` | Persistable interface compliance |

### Services (6 tests)
| File | Tests |
|------|-------|
| `src/lib/services/auth/__tests__/auth-service.test.ts` | Auth state management |
| `src/lib/services/billing/__tests__/billing-service.test.ts` | Billing calculation, tier enforcement |
| `src/lib/services/model-router/__tests__/model-router.test.ts` | Model selection by advisor/intent |
| `src/lib/services/payment-execution-service/__tests__/payment-execution.test.ts` | Payment validation, execution flow |
| `src/lib/services/sovereign-calculation/__tests__/sovereign-calc.test.ts` | Sovereignty score calculation |
| `src/lib/services/self-healing/__tests__/self-healing.test.ts` | Self-healing detection, auto-remediation |

### Utilities (4 tests)
| File | Tests |
|------|-------|
| `src/lib/__tests__/utils.test.ts` | cn() utility, class merging |
| `src/lib/__tests__/cross-domain.test.ts` | Cross-domain data point building |
| `src/lib/__tests__/sita-kernel.test.ts` | Kernel initialization, event dispatch |
| `src/lib/__tests__/continuity-engine.test.ts` | Continuity state management |

---

## Tier 2 — Component / Integration Tests (Vitest + RTL) — 22 new test files

Testing React components render correctly with proper props and context.

### Core Components (10 tests)
| File | Tests |
|------|-------|
| `src/components/sita/__tests__/DemoModeBadge.test.tsx` | Renders in demo mode, hides in live mode, forceShow, compact mode |
| `src/components/sita/__tests__/ErrorBoundary.test.tsx` | Catches errors, displays fallback |
| `src/components/sita/__tests__/SitaCard.test.tsx` | Renders with title, children, className |
| `src/components/sita/__tests__/EmptyStateCard.test.tsx` | Renders message, CTA button |
| `src/components/sita/__tests__/PageSkeleton.test.tsx` | Loading skeleton renders |
| `src/components/sita/__tests__/StateBadge.test.tsx` | Badge variants render correctly |
| `src/components/sita/__tests__/TrustBadge.test.tsx` | Trust level display |
| `src/components/sita/__tests__/SitaPageHeader.test.tsx` | Title, subtitle, actions render |
| `src/components/sita/__tests__/CommandPalette.test.tsx` | Opens, accepts input, shows results |
| `src/components/sita/__tests__/ShellLayout.test.tsx` | Layout renders with sidebar and content |

### Context Providers (5 tests)
| File | Tests |
|------|-------|
| `src/contexts/__tests__/DemoModeProvider.test.tsx` | Surface registration, counts, integrity score |
| `src/contexts/__tests__/DataModeContext.test.tsx` | isDemoMode toggle, persistence |
| `src/contexts/__tests__/AuthContext.test.tsx` | Auth state, user loading, sign-out |
| `src/contexts/__tests__/ThemeContext.test.tsx` | Theme toggle, dark mode default |
| `src/contexts/__tests__/ConnectivityContext.test.tsx` | Online/offline state |

### Page Integration (7 tests)
| File | Tests |
|------|-------|
| `src/pages/__tests__/DailyPulse.test.tsx` | Renders with demo data, shows KPI cards |
| `src/pages/__tests__/BusinessCenter.test.tsx` | Renders CRM section, customer list |
| `src/pages/__tests__/MoneyCenter.test.tsx` | Renders financial overview |
| `src/pages/__tests__/Boardroom.test.tsx` | Renders boardroom view with DemoModeBadge |
| `src/pages/__tests__/SettingsPage.test.tsx` | Settings form renders with controls |
| `src/pages/__tests__/NotFound.test.tsx` | 404 page renders with back link |
| `src/pages/__tests__/PersonalBrain.test.tsx` | Chat interface renders |

---

## Tier 3 — E2E Tests (Playwright) — 8 new test files

Testing full user journeys through the app.

| File | Tests |
|------|-------|
| `e2e/daily-pulse.spec.ts` | Demo mode → Daily Pulse loads → KPI tiles visible → no error boundary |
| `e2e/money-center.spec.ts` | Demo mode → Money Center → financial data visible → navigation between tabs |
| `e2e/boardroom.spec.ts` | Demo mode → Boardroom → review slides load → DemoModeBadge visible |
| `e2e/advisor-chat.spec.ts` | Demo mode → AI Advisor → chat input visible → send message → response appears |
| `e2e/command-palette.spec.ts` | Open palette → type query → results appear → select result → navigates |
| `e2e/admin-routes.spec.ts` | Demo mode → admin dashboard → truth registry → launch readiness → all load |
| `e2e/owner-mode.spec.ts` | Demo mode → owner center → approvals → policy editor → all load |
| `e2e/responsive.spec.ts` | Key pages at mobile (375px) and desktop (1280px) viewports — no overflow, no crash |

---

## Implementation Order

1. **Tier 1a** — No-Hallucination + Core Services unit tests (14 files) — these are pure logic, most valuable
2. **Tier 1b** — Capabilities + Dual Reality + Persistence + Utilities unit tests (14 files)
3. **Tier 1c** — Hooks + Services unit tests (12 files)
4. **Tier 2a** — Component tests (10 files)
5. **Tier 2b** — Context + Page integration tests (12 files)
6. **Tier 3** — E2E tests (8 files)
7. **Final** — Run full suite, fix any failures, verify CI passes

## Technical Details

- All unit/integration tests use Vitest + React Testing Library (already configured)
- E2E tests use Playwright (already configured)
- Component tests wrap in necessary providers (DataModeContext, DemoModeProvider, QueryClientProvider)
- Mock Supabase client for persistence tests using `vi.mock()`
- Each test file follows the `__tests__/` co-location pattern for discoverability
- Existing 52 test files in `src/test/` are left untouched

## Files Created: ~70 new test files
## Files Modified: 0 (no changes to existing code)

