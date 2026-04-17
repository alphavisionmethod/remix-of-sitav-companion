

## Fix C-005: Notification → Realtime → Toast Chain — what's actually broken

### Live findings

1. ✅ Hook `useRealtimeNotifications` already exists at `src/hooks/use-realtime-notifications.ts` — fully implemented with sonner toasts, urgency styling, Electron bridge fallback, and React Query invalidation. **Better than the example fix in the brief.**
2. ✅ It IS already wired — in `src/components/sita/ShellLayout.tsx:204` (not `PlatformInit`, but functionally identical: ShellLayout renders inside the authenticated tree).
3. ✅ `notifications` table IS in the `supabase_realtime` publication.
4. 🔴 **The actual bug**: `pg_class.relreplident = 'd'` (DEFAULT) on `public.notifications`. Supabase Realtime `postgres_changes` requires **`REPLICA IDENTITY FULL`** to deliver the complete `payload.new` row reliably for `INSERT` events with filters like `user_id=eq.<uuid>`. With DEFAULT identity, the filter can silently drop events because the replica stream may not include all columns needed to evaluate the filter on the wire — this is the classic "realtime is enabled but no toast appears" symptom.
5. ✅ Notification bell UI exists (`NotificationInbox.tsx` with `data-testid="notification-bell"`) and listens to the same query key (`["notifications"]`) that the hook invalidates — so once realtime fires, the bell badge updates too.

### The fix (one migration + one tiny resilience tweak)

#### 1. Database migration — set REPLICA IDENTITY FULL

Single SQL migration:

```sql
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
```

This is the real root cause. After this, `postgres_changes` INSERT events with the `user_id=eq.<uuid>` filter will fire reliably and `payload.new` will contain `title`, `body`, `urgency`, `action_url` — exactly what the existing hook reads.

Also confirm (idempotent, no-op if already present) that the table is in the publication:

```sql
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
```

#### 2. Hook resilience — unique channel name + auth-token attach

Two small hardening tweaks to `src/hooks/use-realtime-notifications.ts`:

- Make the channel name user-scoped (`realtime-notifications-${user.id}`) so a stale channel from a previous user never collides on fast logout/login.
- Call `supabase.realtime.setAuth(session.access_token)` before subscribing — required when RLS is on `notifications` (which it is). Without this, the realtime socket can be unauthenticated against RLS and silently drop filtered events for the user.
- Log the subscribe status so future debugging is trivial (`SUBSCRIBED` / `CHANNEL_ERROR` / `TIMED_OUT`).

No UI changes needed — toast, bell, query invalidation, and Electron bridge are already correct.

### Verification steps (post-deploy)

1. `SELECT relreplident FROM pg_class WHERE relname='notifications' AND relnamespace='public'::regnamespace;` returns `f` (FULL).
2. Sign in as a real user, then in another tab insert a row:
   ```sql
   INSERT INTO public.notifications (user_id, title, body, urgency)
   VALUES ('<my-uid>', 'Realtime test', 'You should see a toast', 'high');
   ```
   A toast appears within ~2s and the bell badge increments.
3. Repeat for `urgency: 'critical'` → red toast with 10s duration.
4. Browser console shows `[realtime-notifications] status: SUBSCRIBED`.

### Files

| File | Change |
|---|---|
| `supabase/migrations/<new>.sql` | NEW — `ALTER TABLE notifications REPLICA IDENTITY FULL` + idempotent publication check |
| `src/hooks/use-realtime-notifications.ts` | Per-user channel name, `setAuth` before subscribe, status log |

### Acceptance

- Inserting a row into `notifications` for the current user produces a visible toast within 2s
- Bell badge auto-updates without manual refresh (already wired via `["notifications"]` invalidation)
- C-005 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready

