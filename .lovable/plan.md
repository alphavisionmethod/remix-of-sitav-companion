# Phase 5 — Memory, Files & Knowledge Platform Hardening

Phases 1–4 delivered: module/workspace registry, authority engine, Health OS data layer, and AI orchestration with explainability traces.

Phase 5 hardens the **knowledge spine** the orchestrator depends on: every memory, file, and knowledge chunk becomes workspace-scoped, provenance-tracked, sensitivity-classified, and governed by the Trust layer.

---

## Current State (audit)

**Memory tables present**: `pb_memories` (user-scoped, no workspace_id, no provenance), `advisor_memories`, `boardroom-memory.service.ts`, etc. — fragmented, no unified scope or provenance.

**File tables present**: `file_metadata` (legacy, no workspace_id), `pb_files` (has workspace_id + scope but no sensitivity/classification), `cloud_files` (storage shell). Two storage buckets exist: `user-files`, `pb-files`.

**Gaps**:
- No memory `workspace_id` or `module_id` scoping → orchestrator cannot inject workspace memory.
- No memory `provenance` (source chat / file / inferred / explicit).
- No memory `sensitivity` flag → restricted-workspace policies cannot be enforced.
- No knowledge-chunk table → file Q&A has no retrievable units to cite in explainability traces.
- No ingestion job table → multi-stage pipeline status is invisible.
- File mutations bypass the Trust authority engine.
- No "should I remember this?" governance loop.

---

## Phase 5 Deliverables

### 5.1 — Memory unification & provenance

**New table `memory_provenance`** (extends `pb_memories` rather than replacing it, to avoid duplicate stores):
- `memory_id uuid PK FK pb_memories(id) ON DELETE CASCADE`
- `workspace_id uuid NULL` (FK pb_workspaces — null = global user memory)
- `module_id text NULL` (FK module_registry.module_id)
- `pillar text` (business|finance|concierge|health|shared)
- `sensitivity text` default `internal` (`public|internal|confidential|restricted`)
- `provenance_kind text` (`explicit_user|inferred_chat|inferred_file|inferred_behavior|system_seed`)
- `source_chat_id uuid NULL`, `source_file_id uuid NULL`, `source_correlation_id uuid NULL`
- `confidence_band text` (`low|medium|high|verified`)
- `last_used_at timestamptz`
- `usage_count int default 0`
- `review_status text` default `accepted` (`pending_review|accepted|rejected|expired`)
- RLS: owner-only via `pb_memories.user_id` join.

**RPC `record_memory_usage(memory_id)`** — increments usage_count + sets last_used_at; called by orchestrator when a memory is injected into context.

**RPC `effective_workspace_memories(workspace_id, max_n)`** — returns memories scoped to: (workspace) ∪ (user-global) excluding `restricted` unless workspace is also restricted, ranked by confidence × recency.

### 5.2 — Knowledge chunks (file → retrievable units)

**New table `knowledge_chunks`** — first time the system has citeable retrieval units:
- `id uuid PK`
- `user_id uuid NOT NULL`
- `file_id uuid NOT NULL` (works against both `pb_files` and `file_metadata` via `source_table` discriminator)
- `source_table text` (`pb_files|file_metadata`)
- `workspace_id uuid NULL`, `module_id text NULL`, `pillar text`
- `chunk_index int`, `content text`, `token_estimate int`
- `sensitivity text` default `internal`
- `embedding_status text` (`pending|embedded|failed|skipped`) — embedding column itself deferred (pgvector add-on); we store status now
- `metadata jsonb`
- `created_at, updated_at`
- Indexed on `(user_id, workspace_id, file_id)` and full-text on `content` (tsvector generated column).
- RLS owner-only.

### 5.3 — Ingestion jobs

**New table `ingestion_jobs`** — multi-stage pipeline observability:
- `id uuid PK`, `user_id uuid`, `workspace_id uuid NULL`
- `source_kind text` (`file|chat|voice|connector`)
- `source_id uuid`, `source_table text`
- `stage text` (`queued|extracting|classifying|chunking|embedding|indexed|failed`)
- `progress numeric(4,3)`, `error text`, `correlation_id uuid`
- Timestamps + RLS owner-only.

### 5.4 — Trust integration (5 new actions, seeded into `trust_action_catalog`)

- `shared.memory.create` (low, default `pre_approved`)
- `shared.memory.update` (low, `pre_approved`)
- `shared.memory.delete` (medium, `ask`)
- `shared.file.upload` (low, `pre_approved`)
- `shared.file.delete` (medium, `ask`)
- `shared.knowledge.reindex` (low, `pre_approved`)

Mirror in `src/modules/_trust/registry/trust-action-registry.ts` → catalog now totals **40 actions**. Manifest regenerated deterministically.

### 5.5 — Edge function: `knowledge-indexer`

New orchestration function that:
1. Receives `{file_id, source_table, workspace_id?}`.
2. Calls authority engine (`shared.knowledge.reindex`).
3. Creates `ingestion_jobs` row, advances stages, writes `knowledge_chunks`.
4. Re-uses existing `file-ingestion` for raw extraction (no duplication).
5. Links chunks back to `ai_explainability_traces` schema (`source_table='knowledge_chunks'`).

### 5.6 — Frontend: shared knowledge & memory hooks

In `src/modules/_shared/knowledge/`:
- `memory-service.ts` + `useMemory()` (workspace-scoped read, governed write through authority).
- `knowledge-service.ts` + `useKnowledgeChunks(fileId)` + `useReindex()`.
- `MemoryProvenanceBadge.tsx` — surfaces source/confidence/last-used inline.
- `MemoryReviewQueue.tsx` — "Should I remember this?" inbox for `review_status='pending_review'`.
- `IngestionStatusPanel.tsx` — live job stages.

### 5.7 — Orchestrator wiring

Update `src/modules/_shared/ai/useOrchestrator.ts` and `supabase/functions/ai-orchestrator/index.ts` to:
- When `contextSources.workspaceMemoryAuto = true`, call `effective_workspace_memories` RPC instead of caller passing IDs by hand.
- For each retrieved memory + chunk, write an `ai_explainability_traces` row with role=`grounding` and source_table set correctly.
- Call `record_memory_usage` for each injected memory.

### 5.8 — Admin & CI

- New page `/admin/architecture/knowledge-spine` — counts memories by pillar/sensitivity, ingestion job health, top-cited chunks (last 30d).
- New CI script `check-memory-provenance-coverage.ts` — fails if any `pb_memories` row created in last 24h lacks a `memory_provenance` row. Lock baseline at 0.
- New CI script `check-knowledge-spine-manifest.ts` — emit deterministic `public/generated/knowledge-spine-manifest.json` (table counts, action keys, edge fn version) and diff like Phase 0.
- Wire both into `.github/workflows/ci.yml` and `scripts/pre-deploy.sh`.

### 5.9 — Backfill

One-time migration backfill:
- Insert `memory_provenance` rows for all existing `pb_memories` with `provenance_kind='system_seed'`, `confidence_band` derived from existing `confidence`, `sensitivity='internal'`, `workspace_id=NULL`.
- Leave `knowledge_chunks` empty (filled lazily by `knowledge-indexer` on next file open or admin-triggered reindex).

---

## Acceptance Gates (must all pass before declaring Phase 5 done)

1. ✅ Migration applied; 4 new tables present with RLS; 5 new actions in `trust_action_catalog`.
2. ✅ Backfill produced one `memory_provenance` row per existing `pb_memories` row.
3. ✅ `knowledge-indexer` edge function deployed, smoke-tested on a sample file.
4. ✅ Orchestrator auto-injects workspace memory + chunks and writes traces (verified via SQL).
5. ✅ Admin page `/admin/architecture/knowledge-spine` renders real counts.
6. ✅ Trust action manifest regenerated (40 actions); CI diff check green.
7. ✅ `check-memory-provenance-coverage.ts` and `check-knowledge-spine-manifest.ts` green; baselines locked.
8. ✅ TypeScript compiles; no new `as any` in `src/pages/**`.
9. ✅ No duplicate code: existing `memory-service/` files, `file-ingestion` edge fn, and `pb_memories` table all reused, not replaced.

---

## Out of Scope (deferred to later phases)

- Vector embeddings (pgvector enable + similarity search) — Phase 6 candidate.
- Voice transcript → memory bridge — Phase 6 (Voice Infrastructure).
- Cross-workspace knowledge sharing UI — Phase 8 (Growth/CRM lifecycle).

---

**On approval**: I'll execute as one atomic phase — migration → trust seed → edge fn → frontend hooks → orchestrator update → admin page → CI scripts → manifest regen → verification — and not stop until every acceptance gate passes.