import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    booking_type: z.string().max(100),
    title: z.string().max(255),
    provider: z.string().max(255).optional(),
    scheduled_at: z.string(),
    duration_minutes: z.number().int().min(1).max(1440).optional(),
    notes: z.string().max(2000).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  z.object({
    action: z.literal("update"),
    booking_id: z.string().uuid(),
    title: z.string().max(255).optional(),
    provider: z.string().max(255).optional(),
    scheduled_at: z.string().optional(),
    duration_minutes: z.number().int().min(1).max(1440).optional(),
    notes: z.string().max(2000).optional(),
  }),
  z.object({
    action: z.literal("cancel"),
    booking_id: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("confirm"),
    booking_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("list"),
    status: z.string().max(50).optional(),
    booking_type: z.string().max(100).optional(),
    from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    limit: z.number().int().min(1).max(100).default(50),
  }),
]);

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const rl = checkRateLimit(`booking:${user.id}`, 60);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    if (d.action === "list") {
      let q = supabase.from("bookings").select("*").eq("user_id", user.id)
        .order("scheduled_at", { ascending: true }).limit(d.limit);
      if (d.status) q = q.eq("status", d.status);
      if (d.booking_type) q = q.eq("booking_type", d.booking_type);
      if (d.from_date) q = q.gte("scheduled_at", d.from_date);
      if (d.to_date) q = q.lte("scheduled_at", d.to_date + "T23:59:59");
      const { data, error } = await q;
      if (error) return corsError(error.message, 500);
      return corsResponse({ bookings: data });
    }

    if (d.action === "create") {
      const { data: booking, error } = await supabase.from("bookings").insert({
        user_id: user.id, booking_type: d.booking_type, title: d.title,
        provider: d.provider, scheduled_at: d.scheduled_at,
        duration_minutes: d.duration_minutes, notes: d.notes,
        metadata: d.metadata, status: "pending",
      }).select().single();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "booking_created", category: "bookings",
        actor: "booking-manage", target_type: "booking", target_id: booking.id,
        severity: "low", details: { booking_type: d.booking_type, scheduled_at: d.scheduled_at },
      });
      return corsResponse({ booking }, 201);
    }

    if (d.action === "update") {
      const updates: Record<string, any> = {};
      if (d.title) updates.title = d.title;
      if (d.provider) updates.provider = d.provider;
      if (d.scheduled_at) updates.scheduled_at = d.scheduled_at;
      if (d.duration_minutes) updates.duration_minutes = d.duration_minutes;
      if (d.notes !== undefined) updates.notes = d.notes;

      const { data: booking, error } = await supabase.from("bookings")
        .update(updates).eq("id", d.booking_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "booking_updated", category: "bookings",
        actor: "booking-manage", target_type: "booking", target_id: booking.id,
        severity: "low", details: { updated_fields: Object.keys(updates) },
      });
      return corsResponse({ booking });
    }

    if (d.action === "cancel") {
      const { data: booking, error } = await supabase.from("bookings")
        .update({ status: "cancelled", cancel_reason: d.reason })
        .eq("id", d.booking_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "booking_cancelled", category: "bookings",
        actor: "booking-manage", target_type: "booking", target_id: booking.id,
        severity: "medium", details: { reason: d.reason },
      });
      return corsResponse({ booking });
    }

    if (d.action === "confirm") {
      const { data: booking, error } = await supabase.from("bookings")
        .update({ status: "confirmed" })
        .eq("id", d.booking_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("receipts").insert({
        user_id: user.id, receipt_type: "booking_confirmed", reference_id: booking.id,
        metadata: { booking_type: booking.booking_type, scheduled_at: booking.scheduled_at },
      });
      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "booking_confirmed", category: "bookings",
        actor: "booking-manage", target_type: "booking", target_id: booking.id,
        severity: "low", details: {},
      });
      return corsResponse({ booking });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError(e.message || "Internal error", 500);
  }
});
