

# Refactor FinderWindow to Full Nova SDK Components

## Summary
Replace raw HTML/Tailwind in FinderWindow with Nova SDK primitives (`NovaToolbar`, `NovaCard`, `VStack`, `HStack`) for full design-system consistency. The component already uses `AppLayout`, `NovaList`, `NovaSectionLabel`, and `NovaText` — this closes the remaining gaps.

## Changes (single file: `FinderWindow.tsx`)

### 1. Toolbar — use `NovaToolbar`
Replace the raw `<div className="flex items-center gap-1">` breadcrumb bar with `<NovaToolbar>` using `leading` slot for the breadcrumb trail built with `<HStack spacing="micro">`.

### 2. Sidebar — use `VStack`
Wrap sidebar content in `<VStack spacing="tight">` instead of bare `<div>`.

### 3. Folder grid — use `NovaCard` + `VStack`
Each folder button becomes a `<NovaCard hoverable>` wrapping a `<VStack align="center" spacing="micro">` containing the gradient icon and `<NovaText variant="label">`. The outer grid container uses CSS grid (kept as-is since Nova SDK doesn't have a grid primitive).

### 4. Imports
- Add: `NovaCard`, `NovaToolbar` from `ui/components`, `VStack`, `HStack` from `ui/layout`
- Remove: `cn` (no longer needed), direct `SPACE` import (handled by SDK components)

## File Impact
| Action | File |
|--------|------|
| Modify | `src/components/sita/shell/windows/FinderWindow.tsx` |

