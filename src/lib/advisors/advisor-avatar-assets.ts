import businessAvatar from "@/assets/advisors/business-advisor.png";
import moneyAvatar from "@/assets/advisors/money-advisor.png";
import conciergeAvatar from "@/assets/advisors/concierge-advisor.png";

export const DEFAULT_ADVISOR_AVATARS: Partial<Record<string, string>> = {
  business: businessAvatar,
  money: moneyAvatar,
  concierge: conciergeAvatar,
};

export function getDefaultAdvisorAvatar(domain: string): string | null {
  return DEFAULT_ADVISOR_AVATARS[domain] ?? null;
}