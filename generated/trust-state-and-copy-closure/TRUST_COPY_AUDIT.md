# Trust-Sensitive Copy — Audit

**Generated**: 2026-04-19
**Scope**: boardroom, concierge, communications, admin/ai-runtime, onboarding (sim disclosure), admin/health, releases/support callouts
**Method**: Phrase-pattern scan against the forbidden-phrase set in `check-flagship-surface-trust-copy.ts` + manual review of trust-sensitive copy blocks.

## Forbidden-phrase set (current canonical)

```
\bfully autonomous\b
\bself-acting\b
\bguaranteed (?:to|reliability)\b
\b(?:always|never) fails\b
\b100% (?:reliable|accurate)\b
```

## Per-surface results

| Surface | Forbidden phrases | Drift / overclaim risk | Status |
|---|---|---|---|
| boardroom | 0 | learning-loop wording must distinguish live recommendation vs future learning v2 | exact |
| concierge | 0 | gateway-governed live AI; no autonomy overclaim | exact |
| communications | 0 | live OAuth (Google/MS/Slack) vs manual long-tail; manual badge required | exact |
| admin/ai-runtime | 0 | structurally-wired vs behaviorally-proven vs nightly-verified vs degraded | exact |
| onboarding (sim personas) | 0 | personas labeled `Demo · governed` via StatusBadge | exact |
| admin/health | 0 | uses canonical `StatusBadge` tones | exact |
| releases/support | 0 | uses `NeedsHistoricalReleasesExplainer` for empty windows | exact |

## Drift findings

None at the phrase level.

## Documentation gap

The four per-surface specs (`BOARDROOM_TRUST_COPY_SPEC.md`, `CONCIERGE_TRUST_COPY_SPEC.md`, `COMMUNICATIONS_TRUST_COPY_SPEC.md`, `ADMIN_AI_RUNTIME_TRUST_COPY_SPEC.md`) and the central `TRUST_COPY_GUIDANCE_MODEL.md` were not yet committed. This pass closes that.

## Regression guard

WARN-tier validators (`check-flagship-surface-trust-copy`, `check-trust-copy-quality`, `check-concierge-ai-state-handling`, `check-communications-connector-state-alignment`) already protect against forbidden-phrase regression. This pass adds `check-simulation-and-future-labeling.ts` to ensure `Coming Soon` / `Future` / `Demo` / `Simulated` labels always travel with a canonical badge tone.
