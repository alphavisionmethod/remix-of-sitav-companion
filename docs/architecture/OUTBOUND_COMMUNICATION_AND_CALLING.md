# SITA OS — Outbound Communication & Calling

## Governance Rules

All outbound communication (email, SMS, call) must:
1. Pass policy engine review
2. Respect contact preferences
3. Comply with time-zone and hours restrictions
4. Generate proof receipts
5. Be reviewable before send (draft state)

## Communication Types

| Type | Policy Level | Approval Required |
|------|-------------|-------------------|
| Transactional email | Low | No (auto-approved) |
| Marketing email | Medium | Yes for first-time |
| Follow-up email | Low | No if within relationship |
| SMS | Medium | Yes |
| Phone call | High | Yes always |
| Bulk communication | Critical | Dual approval |

## Review Package

Before any outbound communication:
- Recipient verified
- Content reviewed (advisor draft)
- Tone appropriate for relationship stage
- Legal compliance checked
- Time-zone appropriate
- Opt-out status verified

## Proof Trail

Every outbound generates:
- Draft receipt
- Approval receipt (if required)
- Send receipt with delivery status
- Response tracking receipt
