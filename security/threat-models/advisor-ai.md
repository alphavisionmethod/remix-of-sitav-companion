# Threat Model: Advisor & AI Pipeline

## System Description
SITA OS routes user intents through a brain-core orchestrator to domain-specific AI advisors. Advisors produce recommendations, which may trigger approval flows, workflows, or direct actions. All AI interactions are logged with proof records.

## Assets
- User intent and context (advisor_requests)
- AI model responses and reasoning (advisor_responses)
- System prompts and advisor configurations (advisor_configs)
- Approval decisions (approval_queue)
- Proof of AI actions (proof_records)

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Impersonate advisor to inject false recommendations | High | Advisor responses only created via edge functions with service role; client cannot INSERT | Mitigated |
| Prompt injection via user input | High | No-hallucination guardrails: grounding, confidence scoring, refusal protocol, contradiction detection | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Modify advisor system prompts | Medium | `advisor_configs` RLS: only owner can update; changes logged | Mitigated |
| Alter AI response after generation | Medium | `advisor_responses` immutable after creation; no UPDATE without owner auth | Mitigated |
| Manipulate confidence scores | Medium | Confidence computed server-side in edge function; client receives read-only | Mitigated |

### R — Repudiation
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Deny AI recommendation was made | Low | Full audit trail: request → response → approval → proof chain | Mitigated |
| No record of model used or tokens consumed | Low | `model_used`, `tokens_used`, `latency_ms` recorded per response | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| AI model leaks training data | Medium | Using managed models via Lovable AI; no fine-tuning on user data | Accepted |
| System prompts exposed to user | Low | System prompts stored server-side in advisor_configs; not sent to client | Mitigated |
| Cross-user context leakage in AI | Medium | Each request scoped to single user_id; no shared context between users | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| AI cost explosion via rapid requests | High | AI spend tracking; rate limiting per user; cost anomaly detection in Mission Control | Mitigated |
| Model unavailability | Medium | Multi-model routing; fallback to cheaper models; graceful degradation | Mitigated |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| AI action bypasses approval flow | Critical | Policy engine evaluates every action; high-risk actions require explicit approval | Mitigated |
| Advisor escalation threshold manipulation | Medium | `escalation_threshold` in advisor_configs; owner-only update via RLS | Mitigated |

---

## AI-Specific Controls
1. **No-Hallucination Framework** — Grounding checks, confidence scoring, contradiction detection, staleness detection, truth boundaries, refusal protocol
2. **Execution Chain** — Intent → Policy Check → Approval (if required) → Execution → Receipt → Verification → Proof
3. **Cost Guardrails** — Per-request token tracking, daily spend limits, anomaly alerts
4. **Model Routing** — Brain-core routes to appropriate model based on complexity; never sends sensitive data to unnecessary models
