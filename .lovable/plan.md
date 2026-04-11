

# Three Features — Implementation Plan

## 1. Connect Shopify to E-Commerce Manager

**Approach**: Enable the Shopify integration, then replace the hardcoded `DEMO_PRODUCTS`, `DEMO_COLLECTIONS`, etc. in `EcommerceOffice.tsx` with live Shopify data via an edge function proxy.

**Steps**:
- Enable Shopify integration (user chooses new or existing store)
- Create edge function `shopify-sync` that fetches products, collections, and orders from Shopify Admin API
- Create React hooks (`useShopifyProducts`, `useShopifyCollections`, `useShopifyOrders`) that call the edge function
- Update `EcommerceOffice.tsx` to use live data when available, falling back to demo data in demo mode
- Add inventory sync status indicator showing last sync time

**Files**: 1 new edge function, 1 new hooks file, edit `EcommerceOffice.tsx`

---

## 2. Drag-and-Drop Tab Reordering in Owner Workspace

**Approach**: Make the sidebar TABS array mutable state, persisted to `localStorage`. Use `@dnd-kit` (already common in React projects) or a simple pointer-event drag handler for reordering.

**Steps**:
- Install `@hello-pangea/dnd` (lightweight, maintained fork of react-beautiful-dnd)
- Convert `TABS` from `const` to state in `OwnerWorkspaceShell`, initialized from localStorage or default order
- Wrap the nav in a `DragDropContext` + `Droppable` + `Draggable` for each tab
- Add a drag handle icon (grip dots) visible on hover
- Persist reordered tab list to `localStorage` keyed by user
- Add a "Reset to default" option in the sidebar footer

**Files**: edit `OwnerWorkspaceShell.tsx`, add dependency

---

## 3. Dynamic Notification Badge Counts

**Approach**: The `notifications` table already exists with `user_id`, `domain`, `read`, `urgency` columns and realtime enabled. Replace the hardcoded `DEMO_BADGES` with a Supabase query that counts unread notifications grouped by domain, with a realtime subscription for live updates.

**Steps**:
- Rewrite `useAppBadges` to query `notifications` table: `SELECT domain, urgency, COUNT(*) FROM notifications WHERE user_id = auth.uid() AND read = false GROUP BY domain, urgency`
- Subscribe to realtime `INSERT`/`UPDATE` on `notifications` table to refresh counts automatically
- Map `domain` values to `appId` using the existing `DOMAIN_APP_MAP`
- Keep demo data as fallback when user is not authenticated
- Update `DesktopDock.tsx` if any interface changes are needed (likely none — same `getBadge` API)

**Files**: edit `useAppBadges.ts`

---

## Technical Details

### Shopify Edge Function
```text
POST /shopify-sync
Body: { action: "products" | "collections" | "orders" | "inventory" }
Returns: { data: [...] }
Auth: JWT required, Shopify API key from connector
```

### Badge Query
```sql
SELECT domain, urgency, COUNT(*)::int as count
FROM notifications
WHERE user_id = auth.uid() AND read = false
GROUP BY domain, urgency
```
Realtime subscription on `notifications` table (already in `supabase_realtime` publication) triggers re-fetch on changes.

### Drag-and-Drop
Uses `@hello-pangea/dnd` for accessible keyboard + pointer drag. Tab order stored as `owner-workspace-tab-order` in localStorage as JSON array of tab IDs.

## Total: 1 new edge function, 1 new hooks file, 3 file edits, 1 dependency

