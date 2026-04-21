# Advisor / Boardroom / Brain — Architectural Boundary Document

> **Status:** Authoritative  
> **Owner:** Platform Architecture  
> **Last updated:** 2026-04-21

## 1. Definitions

### Advisor

A **domain-specific intelligence persona** bound to a single area of expertise.

- **User-facing meaning:** Your dedicated expert for a specific area (Business, Finance, Legal, Concierge) that understands your context and gives personalized recommendations.
- **Internal meaning:** A registered agent with domain-scoped knowledge, prompt family, and autonomy policies. Produces recommendations, consumes domain signals, and participates in boardroom sessions when invited.
- **Canonical home:** `src/lib/advisors/`
- **Routes:** `/advisor/:domain`, `/advisor/:domain/chat`

### Boardroom

A **structured multi-advisor consultation and strategic review surface.**

- **User-facing meaning:** A strategic council where multiple advisors debate, analyze, and reach consensus on important decisions — like having a board meeting for your business.
- **Internal meaning:** An orchestration surface that convenes multiple advisors, structures debate rounds, synthesizes perspectives, identifies consensus/disagreement, and produces board-level recommendations.
- **Canonical home:** `src/lib/boardroom/`
- **Routes:** `/boardroom`, `/boardroom/session/:id`

### Brain

The **underlying orchestration, memory, and reasoning substrate.**

- **User-facing meaning:** The intelligence infrastructure that powers all AI features.
- **Internal meaning:** Shared intelligence layer providing context retrieval, model routing, inference pipeline, budget enforcement, receipt emission, fallback chains, and prompt version management. **Not directly user-facing.**
- **Canonical home:** `src/lib/core-services/brain-core/`
- **Routes:** None (infrastructure only)

---

## 2. Decision Tree

```
Is this shared intelligence infrastructure
(memory, routing, budget, inference)?
  → YES → Brain
  → NO  →
    Does it orchestrate multiple advisors
    for strategic review?
      → YES → Boardroom
      → NO  →
        Is it single-domain guidance
        or expertise?
          → YES → Advisor
          → NO  → Brain (default to infrastructure)
```

## 3. What Belongs Where

| Feature | Domain | Anti-pattern |
|---------|--------|-------------|
| Finance-specific recommendation | Advisor | Don't put in Boardroom |
| Business advisor 1:1 chat | Advisor | Don't put in Brain |
| Multi-advisor debate session | Boardroom | Don't put in Advisor |
| Consensus detection | Boardroom | Don't put in Brain |
| Model routing | Brain | Don't put in Advisor |
| Memory persistence | Brain | Don't put in Boardroom |
| Budget enforcement | Brain | Don't put in Advisor |
| Prompt version management | Brain | Don't put in Boardroom |
| Follow-through dispatch | Boardroom | Don't put in Advisor |
| Domain knowledge retrieval | Advisor | Don't put in Brain |

## 4. Terminology Guide

| Context | Use | Don't use |
|---------|-----|-----------|
| Public product copy | "Your Business Advisor" | "The business brain" |
| Public product copy | "Boardroom session" | "Brain meeting" |
| Internal code | `brain-core` | `advisor-brain` |
| Internal code | `boardroom-service` | `advisor-board-service` |
| Component naming | `AdvisorPanel` (single) | `AdvisorBoard` (misleading) |
| Component naming | `BoardroomSession` (multi) | `AdvisorSession` (ambiguous) |

## 5. Service Ownership Map

- **Advisor domain:** advisor-service, recommendation-service, advisor-feedback, advisor-knowledge, advisor-memory
- **Boardroom domain:** boardroom-service, boardroom-followthrough, boardroom-outcome
- **Brain domain:** model-router, budget-service, inference-service, prompt-service, fallback-service, memory-persistence, capability-router

## 6. Route Ownership Map

- **Advisor:** `/advisor/*`, `/advisors/*`
- **Boardroom:** `/boardroom/*`
- **Brain:** No user-facing routes

## 7. Rename Recommendations

| Current | Recommended | Reason |
|---------|-------------|--------|
| `src/components/business/advisor-board/` | `advisor-panel/` | Single-advisor, not boardroom |
| `src/lib/services/boardroom/` + `boardroom-service/` | Consolidate into one | Two duplicates |
| `src/lib/services/brain-core/` | Wrapper → `core-services/brain-core/` | Duplicate pair DSP-030 |