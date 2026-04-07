

# Build Regression Comparison Engine — Full Implementation

## Problem
The verification layer (`src/lib/ai-engineering/verification-layer.ts`) has a `"regression-comparison"` gate that hardcodes `result: "pass"` with no actual engine behind it. The audit flagged this as item #14: "Regression comparison engine ❌→✅".

## What Needs to Exist

A **regression comparison engine** that:
1. Captures baseline snapshots of system metrics (performance, quality, cost, error rates)
2. Compares current metrics against baselines to detect regressions
3. Integrates with the verification layer so the gate produces real results
4. Integrates with error-patrol's existing `BaselineMetrics` and `detectRegressions()` patterns
5. Produces typed, receipt-aware output consistent with SITA OS contracts

## Architecture

- **Layer:** OS / Kernel (same as `error-patrol.ts`, `self-learning-engine.ts`)
- **Location:** `src/lib/core-services/regression-comparison-engine.ts`
- **Contract:** `src/packages/contracts/runtime/regression-comparison-runtime.ts`

## Implementation

### Step 1: Create Contract (`src/packages/contracts/runtime/regression-comparison-runtime.ts`)

Pure TypeScript interfaces — no runtime imports:
- `RegressionBaseline` — snapshot of metrics at a point in time (keyed by domain + metric name)
- `RegressionComparisonResult` — per-metric comparison (current vs baseline, deviation, verdict)
- `RegressionReport` — full comparison output (all metrics, overall verdict, confidence, regressions found)
- `RegressionSeverity` — "none" | "minor" | "moderate" | "critical"
- `RegressionDimension` — "performance" | "quality" | "cost" | "reliability" | "trust" | "latency"

### Step 2: Create Engine (`src/lib/core-services/regression-comparison-engine.ts`)

Full engine class `RegressionComparisonEngine` with:
- `captureBaseline(domain, metrics)` — stores a baseline snapshot
- `compare(domain, currentMetrics)` → `RegressionReport` — compares current vs baseline using statistical thresholds
- `compareAll()` → aggregated report across all domains
- `getBaseline(domain)` — retrieve stored baseline
- `updateBaseline(domain, metrics)` — update after confirmed stable release
- `detectRegression(metric, baseline, current, threshold)` — per-metric comparison using z-score from existing `anomaly-detection.ts` utilities
- Integration with `EventBus` to emit `regression.detected` events
- Integration with `ReceiptService` to produce regression-check receipts

Statistical comparison uses:
- Percentage deviation thresholds (configurable per dimension)
- Z-score calculation (reuse `zScore()` from `src/lib/observability/anomaly-detection.ts`)
- Trend detection (reuse `detectTrend()` from same file)
- Configurable sensitivity per dimension

### Step 3: Wire into Verification Layer

Update `verification-layer.ts` gate #12 to:
- Import `RegressionComparisonEngine`
- Call `engine.compareAll()` to get real regression data
- Map `RegressionReport.overallVerdict` to gate `result` (pass/warning/fail)
- Include regression details in gate `detail` string

### Step 4: Export from core-services index

Add export to `src/lib/core-services/` barrel if one exists, or ensure the engine is importable.

## Files Changed
1. **New:** `src/packages/contracts/runtime/regression-comparison-runtime.ts` (~60 lines)
2. **New:** `src/lib/core-services/regression-comparison-engine.ts` (~250 lines)
3. **Modified:** `src/lib/ai-engineering/verification-layer.ts` — wire gate #12 to real engine (~15 lines changed)

## Build Errors
The 17 reported build errors are confirmed stale — `npx tsc --noEmit` returns 0 errors. The `touch` from earlier already cleared them.

