# Responsive Operator Board Rules

## Breakpoints

The project standardizes on Tailwind's default breakpoints, with `768 px` (`md:`) as the canonical mobile/desktop boundary (`useIsMobile()`).

| Breakpoint | Width    | Treatment                                                          |
|------------|----------|--------------------------------------------------------------------|
| base       | < 640    | Single column, stacked cards, overflow-scroll for tables           |
| sm         | ≥ 640    | Some 2-column layouts permitted                                    |
| md         | ≥ 768    | Full operator density unlocks                                      |
| lg         | ≥ 1024   | Side-rail + main + drilldown 3-pane layouts                        |
| xl         | ≥ 1280   | Wide hub layouts                                                   |

## Tables

Every `<table>` inside `src/pages/admin/**` and `src/components/admin/**` **must** be wrapped in `<div className="overflow-x-auto">` (or `<div className="overflow-auto">`).

The canonical pattern:

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full text-sm">
    {/* … */}
  </table>
</div>
```

shadcn's `<Table>` component already includes the wrapper.

Enforced by `check-responsive-operator-surfaces`.

## Card grids

Fixed-pixel grids are forbidden. Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` patterns, never `grid-cols-3` alone (which forces 3 columns even on a 320-px screen).

## Touch targets

Interactive elements should be ≥ 32 px tall on touch devices (`size="sm"` on `<Button>`). The default `<Button>` is 40 px (`h-10`) — already touch-safe.

## Honest disclosure

Surfaces designed for desktop-only use (e.g. `/desktop`) must render an explicit narrow-width disclosure banner rather than degrade silently. See `check-desktop-honest-narrow-width`.

## Validators

- `check-responsive-operator-surfaces` — bans unwrapped `<table>` in admin tree
- `check-boardroom-briefing-narrow-width` — asserts responsive grid usage on briefing surfaces
- `check-desktop-honest-narrow-width` — asserts the `/desktop` disclosure banner is mounted
