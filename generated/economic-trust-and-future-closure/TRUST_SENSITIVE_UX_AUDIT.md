# Trust-Sensitive UX — Audit

**Generated:** 2026-04-19

## Calm-mode default posture

| Surface | Default | Source | Validator |
|---|---|---|---|
| `ShellLayout.tsx` | `calm` | `useCalmMode()` | `check-calm-mode-default-posture.ts` |
| `AppearanceContext` | `calm` | provider default | same |
| `FirstBootSetup` | `calm` | onboarding step skips animations | same |
| `personalization-engine` | `calm` | profile default | same |

## Forbidden-phrase scan

Active validator: `check-agency-wording-lockdown.ts`

Forbidden phrases (BLOCK on detection):
- "AI autonomously"
- "workforce is acting"
- "agent decided"
- "the system chose"
- "AI took action"

Canonical replacements live in `src/i18n/microcopy.ts::aiAgency`.

## Surfaces audited (13)

Boardroom, Advisors, Suggestions, Internal Agents, Councils, Security Council, Weekly Digest, Dependency Findings, Approvals queue, Connector Truth, Mobile Scope Truth, Frontend Polish Truth, Economic-Trust-Future Truth.

All 13 use `useCalmMode()` and source agency copy from `microcopy.ts`. No forbidden phrases detected.

## Honest limits

- Validator scans static strings; dynamically-constructed strings (template literals with vars) are out of scope
- A11y posture (motion-reduction) tied to calm-mode but verified by separate gate
