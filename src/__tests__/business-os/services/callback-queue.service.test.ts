import { describe, it, expect } from "vitest";
import {
  buildCallbackQueue,
  prioritizeCallbacks,
  type CallbackEntry,
} from "@/lib/services/business-os/callback-queue.service";
import { makeLead } from "../_helpers/business-fixtures";

describe("callback-queue.service", () => {
  describe("buildCallbackQueue", () => {
    it("only includes qualified or nurturing leads", () => {
      const q = buildCallbackQueue([
        makeLead({ id: "1", status: "qualified", score: 50 }),
        makeLead({ id: "2", status: "new", score: 50 }),
        makeLead({ id: "3", status: "nurturing", score: 50 }),
        makeLead({ id: "4", status: "lost", score: 99 }),
      ]);
      expect(q.map(e => e.leadId).sort()).toEqual(["1", "3"]);
    });

    it("sorts by lead score descending", () => {
      const q = buildCallbackQueue([
        makeLead({ id: "low", status: "qualified", score: 10 }),
        makeLead({ id: "high", status: "qualified", score: 90 }),
      ]);
      expect(q[0].leadId).toBe("high");
    });

    it("caps at 20 entries", () => {
      const leads = Array.from({ length: 30 }, (_, i) =>
        makeLead({ id: `l${i}`, status: "qualified", score: i }),
      );
      expect(buildCallbackQueue(leads)).toHaveLength(20);
    });

    it("assigns priority by score band: 80+ urgent, 60+ high, 40+ normal, else low", () => {
      const q = buildCallbackQueue([
        makeLead({ id: "u", status: "qualified", score: 90 }),
        makeLead({ id: "h", status: "qualified", score: 70 }),
        makeLead({ id: "n", status: "qualified", score: 50 }),
        makeLead({ id: "l", status: "qualified", score: 10 }),
      ]);
      expect(q.find(e => e.leadId === "u")?.priority).toBe("urgent");
      expect(q.find(e => e.leadId === "h")?.priority).toBe("high");
      expect(q.find(e => e.leadId === "n")?.priority).toBe("normal");
      expect(q.find(e => e.leadId === "l")?.priority).toBe("low");
    });
  });

  describe("prioritizeCallbacks", () => {
    it("orders urgent → high → normal → low regardless of input order", () => {
      const entries: CallbackEntry[] = ["low", "urgent", "normal", "high"].map((p, i) => ({
        id: `${i}`,
        leadId: `l${i}`,
        leadName: "x",
        priority: p as CallbackEntry["priority"],
        reason: "",
        scheduledFor: new Date().toISOString(),
        estimatedDurationMin: 15,
        assignedTo: "x",
        status: "pending",
      }));
      expect(prioritizeCallbacks(entries).map(e => e.priority)).toEqual([
        "urgent",
        "high",
        "normal",
        "low",
      ]);
    });
  });
});
