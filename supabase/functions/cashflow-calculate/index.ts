import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("analyze") }),
  z.object({
    action: z.literal("forecast"),
    horizon_days: z.number().int().min(7).max(365).default(90),
  }),
  z.object({
    action: z.literal("safe-to-spend"),
    reserve_target_cents: z.number().int().min(0).default(0),
  }),
  z.object({ action: z.literal("burn-rate") }),
]);

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const rl = checkRateLimit(`cashflow:${user.id}`, 30);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    // Shared data fetch
    const [accts, invoices] = await Promise.all([
      supabase.from("financial_accounts").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
    ]);
    const accounts = (accts.data || []) as any[];
    const invs = (invoices.data || []) as any[];
    const now = new Date().toISOString();

    const totalLiquid = accounts.reduce((s: number, a: any) => s + (a.balance_cents || 0), 0);

    if (d.action === "analyze") {
      const receivable = invs.filter((i: any) => i.status === "sent" || i.status === "draft");
      const totalReceivable = receivable.reduce((s: number, i: any) => s + (i.total_cents || 0), 0);
      const paidLast30 = invs.filter((i: any) => i.status === "paid" && daysBetween(i.paid_at || i.created_at, now) <= 30);
      const inflows30 = paidLast30.reduce((s: number, i: any) => s + (i.total_cents || 0), 0);

      const overdue = receivable.filter((i: any) => i.due_date && new Date(i.due_date) < new Date());
      const overdueAmount = overdue.reduce((s: number, i: any) => s + (i.total_cents || 0), 0);

      return corsResponse({
        total_liquid_cents: totalLiquid,
        total_receivable_cents: totalReceivable,
        overdue_cents: overdueAmount,
        overdue_count: overdue.length,
        inflows_30d_cents: inflows30,
        net_position_cents: totalLiquid + totalReceivable,
        accounts_count: accounts.length,
        calculation: "deterministic",
      });
    }

    if (d.action === "forecast") {
      const horizon = d.horizon_days;
      const upcoming = invs.filter((i: any) =>
        (i.status === "sent" || i.status === "draft") && i.due_date &&
        daysBetween(now, i.due_date) > 0 && daysBetween(now, i.due_date) <= horizon
      );

      const buckets = [
        { label: "0-30d", min: 0, max: 30 },
        { label: "31-60d", min: 31, max: 60 },
        { label: "61-90d", min: 61, max: 90 },
      ].filter(b => b.min < horizon);

      const forecast = buckets.map(b => {
        const items = upcoming.filter((i: any) => {
          const days = daysBetween(now, i.due_date);
          return days >= b.min && days <= b.max;
        });
        return { period: b.label, expected_inflow_cents: items.reduce((s: number, i: any) => s + (i.total_cents || 0), 0), invoice_count: items.length };
      });

      return corsResponse({
        current_liquid_cents: totalLiquid,
        forecast,
        total_expected_cents: upcoming.reduce((s: number, i: any) => s + (i.total_cents || 0), 0),
        horizon_days: horizon,
        calculation: "deterministic",
      });
    }

    if (d.action === "safe-to-spend") {
      const upcoming30 = invs.filter((i: any) =>
        (i.status === "sent") && i.due_date && daysBetween(now, i.due_date) > 0 && daysBetween(now, i.due_date) <= 30
      );
      const expectedInflow = upcoming30.reduce((s: number, i: any) => s + (i.total_cents || 0), 0);
      const safeToSpend = Math.max(0, totalLiquid - d.reserve_target_cents);

      return corsResponse({
        total_liquid_cents: totalLiquid,
        reserve_target_cents: d.reserve_target_cents,
        safe_to_spend_cents: safeToSpend,
        expected_inflow_30d_cents: expectedInflow,
        calculation: "deterministic",
      });
    }

    if (d.action === "burn-rate") {
      const paid = invs.filter((i: any) => i.status === "paid" && i.paid_at);
      const last90 = paid.filter((i: any) => daysBetween(i.paid_at, now) <= 90);
      const totalPaid90 = last90.reduce((s: number, i: any) => s + (i.total_cents || 0), 0);
      const monthlyBurn = last90.length > 0 ? Math.round(totalPaid90 / 3) : 0;
      const runwayMonths = monthlyBurn > 0 ? Math.round(totalLiquid / monthlyBurn * 10) / 10 : null;

      return corsResponse({
        monthly_burn_cents: monthlyBurn,
        runway_months: runwayMonths,
        data_points: last90.length,
        total_liquid_cents: totalLiquid,
        calculation: "deterministic",
      });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError(e.message || "Internal error", 500);
  }
});
