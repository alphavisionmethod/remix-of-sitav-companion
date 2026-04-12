

# Edge-to-Viewport Distance Labels During Window Drag

## What We're Building

When dragging a window near any screen edge, show floating distance labels (in pixels) between the window edge and the viewport boundary — like design tool ruler measurements. Labels appear/disappear smoothly and only show when the window is within a threshold (~120px) of an edge.

## Design

```text
         ┌──── 24px ────┐
         │               │
    12px─┤  ┌─────────┐  │
         │  │  Window  │  │
         │  │          │  │
         │  └─────────┘  │
         │       │        │
         │    38px        │
         └────────────────┘
```

Each label: small pill with `"12px"` text, positioned midway along the relevant gap, with a thin dashed line connecting window edge to viewport edge. Fade in/out with opacity transition.

## Implementation

### Single file change: `src/components/sita/shell/FloatingWindow.tsx`

1. **Compute distances** during drag (already have `pos`, `size`, `vw`, `vh`):
   - `distLeft = pos.x`
   - `distRight = vw - (pos.x + size.width)`
   - `distTop = pos.y`
   - `distBottom = vh - (pos.y + (size.height || 300))`

2. **Add state** for edge distances (computed in the lerp animation loop or from `pos` directly — no extra state needed, derive from `pos` + `size`).

3. **Render distance labels** as a new block inside the `<>` fragment, after the snap preview overlay. Only render during `isDragging` and when distance < 120px. Each label:
   - A thin dashed SVG line from window edge to viewport edge
   - A small floating pill (`bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded`) centered on that line
   - Shows `"Npx"` value
   - `pointer-events-none`, z-index above windows

4. **Component**: `EdgeDistanceLabels` — a small inline component that takes `pos`, `size`, `vw`, `vh`, threshold, and renders the 4 edge measurements.

### Visual Style
- Dashed line: `stroke-dasharray="4 3"`, `stroke="hsl(210 80% 60%)"`, opacity 0.5
- Pill: dark glass with white text, 10px font, centered on the dashed line
- Threshold: 120px — labels fade in when closer, invisible when far

