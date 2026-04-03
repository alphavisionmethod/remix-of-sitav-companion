# SITA OS — CRM & Customer Dashboard System

## Ownership

CRM belongs to `business-os`. It is NOT a separate service.

## Customer Lifecycle

```
lead → qualified → opportunity → proposal → customer → active → at-risk → churned → reactivated
```

## Core Entities

| Entity | Description |
|--------|-------------|
| Lead | Inbound interest, scored 0-100 |
| Contact | Person record with communication history |
| Account | Business/organization entity |
| Opportunity | Active deal with value, stage, probability |
| Quote | Priced proposal linked to opportunity |
| Invoice | Billing record linked to finance-os |
| Customer | Active client with health score |

## Customer Health Score

Composite of:
- Engagement recency (30%)
- Revenue trend (25%)
- Communication frequency (20%)
- Issue resolution (15%)
- Satisfaction signals (10%)

## Dashboard Projections

Customer dashboard shows:
- Health score trend
- Revenue history
- Open opportunities
- Pending invoices (cross-domain to finance-os)
- Recent communications
- Upcoming appointments (cross-domain to concierge-os)
- File attachments (cross-domain to files)
- Proof/receipt history

## Follow-Up Detection

Business advisor identifies:
- Contacts not reached in >14 days
- Opportunities stalled >7 days
- Invoices overdue (from finance-os events)
- At-risk customers based on engagement drop

## Website Lead Capture

Inbound leads from website forms:
- Payload validated against business-contracts
- Auto-scored on arrival
- Routed to lead inbox
- Advisor notified
