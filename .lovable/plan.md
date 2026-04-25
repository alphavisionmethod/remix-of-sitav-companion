# Phase 7 — Live Semantic Cortex (streaming + voice intents + embedding budget)

Phase 6 closed the vector + voice-to-memory loops. Phase 7 turns them into a **live, governed cortex** the orchestrator can stream from, that voice can act on, and that finance can budget.

## Three loops still open after Phase 6.b
1. **Streaming semantic deltas** — `ai-orchestrator` returns one final payload; explainability traces only appear after the model finishes. There's no SSE channel.
2. **Voice intents** — `voice-spine` records transcripts but they're inert. There's no path from "user said X" → "advisor proposes a trust-gated action".
3. **Embedding budget** — `knowledge-embedder` calls `text-embedding-004` with no per-user ceiling, no cost ledger entry tagged `mode='embedding'`, and no fallback when over budget.

## Phase 7 Deliverables

### 7.1 Streaming orchestrator (`ai-orchestrator-stream`)
New SSE edge fn emitting `context` (semantic hits), `delta` (token chunks), `trace` (explainability rows), `done` (final receipt). Frontend `useOrchestratorStream()` hook yields tokens + traces incrementally.

### 7.2 Voice intents
New table `voice_intents` (session_id, transcript_id, action_key, params, confidence, status, expires_at — 30d TTL). New RPC `extract_voice_intents` + `voice-spine?action=extract_intents` calling `gemini-3-flash-preview` with tool-calling. Surfaced in `VoiceTranscriptDrawer` with a "Run via Trust" button → existing trust-action engine.

### 7.3 Embedding budget governance
`embedding` capability key in `ai_capability_routing` (budget_class=`bulk`). `knowledge-embedder` calls `check_ai_budget_policies` per batch and writes `ai_budget_decision_receipts`. New view `embedding_budget_overview`; admin panel adds a burn-down card to `/admin/architecture/semantic-spine`.

### 7.4 Trust + observability
2 new trust actions: `shared.voice.intent.execute` (high, `ask`), `shared.embedding.batch` (low, `pre_approved`) — total **44**. Manifest + CI gate updated.

### Acceptance gates (10)
1. `ai-orchestrator-stream` deployed and returns SSE.
2. `useOrchestratorStream` emits ≥3 event kinds.
3. `voice_intents` table exists, RLS owner-only, 30d TTL.
4. `extract_voice_intents` returns ≥1 proposal on a test transcript.
5. `voice-spine?action=extract_intents` deployed + idempotent.
6. `VoiceTranscriptDrawer` renders intents with Trust-routed execute button.
7. Embedder writes `ai_budget_decision_receipts` for every batch.
8. `embedding_budget_overview` returns today's totals per user.
9. Trust registry exports 44 entries; manifest hash regenerated.
10. CI gate `check-semantic-spine-manifest.mjs` passes.

---

# Phase 6 — Vector Embeddings & Voice-to-Memory Bridge ✅ SHIPPED

Phases 1–5 delivered: module/workspace registry, authority engine, Health OS, AI orchestration with explainability traces, and a workspace-scoped knowledge spine (memory provenance + knowledge chunks + ingestion jobs).

Phase 6 closes two open loops the orchestrator cannot yet do:

1. **Semantic retrieval** — chunks are stored full-text only (`tsvector`); the orchestrator cannot rank by meaning.
2. **Voice as a first-class memory source** — voice goes into `personal-brain` and `SitaVoiceContext` but never lands in `pb_memories` with provenance, so it disappears.

---

## Current State (audit)

- ✅ `pgvector` extension is **available** in Postgres but not yet enabled.
- ✅ `knowledge_chunks` exists with `embedding_status text` placeholder and tsvector full-text — but no embedding column.
- ✅ Voice infra exists: `pb_voice_prefs`, `SitaVoiceContext`, `useCloudVoice`, `VoicePanel`, browser STT and `personal-brain` edge fn.
- ❌ No `voice_sessions` / `voice_transcripts` tables → voice has no audit trail or persistence.
- ❌ No bridge from a voice transcript to `memory_provenance` (`provenance_kind='inferred_voice'` is missing from the enum vocabulary).
- ❌ Orchestrator `effective_workspace_memories` ranks by confidence × recency only, not similarity.
- ❌ No embedding worker / batch job; `embedding_status` is permanently `pending`.
- ❌ ElevenLabs STT/TTS exists in browser only — no server-side STT receipt for the audit trail.

---

## Phase 6 Deliverables

### 6.1 — Enable pgvector + embedding columns

- `CREATE EXTENSION IF NOT EXISTS vector;`
- `ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(768) NULL;` (768 = Gemini text-embedding-004 dim).
- `ALTER TABLE memory_provenance ADD COLUMN embedding vector(768) NULL;` — memories are also embedded for semantic recall.
- IVFFlat indexes (`vector_cosine_ops`, `lists=100`) on both columns. Conditional creation only after first 100 rows are populated (deferred trigger).
- New column `knowledge_chunks.embedding_model text` + `embedding_dim int` so future re-embed (e.g. 1536-dim) is non-destructive.

### 6.2 — Embedding worker (`knowledge-embedder` edge fn)

- Pulls up to 50 rows where `embedding_status='pending'` (chunks ∪ memories).
- Calls **Lovable AI Gateway** `google/text-embedding-004` (no extra key required).
- Writes `embedding`, `embedding_model`, `embedding_dim`, sets `embedding_status='embedded'`.
- Records `ai_invocation_plans` row with `mode='embedding'`, capability `shared.embed.text`, full cost accounting.
- Triggered by:
  - Trust action `shared.knowledge.embed` (manual reindex).
  - Cron-style invocation from existing `knowledge-indexer` once a chunk is written (already-async pattern, no new scheduler).

### 6.3 — RPC `semantic_workspace_memories(workspace_id, query_embedding, max_n, min_similarity)`

- Returns memories from (workspace ∪ user-global) ordered by `1 - (embedding <=> query_embedding)` (cosine sim).
- Falls back gracefully to `effective_workspace_memories` when query_embedding is null OR fewer than 10 embedded memories exist.
- Same sensitivity/restricted-workspace gating as Phase 5.

### 6.4 — RPC `semantic_knowledge_chunks(workspace_id, query_embedding, max_n)` — same pattern, returns top chunks for grounding.

### 6.5 — Orchestrator wiring

Update `supabase/functions/ai-orchestrator/index.ts`:

1. Before context resolution, embed the **last user message** via the embedding worker (cached by hash to avoid re-embedding).
2. If `contextSources.semanticRetrieval !== false`, call the two new RPCs first; merge with `effective_workspace_memories` results (semantic wins on ties).
3. Emit explainability traces with `metadata.similarity` and `metadata.retrieval_kind ∈ ('semantic'|'recency'|'explicit')`.

Update `useOrchestrator.ts` types: `OrchestratorContextSources.semanticRetrieval?: boolean` (default true).

### 6.6 — Voice spine (Voice-to-Memory bridge)

**New tables** (RLS owner-only, 90-day TTL on transcripts):

- `voice_sessions`
  - `id uuid PK`, `user_id`, `workspace_id NULL`, `module_id NULL`
  - `started_at`, `ended_at`, `duration_ms`, `provider text` (`browser_stt|elevenlabs_stt|gemini_stt`)
  - `mode text` (`dictation|conversation|background`)
  - `correlation_id uuid`, `metadata jsonb`, `expires_at`
- `voice_transcripts`
  - `id uuid PK`, `session_id uuid FK`, `user_id`
  - `seq int`, `role text` (`user|assistant|system`)
  - `text text`, `lang text`, `confidence numeric(4,3)`
  - `is_final bool`, `audio_storage_path text NULL` (optional reference into `voice-recordings` bucket — not auto-stored)
  - `embedding vector(768) NULL`, `embedding_status text`
  - `expires_at`

**New storage bucket** `voice-recordings` (private, owner-only via folder-name = user id). Default disabled — only used when user explicitly opts in via `pb_voice_prefs.transcript_retention='extended'`.

### 6.7 — Voice-to-Memory promotion

New RPC `promote_voice_transcript_to_memory(transcript_id, sensitivity)`:
- Inserts into `pb_memories` with content from transcript.
- Inserts into `memory_provenance` with `provenance_kind='inferred_voice'`, `source_chat_id=session_id`, `confidence_band` derived from STT confidence.
- Marks transcript `metadata.promoted_memory_id`.
- Trust action: `shared.memory.create` already covers this (Phase 5).

New Trust action: `shared.voice.session.start` (low, `pre_approved`) — keeps voice spine inside authority engine. **Catalog now totals 41 actions.**

### 6.8 — Edge function `voice-spine`

Single endpoint with sub-routes:
- `POST /voice-spine/session/start` → creates `voice_sessions` row, returns `session_id` + `correlation_id`.
- `POST /voice-spine/transcript` → upserts `voice_transcripts` (called by client when STT fires `is_final`).
- `POST /voice-spine/session/end` → finalises session, kicks `knowledge-embedder` to embed final transcripts.
- `POST /voice-spine/promote` → wraps `promote_voice_transcript_to_memory`.

CORS, auth via JWT, Trust enforcement on every sub-route.

### 6.9 — Frontend (`src/modules/_shared/voice/`)

- `voice-spine-service.ts` + `useVoiceSession()`, `useVoiceTranscripts(sessionId)`, `usePromoteTranscript()`.
- `VoiceTranscriptDrawer.tsx` — read-only timeline of finalised transcripts with one-click "Remember this" button.
- `SemanticContextBadge.tsx` — small chip surfaced inside `ExplainabilityPanel` showing similarity score when `retrieval_kind='semantic'`.
- Hook `SitaVoiceContext` (existing) emits transcripts to the new spine when `pb_voice_prefs.transcript_retention !== 'none'` — non-breaking.

### 6.10 — Admin & CI

- New page `/admin/architecture/semantic-spine` — embedding coverage % per pillar, average similarity for last 100 retrievals, voice session counts, top-promoted memories.
- New CI script `check-embedding-coverage.mjs` — fails if `embedding_status='pending'` count > 1000 (baseline lock) for chunks older than 24h.
- New CI script `check-voice-spine-manifest.mjs` — emits `public/generated/voice-spine-manifest.json` (tables, RPCs, edge fn version, trust action count) and diff-checks like Phase 0/5.
- Wire both into existing `deployment-readiness-gate.yml`.

### 6.11 — Backfill

- Schedule (idempotent, runs once via the embedder on first deploy): embed all existing `knowledge_chunks` and `pb_memories` rows in batches of 50.
- No voice backfill (voice tables are net new).

---

## Acceptance Gates (must all pass before declaring Phase 6 done)

1. ✅ `vector` extension enabled; `embedding` columns added; IVFFlat indexes created (post-backfill).
2. ✅ `knowledge-embedder` deployed and successfully embeds a sample chunk via Lovable AI Gateway.
3. ✅ `semantic_workspace_memories` and `semantic_knowledge_chunks` RPCs return ranked results in < 200ms on a 1k-row test set.
4. ✅ Orchestrator uses semantic retrieval; explainability traces show `retrieval_kind='semantic'` with similarity scores.
5. ✅ `voice_sessions` and `voice_transcripts` tables present with RLS; `voice-spine` edge fn smoke-tested end-to-end.
6. ✅ `promote_voice_transcript_to_memory` writes `memory_provenance` with `provenance_kind='inferred_voice'`.
7. ✅ Trust catalog totals **41 actions**; manifest regenerated; diff CI green.
8. ✅ Admin page `/admin/architecture/semantic-spine` renders real coverage %.
9. ✅ Both new CI scripts green; baselines locked.
10. ✅ TypeScript compiles clean; no new `as any` in `src/pages/**`; no duplicate code (re-uses `knowledge-indexer`, `pb_memories`, `pb_voice_prefs`, `SitaVoiceContext`).

---

## Out of Scope (deferred)

- Real-time streaming embeddings (we batch every chunk-write — sufficient for Phase 6).
- Cross-modal (image/audio) embeddings — Phase 7 candidate.
- Speaker diarisation — Phase 7 candidate (ElevenLabs scribe_v2 supports it; not needed for memory bridge).
- Voice TTS personalisation — already covered by existing `pb_voice_prefs`.

---

**On approval**: I'll execute as one atomic phase — migration (vector + voice tables + RPCs) → trust seed → `knowledge-embedder` + `voice-spine` edge fns → frontend hooks/components → orchestrator semantic wiring → admin page → CI scripts → manifest regen → backfill smoke test — and not stop until every acceptance gate passes.

---

# Phase 5 — Memory, Files & Knowledge Platform Hardening (COMPLETED)

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