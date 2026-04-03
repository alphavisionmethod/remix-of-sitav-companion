# SITA OS — Travel & Booking Integration

## Ownership

Travel belongs to `concierge-os` as a capability family.

## Booking Flow

```
Search → Score Options → Present → Approve → Book → Confirm → Track → Prep → Travel → Post-Trip
```

## Advisor Role

Concierge advisor:
- Scores booking options (price, convenience, preference fit)
- Detects scheduling conflicts
- Builds itineraries
- Generates prep checklists
- Tracks confirmation status

## Cross-Domain Impact

Travel booking triggers:
- Finance: projection update, budget check
- Business: calendar block, client meeting prep
- Concierge: household schedule update, pet/home care coordination

## Connector Dependencies

| Connector | Purpose |
|-----------|---------|
| Calendar | Conflict detection, schedule blocking |
| Email | Confirmation parsing |
| Booking APIs | Search and booking (future) |

## Proof Model

- Search receipt (what was searched)
- Comparison receipt (options scored)
- Approval receipt (booking approved)
- Booking receipt (confirmation details)
- Prep checklist receipt
