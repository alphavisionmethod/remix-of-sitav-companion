// SITA OS — Family Packet Service
import type { ServiceBoardroomPacket } from "./business-packet.service";

export function generateFamilyPacket(): ServiceBoardroomPacket {
  return {
    id: crypto.randomUUID(), domain: "concierge", generatedAt: new Date().toISOString(), confidence: 0.76,
    staleWarnings: ["Calendar sync 2h stale"],
    sections: [
      { title: "Household Load", content: "24 active tasks, 2 overdue. 5 due today.", dataPoints: { total: 24, overdue: 2, dueToday: 5 }, confidence: 0.82 },
      { title: "Upcoming Events", content: "Parent-teacher in 2 days. Family dinner Saturday.", dataPoints: { upcomingCount: 2, prepRemaining: 6 }, confidence: 0.85 },
      { title: "Schedule Conflicts", content: "1 conflict detected: overlapping appointments Thursday.", dataPoints: { conflicts: 1 }, confidence: 0.78 },
    ],
    advisorTracks: [
      { advisorId: "concierge-advisor", position: "Resolve Thursday conflict — suggest rescheduling dentist to Friday", confidence: 0.75 },
    ],
  };
}

