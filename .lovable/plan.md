

# Architectural Upgrade Phase 1: OS Window Engine

## Context

The project already has a window system (`useWindowManager` hook, `WindowManagerContext`, `FloatingWindow` at 873 lines). The user wants a **new, clean architectural layer** at `src/components/sita/os/` that introduces a proper `WindowContext` provider pattern with `isMaximized` support, a simplified premium `AppWindow` component, and a `WindowCompositor` renderer. This sits alongside the existing system without breaking it.

## Files to Create

### File 1: `src/components/sita/os/WindowContext.tsx`

React Context + Provider managing an array of `OSWindow` objects:

```typescript
interface OSWindow {
  id: string;
  title: string;
  component: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
```

Context functions: `openWindow(id, title, component)`, `closeWindow(id)`, `minimizeWindow(id)`, `maximizeWindow(id)`, `focusWindow(id)` (bumps zIndex). Provider wraps children, manages state with `useState`. Auto-cascades new window positions (offset by 30px each). `focusWindow` sets the target window's zIndex to `max + 1`.

### File 2: `src/components/sita/os/AppWindow.tsx`

Premium glassmorphic window component:
- `motion.div` wrapper with Framer Motion `initial/animate/exit` animations (scale 0.96 -> 1, opacity 0 -> 1, blur-in)
- Header bar with drag handle (`onPointerDown` manual drag, `dragMomentum={false}` equivalent via custom pointer tracking)
- Traffic-light buttons: Minimize (yellow), Maximize (green), Close (red) using Lucide icons (`Minus`, `Square`, `X`)
- Glassmorphism: `bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col`
- `onMouseDown={() => focusWindow(id)}` on wrapper
- Respects `zIndex` from context, `position: absolute`, `left/top` from window state
- Maximized state: `inset-0 w-full h-full` override
- Body: `flex-1 overflow-y-auto` renders the `component`
- Default size: `w-[800px] h-[600px]`

### File 3: `src/components/sita/os/WindowCompositor.tsx`

- Consumes `useOSWindowContext()`
- Wrapper: `absolute inset-0 pointer-events-none z-50`
- Maps over `openWindows`, filters out minimized, renders `<AppWindow>` for each with `pointer-events-auto`
- Wrapped in `<AnimatePresence>` for enter/exit animations

## Step 4: Output Layout Code

Include the full current code of these two files in the response (no changes):
- `src/components/sita/ShellLayout.tsx` (220 lines — already read)
- `src/components/sita/DesktopDock.tsx` (584 lines)

This lets the architect plan where to inject `<WindowCompositor />` and hook dock buttons to `openWindow()`.

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/os/WindowContext.tsx` | Create new |
| `src/components/sita/os/AppWindow.tsx` | Create new |
| `src/components/sita/os/WindowCompositor.tsx` | Create new |
| `ShellLayout.tsx`, `DesktopDock.tsx` | Output only (no changes) |

