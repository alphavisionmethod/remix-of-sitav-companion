import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

// ── 2024 US Federal Tax Brackets (deterministic, zero LLM) ──
const BRACKETS_2024: Record<string, { rate: number; min: number; max: number }[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11600 },
    { rate: 0.12, min: 11600, max: 47150 },
    { rate: 0.22, min: 47150, max: 100525 },
    { rate: 0.24, min: 100525, max: 191950 },
    { rate: 0.32, min: 191950, max: 243725 },
    { rate: 0.35, min: 243725, max: 609350 },
    { rate: 0.37, min: 609350, max: Infinity },
  ],
  married_joint: [
    { rate: 0.10, min: 0, max: 23200 },
    { rate: 0.12, min: 23200, max: 94300 },
    { rate: 0.22, min: 94300, max: 201050 },
    { rate: 0.24, min: 201050, max: 383900 },
    { rate: 0.32, min: 383900, max: 487450 },
    { rate: 0.35, min: 487450, max: 731200 },
    { rate: 0.37, min: 731200, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.10, min: 0, max: 16550 },
    { rate: 0.12, min: 16550, max: 63100 },
    { rate: 0.22, min: 63100, max: 100500 },
    { rate: 0.24, min: 100500, max: 191950 },
    { rate: 0.32, min: 191950, max: 243700 },
    { rate: 0.35, min: 243700, max: 609350 },
    { rate: 0.37, min: 609350, max: Infinity },
  ],
};

const STANDARD_DEDUCTION_2024: Record<string, number> = {
  single: 14600, married_joint: 29200, head_of_household: 21900,
};

const SE_TAX_RATE = 0.153;
const SE_INCOME_FACTOR = 0.9235;
const SE_WAGE_BASE_2024 = 168600;
const MEDICARE_ADDITIONAL_THRESHOLD = 200000;
const MEDICARE_ADDITIONAL_RATE = 0.009;

function calcFederalTax(taxableIncome: number, filing: string): { tax: number; marginalRate: number; effectiveRate: number; breakdown: any[] } {
  const brackets = BRACKETS_2024[filing] || BRACKETS_2024.single;
  let remaining = Math.max(0, taxableIncome);
  let tax = 0;
  const breakdown: any[] = [];
  let marginalRate = 0;

  for (const b of brackets) {
    const taxable = Math.min(remaining, b.max - b.min);
    if (taxable <= 0) break;
    const amt = Math.round(taxable * b.rate * 100) / 100;
    tax += amt;
    breakdown.push({ rate: b.rate, taxable_amount: taxable, tax_amount: amt });
    remaining -= taxable;
    marginalRate = b.rate;
  }

  return {
    tax: Math.round(tax * 100) / 100,
    marginalRate,
    effectiveRate: taxableIncome > 0 ? Math.round((tax / taxableIncome) * 10000) / 10000 : 0,
    breakdown,
  };
}

function calcSETax(netSEIncome: number) {
  const seBase = netSEIncome * SE_INCOME_FACTOR;
  const ssBase = Math.min(seBase, SE_WAGE_BASE_2024);
  const ssTax = ssBase * 0.124;
  const medicareTax = seBase * 0.029;
  const additionalMedicare = seBase > MEDICARE_ADDITIONAL_THRESHOLD ? (seBase - MEDICARE_ADDITIONAL_THRESHOLD) * MEDICARE_ADDITIONAL_RATE : 0;
  const total = Math.round((ssTax + medicareTax + additionalMedicare) * 100) / 100;
  const deductibleHalf = Math.round(total / 2 * 100) / 100;
  return { se_tax: total, deductible_half: deductibleHalf, ss_tax: Math.round(ssTax * 100) / 100, medicare_tax: Math.round((medicareTax + additionalMedicare) * 100) / 100 };
}

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("estimate-federal"),
    gross_income: z.number().min(0),
    filing_status: z.enum(["single", "married_joint", "head_of_household"]).default("single"),
    deductions: z.number().min(0).optional(),
    use_standard_deduction: z.boolean().default(true),
  }),
  z.object({
    action: z.literal("estimate-quarterly"),
    annual_income: z.number().min(0),
    filing_status: z.enum(["single", "married_joint", "head_of_household"]).default("single"),
    prior_year_tax: z.number().min(0).optional(),
  }),
  z.object({
    action: z.literal("summary"),
    gross_income: z.number().min(0),
    net_se_income: z.number().min(0).default(0),
    filing_status: z.enum(["single", "married_joint", "head_of_household"]).default("single"),
    use_standard_deduction: z.boolean().default(true),
    itemized_deductions: z.number().min(0).optional(),
  }),
]);

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user } = auth;

    const rl = checkRateLimit(`tax:${user.id}`, 60);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    if (d.action === "estimate-federal") {
      const stdDed = STANDARD_DEDUCTION_2024[d.filing_status] || 14600;
      const deduction = d.use_standard_deduction ? stdDed : (d.deductions || 0);
      const taxable = Math.max(0, d.gross_income - deduction);
      const result = calcFederalTax(taxable, d.filing_status);
      return corsResponse({
        ...result, gross_income: d.gross_income, deduction, taxable_income: taxable,
        filing_status: d.filing_status, tax_year: 2024, calculation: "deterministic",
      });
    }

    if (d.action === "estimate-quarterly") {
      const stdDed = STANDARD_DEDUCTION_2024[d.filing_status] || 14600;
      const taxable = Math.max(0, d.annual_income - stdDed);
      const { tax } = calcFederalTax(taxable, d.filing_status);
      const quarterly = Math.round(tax / 4 * 100) / 100;
      const safeHarbor = d.prior_year_tax ? Math.round(d.prior_year_tax * 1.1 / 4 * 100) / 100 : null;

      return corsResponse({
        annual_tax: tax, quarterly_payment: quarterly,
        safe_harbor_quarterly: safeHarbor,
        recommended: safeHarbor ? Math.max(quarterly, safeHarbor) : quarterly,
        due_dates: ["2024-04-15", "2024-06-17", "2024-09-16", "2025-01-15"],
        tax_year: 2024, calculation: "deterministic",
      });
    }

    if (d.action === "summary") {
      const se = d.net_se_income > 0 ? calcSETax(d.net_se_income) : null;
      const stdDed = STANDARD_DEDUCTION_2024[d.filing_status] || 14600;
      const deduction = d.use_standard_deduction ? stdDed : (d.itemized_deductions || 0);
      const adjustedIncome = d.gross_income - (se?.deductible_half || 0);
      const taxable = Math.max(0, adjustedIncome - deduction);
      const federal = calcFederalTax(taxable, d.filing_status);
      const totalTax = Math.round((federal.tax + (se?.se_tax || 0)) * 100) / 100;

      return corsResponse({
        federal, self_employment: se, total_tax: totalTax,
        gross_income: d.gross_income, net_se_income: d.net_se_income,
        deduction, taxable_income: taxable, filing_status: d.filing_status,
        quarterly_estimate: Math.round(totalTax / 4 * 100) / 100,
        tax_year: 2024, calculation: "deterministic",
      });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError(e.message || "Internal error", 500);
  }
});
