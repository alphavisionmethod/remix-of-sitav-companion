# Partial Surface Closure Plan

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Companion to:** `PARTIAL_ROUTE_FAMILY_AUDIT.md`

## Closure approach

Each partial family receives one of three labels:

- **gate-copy** — wording adjustment + trust-ladder check, no behavioral change
- **feature-flag** — gate forward-looking wording behind `feature_flags` table entry
- **drilldown** — extend existing detail drawer with operator remediation paths

## Family-by-family recommendations

### 1. Onboarding (`/onboarding/**`)

**Action:** gate-copy

| File | Recommendation |
|---|---|
| `src/pages/onboarding/OnboardingStart.tsx` | Verify no "AI will manage X for you" autonomy overclaim |
| `src/pages/onboarding/PersonaSelect.tsx` | Confirm `[Simulated]` badge on every persona |
| `src/pages/onboarding/Complete.tsx` | Use canonical microcopy from `microcopy.ts::aiAgency` |

**Owner:** user-product team (out of scope this pass)

### 2. Boardroom (`/boardroom/**`)

**Action:** feature-flag

| File | Recommendation |
|---|---|
| `src/pages/boardroom/Briefing.tsx` | OK — receipts visible |
| `src/pages/boardroom/LearningLoop.tsx` | Gate v2 wording behind `feature_flags.boardroom_learning_loop_v2` |
| `src/pages/boardroom/Reflections.tsx` | Show outcome confidence honestly |

**Owner:** advisor-board team (out of scope this pass)

### 3. Concierge (`/concierge/**`)

**Action:** drilldown

| File | Recommendation |
|---|---|
| `src/pages/concierge/Chat.tsx` | Surface degraded-state banner when `ai_inference_receipts.status = 'degraded'` |
| `src/pages/concierge/History.tsx` | Link each message to its receipt id |

**Owner:** concierge team (out of scope this pass)

### 4. Communications (`/communications/**`)

**Action:** drilldown + gate-copy

| File | Recommendation |
|---|---|
| `src/pages/communications/Inbox.tsx` | Use `ConnectorStateBadge` per channel |
| `src/pages/communications/ChannelList.tsx` | Show "manual sync" tier for long-tail connectors explicitly |

**Owner:** communications team (out of scope this pass)

### 5. AI Runtime (`/admin/ai-runtime/**`)

**Action:** none — canonical

After this hardening pass: 10 truth panels (was 8) + this `ArchitectureHardeningTruthPanel`. No further action required.

### 6. Admin Integrations (`/admin/integrations/**`)

**Action:** drilldown

| File | Recommendation |
|---|---|
| `src/pages/admin/integrations/IntegrationsHub.tsx` | OK — already uses canonical badges |
| `src/pages/admin/integrations/ConnectorDetail.tsx` | Add reauth/degraded/failing remediation panel |

**Owner:** admin-control team (out of scope this pass)

## Why this is closure-by-recommendation, not by-rewrite

The hardening prompt's invariant: **"only on the admin AI engineer team"**. UI rewrites of user-facing partial surfaces (onboarding/boardroom/concierge/communications) and other admin domains (integrations) are explicitly out of scope.

This document records the recommendations as canonical truth. Implementation belongs to a separate flagship-surface pass owned by each domain team.

## Tracking

A follow-up issue should be opened per family with this document linked. Status: `recommended` until implementation pass. No truth drift — these recommendations remain canonical until superseded.
