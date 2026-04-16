

# SITA OS — Domain Manifest System: Ownership, Workflows, Shell Integration & Truth Visibility

## Current State

**Strong foundations already exist:**
- `domain-runtime-service.ts`: 15 domains with runtime truth scoring (tables, RLS, edge functions, demo providers)
- `DomainId` type in `_contract-scaffold.ts`: `"business" | "finance" | "concierge" | "platform" | "cross-domain"`
- Rich contracts: `business-contracts/` (42 files), `finance-contracts/` (11+ files), `concierge-contracts/` (35 files)
- Rich service layers: `business-os/` (27 services), `finance-os/` (38 services), `concierge-os/` (21 services)
- Domain atmospheres, empty states, advisor rosters, boardroom packet compilers per domain
- Feature barrels per domain in `src/features/`
- `canonical-service-registry.ts` with ~45 services mapped

**What's missing — the "Domain Manifest" layer:**

| Gap | Description |
|-----|-------------|
| No unified Domain Manifest type | No single structure declaring a domain's entities, workflows, integrations, truth model |
| No workflow registry per domain | Services exist but canonical workflows (create→review→approve→execute) aren't declared |
| No shell integration contracts | Domains don't declare their launcher, command palette, search, and notification hooks |
| No cross-domain event map | No explicit registry of what events flow between domains |
| No domain health dashboard | Admin has runtime truth but not a unified domain completeness view |

## Implementation Plan

### 1. Domain Manifest Contract (`src/lib/domain-system/domain-manifest.ts`)

The core type every domain declares against:

```typescript
interface DomainManifest {
  id: DomainId;
  name: string;
  description: string;
  owner: string; // canonical service owner
  entities: DomainEntity[];        // what data it owns
  workflows: DomainWorkflow[];     // what workflows it enables
  shellIntegration: ShellHooks;    // launcher, search, commands, notifications
  crossDomainEvents: CrossDomainEvent[]; // events it emits/consumes
  truthModel: DomainTruthModel;    // real vs simulated, freshness rules
  aiIntegration: DomainAIConfig;   // advisor IDs, capability keys
  fileIntegration: DomainFileConfig; // file types, storage paths
  boardroomEscalation: EscalationConfig; // what gets escalated and when
}
```

With sub-types for entities (id, name, dbTable, permissions, statusStates), workflows (steps, approvals, notifications, receipts), shell hooks (launcher metadata, command palette commands, search providers, notification triggers), and truth model (freshness thresholds, simulated surfaces, data source classification).

### 2. Three Domain Manifests (Business, Finance, Concierge)

**`src/lib/domain-system/manifests/business-manifest.ts`**
- 12 entities (Lead, Customer, Deal, Invoice, Quote, Proposal, Contact, Account, Booking, ServiceOrder, Communication, Website)
- 8 workflows (Lead-to-Customer, Quote-to-Invoice, Deal Pipeline, Collection Sequence, Callback Queue, Revenue Recovery, Website Publish, Outreach Campaign)
- Shell: 6 command palette commands, 4 search providers, launcher with badges from pipeline/callback counts
- Cross-domain: `invoice.paid → finance.receivable.update`, `booking.created → concierge.calendar.block`
- AI: business advisors (revenue, operations, growth), capability keys
- Boardroom: auto-escalates deals > $50k, revenue anomalies, collection failures

**`src/lib/domain-system/manifests/finance-manifest.ts`**
- 14 entities (Transaction, Bill, Budget, Envelope, SinkingFund, Subscription, Asset, Portfolio, Receivable, DebtObligation, CapitalBucket, InvestmentThesis, Scenario, Reserve)
- 10 workflows (Bill Pay, Budget Allocation, Subscription Review, Reserve Fund, Capital Allocation, Investment Review, Debt Payoff, Scenario Simulation, Reconciliation, Tax Prep)
- Shell: 8 commands, 5 search providers, badges from bills-due/renewal-risk counts
- Cross-domain: `bill.paid → business.invoice.reconcile`, `anomaly.detected → boardroom.escalate`
- Truth: finance uses strict freshness (< 1hr for balances), deterministic calculation flag
- Boardroom: auto-escalates spend anomalies, reserve warnings, investment decisions

**`src/lib/domain-system/manifests/concierge-manifest.ts`**
- 15 entities (Schedule, Errand, Trip, Reservation, HouseholdTask, GroceryList, EventPlan, GiftPlan, SchoolActivity, Provider, FamilyMember, PackingPlan, PrepSequence, MaintenanceItem, Responsibility)
- 7 workflows (Trip Planning, Errand Bundling, Event Coordination, Household Maintenance, School Prep, Provider Booking, Gift Coordination)
- Shell: 5 commands, 3 search providers, badges from overdue errands/upcoming events
- Cross-domain: `travel.booked → finance.projection.update → business.calendar.block`
- Truth: relaxed freshness (< 4hr acceptable), heavy demo/simulated surface

### 3. Platform & Cross-Domain Manifests

**`src/lib/domain-system/manifests/platform-manifest.ts`**
- Covers: Auth, Approvals, Workflows, Notifications, Connectors, AI Gateway, Analytics, Files, Storage
- Declares platform-level shell integration (global search, system notifications, file picker)

**`src/lib/domain-system/manifests/cross-domain-manifest.ts`**
- Declares all cross-domain event flows as a typed registry
- Maps 15+ canonical cross-domain events with source→target→consequence

### 4. Domain Manifest Registry (`src/lib/domain-system/domain-registry.ts`)

Unified queryable registry:
- `getDomainManifest(id)` — returns full manifest
- `getAllDomains()` — returns all manifests
- `getDomainEntities(id)` — entities for a domain
- `getDomainWorkflows(id)` — workflows for a domain
- `getShellCommands(id?)` — all or per-domain command palette entries
- `getCrossDomainEvents()` — full event flow map
- `getDomainTruthModel(id)` — truth/freshness rules
- `getDomainCompleteness(id)` — scored completeness (entities/workflows/shell/truth all declared)

### 5. Domain Completeness Engine (`src/lib/domain-system/domain-completeness.ts`)

Scores each domain manifest against the 4.1 principles:
- Has real ownership (owner declared, service exists) — 15pts
- Has canonical data model (entities declared with DB tables) — 20pts
- Has real workflow layer (workflows with steps, not just display) — 20pts
- Has shell integration (launcher + commands + search + notifications) — 15pts
- Has truth/trust visibility (freshness rules, simulated flags, data classification) — 15pts
- Has cross-domain events (emits/consumes declared) — 10pts
- Has AI integration (advisors declared) — 5pts

### 6. Admin Dashboard (`src/pages/admin/DomainManifestDashboard.tsx`)

- Shows all domains with completeness scores
- Drill into entities, workflows, shell hooks, cross-domain events
- Color-coded by completeness (green > 80, amber > 50, red < 50)
- Shows truth model per domain (freshness, simulated surfaces)
- Links to existing domain-runtime-service truth scores

### 7. Shell Wiring: Command Palette + Search Integration

**`src/lib/domain-system/shell-command-provider.ts`**
- Aggregates all domain shell commands into a single provider
- Used by command palette to show domain-contextual commands
- Permission-filtered

### 8. Documentation

**`docs/architecture/DOMAIN_MANIFEST_SYSTEM.md`**
- Explains the manifest model, how to add a domain, completeness scoring, cross-domain event patterns

## Files Summary

| File | Action |
|------|--------|
| `src/lib/domain-system/domain-manifest.ts` | Create — Core types |
| `src/lib/domain-system/manifests/business-manifest.ts` | Create — Business domain manifest |
| `src/lib/domain-system/manifests/finance-manifest.ts` | Create — Finance domain manifest |
| `src/lib/domain-system/manifests/concierge-manifest.ts` | Create — Concierge domain manifest |
| `src/lib/domain-system/manifests/platform-manifest.ts` | Create — Platform domain manifest |
| `src/lib/domain-system/manifests/cross-domain-manifest.ts` | Create — Cross-domain event registry |
| `src/lib/domain-system/domain-registry.ts` | Create — Unified queryable registry |
| `src/lib/domain-system/domain-completeness.ts` | Create — Completeness scoring engine |
| `src/lib/domain-system/shell-command-provider.ts` | Create — Shell integration aggregator |
| `src/lib/domain-system/index.ts` | Create — Barrel |
| `src/pages/admin/DomainManifestDashboard.tsx` | Create — Admin visibility |
| `src/admin/pages/architecture/index.ts` | Edit — Add dashboard export |
| `docs/architecture/DOMAIN_MANIFEST_SYSTEM.md` | Create — Documentation |

**Total: 11 new files, 1 modified file**

## Implementation Order

1. Core types (`domain-manifest.ts`)
2. All 5 domain manifests (parallel)
3. Registry + completeness engine
4. Shell command provider
5. Admin dashboard + barrel + wiring
6. Documentation

