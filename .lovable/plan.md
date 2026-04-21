

# OS-App Experience Unification — Implementation Plan

## Summary

Create a canonical experience layer (`src/platform/experience/`) that unifies the OS shell and app product design language into one coherent system. This layer bridges the existing design token foundations (`sita-design-tokens.ts`, `nova-os.ts`, `app-window-system.ts`), shell grammar (`shell-grammar/`), component taxonomy (`component-family-taxonomy.ts`), layout grammar (`layout-grammar-map.ts`), and trust surface registry (`truth-surface-registry.ts`) into explicit contracts. Accompanied by a generator script and 8 validators producing 9 generated proof artifacts.

## Existing Systems to Preserve and Extend

| System | Location | Role |
|---|---|---|
| Design tokens (4-surface hierarchy, domain atmosphere, typography, motion, badges) | `src/platform/design-system/sita-design-tokens.ts` | Token foundation |
| NovaOS materials, depth, shadows, shapes, motion | `src/platform/design-system/nova-os.ts` | Shell-level materials |
| App window system (spacing, type, materials, shadows, chrome) | `src/platform/design-system/app-window-system.ts` | App-level materials |
| Domain atmospheres | `src/platform/design-system/domain-atmospheres.ts` | Per-domain personality |
| Snap zones | `src/platform/design-system/snap-zones.ts` | Window snapping |
| Shell grammar (frames, navigation, lanes, density, modes, contexts) | `src/packages/shell-grammar/index.ts` | Shell behavior rules |
| Design tokens package (colors, spacing, typography, radius, shadows, motion, trust/workflow/proof states) | `src/packages/design-tokens/index.ts` | Cross-plane tokens |
| Component family taxonomy (19 primitives + 5 lib-ui families) | `src/lib/frontend/component-family-taxonomy.ts` | Component classification |
| Layout grammar map (10 layout patterns) | `src/lib/frontend/layout-grammar-map.ts` | Page layout rules |
| Truth surface registry (20 entries) | `src/lib/frontend/truth-surface-registry.ts` | AI disclosure mapping |
| Page state contract | `src/lib/frontend/page-state-contract.ts` | Page state rules |
| Product state grammar (13 states) | `src/platform/product/state-grammar.ts` | Unified UX states |
| Trust explanation layer | `src/platform/product/trust-explanation-layer.ts` | Trust badge/explanation model |
| AppSurface component | `src/components/sita/surfaces/AppSurface.tsx` | Surface level wrapper |
| FloatingWindow (887 lines) | `src/components/sita/shell/FloatingWindow.tsx` | Shell window chrome |
| AppWindow (271 lines) | `src/components/sita/os/AppWindow.tsx` | OS app window chrome |
| DomainAppShell | `src/components/sita/shell/DomainAppShell.tsx` | Domain app container |
| WindowCompositor | `src/components/sita/os/WindowCompositor.tsx` | Window render layer |
| Layer opacity engine | `src/hooks/useLayerOpacity.ts` | 4-layer opacity system |
| Notification center/panel | `src/components/sita/NotificationCenter.tsx`, `NotificationPanel.tsx` | Notification surfaces |
| Command palette | `src/components/sita/CommandPalette.tsx` | Global command surface |
| SystemMenuBar | `src/components/sita/shell/SystemMenuBar.tsx` | Shell menu bar |
| ControlCenter | `src/components/sita/shell/ControlCenter.tsx` | Shell control center |

## Identified Drift Points

1. **Two window chrome systems**: `FloatingWindow.tsx` (shell) and `AppWindow.tsx` (OS) use different shadow values, drag implementations, and chrome heights but should share the same visual grammar.
2. **Duplicate domain atmosphere definitions**: `sita-design-tokens.ts` defines `DomainAtmosphere` with `accentHsl/tone` fields; `domain-atmospheres.ts` defines a separate `DomainAtmosphere` with `contrast/warmth/shadowDepth` fields. Both cover the same 5 domains.
3. **Token hierarchy gap**: `nova-os.ts` (shell-level glass/shadows) and `app-window-system.ts` (app-level materials/shadows) have overlapping shadow values with no explicit tier relationship.
4. **No explicit visual tier contract**: Nothing declares which tokens/materials apply at shell level vs app level vs admin level vs trust surfaces.

## Phase 1 -- Core Experience Contracts (7 files)

Create `src/platform/experience/`:

### 1. `os-app-experience-contract.ts`
Defines the canonical relationship between OS shell and app layers:
- Shell layer: owns desktop, dock, menu bar, control center, window compositor, notification dropdown, command palette
- App layer: owns internal navigation, domain content, domain command palettes, in-app settings
- Shared system: surface hierarchy (0-3), trust badges, state grammar, typography scale, motion configs
- Merge rules: when shell chrome yields to app chrome (fullscreen), when app adopts shell rules (notifications, global search results)
- Context handoff declarations: focus transfer, notification routing, search result scoping

### 2. `visual-tier-system.ts`
Defines 5 visual tiers referencing existing token systems:
- `TIER_SYSTEM_SHELL` -- uses `MATERIALS` from `nova-os.ts`, `DEPTH_LAYERS`, glassmorphic surfaces
- `TIER_PRODUCT_APP` -- uses `APP_MATERIALS`/`APP_SHADOWS` from `app-window-system.ts`, `SURFACE_TOKENS` from `sita-design-tokens.ts`
- `TIER_OPERATOR_ADMIN` -- inherits app tier with reduced chrome intensity, higher density
- `TIER_SUPPORT_TRUST` -- uses trust badge grammar from `design-tokens`, evidence chain from `trust-explanation-layer.ts`
- `TIER_DEGRADED_RECOVERY` -- uses state grammar from `product/state-grammar.ts`, reduced motion, muted palette

Each tier declares: token source references, spacing rules, surface density, elevation rules, typography hierarchy, chrome intensity, and what must remain shared across tiers.

### 3. `shell-app-merge-grammar.ts`
Defines how apps appear within the OS shell:
- Window mode: app inside `FloatingWindow`/`AppWindow` with traffic-light chrome, title bar yields to app toolbar on scroll
- Fullscreen mode: shell menu bar stays, dock auto-hides, app takes remaining viewport
- Browser/web fallback: route-based rendering with `DomainAppShell` as container
- Mobile: stacked layout, no window chrome, tab-bar navigation
- Embedding rules: app cannot override shell depth layers, app commands merge into global command palette, app notifications route through notification center

### 4. `window-chrome-grammar.ts`
Unifies window/panel/overlay chrome referencing existing values:
- Window chrome: `APP_CHROME` (title bar 40px, toolbar 36px, corner radius 16px) as canonical
- Panel chrome: `DetailDrawer`, `SlidePanel` -- inherits app chrome radius, uses `APP_MATERIALS.sidebarBg`
- Modal/dialog chrome: shadcn Dialog + frostedGlass material overlay
- Dock chrome: glass material from `nova-os.ts`
- System surfaces: menu bar material from `nova-os.ts`
- Declares which chrome properties are shared (radius, border treatment) and which differ intentionally (depth layer, backdrop blur intensity)

### 5. `state-visual-grammar.ts`
Maps the 13 `ProductState` values from `product/state-grammar.ts` to concrete visual tokens:
- Each state mapped to: icon (from state-grammar), color token (from design-tokens `COLORS`), surface treatment, animation behavior, badge variant
- Declares that shell-level and app-level surfaces must render identical state presentations
- References existing components: `PageSkeleton`, `SectionSkeleton`, `EmptyState`, `EmptyStateCTA`, `DegradedStateBanner`, `OfflineBanner`, `ErrorBoundary`

### 6. `trust-visual-grammar.ts`
Unifies trust/explanation rendering:
- Maps `TrustBadgeLevel` (6 levels from `trust-explanation-layer.ts`) to visual tokens from `BADGE_STYLES` (7 intents from `sita-design-tokens.ts`)
- References existing trust components: `TrustBadge`, `TrustStateBadge`, `StateBadge`, `SurfaceTrustStrip`, `SourceOfTruthDisclosure`, `AIConfidenceDisclosure`
- Declares trust surface placement rules: always top-right of content area, consistent z-index, same typography (`trustAnnotation` from `SITA_TYPE`)

### 7. `index.ts`
Barrel export for all experience contracts.

## Phase 2 -- Supporting Contracts (11 files)

### 8. `design-token-bridge.ts`
Maps token systems to tiers:
- `nova-os.ts` tokens -> `TIER_SYSTEM_SHELL`
- `app-window-system.ts` tokens -> `TIER_PRODUCT_APP`
- `sita-design-tokens.ts` -> shared across all tiers
- `design-tokens/index.ts` -> canonical semantic tokens
- Flags where overlapping values exist (e.g., dual shadow definitions)

### 9. `component-tier-map.ts`
Maps the 24 component families from `component-family-taxonomy.ts` to visual tiers. Each family declares which tiers it appears in and whether it has tier-specific variants.

### 10. `layout-merge-map.ts`
Maps the 10 layout patterns from `layout-grammar-map.ts` to shell/app merge behavior (whether shell chrome is visible, which navigation system is active, how sidebar interacts with shell).

### 11. `motion-grammar.ts`
Unifies motion configs: `NOVA_MOTION` (shell), `DOMAIN_MOTION` (app), `MOTION` (tokens). Declares shared spring defaults and tier-specific overrides. References existing `AppTransitions.tsx`.

### 12. `navigation-merge-map.ts`
Declares how shell navigation (SystemMenuBar, dock, desktop icons) and app navigation (AppSidebarNav, tab groups, breadcrumbs) coexist. References `shell-grammar` `NavigationSection` and `route-plane-map`.

### 13. `notification-merge-map.ts`
Declares notification routing: shell-level notifications (NotificationDropdown, DesktopNotifications) vs app-level notifications (in-app toasts). Single notification center model. References `notification-center-model.ts`.

### 14. `command-surface-merge-map.ts`
Declares command/search routing: global CommandPalette (shell) + DomainCommandPalette (app) + UniversalCommandSurface. How results merge, keyboard shortcut ownership. References `command-search-model.ts`.

### 15. `settings-merge-map.ts`
Declares settings ownership: shell-level (appearance, accessibility, sound) vs app-level (domain preferences) vs operator-level (admin policies). References `settings-coherence-map.ts`.

### 16. `responsive-coherence-map.ts`
Declares responsive behavior per tier: desktop windowed (full shell), desktop fullscreen (minimal shell), browser/web (route-based), mobile (no shell chrome). References `mobile-adaptive-policy.ts`.

### 17. `brand-surface-policy.ts`
Declares branding rules: shell-level branding (SITA logo in menu bar, dock), app-level branding (domain accent colors from `DOMAIN_ATMOSPHERE`), admin-level (neutral). What must stay consistent (logo, font family, trust language), what may vary (accent hue, card radius, motion speed).

### 18. `window-app-surface-map.ts`
Maps each app type to its window behavior (default size, resizable, snap-eligible, fullscreen-capable). References `app-window-system.ts` chrome defaults and `snap-zones.ts`.

## Phase 3 -- Generator Script (1 file)

### `scripts/experience/generate-experience-artifacts.ts`

Generates 9 artifacts in `generated/`:
- `os-app-experience-closure.json` -- shell/app merge contract completeness
- `visual-tier-audit.json` -- tier token coverage and overlap detection
- `window-app-visual-coherence.json` -- window/panel/overlay chrome consistency
- `shell-app-layout-coherence.json` -- layout pattern merge coverage
- `state-visual-coherence.json` -- state rendering consistency across tiers
- `trust-surface-visual-coherence.json` -- trust/explanation surface consistency
- `command-notification-settings-coherence.json` -- shared surface coherence
- `responsive-coherence-report.json` -- responsive behavior per tier
- `component-tier-drift-report.json` -- component families with tier mismatches

## Phase 4 -- Validators (8 scripts)

All in `scripts/experience/`, using `emitGateReport` from `scripts/validation/_lib/`:

1. `check-os-app-experience-contract.ts` -- verifies contract file exists and is structurally complete
2. `check-visual-tier-coherence.ts` -- verifies all 5 tiers have token source declarations
3. `check-window-app-visual-coherence.ts` -- verifies window chrome values are consistent between FloatingWindow and AppWindow
4. `check-state-visual-coherence.ts` -- verifies all 13 ProductState values have visual mappings
5. `check-trust-surface-coherence.ts` -- verifies all 6 TrustBadgeLevel values have visual token mappings
6. `check-command-notification-settings-coherence.ts` -- verifies merge maps reference existing components
7. `check-component-tier-drift.ts` -- verifies component families are mapped to tiers
8. `check-responsive-coherence.ts` -- verifies responsive map covers all layout patterns

## Technical Details

- All contracts are TypeScript `as const` readonly registries with type exports
- Contracts reference existing token/component systems by import path, not by duplicating values
- The `design-token-bridge.ts` explicitly maps existing overlapping token systems to tiers, serving as the canonical "which tokens for which surface" resolver
- Window chrome grammar references specific numeric values from `APP_CHROME` and `NOVA_SHADOWS` rather than inventing new ones
- Approximately 20 new files total: 18 contracts, 1 generator, 8 validators (+ barrel export)
- No existing files are modified or deleted
- No new React components, pages, or routes are created
- The experience layer is a governance/contract layer that existing components can reference

## No-Duplication Approach

This layer does NOT create new design tokens, materials, or components. It creates the contract layer that:
- Declares which existing tokens belong to which tier
- Declares how existing shell and app components relate
- Detects drift between the two window chrome implementations
- Produces proof artifacts showing coherence status

The duplicate `DomainAtmosphere` types in `sita-design-tokens.ts` and `domain-atmospheres.ts` will be flagged in the `visual-tier-audit.json` artifact as a known drift point requiring future consolidation, but no files will be modified in this phase.

