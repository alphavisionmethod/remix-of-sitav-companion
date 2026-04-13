

# Deepin-Style App Launcher Menu

## What We're Building

A beautiful two-panel app launcher that opens from a dock icon (replacing the current "+" button with a grid/launchpad icon), styled like Deepin's launcher in the reference image:

```text
┌──────────────────────────────────────────────┐
│  ↕  │ Browser        │  Frequently Used      │
│     │ File Manager   │  [icon] [icon] [icon]  │
│     │ App Store      │  [icon] [icon] [icon]  │
│     │ Music          │  [icon] [icon] [icon]  │
│     │ Movie          │  [icon] [icon] [icon]  │
│     │ Screen Capture │                        │
│     │ Image Viewer   │                        │
│     │ ...            │                        │
│  ⏻  │────────────────│  🔍 Search             │
└──────────────────────────────────────────────┘
```

**Key design elements from the reference:**
- Frosted glass panel (`bg-white/[0.08] backdrop-blur-[60px]`) anchored to bottom-left, above the dock
- Left column: scrollable app list with icons + labels, category filter buttons at top, power button at bottom
- Right column: "Frequently Used" grid (4x4) with larger icons and labels
- Search bar at the bottom of the right panel
- Smooth spring animation opening upward from the dock icon
- Rounded corners (`rounded-2xl`), no harsh borders

## Changes

### 1. Rewrite `AppLauncherPanel.tsx` — Deepin-style two-panel layout
- **Position**: Fixed, anchored bottom-left (`bottom-20 left-4`), rises from dock
- **Left panel** (~200px): Scrollable list of all installed apps with 24px icons + name, grouped by category with subtle headers. Category sidebar icons on far left for filtering. Power/logout icon at bottom.
- **Right panel** (~400px): "Frequently Used" header + 4-column grid of top/recent apps with 48px icons. Search input at bottom with glass styling.
- **Glass material**: `bg-[hsl(0_0%_0%/0.55)] backdrop-blur-[60px]` with `border border-white/[0.12]`
- **Animation**: `initial={{ opacity: 0, y: 40, scale: 0.95 }}` springing upward
- Keep all existing functionality: fuzzy search, keyboard nav, system commands

### 2. Update dock launcher button in `DesktopDock.tsx`
- Replace the `+` (Plus) icon with a grid icon (`LayoutGrid` from lucide) to match the Deepin aesthetic
- Keep tooltip "App Launcher"

### 3. Keep existing wiring in `ShellLiveLayer.tsx`
- No changes needed — the `launcherOpen` state and `onOpenLauncher` callback already work correctly

## Files

| File | Change |
|------|--------|
| `src/components/sita/shell/AppLauncherPanel.tsx` | Full rewrite — Deepin two-panel layout with left app list + right frequently used grid |
| `src/components/sita/DesktopDock.tsx` | Change launcher icon from Plus to LayoutGrid |

