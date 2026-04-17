import { usePolicyDecision } from "@/hooks/use-policy-decision";
import { AIT07ApprovalQueue } from "./AIT04to08Boards";
export default function AIT07ApprovalQueuePage() { return <AIT07ApprovalQueue />; }
  const __policy = usePolicyDecision({ domain: "admin", riskClass: "R4", actor: "platform-admin" }); void __policy;
