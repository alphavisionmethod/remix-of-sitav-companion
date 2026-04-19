# Admin Action Panel Hierarchy Spec

## Canonical primitive

`src/components/primitives/actions/OperatorActionPanel.tsx`

Renders operator actions in the fixed canonical order:

1. **primary** — the principal next action (visual variant: `default` / filled)
2. **remediation** — only present when the board is in degraded / failing state (variant: `destructive` or `outline` with destructive tone)
3. **next** — suggested onward navigation (variant: `outline`)
4. **related** — lateral inspection (variant: `ghost`)
5. **evidence** — drilldown to receipts / proof bundles (variant: `ghost`, icon-led)

## Type-level enforcement

```ts
interface OperatorActionPanelProps {
  primary?: OperatorAction;
  remediation?: OperatorAction;
  next?: OperatorAction[];
  related?: OperatorAction[];
  evidence?: OperatorAction[];
}
```

The slot ordering is enforced at the type level — there is no `actions[]` flat prop that callers could reorder.

## Adoption rule

Admin boards that surface 2+ outbound actions should compose `OperatorActionPanel` rather than free-form `<Button>` rows. The validator `check-admin-action-panel-hierarchy` records — without blocking — which boards have adopted the primitive.

## Microcopy

Action labels follow the microcopy rules (operator-grade, calm, action-oriented). See `ADMIN_MICROCOPY_AND_SEMANTICS_MODEL.md`.
