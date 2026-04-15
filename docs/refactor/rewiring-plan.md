# SITA OS — Rewiring Plan

> How trust, approval, eventing, and communication flows are rewired after migration.

## 1. Trust Flow

### Current (Monolith)
```
UI → import trust-governor.ts → evaluate locally → render
```

### Target (Multi-Plane)
```
UI (admin/founder/mobile)
  → HTTP/WS → Backend BFF
    → trust-governor service
      → evaluation result
    → response
  → render
```

**Key change**: Trust evaluation moves from client-side import to server-side API call. No UI plane may evaluate trust directly.

## 2. Approval Flow

### Current
```
UI → import approval-engine → create approval → store in Supabase
Mobile → import approval-engine → approve/reject
```

### Target
```
Any surface → POST /api/approvals → Backend approval-service
  → validates authority (JWT + device attestation)
  → stores approval
  → emits WebSocket event
Mobile (authority device)
  → receives push notification
  → POST /api/approvals/:id/approve (biometric-gated)
  → Backend verifies, executes
```

## 3. Event Flow

### Current
```
EventBus (in-memory singleton) → subscribers in same process
Supabase Realtime → WebSocket to browser
```

### Target
```
Backend internal event bus
  → processes events
  → materializes receipts/timeline
  → fans out via WebSocket Gateway

WebSocket Gateway
  → multiplexed channels per plane
  → admin-events, founder-events, mobile-events, os-events

Push Gateway (mobile)
  → APNs / FCM for wake/alert
  → deep-link to approval surface
```

## 4. Command Execution Flow

### Current
```
UI → import executor-service → execute command
```

### Target
```
1. Command originates in app/admin/founder surface
2. → POST /api/commands → Backend command router
3. → Backend creates ActionEnvelope
4. → Approval service gates if required (mobile push)
5. → Backend dispatches to OS agent (WebSocket/gRPC)
6. → OS local command executor performs action
7. → OS emits progress events + receipts
8. → Backend verifies outcome
9. → UI surfaces observe result via WebSocket
```

**No UI plane may execute commands by importing executor logic.**

## 5. Receipt & Proof Flow

### Current
```
receipt-service.ts → generates receipts in-browser → stores in Supabase
```

### Target
```
Backend receipt-service
  → generates receipts server-side
  → signs with service key
  → stores in DB
  → emits receipt-created event

Clients
  → receive receipt via WebSocket
  → verify signature client-side
  → display proof chain
```

## 6. AI Gateway Flow

### Current
```
UI → invokeAICapability() → edge function → AI provider
```

### Target (unchanged — already correct)
```
UI → invokeAICapability() → Supabase edge function → Lovable AI Gateway → provider
```

The AI gateway is already correctly architected as an edge function boundary.

## 7. Sync Engine Flow

### Current
```
sync-engine (browser) → Supabase Realtime → conflict resolution in-browser
```

### Target
```
OS agent (Electron/Docker)
  → sync-engine runs locally
  → connects to Backend sync-service
  → conflict resolution uses last-write-wins or CRDT
  → resolved state pushed to Supabase
  → WebSocket notifies all connected surfaces
```

## 8. Communication Protocol Summary

| Channel | Direction | Protocol | Auth |
|---------|-----------|----------|------|
| BFF API | UI → Backend | HTTPS REST | JWT |
| Command API | UI → Backend | HTTPS REST | JWT + RBAC |
| WebSocket | Backend → UI | WSS (Supabase Realtime) | JWT |
| OS Agent | Backend ↔ OS | WSS / gRPC | Service token |
| Push | Backend → Mobile | APNs / FCM | Device token |
| Inter-service | Backend ↔ Backend | In-process / message queue | Service identity |
