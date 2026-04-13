

# Fix C-008: FadeInSection forwardRef

## Problem
`FadeInSection` is a plain function component receiving a ref internally via `useRef`, but if any parent passes a ref to it (or framer-motion tries to), React logs a console warning because it's not wrapped in `forwardRef`.

## Change
In `src/pages/LandingPage.tsx` lines 10-24, convert `FadeInSection` to use `React.forwardRef` and merge the forwarded ref with the internal `useRef` via a callback ref pattern.

**Before:**
```tsx
const FadeInSection = ({ children, className, delay = 0 }: ...) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return <motion.div ref={ref} ...>{children}</motion.div>;
};
```

**After:**
```tsx
const FadeInSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; delay?: number }>(
  ({ children, className, delay = 0 }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);
    const inView = useInView(localRef, { once: true, margin: "-60px" });
    return (
      <motion.div
        ref={(node) => {
          (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInSection.displayName = "FadeInSection";
```

Single file, single edit. No other files affected.

