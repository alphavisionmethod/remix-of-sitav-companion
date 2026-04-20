

## Add Design Implementation Reference to DEMO_SITA.MD

### Problem

The DEMO_SITA.MD document describes *what* to build and *how it should behave*, but it does not include the actual design system code, Tailwind classes, Framer Motion patterns, component APIs, or visual tokens from this codebase. A developer on the other workspace would have to guess at the glassmorphism values, shadow stacks, motion springs, traffic light colors, typography scales, and component structures — resulting in a demo that looks *similar* but not *identical* to the real SITA OS.

### What Needs to Be Added

A new section titled **"Section 15 — Design System Implementation Reference"** appended to DEMO_SITA.MD, containing the actual code and tokens needed to reproduce the exact visual identity. This section will cover:

**1. NovaOS Design Tokens (verbatim from `nova-os.ts`)**
- `MATERIALS` — all 4 material classes with exact HSL/opacity/blur values (glass, frostedGlass, subtleSurface, menuBar)
- `DEPTH_LAYERS` — z-index hierarchy (desktop=0 through contextMenu=50)
- `NOVA_SHADOWS` — exact shadow stacks for windows, dock, menuBar, widgets (including focused/unfocused states)
- `TRAFFIC_LIGHTS` — exact HSL colors for close/minimize/maximize/inactive dots
- `SHAPES` — border-radius tokens (window=2xl, icon=xl, pill=full, widget=2xl)
- `NOVA_MOTION` — spring configs (gentle, snappy, dock), duration tiers, window enter/exit scale+opacity values
- `ICON_GRADIENTS` — all 8 gradient pairs for app icons

**2. App Window System (from `app-window-system.ts`)**
- `APP_SHADOWS` — per-app shadow definitions
- `APP_ACCENTS` — per-app accent color HSL values
- `APP_CHROME` — window chrome styling per app type
- `APP_TYPE` — app type classifications

**3. FloatingWindow Component API**
- Props interface (title, appIcon, appAccent, toolbar, width, snap behavior, etc.)
- Traffic light button layout and hover behavior
- Title bar structure: accent strip + icon + title + toolbar slot
- Drag/resize implementation approach (CSS transforms for 60fps)
- Snap zones and magnetic edge behavior
- Glassmorphic window body styling (exact classes)

**4. SystemMenuBar Exact Styling**
- Menu trigger class (11px font, HSL opacity transitions)
- Menu content class (popover/95 + backdrop-blur-xl)
- Status indicator layout (search, bell, wifi, sliders, clock)
- Brand logo positioning

**5. Desktop Surface Structure**
- ShellAmbientBackground wallpaper gradient
- Widget grid layout and DraggableWidget wrapper
- DesktopLeftRail structure
- DesktopIconGrid Quick Launch layout (8 icons, gradient backgrounds)

**6. Key Widget Component Patterns**
- `DesktopWidgetCard` — the shared card wrapper (glassmorphic surface, rounded-2xl, border styling)
- Widget sizing and spacing conventions
- Widget header pattern (icon + title + optional action)

**7. Framer Motion Patterns Used Throughout**
- Scroll reveal: `initial={{ opacity: 0, y: 30 }}` + `whileInView`
- Window open: scale 0.96→1 with gentle spring
- Window close: scale 1→0.98, 140ms ease-out
- Dock magnification spring (stiffness: 300, damping: 20)
- Notification slide: from right, with spring
- Stagger children: 0.03-0.1s delay per item

**8. Color Palette (Exact CSS Custom Properties)**
- All `--background`, `--foreground`, `--primary`, `--muted`, `--card`, `--border` values from the dark theme
- Semantic success/warning/destructive token values
- The amber-400/80 phase label color
- The emerald-400/500 verified badge colors

**9. Typography Scale**
- Hero: `text-4xl md:text-6xl font-bold tracking-tight`
- Phase labels: `text-xs uppercase tracking-[0.3em] text-amber-400/80 font-semibold`
- Body: `text-base md:text-lg text-muted-foreground leading-relaxed`
- Monospace: `font-mono text-sm` for hashes/receipts
- Menu bar: `text-[11px] font-medium`
- Widget headers: `text-xs font-semibold uppercase tracking-wider`

**10. Complete Demo Component Skeletons**
- Exact React component signatures for all 18 new components listed in DEMO_SITA.MD
- Import paths for shared UI primitives (`Button`, `Card`, `DropdownMenu`, etc. from `@/components/ui/`)
- The `DemoDesktopFrame` component with exact CSS for the macOS chrome frame (border-radius, shadow stack, traffic lights, title bar)
- The `DemoSandboxProvider` context shape (DataModeContext override, fake auth, write interception pattern)

**11. Snap Zones System (from `snap-zones.ts`)**
- Zone definitions and snap rect calculations
- Visual snap guide overlay styling

**12. Existing Demo Data Layer Paths**
- `src/lib/demo-data/` — structured datasets to import
- `src/lib/mock-data/` — legacy mock data paths
- `src/contexts/DataModeContext.tsx` — how to force `isDemoMode: true`
- `useModeData` / `useModeGate` hook patterns for demo/real switching

### Implementation Approach

1. Read the full design system files (`nova-os.ts`, `app-window-system.ts`, `snap-zones.ts`, theme CSS)
2. Read key component files to extract exact class strings and structural patterns
3. Generate a new section in DEMO_SITA.MD with all tokens, classes, and patterns as copyable code blocks
4. Output an updated `DEMO_SITA_v2.MD` to `/mnt/documents/`

### Why This Matters

Without this section, a developer on the other workspace would produce a demo that *approximates* SITA OS visually but doesn't match it exactly. With this section, every glassmorphism value, shadow stack, spring constant, and color token is explicitly provided — making the demo pixel-accurate to the real product.

