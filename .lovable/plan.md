

# NovaOS Window System — Full Advanced Spec Audit & Implementation

## Assessment: What Exists vs. What's Missing

The window system is already quite advanced. Here's the gap analysis against the spec:

### Already Implemented (Confirmed)
- **Window open animation**: Scale 0.85→1, opacity 0→1, blur 8→0, spring physics (FloatingWindow.tsx)
- **Window close/exit animation**: Scale 1→0.95, opacity 1→0, via NOVA_MOTION + AnimatePresence
- **Drag physics**: Lerp smoothing (0.25), inertia with friction (0.92), velocity tracking
- **Magnetic docking**: Inter-window edge snapping with alignment guides
- **Edge bounce**: Dampened bounce on screen edges
- **Snap zones**: Left/right half + maximize with preview overlays
- **Z-order system**: Click-to-front, compositor tracking, per-window zIndex
- **Focus/active states**: Shadow differentiation, opacity/saturation dimming via CalmEngine
- **Dual shadow model**: Near sharp + far soft shadows in APP_SHADOWS
- **Resize handles**: Continuous resize with min width/height enforcement
- **Shake-to-minimize**: Direction change detection
- **Double-buffering**: Surface allocator with double/triple buffering modes
- **Dirty region rendering**: DamageTracker with coalescing in compositor-sim.ts
- **VSync loop**: RenderPipeline with requestAnimationFrame-based frame pacing
- **Scene graph**: Retained mode with visibility culling, hit testing, display lists
- **Error boundaries**: GlobalErrorBoundary and per-shell ErrorBoundary exist
- **Microinteraction engine**: Complete with window/menu/dock/modal/toast variants
- **Sound on open**: SoundEngine.click() on window creation

### Gaps to Fill

| # | Spec Requirement | Gap |
|---|---|---|
| 1 | **Per-window error boundary + crash fallback UI** | Children render raw inside FloatingWindow — no per-window crash isolation with "frozen" fallback |
| 2 | **Window close sound** | Only open sound exists; no close/minimize/maximize/focus sounds wired |
| 3 | **Minimize-to-dock curved path** | Minimize just hides — no visual "shrink toward dock" animation |
| 4 | **Occlusion culling in React layer** | Compositor has the concept but FloatingWindow renders all content regardless of occlusion |
| 5 | **Background window update throttling** | All windows update at same rate; unfocused windows should throttle re-renders |
| 6 | **Shadow dynamic with elevation** | Shadows are static CSS classes; should shift intensity based on drag elevation |
| 7 | **Progressive content fade-in** | Skeleton shows for 150ms then hard-swaps — should crossfade |
| 8 | **Snap zone: bottom-left/bottom-right quadrants** | Only left/right/top snap zones exist |
| 9 | **Modal z-order enforcement** | No modal-above-parent guarantee in compositor |
| 10 | **System overlay always-on-top** | No overlay z-level enforcement |
| 11 | **Performance timing instrumentation** | No actual measurement of window open time or drag latency |

---

## Implementation Plan

### 1. Per-Window Error Boundary with Crash Fallback
**File**: `src/components/sita/shell/WindowErrorBoundary.tsx` (create)
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- Create `WindowErrorBoundary` React class component that catches errors in window content
- On crash: render a frozen fallback UI showing "This window encountered an error" with a close button and restart option
- Wrap `{children}` in FloatingWindow with this boundary
- Wire into `AppErrorBoundary` from managed-runtime for crash counting

### 2. Window Sound Hooks
**File**: `src/components/sita/shell/DesktopSurface.tsx` (modify)
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)
**File**: `src/lib/sound-engine.ts` (modify if needed)

- Call `SoundEngine.windowClose()` in `onClose` handler
- Call `SoundEngine.windowMinimize()` in `onMinimize` handler
- Call `SoundEngine.click()` on focus change
- Call `SoundEngine.snap()` on snap-to-zone (already exists)

### 3. Minimize-to-Dock Curved Animation
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- On minimize: compute dock icon position (center-bottom of screen)
- Use framer-motion `animate` to scale down (1→0.3), translate toward dock position on a bezier curve, and fade opacity
- Add `onMinimize` exit variant that includes `y: window.innerHeight - 80`, `scale: 0.2`, `opacity: 0`

### 4. Occlusion-Aware Content Rendering
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- Accept `isOccluded` prop (computed by parent from compositor data)
- When fully occluded: render placeholder div instead of children (saves React reconciliation)
- Parent (DesktopSurface) computes occlusion using `Compositor.findSurfaceAt()` bounding box checks

### 5. Background Window Throttling
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- When `isFocused === false`: wrap children in a `React.memo`-style container that skips re-renders
- Use `useDeferredValue` or a throttled state update for unfocused window content
- Add CSS `content-visibility: auto` on unfocused window content for browser-level optimization

### 6. Dynamic Shadow Based on Drag Elevation
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- During drag: increase shadow spread/blur proportionally to velocity magnitude
- Compute `elevation = Math.min(1, velocity / 20)` and interpolate between `APP_SHADOWS.unfocused` and a deeper "lifted" shadow
- Apply via inline style during drag state

### 7. Progressive Content Crossfade
**File**: `src/components/sita/shell/FloatingWindow.tsx` (modify)

- Replace hard swap from skeleton→content with a crossfade:
  - Skeleton fades out over 120ms
  - Content fades in simultaneously
- Use `AnimatePresence mode="wait"` with opacity transitions

### 8. Quadrant Snap Zones
**File**: `src/lib/design-system/snap-zones.ts` (modify)

- Add `"bottom-left"`, `"bottom-right"`, `"top-left"`, `"top-right"` to `SnapZone` type
- Detect corner zones when pointer is within both edge thresholds
- Return quarter-screen rects for corner snaps

### 9. Modal & Overlay Z-Order Enforcement
**File**: `src/lib/nova-sdk/kernel/compositor.ts` (modify)

- Add `layer` field to `CompositorSurface`: `"normal" | "modal" | "overlay"`
- `getRenderOrder()` sorts by layer first, then zIndex within layer
- Modals always render above normal windows; overlays above everything

### 10. Performance Instrumentation
**File**: `src/lib/nova-sdk/kernel/window-perf.ts` (create)

- `WindowPerformanceMonitor` singleton tracking:
  - Window open time (from request to first content render via `performance.now()`)
  - Drag latency (pointer event timestamp vs frame render)
  - Frame consistency (jank detection via frame time variance)
- Expose via `getDiagnostics()` for Kernel Dashboard integration

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/sita/shell/WindowErrorBoundary.tsx` | Create |
| `src/lib/nova-sdk/kernel/window-perf.ts` | Create |
| `src/components/sita/shell/FloatingWindow.tsx` | Modify (error boundary, sounds, minimize anim, occlusion, throttling, dynamic shadow, crossfade) |
| `src/components/sita/shell/DesktopSurface.tsx` | Modify (sound hooks, occlusion computation, pass props) |
| `src/lib/design-system/snap-zones.ts` | Modify (quadrant zones) |
| `src/lib/nova-sdk/kernel/compositor.ts` | Modify (layer-based z-order) |
| `src/lib/sound-engine.ts` | Verify/modify (ensure all window sound methods exist) |

