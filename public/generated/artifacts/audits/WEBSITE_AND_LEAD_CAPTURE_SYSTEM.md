# SITA OS — Website & Lead Capture System

## Purpose

Capture inbound interest from website forms, score leads, and route to business-os pipeline.

## Lead Intake Flow

```
Website Form → API Gateway → business-os Lead Intake → Score → Route → Advisor Notification
```

## Lead Scoring

Composite score (0-100):
- Form completeness (20%)
- Source quality (20%)
- Budget indicator (20%)
- Urgency signals (20%)
- Fit score (20%)

## Lead Routing

| Score | Action |
|-------|--------|
| 80+ | Hot lead — immediate advisor alert |
| 60-79 | Warm lead — priority inbox |
| 40-59 | Cool lead — standard queue |
| <40 | Cold lead — nurture track |

## Data Contracts

See `packages/business-contracts` for:
- `WebsiteLeadIntakePayload`
- `ScoredLead`
- `LeadRoutingDecision`

## Proof

Every lead capture generates:
- Intake receipt with timestamp
- Score receipt with reasoning
- Routing receipt with destination
