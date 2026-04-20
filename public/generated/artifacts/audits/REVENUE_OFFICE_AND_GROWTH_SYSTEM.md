# SITA OS — Revenue Office & Growth System

## Ownership

Domain: `business-os`
Service: `revenue-office`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Pipeline Management | Deal stages, probability weighting, revenue forecasting |
| Campaign Engine | Multi-channel campaigns, audience segmentation, A/B testing |
| Marketing Automation | Drip sequences, trigger-based actions, lead scoring |
| Booking & Scheduling | Appointment booking, calendar sync, availability management |
| Retention Engine | Churn prediction, re-engagement workflows, loyalty tracking |
| Growth DNA | Growth metric tracking, experiment framework, cohort analysis |
| Revenue Analytics | MRR/ARR tracking, LTV calculations, unit economics |

## Page Map

| Route | Purpose |
|-------|---------|
| `/revenue-office` | Dashboard — pipeline, revenue metrics, campaign status |
| `/revenue-office/pipeline` | Deal management, stage progression |
| `/revenue-office/campaigns` | Campaign creation, performance, audience |
| `/revenue-office/automation` | Marketing automation workflows |
| `/revenue-office/booking` | Scheduling, availability, appointments |
| `/revenue-office/retention` | Churn analysis, re-engagement |
| `/revenue-office/growth-dna` | Growth experiments, cohort analysis |
| `/revenue-office/analytics` | Revenue metrics, forecasting |

## Data Model

- `deals` / `pipeline_stages` — CRM pipeline
- `campaigns` / `campaign_audiences` — marketing campaigns
- `automation_workflows` — drip/trigger sequences
- `appointments` / `booking_slots` — scheduling
- `growth_experiments` — A/B tests and results
- `revenue_metrics` — periodic snapshots

## Proof Model

- Deal stage change receipt (who moved, when, rationale)
- Campaign launch receipt (audience size, channels, budget)
- Automation trigger receipt (event → action → outcome)
- Booking confirmation receipt (parties, time, confirmation)

## Integration Points

- `finance-os` — revenue recognition, invoice generation
- `concierge-os` — appointment reminders, follow-ups
- `connector-control-plane` — email/SMS/calendar connectors
- `event-bus` — cross-domain revenue events
- `receipt-service` — proof chain for all revenue actions
