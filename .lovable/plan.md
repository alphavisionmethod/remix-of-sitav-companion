

# Plan: Canvas-Based System Monitor Using NovaContext

## What We're Building
Replace the recharts-based CPU and Memory chart rendering in `SystemMonitorWindow.tsx` with high-performance canvas rendering using the existing `NovaContext` graphics API. This gives a more "native OS" feel with direct pixel-level control and better performance for real-time 1Hz updates.

## Changes

### 1. Create a reusable canvas chart component
**New file**: `src/components/sita/shell/windows/NovaCanvasChart.tsx`

A React component that wraps a `<canvas>` element and uses `NovaContext` to draw:
- **Area charts** with gradient fills (for CPU user/system stacked areas and memory used/cached)
- **Grid lines** with subtle tick labels (time axis)
- **Live value indicator** — glowing dot at the rightmost data point
- **Axis labels** drawn via `drawText`
- Uses `requestAnimationFrame` for smooth interpolation between 1s data ticks
- Accepts generic `series[]` prop with color, data array, and fill opacity
- Auto-scales Y axis, handles resize via `ResizeObserver`

### 2. Create a canvas-based core bar component
**New file**: `src/components/sita/shell/windows/NovaCanvasBars.tsx`

For the per-core CPU utilization bars and memory pressure visualization:
- Horizontal bars drawn with `drawRoundedRect` + `drawGradient`
- Animated fill using lerp between old and new values
- Label overlay via `drawText`

### 3. Refactor SystemMonitorWindow.tsx
**Modified file**: `src/components/sita/shell/windows/SystemMonitorWindow.tsx`

- Remove `recharts` imports (`AreaChart`, `Area`, `XAxis`, `YAxis`, `ResponsiveContainer`, `Tooltip`, `BarChart`, `Bar`)
- Replace the CPU tab's `<ResponsiveContainer><AreaChart>` with `<NovaCanvasChart>` rendering user + system series as stacked areas (cyan + purple)
- Replace the Memory tab's area chart with `<NovaCanvasChart>` rendering used + cached series (amber + blue)
- Replace the Network tab's chart with `<NovaCanvasChart>` for download/upload throughput
- Replace core utilization bars and memory pressure bars with `<NovaCanvasBars>`
- Keep the process table, GPU tab, sidebar, and all state management unchanged
- The existing SVG `Sparkline` mini-component in the sidebar summary cards can optionally be replaced with a tiny canvas version, but this is low priority

## Technical Details

- `NovaContext` already provides: `clear()`, `fillRect()`, `drawRoundedRect()`, `drawText()`, `drawGradient()`, `drawCircle()`, and `raw` (direct CanvasRenderingContext2D access) for custom path drawing (needed for area chart polylines)
- Canvas DPI scaling: multiply canvas width/height by `devicePixelRatio`, scale context, set CSS dimensions — standard HiDPI approach
- Color palette uses `NovaColor` HSL objects matching the existing design tokens (cyan for CPU user, purple for system, amber for memory used, blue for cached)
- Data flow unchanged — same `useState` arrays, just rendered to canvas instead of SVG

## File Impact
| Action | File |
|--------|------|
| Create | `src/components/sita/shell/windows/NovaCanvasChart.tsx` |
| Create | `src/components/sita/shell/windows/NovaCanvasBars.tsx` |
| Modify | `src/components/sita/shell/windows/SystemMonitorWindow.tsx` |

