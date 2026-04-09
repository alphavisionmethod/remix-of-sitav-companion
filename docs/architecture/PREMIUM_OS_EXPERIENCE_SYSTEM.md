# SITA OS — Premium OS Experience System

## Core Identity

SITA is a sovereign AI operating system for founders, families, and service businesses.
It is **not** a chatbot, not a dashboard collection, not a plugin ecosystem.

It is one coherent operating environment with:
- One sovereign brain (brain-core)
- Three canonical domain modules (business-os, finance-os, concierge-os)
- One proof/receipt chain
- One policy engine
- One memory system
- One trust model
- One workflow engine
- Thin presentation surfaces

## Design Principles

| Principle | Meaning |
|-----------|---------|
| Calm at the core | No visual noise. Quiet confidence. Premium negative space. |
| Proof over promise | Every action generates visible proof. Receipts are first-class. |
| Trust is earned | Advisors start at observe, earn autonomy through use. |
| One OS | No matter how many packs/apps installed, it feels unified. |
| Deterministic where it matters | Finance, tax, reserves use math — not LLM approximation. |
| Governed expansion | Packs add intelligence, not clutter. |

## Shell Architecture

The OS shell is built from:
- **Frame** — persistent top bar, sidebar, command palette
- **Lanes** — content lanes (primary, detail, auxiliary)
- **Density** — calm, standard, analyst modes
- **Contexts** — domain-aware (business, money, concierge, boardroom)
- **Surfaces** — thin app surfaces consuming projections

## Display Modes

| Mode | Purpose |
|------|---------|
| Calm | Minimal information, large type, generous space |
| Standard | Default balanced view |
| Focus | Single-task immersion |
| Analyst | Maximum density, all metrics visible |
| Presentation | Boardroom fullscreen, no chrome |

## Auth Flow

SITA OS authentication supports:
- **Email/password** — standard signup and login
- **Magic link** — passwordless email login
- **Demo mode** — sandboxed experience without account creation
- **Password reset** — email-based recovery flow
- **Session management** — JWT with automatic refresh rotation

Auth pages: `/auth/login`, `/auth/signup`, `/auth/reset-password`, `/auth/callback`

## Trust States

Every advisor output flows through:
```
suggestion → draft → simulated → approval-required → approved → executing → completed → verified
```

Failed states: `failed`, `rolled-back`, `escalated`

## Type Safety Status

- 0 TypeScript errors (`tsc --noEmit` clean)
- 0 `as any` in page files
- 0 `as unknown as` in page files
- 0 `useState<any>` in codebase
- All page callbacks typed with DB row types or view-model interfaces

## Cross-Domain Intelligence

Events in one domain contextually impact others:
- Business invoice paid → finance reserves update → concierge reminder cleared
- Family travel booked → finance projection updates → business calendar blocks
- Money anomaly detected → business advisor alerted → approval escalated
