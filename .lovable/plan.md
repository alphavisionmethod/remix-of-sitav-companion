

# Calm UI Engine — Implementation Plan

## What Already Exists
- **Layer system**: `DEPTH_LAYERS` in `nova-os.ts` (desktop=0, orbs=1, content=10, windows=20, overlay=40)
- **Adaptive Interface**: `AdaptiveInterfaceService` adjusts density/animation/fontSize based on cognitive load, mode, surface
- **Attention OS**: Full priority stack with cognitive load scoring
- **Soft Focus**: Desktop dims content when windows are open
- **Boot ceremony**: Phased fade-in of desktop elements
- **Compositor sim**: `compositor-sim.ts` with alpha blending, damage tracking, lerp physics
- **Materials**: Glassmorphism tokens, translucent layers, soft shadows — already "no hard borders"
- **Motion**: Spring physics, lerp drag, inertia in `FloatingWindow`

## What's New (6 features to build)

### 1. Window Attention Model
A hook `useWindowAttention` that computes per-window attention scores (0-1) based on mouse proximity, typing recency, and last-focused time. Unfocused windows get reduced opacity and slight desaturation. Active window stays crisp.

**Files**: New `src/hooks/useWindowAttention.ts`, modify `FloatingWindow.tsx` and `DesktopSurface.tsx`

### 2. Zero-Clutter Idle Mode
After 30s of no mouse/keyboard activity, desktop enters idle mode: icons fade to 20% opacity, widgets reduce contrast, clock stays visible. Any input instantly restores. Uses a single `useIdleDetector` hook.

**Files**: New `src/hooks/useIdleDetector.ts`, modify `DesktopSurface.tsx`

### 3. Micro-Interaction Engine
A centralized timing config (`src/lib/engine/micro-interactions.ts`) defining hover=80ms, click=120ms, animation=200ms. Add CSS custom properties and a click ripple feedback system integrated into interactive elements (widgets, dock items).

**Files**: New `src/lib/engine/micro-interactions.ts`, update `tailwind.config.ts` with CSS vars, enhance `DesktopSurface.tsx` glass widgets

### 4. Dynamic Layer Opacity System
Each of the 4 conceptual layers (background, content, interaction, awareness) gets independent opacity control driven by context. When a menu is open, content layer dims. When notifications appear, other layers soften. Managed via CSS custom properties set by a `useLayerOpacity` hook.

**Files**: New `src/hooks/useLayerOpacity.ts`, modify `DesktopSurface.tsx` to apply layer classes

### 5. Adaptive App Surfacing
Track app launch frequency in localStorage. The `useAppSurfacing` hook returns apps sorted by usage frequency. The dock and command palette use this to prioritize frequent apps. Already partially exists in CommandPalette's recent tracking — this formalizes it.

**Files**: New `src/hooks/useAppSurfacing.ts`, modify dock/command palette to consume it

### 6. Calm Engine Orchestrator
A top-level `CalmEngine` provider that wires together idle detection, layer opacity, attention model, and adaptive interface into a single context. Components read from this instead of calling 4 separate hooks.

**Files**: New `src/contexts/CalmEngineContext.tsx`, wire into `DesktopPage.tsx`

## Technical Details

### Window Attention Score Formula
```text
score = 0.4 * proximity + 0.3 * recency + 0.3 * isFocused
proximity = 1 - clamp(distance_to_center / 600, 0, 1)
recency = max(0, 1 - (now - lastInteraction) / 10000)
```
Applied as: `opacity: 0.5 + score * 0.5`, `filter: saturate(score)`

### Idle Detection
- `mousemove`, `keydown`, `pointerdown` reset a 30s timer
- State machine: `active → fading (2s transition) → idle`
- CSS classes applied to desktop root element

### Micro-Interaction Timings
```text
--mi-hover:     80ms
--mi-click:     120ms
--mi-animate:   200ms
--mi-spring:    300ms
```

### Layer Opacity State
```text
Layer 0 (bg):        always 1.0
Layer 1 (content):   1.0 default, 0.4 when menu/overlay open
Layer 2 (interact):  0 hidden, 1.0 when active
Layer 3 (awareness): 0 hidden, fade in on notification
```

## Implementation Order
1. Micro-interaction engine (foundation timings)
2. Idle detector hook
3. Window attention model
4. Layer opacity system
5. App surfacing hook
6. Calm Engine orchestrator (wires everything)

