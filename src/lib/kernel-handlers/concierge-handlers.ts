// ═══════════════════════════════════════════════════════════════
// Concierge domain handlers — Household tasks.
// ═══════════════════════════════════════════════════════════════

import type { ExecutorService } from "@/lib/core-services/executor-service";
import { safe, insertRow, updateRowById, deleteRowById, pickId } from "./_shared";

export function registerConciergeHandlers(executor: ExecutorService): void {
  // ── Tasks (table: household_tasks) ───────────────────────────
  executor.registerHandler("concierge.task.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { title, category, priority, due_date, description, assigned_to, status }
      // DB columns: title, description, category, assigned_to, due_date, recurrence, status, metadata
      const row = await insertRow("household_tasks", {
        title: String(p.title ?? "Untitled task"),
        description: typeof p.description === "string" ? p.description : null,
        category: typeof p.category === "string" ? p.category : "General",
        assigned_to: typeof p.assigned_to === "string" ? p.assigned_to : null,
        due_date: p.due_date && typeof p.due_date === "string" ? p.due_date : null,
        recurrence: typeof p.recurrence === "string" ? p.recurrence : null,
        status: typeof p.status === "string" ? p.status : "todo",
        metadata: {
          priority: p.priority ?? null,
        },
      });
      return { entity: "task", id: row.id, row };
    });
  });

  executor.registerHandler("concierge.status.update", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const status = typeof p.status === "string" ? p.status : null;
      if (!status) throw new Error("status required");
      const row = await updateRowById("household_tasks", id, { status });
      return { entity: "task", id, row };
    });
  });

  executor.registerHandler("concierge.task.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("household_tasks", id);
      return { entity: "task", ...result };
    });
  });
}