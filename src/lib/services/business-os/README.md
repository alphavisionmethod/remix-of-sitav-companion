# Business OS Services — Authority & Type Conventions

## Layer responsibility

`src/lib/services/business-os/*` is the **side-effect layer** for the
Business OS domain. Services own:

- All persistence (Supabase reads/writes, `localStorage`, etc.)
- Telemetry, receipts, and outbound integrations
- Composition of pure engine logic (`src/domains/engines/*`) into
  workflows callable from UI modules and edge orchestrators

Services MUST NOT contain pure scoring or recovery rules — those live in
`src/domains/engines/*`. Services orchestrate engines and persist results.

## Type conventions

1. **Canonical entity types** (`Lead`, `Invoice`, `CRMAccount`,
   `CRMContact`, `RevenueLeakRecord`, `StaleLeadState`,
   `CollectionsEscalationPacket`, `RevenueAutopilotKpiSummary`, …) are
   imported from `@/domains/business` — the single canonical surface.
   They MUST NOT be redefined inside a service.

2. **Service-local DTOs** (`ScoredLeadResult`, `RecoveryPlan`,
   `Proposal`, `Quote`, `Opportunity`, `OpportunityScore`,
   `RankedOpportunity`, `HealthScoreBreakdown`, `CallbackEntry`,
   `ReactivationCandidate`, `LeadIntakePayload`, `StaleLeadReport`,
   `NoShowEvent`, `NoShowRecoveryAction`, `RecoveredValueEntry`,
   `RecoveryLedgerSummary`, `BusinessBoardroomPacket`, `CollectionsStatus`,
   `WebsitePage`, `PageContentBlock`, `SEOConfig`, `DomainMapping`,
   `AnalyticsHook`, `WebsiteStats`, `TimelineEvent`, `FollowUpAction`,
   `ContactTimelineEntry`, `InvoiceLink`, `AccountHealthRollup`) are
   intentionally narrower than the corresponding canonical contracts in
   `@/packages/business-contracts`. They are operational shapes computed
   inside services and do not represent the persisted record.

   Example: the canonical `OpportunityRecord` carries 25+ fields
   (currency, productLines, tags, score, metadata…). The service-local
   `Opportunity` DTO carries only the 10 fields needed by the scoring
   workflow. Promoting it to the canonical record would force every
   caller to provide fields the service never uses.

3. **New shared types** that more than one service or any UI module
   needs MUST be promoted to `@/packages/business-contracts/*` (and
   re-exported via `@/domains/business`). Do not duplicate types
   between services.

## Import convention

```ts
// ✅ Canonical
import type { Lead, Invoice, RevenueLeakRecord } from "@/domains/business";

// ❌ Avoid going around the canonical surface
import type { Lead } from "@/packages/business-contracts";
import type { RevenueLeakRecord } from "@/packages/business-contracts/revenue-autopilot";
```
