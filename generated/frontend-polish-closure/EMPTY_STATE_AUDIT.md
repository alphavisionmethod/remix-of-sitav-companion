# Empty State Audit

Pre-closure state showed 18 raw text empty states across the AI Engineer hub. Post-closure: see `empty-state-status.json` for current count.

## Remediation pattern

```tsx
// Before
{rows.length === 0 && <p className="text-xs text-muted-foreground">No data.</p>}

// After
{rows.length === 0 && (
  <EmptyState
    icon={<Icon className="h-5 w-5" />}
    title="Trust-grade title"
    description="Truthful reason + operator next step"
  />
)}
```
