// SITA OS — Concierge: Family Boardroom Packet
export interface FamilyBoardroomPacket {
  generatedAt: string;
  period: string;
  memberSummaries: Array<{ memberId: string; name: string; taskCount: number; completionRate: number; loadScore: number; mood?: string }>;
  weeklyHighlights: string[];
  upcomingMilestones: Array<{ title: string; date: string; memberIds: string[] }>;
  budgetSnapshot: { allocatedCents: number; spentCents: number; remainingCents: number };
  actionItems: Array<{ title: string; assignedTo: string; dueDate: string; priority: string }>;
  familyGoals: Array<{ goal: string; progress: number; targetDate: string }>;
  discussionTopics: string[];
  overallHealthScore: number;
}
