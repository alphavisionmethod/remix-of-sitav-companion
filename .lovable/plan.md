

# Advanced App Platform Design System — Implementation Plan

## Summary
Elevate the entire NovaOS app experience to feel like apps are true OS citizens: unified visual materials, strict spacing/typography, shared component library, app launch animations, permission gates, and polished window chrome. This makes everything feel cohesive, premium, and "wow."

## What Already Exists (Strong Foundation)
- FloatingWindow with glassmorphism, traffic lights, snap zones, lerp drag, inertia, resize
- DesktopDock with magnification, badges, tooltips, context menus
- SystemMenuBar with translucent blur, contextual menus, status indicators
- Finder + Settings window apps with sidebar/content layout
- FlowSpace (Mission Control) with physics-based grid
- Calm Engine (idle, attention, layers, micro-interactions)
- App catalog with trust levels, permissions, install status

## What's New (7 Enhancements)

### 1. App Window Design System Tokens
Create `src/lib/design-system/app-window-system.ts` — strict spacing scale (4/8/16/24/32px), typography scale (11/13/16px), shared material tokens for app backgrounds/borders/shadows, component style presets (buttons, inputs, lists, cards). All app windows consume these instead of ad-hoc values.

### 2. App Launch Animation (Icon-to-Window Morphing)
Enhance FloatingWindow to accept an `originRect` prop (the dock icon's bounding box). On mount, the window scales from that rect position/size to its final position — creating the psychological "window emerges from icon" effect. The dock passes icon refs to enable this.

### 3. Permission Gate Modal
Create `src/components/sita/shell/AppPermissionGate.tsx` — a centered glassmorphic modal shown on first app launch. Displays app icon, name, requested permissions with risk-level coloring, and Allow/Deny buttons. Integrates with AppDefinition's permissions array. Uses localStorage to remember grants.

### 4. App State System (Empty/Loading/Error)
Create `src/components/sita/shell/AppStateWrapper.tsx` — a wrapper component every window app uses. Handles three states: loading (skeleton shimmer with app accent), empty (centered illustration + message), error (soft error card with retry). Finder and Settings adopt this wrapper.

### 5. Enhanced Window Chrome
Upgrade FloatingWindow:
- Toolbar area below title bar for app-specific actions (search, view toggles)
- App accent color strip along the top edge (2px gradient line matching app's iconBg)
- Active window subtle inner glow, unfocused windows get slight grayscale
- Double-shadow depth system: near sharp (2px/6px) + far soft (20px/40px)
- Window title bar shows app icon (mini 14px version) next to the title

### 6. Dock Enhancements
Upgrade DesktopDock:
- App launch bounce animation (icon scales down 0.8 → springs back on click)
- Running indicator dot becomes a subtle glowing bar for active windows
- Dock separator between pinned apps and running-only apps
- Dock auto-hide option when windows are maximized

### 7. Desktop Polish
- Glassmorphic notification toasts get app icon + accent color on the left edge
- Context menu items get keyboard shortcuts displayed (right-aligned hint text)
- Widget hover micro-interactions: 80ms scale(1.02) + inner glow pulse

## Technical Details

### Spacing Scale Constants
```text
SPACE_MICRO = 4    // gap between icon elements
SPACE_TIGHT = 8    // compact padding
SPACE_NORMAL = 16  // standard padding
SPACE_SECTION = 24 // between groups
SPACE_LARGE = 32   // major sections
```

### Typography Scale
```text
LABEL = { size: 11, weight: 500, tracking: 'wider' }
BODY = { size: 13, weight: 400 }
TITLE = { size: 16, weight: 600 }
HEADING = { size: 18, weight: 600 }
```

### Launch Animation Sequence
```text
t=0ms:   Icon scales to 0.8, slight bounce
t=80ms:  Window appears at icon position, scale 0.3, opacity 0
t=120ms: Window morphs to final position, scale 0.96→1, opacity 1
t=320ms: Settled — spring physics with stiffness 260, damping 22
```

### Permission Gate Data Flow
```text
User clicks app → check localStorage for grant
  → if granted: launch normally
  → if not: show PermissionGate modal
    → user clicks Allow → persist grant → launch
    → user clicks Deny → close, no launch
```

## Files to Create
1. `src/lib/design-system/app-window-system.ts` — tokens
2. `src/components/sita/shell/AppPermissionGate.tsx` — permission modal
3. `src/components/sita/shell/AppStateWrapper.tsx` — empty/loading/error states

## Files to Modify
1. `FloatingWindow.tsx` — accent strip, icon in title, origin morph, toolbar slot, enhanced shadows
2. `DesktopDock.tsx` — bounce animation, glowing running indicator, icon ref forwarding
3. `FinderWindow.tsx` — adopt AppStateWrapper, use spacing tokens
4. `SettingsWindow.tsx` — adopt AppStateWrapper, use spacing tokens
5. `DesktopSurface.tsx` — widget micro-interactions, toast accent colors
6. `DesktopContextMenu.tsx` — keyboard shortcut hints
7. `ShellLayout.tsx` — wire permission gate into app launch flow

## Implementation Order
1. App Window System tokens (foundation)
2. Enhanced Window Chrome (visual upgrade)
3. App State Wrapper (empty/loading/error)
4. App Launch Animation (dock → window morph)
5. Permission Gate Modal
6. Dock enhancements (bounce, glow bar)
7. Desktop polish (widgets, context menu, toasts)

