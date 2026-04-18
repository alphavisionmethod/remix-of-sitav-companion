# Power Management & Scheduler — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

Kernel-level CPU/GPU scheduler, P-state and C-state management, thermal throttling policy, battery and charging control, sleep/wake/hibernate flow ownership, and per-process power budgeting.

## What SITA OS actually does today

- Lets the host OS handle all power management.
- The agent scheduler (`agent-scheduler` edge function) is an **application-level** scheduler for AI workforce tasks — not an OS scheduler.

## Honesty boundary

- ❌ No claim of "we manage power" or "we own the scheduler."
- ✅ "SITA OS schedules its own AI workforce jobs with budget controls" is accurate (Phase Q metering).
