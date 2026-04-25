import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, Sparkles } from "lucide-react";
import type { BranchQuestion } from "../branching";

interface Props {
  questions: BranchQuestion[];
  answers: Record<string, string[]>;
  onAnswer: (questionId: string, optionId: string) => void;
}

function inferInsight(answers: Record<string, string[]>): string | null {
  const allAnswers = Object.values(answers).flat();
  if (allAnswers.includes("booking_flow") && allAnswers.includes("proposal_flow")) return "Your business appears appointment-and-proposal-driven — Quote Studio and Call Desk will be core modules.";
  if (allAnswers.includes("client_management") && allAnswers.includes("retainer_tracking")) return "Multi-client retainer model detected — SITA will set up client-level reporting and renewal tracking.";
  if (allAnswers.includes("booking_nurture") && allAnswers.includes("packages")) return "Package-based coaching practice — booking funnels and program enrollment flows will be prioritized.";
  if (allAnswers.includes("products") && allAnswers.includes("launches")) return "Launch-driven creator business — campaign automation and launch sequences are key modules.";
  if (allAnswers.includes("checkout_flow") && allAnswers.includes("abandoned_cart")) return "Cart recovery is critical — automated abandoned checkout workflows will be a top priority.";
  if (allAnswers.includes("bookings_walkins") && allAnswers.includes("review_dependence")) return "Reputation-dependent local business — review automation and local discovery are priorities.";
  if (allAnswers.includes("booking_pct_high") && allAnswers.includes("no_shows_hurt")) return "Booking-heavy with no-show impact — pre-call prep automation and rescue flows are critical.";
  if (allAnswers.includes("quotes_custom") && allAnswers.includes("quote_slow")) return "Custom quoting bottleneck detected — SITA will prioritize Quote Studio templates and automation.";
  if (allAnswers.includes("leads_forgotten") || allAnswers.includes("leads_delayed")) return "Lead follow-up gap confirmed — automated lead nurture and response sequences are a top first-win.";
  if (allAnswers.includes("quiet_disengage") && allAnswers.includes("renewals_slip")) return "Silent churn pattern detected — health monitoring and proactive renewal flows will be activated.";
  if (allAnswers.length >= 4) return `Based on your ${allAnswers.length} selections, SITA is building a detailed picture of your operational priorities.`;
  return null;
}

export default function BranchingQuestionsPanel({ questions, answers, onAnswer }: Props) {
  const insight = useMemo(() => inferInsight(answers), [answers]);

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <p className="text-[11px] font-semibold text-foreground">SITA wants to understand more</p>
        <Badge className="bg-primary/10 text-primary text-[8px]">Based on your answers</Badge>
      </div>

      {insight && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">SITA noticed: </span>
            {insight}
          </p>
        </div>
      )}

      {questions.map(q => (
        <Card key={q.id} className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-foreground mb-2.5">{q.question}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {q.options.map(o => {
                const selected = (answers[q.id] || []).includes(o.id);
                return (
                  <button key={o.id} onClick={() => onAnswer(q.id, o.id)}
                    className={`p-2.5 rounded-lg border text-[11px] text-left font-medium transition-all flex items-center gap-2 ${
                      selected ? "bg-primary/10 border-primary/30 text-foreground" : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/20"
                    }`}>
                    {selected && <Check className="h-3 w-3 text-primary flex-shrink-0" />}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
