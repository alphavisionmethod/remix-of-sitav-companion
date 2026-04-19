# Admin Status Semantics Spec

## Canonical primitive

`src/components/primitives/status/StatusBadge.tsx`

## Locked tone-to-meaning mapping

| Tone      | Meaning                                                           | Visual                |
|-----------|-------------------------------------------------------------------|-----------------------|
| neutral   | informational / no judgement                                       | muted gray            |
| info      | informational signal worth attention                              | blue                  |
| success   | healthy / passing / verified                                      | green                 |
| warning   | degraded / pending intervention / reauth required                 | amber                 |
| danger    | failing / critical / blocked                                      | red                   |
| muted     | archived / out-of-scope / honest-warn deferred                    | very muted gray       |
| verified  | proof-bound (receipt / signature / attestation present)           | green (verified hue)  |
| pending   | awaiting confirmation / dual-approval / cooldown                  | amber (pending hue)   |
| failed    | terminal failure with operator action required                    | red (failed hue)      |

Tones are HSL-defined inside `StatusBadge.tsx` — they are **not** to be redefined or shadowed elsewhere.

## Bans (enforced by `check-admin-status-semantics`)

Inside `src/pages/admin/**` and `src/components/admin/**`, the following classes may **not** appear outside `StatusBadge.tsx`:

- `bg-yellow-*`, `text-yellow-*`, `border-yellow-*`
- `bg-red-*`, `text-red-*`, `border-red-*`
- `bg-green-*`, `text-green-*`, `border-green-*`
- `bg-amber-*`, `text-amber-*`, `border-amber-*`

Allowed alternatives: semantic tokens (`bg-destructive`, `text-destructive-foreground`, etc.) and `<StatusBadge tone="...">`.

## Rationale

Without a locked color palette, "yellow" can drift across boards (degraded vs informational vs preview), eroding the operator's ability to scan a hub at a glance. Locking semantics at the primitive level guarantees that one color always means one thing.
