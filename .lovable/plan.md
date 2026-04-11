

# Fix: LandingPage Ref Warning + Stale Module Error

## Issues Found

1. **React ref warning on LandingPage** — `HomeRoute` renders `<LandingPage />` which is a plain function component. React Router's internal ref forwarding triggers "Function components cannot be given refs" warning. Fix: wrap `LandingPage` with `React.forwardRef`.

2. **"Failed to fetch dynamically imported module" error** — This is a stale chunk cache issue after rebuilds. The old `LandingPage-CJgqfgER.js` no longer exists. Not a code bug, but we should ensure the error boundary handles this gracefully (it already does via `GlobalErrorBoundary`). A page refresh resolves it.

## Fix

### File: `src/pages/LandingPage.tsx`
- Wrap the component with `React.forwardRef` so it can accept refs from React Router without warnings
- Change from `const LandingPage = () => { ... }` to `const LandingPage = React.forwardRef<HTMLDivElement>((props, ref) => { ... })` and add the `ref` to the root `<div>`

### No other code errors found
- Edge functions: all clean from prior fixes
- Routes: deduplicated from prior fixes
- Contracts/kernels: clean

## Technical Detail
The `forwardRef` wrapper adds `ref` to the root div element, which satisfies React Router's internal ref forwarding. This eliminates the console error completely. The stale module fetch error only occurs after hot rebuilds when the browser has cached old chunk filenames — no code fix needed for that.

