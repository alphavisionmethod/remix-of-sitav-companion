

# Advisor Specialization, Individual Knowledge & Self-Learning

## Current Gaps

1. **Edge function `chat-advisor`** uses 6 generic one-paragraph system prompts. All advisors get the same shallow personality. No domain knowledge, no user-specific context injection, no memory of past conversations.
2. **Self-learning service** is a 13-line in-memory stub. No persistence, no per-advisor learning, no correction tracking, no feedback loop.
3. **No per-advisor knowledge base** — advisors cannot accumulate domain expertise, remember user corrections, or adapt their behavior over time.
4. **No conversation memory** — each chat session starts fresh. Advisors forget everything between sessions.
5. **No correction/feedback pipeline** — when a user says "that's wrong" or thumbs-down a response, nothing is captured or used to improve future responses.

## What We Build

### 1. Advisor Knowledge Base Service — `src/lib/services/advisor-knowledge/index.ts`

Per-advisor persistent knowledge store. Each advisor accumulates domain-specific knowledge articles that get injected into their system prompt as context.

- `addKnowledge(advisorId, article)` — stores a knowledge entry (title, content, tags, source, confidence)
- `getRelevantKnowledge(advisorId, query, limit)` — retrieves top-N articles matching the query by tag/keyword overlap
- `promoteKnowledge(id)` / `deprecateKnowledge(id)` — lifecycle management
- Persisted to `advisor_knowledge` Supabase table (new migration)
- Each advisor starts with seed knowledge from their `capabilities` and `description` in the registry

### 2. Advisor Memory Service — `src/lib/services/advisor-memory/index.ts`

Per-advisor, per-user conversational memory. Advisors remember past interactions, decisions, and user preferences.

- `saveConversationSummary(advisorId, userId, summary)` — stores a compressed summary of each conversation
- `getRecentMemories(advisorId, userId, limit)` — retrieves last N conversation summaries
- `saveUserFact(advisorId, userId, fact)` — stores a learned fact about the user ("prefers conservative investments", "has 3 kids")
- `getUserFacts(advisorId, userId)` — retrieves all known facts for context injection
- Persisted to `advisor_memories` Supabase table (new migration)

### 3. Advisor Correction & Feedback Service — `src/lib/services/advisor-feedback/index.ts`

Captures user corrections and feedback to improve advisor responses over time.

- `recordCorrection(advisorId, userId, originalResponse, correction, category)` — stores what went wrong
- `recordRating(advisorId, userId, messageId, rating, comment)` — thumbs up/down with optional comment
- `getCorrections(advisorId, limit)` — retrieves recent corrections to inject as "anti-patterns" in system prompt
- `getAdvisorScore(advisorId)` — computes rolling satisfaction score from ratings
- `generateLearningFromCorrections(advisorId)` — synthesizes corrections into knowledge articles (calls AI to extract patterns)
- Persisted to `advisor_feedback` table (new migration)

### 4. Enhanced Self-Learning Engine — Rewrite `src/lib/services/self-learning/index.ts`

Replace the 13-line stub with a full per-advisor self-learning engine.

- Per-advisor learning profiles with domain-specific pattern tracking
- Correction-driven learning: when corrections accumulate (3+ similar), auto-generate a knowledge article
- Outcome tracking: advisor predictions vs. actual outcomes (e.g., revenue forecast accuracy)
- Confidence calibration: adjusts advisor confidence thresholds based on historical accuracy
- Learning decay: old patterns lose weight over time unless reinforced
- Persists learning signals to `user_memory` with category `advisor_learning`

### 5. Deep System Prompts — Rewrite `chat-advisor/index.ts`

Replace the 6 generic prompts with a dynamic prompt builder that assembles per-advisor context:

- **Base personality**: Deep, unique personality and expertise description per advisor (2000+ chars each for all 26 advisors)
- **Knowledge injection**: Top 10 relevant knowledge articles from `advisor_knowledge` table
- **Memory injection**: Last 5 conversation summaries + all user facts from `advisor_memories`
- **Correction guardrails**: Recent corrections formatted as "AVOID: [pattern]" instructions
- **Cross-advisor context**: Key facts from other advisors that are relevant (e.g., Money Advisor knows business revenue context)
- **User preferences**: Communication style, detail level, formality from personalization engine
- Dynamic prompt assembly: `buildAdvisorPrompt(advisorId, userId, query)` constructs the full system prompt

### 6. Conversation Summarizer — `src/lib/services/advisor-memory/summarizer.ts`

After each conversation ends (or every 10 messages), calls AI to compress the conversation into a structured summary:

- Key decisions made
- Facts learned about the user
- Action items generated
- Unresolved questions
- Stored via the Advisor Memory Service for future context injection

### 7. Database Migration

New tables with RLS:

- `advisor_knowledge` — id, advisor_id, user_id, title, content, tags[], source, confidence, status, created_at, updated_at
- `advisor_memories` — id, advisor_id, user_id, memory_type (summary/fact/preference), content, metadata, created_at
- `advisor_feedback` — id, advisor_id, user_id, message_id, feedback_type (correction/rating), original_response, corrected_response, rating, category, created_at

All with RLS: users can only access their own rows.

## File Summary

| # | File | Type |
|---|------|------|
| 1 | Migration: `advisor_knowledge`, `advisor_memories`, `advisor_feedback` tables | New |
| 2 | `src/lib/services/advisor-knowledge/index.ts` | New |
| 3 | `src/lib/services/advisor-memory/index.ts` | New |
| 4 | `src/lib/services/advisor-memory/summarizer.ts` | New |
| 5 | `src/lib/services/advisor-feedback/index.ts` | New |
| 6 | `src/lib/services/self-learning/index.ts` | Rewrite |
| 7 | `supabase/functions/chat-advisor/index.ts` | Rewrite (dynamic prompts + memory + knowledge injection) |

**Total: 4 new service files, 2 rewrites, 1 migration. Each advisor becomes a unique specialist that learns, remembers, and improves from every interaction.**

