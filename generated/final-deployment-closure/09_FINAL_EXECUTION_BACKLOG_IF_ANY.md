# 09 — Final Execution Backlog (if any)

> Generated: 2026-04-19

## Active caveats (carried into next release window)

### External — credential / account blockers

| Item | Class | Owner action required |
|---|---|---|
| Apple Developer Program membership | External | Enroll ($99/yr) → unblocks iOS submission, APNs |
| Google Play Console account | External | Enroll ($25 one-time) → unblocks Play submission |
| APNs push certificate | Gated by Apple Dev | After Apple Dev: provision in `mobile/ios/SIGNING.md` |

These are **not** code gaps. The mobile code path is complete and validated by
the 16 mobile gates.

### Internal — observable but not blocking

| Item | Class | Recommendation |
|---|---|---|
| Security Council seed run produced 0 findings | Healthy signal | Re-run after first hourly cron tick to populate baseline |
| Cron firing self-verification | Sandbox limitation | Cannot query `cron.job_run_details` from app sandbox; verify from Lovable Cloud directly |
| Long-form docs in `generated/final-deployment-closure/` | Just landed | Operators should bookmark `INDEX.md` |

## What's explicitly out of scope

- New flagship loops (e.g., Onboarding ceremony screens 11-29) — separately tracked
- Multi-region active-active DR — Phase 9 covers cross-region drill, not active-active
- Public marketing site polish — separate engagement

## Next release window readiness

**Pre-flight checklist:**

- [ ] Run `npm run release:readiness` — expect 124/124 GREEN
- [ ] Run `npm run security-council:tick:manual` — verify 1 successful tick
- [ ] Visit `/admin/ai-runtime` → "Security Council" tab — confirm board renders
- [ ] Verify HMAC seal: `npm run hardening:gates`
- [ ] Confirm no PRs sitting in mobile-identity drift: `npm run mobile:run-all`

If all 5 pass, **proceed with publish via the Lovable publish dialog**.
