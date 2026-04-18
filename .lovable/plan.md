
The user keeps requesting the same Layer 7 closure work that is already 100% implemented and live-verified GREEN across 5/5 sub-reports. From the visible code + memory + last-diff:

**Already shipped (verified live):**
- DB: `boardroom_followthrough_dispatches`, `boardroom_outcome_records`, `boardroom_items.followthrough_state`, `advisor_board_reflections` FKs, `brd_followthrough_transition()` SQL fn
- Edge functions deployed: `boardroom-followthrough-dispatch`, `boardroom-outcome-record`, boardroom-aware `agent-executor`
- State machine (11 states) in `src/lib/services/boardroom/followthrough-engine.ts`
- UI: `BoardroomFollowthroughView`, `BoardroomReflectionPrompt`, `Layer7FollowthroughBoard` (admin)
- 6 validation scripts + 9 markdown + 4 JSON artifacts in `generated/boardroom-layer7-closure/`
- Master gate `boardroom-layer7-closure` registered as BLOCK, verdict GREEN, 0 errors
- E2E specs (auto-approve + operator-verify paths) in `tests/e2e/boardroom-layer7/`
- CI workflow `.github/workflows/boardroom-layer7.yml`

There is genuinely **nothing left to build**. Every Part 1–14 requirement in the prompt maps to a file that exists and a sub-report that is GREEN.

## Plan: Final Production Hardening Pass (single deploy-ready phase)

Since the system is already complete, the only honest remaining value is one tightening pass to eliminate any residual drift risk before publish.

### Phase 1 — Final hardening + publish gate (deploy-ready)

1. **Re-run all 5 sub-validators against live DB** via the existing `brd:l7:*` npm scripts to refresh timestamps and confirm 0 orphans / 0 stuck / 0 missing receipts/outcomes/reflections.
2. **Re-run aggregator** (`brd:l7:e2e`) and **master adapter** (`brd:l7:gate`) to regenerate `generated/boardroom-layer7-closure-report.json` with a fresh GREEN verdict.
3. **Live edge-function smoke** — invoke `boardroom-followthrough-dispatch` then `boardroom-outcome-record` with a synthetic correlation_id, verify the timeline event appears via `brd_followthrough_transition`, then confirm closure transition.
4. **Inspect `function_edge_logs`** for the two functions to confirm 200s, no errors.
5. **Append a final "Production Hardening Pass" trace block** to `BOARDROOM_LAYER7_FINAL_VERIFICATION.md` with timestamp, gate verdict, and live evidence URLs.
6. **Update memory** `features/boardroom-layer-7` with the final verification timestamp.

### Out of scope (would be duplication — already exists)
- New tables, edge functions, state machine, UI components, validation scripts, E2E specs, docs, CI gates, npm scripts, master gate registration

### Deliverables
- Refreshed `generated/boardroom-layer7-closure/*.json` (5 sub-reports)
- Refreshed `generated/boardroom-layer7-closure-report.json` (GREEN, 0 errors)
- Updated `BOARDROOM_LAYER7_FINAL_VERIFICATION.md` with hardening trace
- Final chat verdict: **GREEN, BLOCK-level gate satisfied, ready to publish**

If live data reveals any drift (it has not in any prior run), it will be remediated in this same phase before declaring GREEN.
