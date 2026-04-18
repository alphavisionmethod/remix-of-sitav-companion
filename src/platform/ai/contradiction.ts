// ============================================================
// SITA OS — Contradiction Detection Engine
// Cross-domain conflict detection and downgrade recommendation
// ============================================================

import type { ContradictionReport, Contradiction } from "./types";

interface DataPoint {
  field: string;
  value: string;
  source: string;
  domain: string;
}

export function detectContradictions(dataPoints: DataPoint[]): ContradictionReport {
  const contradictions: Contradiction[] = [];

  // Group by field
  const fieldGroups = new Map<string, DataPoint[]>();
  for (const dp of dataPoints) {
    const existing = fieldGroups.get(dp.field) || [];
    existing.push(dp);
    fieldGroups.set(dp.field, existing);
  }

  // Check for conflicts within each field
  for (const [field, points] of fieldGroups) {
    if (points.length < 2) continue;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];

        if (a.value !== b.value && a.value !== "" && b.value !== "") {
          const severity = classifyContradictionSeverity(field, a, b);
          contradictions.push({
            field,
            sourceA: a.source,
            valueA: a.value,
            sourceB: b.source,
            valueB: b.value,
            severity,
          });
        }
      }
    }
  }

  const materialCount = contradictions.filter(c => c.severity === "material").length;
  const recommendedDowngrade = materialCount > 0
    ? `${materialCount} material contradiction(s) detected — downgrade confidence and flag for review`
    : null;

  return { contradictions, recommendedDowngrade };
}

function classifyContradictionSeverity(field: string, a: DataPoint, b: DataPoint): "material" | "minor" {
  // Financial fields are always material
  const materialFields = [
    "balance", "amount", "total", "payment_state", "invoice_state",
    "approval_state", "execution_state", "obligation", "price",
  ];
  if (materialFields.some(f => field.toLowerCase().includes(f))) return "material";

  // Cross-domain contradictions are material
  if (a.domain !== b.domain) return "material";

  // Numeric contradictions: check magnitude
  const numA = parseFloat(a.value.replace(/[$,]/g, ""));
  const numB = parseFloat(b.value.replace(/[$,]/g, ""));
  if (!isNaN(numA) && !isNaN(numB)) {
    const diff = Math.abs(numA - numB);
    const avg = (Math.abs(numA) + Math.abs(numB)) / 2;
    if (avg > 0 && diff / avg > 0.1) return "material"; // >10% divergence
  }

  return "minor";
}

export function createEmptyContradictionReport(): ContradictionReport {
  return { contradictions: [], recommendedDowngrade: null };
}

/**
 * Build contradiction data points from cross-domain mock data.
 * This scans invoice amounts vs cash flow, lead states, etc.
 */
export function buildCrossDomainDataPoints(data: {
  invoices?: Array<{ id: string; status: string; amount: string }>;
  cashFlow?: { available: string; outgoing: string };
  leads?: Array<{ id: string; status: string; value: string }>;
}): DataPoint[] {
  const points: DataPoint[] = [];

  // Invoice totals vs cash flow outgoing
  if (data.invoices && data.cashFlow) {
    const pendingTotal = data.invoices
      .filter(i => i.status === "pending" || i.status === "overdue")
      .reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);

    const outgoing = parseFloat(data.cashFlow.outgoing.replace(/[$,]/g, ""));

    points.push(
      { field: "outstanding_obligations", value: `$${pendingTotal}`, source: "invoices", domain: "business" },
      { field: "committed_outgoing", value: `$${outgoing}`, source: "cash_flow", domain: "finance" },
    );
  }

  // Lead values
  if (data.leads) {
    const activeValue = data.leads
      .filter(l => l.status !== "lost")
      .reduce((s, l) => s + parseFloat(l.value.replace(/[$,]/g, "")), 0);
    points.push(
      { field: "pipeline_value", value: `$${activeValue}`, source: "leads", domain: "business" },
    );
  }

  return points;
}
