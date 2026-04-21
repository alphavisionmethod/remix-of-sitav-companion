import businessAvatar from "@/assets/advisors/business-advisor.png";
import moneyAvatar from "@/assets/advisors/money-advisor.png";
import conciergeAvatar from "@/assets/advisors/concierge-advisor.png";
import growthAvatar from "@/assets/advisors/growth-advisor.png";
import trustAvatar from "@/assets/advisors/trust-advisor.png";
import opportunityAvatar from "@/assets/advisors/opportunity-advisor.png";
import recoveryAvatar from "@/assets/advisors/recovery-advisor.png";
import boardroomAvatar from "@/assets/advisors/boardroom-advisor.png";
import familyAvatar from "@/assets/advisors/family-advisor.png";
import generalAvatar from "@/assets/advisors/general-advisor.png";

export const DEFAULT_ADVISOR_AVATARS: Partial<Record<string, string>> = {
  business: businessAvatar,
  money: moneyAvatar,
  concierge: conciergeAvatar,
  growth: growthAvatar,
  trust: trustAvatar,
  opportunity: opportunityAvatar,
  recovery: recoveryAvatar,
  boardroom: boardroomAvatar,
  family: familyAvatar,
  general: generalAvatar,
};

export function getDefaultAdvisorAvatar(domain: string): string | null {
  return DEFAULT_ADVISOR_AVATARS[domain] ?? null;
}