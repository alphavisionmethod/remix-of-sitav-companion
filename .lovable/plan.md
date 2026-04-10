

# Intelligence Architecture Enhancement Plan

## Audit Results

**Fully implemented and verified (no changes needed):**
- 12 strategic intelligence engines (A–L) in `src/lib/strategic-intelligence/` — all real logic, no stubs
- 12 admin dashboards in `src/pages/admin/strategic/` — all wired to persistence hooks
- All 12 routes registered in `AdminRoutes.tsx`
- 4 dedicated persistence layers: intelligence-asset, quality-floor, operator-taste, compute-governance
- Generic engine persistence adapter (`engine_state` + `engine_events` tables)
- Barrel export with all types and functions

**What's missing — the REST API layer (contracts A–J from spec):**

The `admin-intelligence` edge function only has 3 endpoints (`anomalies`, `forecast`, `optimize`). None of the 10 API contract families specified in the prompt exist as server-side endpoints:

| Contract | Endpoint Pattern | Status |
|----------|-----------------|--------|
| A. Asset Library | `GET/POST /assets`, `POST /assets/:id/reuse-evaluate` | Missing |
| B. Differential Reasoning | `POST /differential-reasoning/evaluate` | Missing |
| C. Intelligence Packets | `POST /packets/compile`, `GET /packets/:id` | Missing |
| D. Efficiency Scores | `GET /efficiency/scores`, `GET /scores/:id/history` | Missing |
| E. Outcome Economics | `GET /outcomes/economics`, `GET /high-value-categories` | Missing |
| F. Escalation | `POST /escalations` | Missing |
| G. Digests | `GET/POST /digests` | Missing |
| H. Patterns | `GET/POST /patterns`, `POST /:id/generalize` | Missing |
| I. Prompt Profiles | `GET/POST /prompt-profiles`, `POST /:id/evaluate` | Missing |
| J. Overview | `GET /overview` (unified dashboard API) | Missing |

The dashboards currently work by querying Supabase directly via client-side persistence hooks. The API layer adds programmatic/server-to-server access and enables the intelligence pipeline to be called from edge functions and agents.

## Implementation Plan

### 1. Build `intelligence-api` edge function (~400 lines)
Single edge function with path-based routing covering all 10 contract families. Each handler:
- Validates input with Zod
- Uses service-role Supabase client for DB access
- Calls the actual engine functions (imported logic patterns applied server-side)
- Returns the exact response shapes from the spec

Endpoints implemented:
- `GET /assets` — list with filters (domain, type, confidence, freshness, verification, page, limit)
- `GET /assets/:id` — detail with usageStats
- `POST /assets` — create new asset
- `POST /assets/:id/reuse-evaluate` — evaluate reuse decision
- `POST /differential-reasoning/evaluate` — run differential analysis
- `GET /differential-reasoning/:id` — fetch prior result
- `POST /packets/compile` — compile domain packet
- `GET /packets/:id` — fetch packet
- `GET /efficiency/scores` — list efficiency scores with scope filters
- `GET /efficiency/scores/:id/history` — trend history
- `GET /outcomes/economics` — value-per-dollar view
- `GET /outcomes/high-value-categories` — high vs low value
- `POST /escalations` — log/trigger escalation
- `GET /digests` — list digests
- `POST /digests/generate` — generate digest
- `GET /patterns` — list patterns
- `POST /patterns/extract` — extract pattern from sources
- `POST /patterns/:id/generalize` — move to cross-tenant review
- `GET /prompt-profiles` — list prompt profiles
- `POST /prompt-profiles` — create profile
- `POST /prompt-profiles/:id/evaluate` — evaluate prompt efficiency
- `GET /overview` — unified operator dashboard snapshot

### 2. Wire the existing dashboards to use the API
Update the 6 dashboards that currently rely on `useEngineEvents` (generic event-based) to optionally call the new API for richer, structured responses:
- `CostToConfidenceDashboard` → `/efficiency/scores` + `/overview`
- `ValueRiskDashboard` → enriched from `/overview`
- `TimeToTruthDashboard` → `/efficiency/scores/:id/history`
- `BenchmarkLabDashboard` → `/overview`
- `IntelligenceInsuranceDashboard` → `/escalations` data
- `ReasoningReplayDashboard` → `/differential-reasoning` data

The other 6 dashboards (Capital Index, Quality Floor, Decay Monitor, Intelligence Market, Portfolio Allocation, Operator Taste) already use dedicated persistence hooks and are correctly wired.

### 3. Connect pipeline to API persistence
Ensure `processSignal()` in `intelligence-pipeline.ts` writes results to the persistence layer so dashboards show real pipeline output — append engine events for each pipeline stage completion.

### Technical Details

**File changes:**

| File | Action |
|------|--------|
| `supabase/functions/intelligence-api/index.ts` | **New** — ~400 line edge function with all 10 API contract families |
| `src/lib/hooks/useIntelligenceAPI.ts` | **New** — React hooks that call the edge function for structured data |
| `src/pages/admin/strategic/CostToConfidenceDashboard.tsx` | Update to use API hook for richer data |
| `src/pages/admin/strategic/ValueRiskDashboard.tsx` | Update to use API hook |
| `src/pages/admin/strategic/TimeToTruthDashboard.tsx` | Update to use API hook |
| `src/pages/admin/strategic/BenchmarkLabDashboard.tsx` | Update to use API hook |
| `src/pages/admin/strategic/IntelligenceInsuranceDashboard.tsx` | Update to use API hook |
| `src/pages/admin/strategic/ReasoningReplayDashboard.tsx` | Update to use API hook |
| `src/lib/intelligence-architecture/intelligence-pipeline.ts` | Add persistence calls after each pipeline stage |

