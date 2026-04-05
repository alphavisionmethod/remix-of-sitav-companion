import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Check } from "lucide-react";
import type { BranchQuestion } from "../branching";

interface Props {
  questions: BranchQuestion[];
  answers: Record<string, string[]>;
  onAnswer: (questionId: string, optionId: string) => void;
}

export default function BranchingQuestionsPanel({ questions, answers, onAnswer }: Props) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <p className="text-[11px] font-semibold text-foreground">SITA wants to understand more</p>
        <Badge className="bg-primary/10 text-primary text-[8px]">Based on your answers</Badge>
      </div>
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
