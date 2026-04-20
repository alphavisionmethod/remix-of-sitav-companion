

## Diagnosis

User wants a brand-new artifact — `MISSING_AUDIT.md` — generated as a deep, file-level repository reality audit and made downloadable. This is a **non-build, artifact-generation task** (a long markdown document), not a UI feature. It should be produced via `code--exec` writing to `/mnt/documents/` and surfaced via `<lov-artifact>`. A copy should also land in `public/generated/` so it's reachable from the in-app document viewer alongside the existing `PROJECT_TREE_AUDIT.md`.

I am in plan mode (read-only), so I'll present the plan and execute on approval.

## Exploration I'll perform during execution

Before writing the audit, I need to ground every claim in real filesystem evidence (the user's primary rule: "Truth only"). I'll inventory:

| Surface | Command / probe |
|---|---|
| Top-level layout | `ls -la`, `ls src/`, `ls electron/`, `ls os/`, `ls supabase/{functions,migrations}` |
| `src/lib/` cluster (91 dirs) | `ls src/lib/` + `wc -l` per subdir, identify duplicates/legacy |
| Routes vs pages | grep `<Route` in `src/App.tsx` + `ls src/pages/**`, find dead pages |
| Edge functions | `ls supabase/functions/` + cross-check with callers via `grep "supabase.functions.invoke"` |
| Migrations | `ls supabase/migrations/` count + scan recent files for RLS patterns |
| Generated artifacts | `ls generated/`, `ls public/generated/` — flag stale outputs |
| Validators | `ls scripts/architecture/checks/` cross-checked vs `check-os-release-readiness.ts` aggregator |
| Electron | `ls electron/` vs `_layout.cjs` registry |
| OS image | `ls os/image-builder/` + `.github/workflows/os-build-iso.yml` |
| Internal agents | `ls src/lib/internal-agents/` + the 40-agent registry |
| Onboarding | grep first-use screens vs the 29-screen master spec |
| Connectors | `ls src/lib/connectors/` + connector_tokens table refs |
| AI gateway | `ls src/lib/services/ai-gateway/` + `supabase/functions/ai-gateway` |

I'll also read key truth files: `PROJECT_TREE_AUDIT.md`, `MASTER_REMEDIATION_BLUEPRINT_v2.md`, `MASTER_REMEDIATION_VERIFICATION_v2.md`, `check-os-release-readiness.ts`, and 5-10 representative generated reports to detect drift.

## Plan — Generate `MISSING_AUDIT.md`

### Step 1 — Filesystem reconnaissance (parallel reads)
Run a batch of `ls`, `wc`, and targeted `grep` calls to build the evidence base. Outputs feed directly into Parts II–XII.

### Step 2 — Targeted file reads
Read the 8–12 most-important truth files (release aggregator, route map, electron layout, latest migration index, generated coverage reports) to cross-validate claims vs reality.

### Step 3 — Compose the audit (single Python heredoc → `/mnt/documents/MISSING_AUDIT.md`)
Document follows the user's exact 15-part structure:

- **Part I** — Executive Reality Summary (solid / weak / missing / overstated / duplicated / critical path)
- **Part II** — Full Repository Topology (table: directory · purpose · canonical status · owner · risks · missing proof)
- **Part III** — File Cluster Audit (12 clusters, each with: exists / wired / partial / dead / missing / fixes)
- **Part IV** — End-to-End Wiring Audit (8 representative traces with breakpoints)
- **Part V** — Integration Audit (auth, Supabase, Google, MS, Slack, Twilio, SendGrid, Stripe, Plaid, AI providers, voice, runtime, update channels)
- **Part VI** — Database & Policy Audit (tables · RLS · indexes · append-only · receipts · missing migrations)
- **Part VII** — Runtime / Electron / OS Audit
- **Part VIII** — AI / Advisor / Autonomy Audit
- **Part IX** — App Platform / SDK / Windowing Audit
- **Part X** — Admin / Operator / Support Audit
- **Part XI** — Onboarding / Journey Audit (29-screen first-use spec vs reality)
- **Part XII** — Validation / Evidence / Release Audit (21 BLOCK gates verified line-by-line)
- **Part XIII** — Contradictions, Drift, Legacy (verified phantom folders, stale generated artifacts, deprecated-but-live paths)
- **Part XIV** — Exact Fix Plan (P0/P1/P2/P3, each with title · problem · files · wiring · validator · proof · rollback)
- **Part XV** — 30/60/90 day execution plan with critical path + parallel workstreams

Target: ~3,000–4,500 lines of dense, table-heavy, evidence-cited markdown. Every claim hyperlinked to a real file path discovered in Step 1/2.

### Step 4 — Mirror & surface
- Write to `/mnt/documents/MISSING_AUDIT.md` (downloadable artifact).
- Copy to `public/generated/MISSING_AUDIT.md` so it's reachable from the in-app document viewer alongside `PROJECT_TREE_AUDIT.md`.
- Verify both copies are byte-identical (`md5sum`).
- Emit `<lov-artifact path="MISSING_AUDIT.md" mime_type="text/markdown">`.

### Step 5 — QA pass
Open the generated file, spot-check 5 random claims against the filesystem, and confirm:
- All 15 parts present
- No phantom-folder claims (e.g., no `src/lib/policies/`, `sync/`, `proof/` etc. — verified non-existent per memory)
- Every "missing" item paired with an exact fix
- Honest classification of deferred items (mobile, calendar streaks, etc.)

## What this does NOT touch

- No code changes
- No DB migrations, edge functions, auth changes
- No edits to `src/`, `electron/`, `os/`, `scripts/`, `supabase/`
- No changes to the 21 BLOCK gates or release aggregator
- No edits to `PROJECT_TREE_AUDIT.md` or any existing generated artifact

## Verification after approval

```bash
ls -la /mnt/documents/MISSING_AUDIT.md public/generated/MISSING_AUDIT.md
md5sum /mnt/documents/MISSING_AUDIT.md public/generated/MISSING_AUDIT.md     # identical
wc -l /mnt/documents/MISSING_AUDIT.md                                          # ~3000-4500 lines
grep -cE "^## Part " /mnt/documents/MISSING_AUDIT.md                          # 15
grep -E "src/lib/(policies|sync|proof|execution|eventing|notifications)/" /mnt/documents/MISSING_AUDIT.md  # 0 phantom claims
```

Deliverable: a downloadable `MISSING_AUDIT.md` that a CTO, principal engineer, release manager, and security lead can execute against immediately.

