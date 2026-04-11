# SITA OS — Rendering Pipeline Diagrams

## Frame Lifecycle Flow

```
┌──────────────────────────────────────────────────────────┐
│                     FRAME N                              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐              │
│  │  Layout   │→│  Damage   │→│   Tile    │              │
│  │  Pass     │  │ Collect   │  │  Assign   │              │
│  │  ~2ms     │  │  ~0.05ms  │  │  ~0.1ms   │              │
│  └──────────┘  └──────────┘  └───────────┘              │
│                                     │                    │
│                                     ▼                    │
│  ┌──────────────────────────────────────────┐            │
│  │        Parallel Rasterization             │            │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐ │            │
│  │  │Thread 0│ │Thread 1│ │Thread 2│ │T 3 │ │            │
│  │  │ T0,T4  │ │ T1,T5  │ │ T2,T6  │ │T3,7│ │            │
│  │  └────────┘ └────────┘ └────────┘ └────┘ │            │
│  │              ~10ms budget                 │            │
│  └──────────────────────────────────────────┘            │
│                       │                                  │
│                       ▼                                  │
│  ┌──────────┐  ┌──────────┐                              │
│  │Composite │→│ Present   │                              │
│  │  ~1ms    │  │ (VSync)  │                              │
│  └──────────┘  └──────────┘                              │
│                                                          │
│  Total budget: 16.6ms                                    │
└──────────────────────────────────────────────────────────┘
```

## Tile Grid Layout

```
Screen: 1920 × 1080 → 30 cols × 17 rows = 510 tiles

  Col  0    1    2    3   ...  29
  ┌────┬────┬────┬────┬───┬────┐
0 │    │    │    │    │   │    │  Row 0
  ├────┼────┼────┼────┼───┼────┤
1 │    │████│████│    │   │    │  Row 1  (████ = dirty)
  ├────┼────┼────┼────┼───┼────┤
2 │    │████│████│    │   │    │  Row 2
  ├────┼────┼────┼────┼───┼────┤
  :    :    :    :    :   :    :
  ├────┼────┼────┼────┼───┼────┤
16│    │    │    │    │   │    │  Row 16
  └────┴────┴────┴────┴───┴────┘

Only dirty tiles (4 of 510 = 0.8%) are re-rasterized
```

## Damage Coalescing

```
Before coalescing:          After coalescing:
┌──────────────────┐        ┌──────────────────┐
│  ┌──┐   ┌──┐    │        │  ┌──────────┐    │
│  │R1│   │R2│    │   →    │  │ Merged   │    │
│  └──┘   └──┘    │        │  └──────────┘    │
│       ┌──┐      │        │                  │
│       │R3│      │        │                  │
│       └──┘      │        │                  │
└──────────────────┘        └──────────────────┘

Gap < 8px → merge (less overhead than separate raster)
```

## Work-Stealing Thread Pool

```
Thread 0         Thread 1         Thread 2         Thread 3
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Deque:   │     │ Deque:   │     │ Deque:   │     │ Deque:   │
│ [T0,T4,  │     │ [T1,T5]  │     │ [T2]     │     │ [T3]     │
│  T8,T12] │     │          │     │          │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
  Process          Process          Process           Process
  from front       from front       from front        from front
                                       │
                                       ▼
                                    IDLE — steal
                                    from Thread 0
                                    (back of deque)

Affinity: Thread N prefers tiles in screen region N
          (cache warmth: same memory pages stay hot)
```

## Layer Compositing Order

```
z-index:  ┌─────────────────────────────┐
    3      │    Overlay (cursor, toast)   │  opacity: 1.0
           ├─────────────────────────────┤
    2      │    Window Layer              │  opacity: 1.0
           ├─────────────────────────────┤
    1      │    Panel Layer               │  opacity: 0.95
           ├─────────────────────────────┤
    0      │    Desktop Background        │  opacity: 1.0
           └─────────────────────────────┘

Composite: back-to-front with per-layer opacity and clip rects
```

## Blend Mode Visual Reference

```
Source-Over (default):     Multiply:              Screen:
  Cs·αs + Cd·αd·(1-αs)      Cs × Cd                Cs + Cd - Cs×Cd

  ┌───┐                    ┌───┐                  ┌───┐
  │ S │                    │ S │                  │ S │
  │ ┌─┼─┐   Normal        │ ┌─┼─┐  Darken       │ ┌─┼─┐  Lighten
  └─┼─┘ │   overlay        └─┼─┘ │  blend        └─┼─┘ │  blend
    │ D │                    │ D │                  │ D │
    └───┘                    └───┘                  └───┘
```
