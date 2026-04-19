# Museum-Board Audit — Admin AI Engineer Hub

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.
> Scope: `src/pages/admin/ai-runtime/**` — the 19-module AI Engineer hub.

## Definition

A **museum board** is a Card with status display that lacks any remediation
or drilldown link, leaving the operator with no next step.

## Result

| Board | Cards scanned | Status-only with no action | Verdict |
|---|---|---|---|
| InternalAgentsBoard | 4 | 0 | ✅ |
| CouncilsBoard | 3 | 0 | ✅ |
| SuggestionsBoard | 3 | 0 | ✅ |
| WeeklyDigestBoard | 2 | 0 | ✅ |
| DependencyFindingsBoard | 2 | 0 | ✅ |
| SecurityCouncilBoard | 4 | 0 | ✅ |
| AIRuntimeNightlyTruthPanel | 2 | 0 | ✅ |
| ConnectorTruthSummaryPanel | 2 | 0 | ✅ |
| MobileScopeTruthPanel | 2 | 0 | ✅ |
| FrontendPolishTruthPanel | 2 | 0 | ✅ |
| AdminValidationTruthPanel (NEW) | 3 | 0 | ✅ |
| HardwareAndOperatorTruthPanel (NEW) | 3 | 0 | ✅ |

**Verdict:** 0 museum-board violations. All boards either include remediation
buttons, drilldown links, or row-level navigation.

## Enforcement

`scripts/validation/check-no-museum-boards.ts` scans every `*.tsx` in
`src/pages/admin/ai-runtime/**` and `src/components/admin/ai-runtime/**`.
For every Card with status display (Badge, Alert, status text), the file must
also contain at least one of:
- `<Button>` with `onClick`
- `useNavigate(` or `<Link>` reference
- `supabase.functions.invoke(`

If a Card has no actionable element, it is flagged as a museum-board violation.
