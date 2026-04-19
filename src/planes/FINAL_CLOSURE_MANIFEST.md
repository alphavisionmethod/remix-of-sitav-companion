# SITA OS — Final Deployment Closure Manifest

> Canonical map for the **final last-mile deployment closure** pass.
> Generated: 2026-04-19. Owner: Release Engineering.

## Scope

This manifest closes the remaining gaps after AI Workforce Phases 1–9, Boardroom Layer 7,
Mobile Closure, and Mobile Identity Reconciliation. It adds:

1. **Phase 4 Security Council runtime** — 7 agents, hourly cron, admin board.
2. **7 meta-validators** that defend the master release aggregator against false-green states.
3. **16 governance artifacts** in `generated/final-deployment-closure/`.

## Files

| Concern | Path | Status |
|---|---|---|
| Security Council edge function | `supabase/functions/security-council-tick/index.ts` | EXISTS |
| Security Council DB | `security_council_findings` + `summarize_security_council()` RPC | EXISTS |
| Security Council operator RPC | `acknowledge_security_finding(uuid, text, text)` | NEW |
| Security Council UI | `src/pages/admin/ai-runtime/SecurityCouncilBoard.tsx` | NEW |
| Hub wiring | `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` | UPDATED |
| pg_cron schedule | `sita-security-council-tick` (hourly) | INSTALLED |
| Meta-validator: deployment | `scripts/validation/check-final-deployment-readiness.ts` | NEW |
| Meta-validator: runtime | `scripts/validation/check-final-runtime-proof.ts` | NEW |
| Meta-validator: mobile | `scripts/validation/check-final-mobile-truth.ts` | NEW |
| Meta-validator: ai workforce | `scripts/validation/check-final-ai-workforce-readiness.ts` | NEW |
| Meta-validator: launch honesty | `scripts/validation/check-final-launch-honesty.ts` | NEW |
| Meta-validator: supportability | `scripts/validation/check-final-supportability-readiness.ts` | NEW |
| Meta-validator: gate meaningfulness | `scripts/validation/check-final-gate-meaningfulness.ts` | NEW |
| Aggregator wiring | `scripts/architecture/checks/check-os-release-readiness.ts` (+7 BLOCK gates) | UPDATED |
| npm script | `final:closure:run-all` + `security-council:tick:manual` | ADDED |

## Operator usage

```bash
# Run all 7 final closure meta-validators
npm run final:closure:run-all

# Manually fire one Security Council tick (uses publishable env)
npm run security-council:tick:manual

# Full release readiness aggregation (now includes 7 final gates)
npm run release:readiness
```

## Honest limits

- **Cron firing:** scheduled in `cron.job` via the Insert tool; cannot self-verify from the
  app sandbox because `cron` schema requires elevated DB role.
- **Apple/Play submission:** still externally blocked by account credentials, classified as
  WARN-tier in mobile gates.
- **Structural ceiling:** `final-gate-meaningfulness` enforces ≤25% structural-only gates.
