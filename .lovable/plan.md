

# Digital Presence Office — Audit & Enhancement Plan

## Audit Summary

The Digital Presence Office is **extensively implemented** with 19 pages, 19 routes, ~4,000 LOC of page code, 473 LOC of demo data, full test coverage, data services, and capabilities. Every subspace from the spec exists and is functional.

## What Already Exists (All Working)

| # | Page | File | LOC | Status |
|---|------|------|-----|--------|
| 1 | Presence Gate (Hub) | PresenceGate.tsx | 88 | 17 workspace cards, health stats, quick actions |
| 2 | Presence Boardroom | PresenceBoardroom.tsx | 114 | Metrics, top/weak pages, promotions, advisor signals |
| 3 | Website Twin | WebsiteTwin.tsx | 88 | Page hierarchy tree, conversion paths, weak nodes |
| 4 | Site Builder | SiteBuilder.tsx | 85 | 8 page types, AI generator, existing pages |
| 5 | Brand Studio | BrandStudio.tsx | 122 | AI logo gen, colors, typography, assets, blocks |
| 6 | Connected Sites | ConnectedSites.tsx | 99 | 6 platforms, audit findings, AI recommendations |
| 7 | CRO Office | CROOffice.tsx | 111 | CTA analysis, trust gaps, funnel leaks, form friction, mobile |
| 8 | Ecommerce Office | EcommerceOffice.tsx | 102 | Products, collections, cart diagnostics, merchandising AI |
| 9 | Promotions Office | PromotionsOffice.tsx | 98 | Active promos, calendar, email/SMS sync |
| 10 | AI Web Team | AIWebTeam.tsx | 497 | 10 agents, observations, synthesis, disagreements, ask team |
| 11 | Error Radar | ErrorRadar.tsx | 62 | Issues + opportunities combined signal board |
| 12 | Content Freshness | ContentFreshness.tsx | 112 | Stale pages, expired offers, outdated info, inconsistencies |
| 13 | Launch War Room | LaunchWarRoom.tsx | 92 | Readiness checks, timeline, rollback plan |
| 14 | Time Machine | PresenceTimeMachine.tsx | 78 | Change timeline, before/after, impact review |
| 15 | Self-Healing Queue | SelfHealingQueue.tsx | 172 | Patches with approve/auto-apply/verify/rollback |
| 16 | App Experience Studio | AppExperienceStudio.tsx | 128 | PWA, portals, mini-apps, device preview |
| 17 | Presence Analytics | PresenceAnalytics.tsx | 149 | Traffic, source perf, page impact, promo perf, agent confidence |
| 18 | Domain/Publish Manager | DomainPublishManager.tsx | 129 | Domains, environments, publish history, publishing rules |
| 19 | DPO Onboarding | DPOOnboarding.tsx | 600 | 10-step formation ceremony with path branching |

Supporting infrastructure: `digital-presence-data-service.ts` (CRUD for 7 tables), `use-digital-presence.ts` (6 hooks), `digital-presence-capabilities.ts` (5 capabilities), `digital-presence.ts` demo data (473 LOC), test file covering all 19 pages.

## Genuine Gaps Found

### Gap 1: DemoModeBadge rendering bugs (3 files)
`DemoModeBadge` is incorrectly placed inside reusable sub-components, causing it to render dozens of times per page:
- `WebsiteTwin.tsx` line 14: inside `PageNode` — renders per tree node
- `AIWebTeam.tsx` line 178: inside `ConfidenceBar` — renders per bar
- `DPOOnboarding.tsx` line 96: inside `ToggleChip` — renders per chip

**Fix:** Remove `DemoModeBadge` from these sub-components. The parent page already renders it once.

### Gap 2: No DPO sub-navigation bar
Revenue Office has `AutomationSubNav` for persistent workspace navigation. DPO has nothing — users must navigate back to PresenceGate every time. This is a major UX gap for a 19-page workspace.

**Fix:** Create `DPOSubNav.tsx` — a compact horizontal nav bar (similar to AutomationSubNav) with key workspace links. Add it to all 18 child pages.

### Gap 3: No Revenue Office ↔ DPO cross-links
The spec emphasizes deep integration: "if a promotion is created in Revenue Office, site updates can follow." Currently zero cross-module navigation exists.

**Fix:** Add a "Revenue Office Sync" card to PresenceBoardroom showing connected modules (Funnel Studio, Campaign Office, Offers), and add a "Digital Presence" quick-link to RevenueGate.

### Gap 4: Missing "Brand Evolution Engine" concept
BrandStudio has static assets but no evolution/refresh concept. The spec calls for coherent seasonal/campaign-driven brand evolution.

**Fix:** Add a "Brand Evolution" section to BrandStudio with seasonal presets, campaign-driven style variations, and a timeline of brand changes.

### Gap 5: Site Builder lacks "Experience Rewrite" mode
The spec says users should ask "refresh homepage for this offer" and get strategy + copy + layout + variants. Current AI generator is just a one-line input.

**Fix:** Add an "Experience Rewrite" card to SiteBuilder with a richer prompt area showing what SITA will produce (strategy, copy, layout, variants, publish plan).

## Files Changed

| File | Change |
|------|--------|
| `DPOSubNav.tsx` (NEW) | Compact horizontal sub-nav for DPO workspace |
| `WebsiteTwin.tsx` | Remove DemoModeBadge from PageNode |
| `AIWebTeam.tsx` | Remove DemoModeBadge from ConfidenceBar |
| `DPOOnboarding.tsx` | Remove DemoModeBadge from ToggleChip |
| `PresenceBoardroom.tsx` | Add DPOSubNav + Revenue Office Sync card |
| `BrandStudio.tsx` | Add Brand Evolution section |
| `SiteBuilder.tsx` | Add Experience Rewrite card |
| 15 other DPO pages | Add DPOSubNav import and render |
| `PresenceGate.tsx` | Add DPOSubNav |
| `RevenueGate.tsx` | Add Digital Presence quick-link |

Total: ~1 new file, ~19 files touched, ~150 net LOC added.

