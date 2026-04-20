# SITA OS — Domain Manifest System

## Overview

The Domain Manifest System provides a canonical, typed declaration for every domain in SITA OS. Each manifest declares the domain's entities, workflows, shell integration, cross-domain events, truth model, AI integration, file handling, and boardroom escalation rules.

## Architecture

```
src/lib/domain-system/
├── domain-manifest.ts          # Core types (DomainManifest, DomainEntity, etc.)
├── domain-registry.ts          # Queryable registry with lookup helpers
├── domain-completeness.ts      # Scoring engine (7 checks, 100pts max)
├── shell-command-provider.ts   # Aggregates commands for shell integration
├── index.ts                    # Barrel exports
└── manifests/
    ├── business-manifest.ts    # Business OS (12 entities, 8 workflows)
    ├── finance-manifest.ts     # Finance OS (14 entities, 10 workflows)
    ├── concierge-manifest.ts   # Concierge OS (15 entities, 7 workflows)
    ├── platform-manifest.ts    # Platform Services (8 entities, 2 workflows)
    └── cross-domain-manifest.ts # 15 cross-domain event flows
```

## Adding a New Domain

1. Create `src/lib/domain-system/manifests/{domain}-manifest.ts`
2. Implement `DomainManifest` interface with all required fields
3. Register in `domain-registry.ts` manifests record
4. Re-export from `index.ts`

## Completeness Scoring

| Check | Max Points | What It Measures |
|-------|-----------|------------------|
| Real Ownership | 15 | Owner declared, version set |
| Canonical Data Model | 20 | Entity count, persistence, searchability |
| Real Workflow Layer | 20 | Workflow count, approval gates, receipt emission |
| Shell Integration | 15 | Launcher, commands, search providers, notifications |
| Truth/Trust Visibility | 15 | Freshness rules, data classification, deterministic fields |
| Cross-Domain Events | 10 | Event flow declarations |
| AI Integration | 5 | Advisor and capability declarations |

Grades: A (≥90%), B (≥75%), C (≥60%), D (≥40%), F (<40%)

## Cross-Domain Event Patterns

Events flow between domains via the `crossDomainEventFlows` registry. Each flow declares source event, target action, priority, and consequence description. The shell and orchestration layers use this registry for routing.

## Shell Integration

The `shell-command-provider.ts` aggregates all domain commands into a searchable index used by the command palette. Search uses keyword matching with scoring for exact, prefix, and substring matches.
