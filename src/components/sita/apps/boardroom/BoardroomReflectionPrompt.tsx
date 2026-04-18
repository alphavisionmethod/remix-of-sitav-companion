// ═══════════════════════════════════════════════════════════════
// BoardroomReflectionPrompt
// Captures reflection after outcome_tracked and writes to
// advisor_board_reflections via the canonical engine, transitioning
// the chain to `reflected` then `closed`.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  recordReflection,
  closeFollowthrough,
} from "@/lib/services/boardroom/followthrough-engine";

interface Props {
  dispatchId: string;
  advisorId: string;
  onComplete?: () => void;
}

export function BoardroomReflectionPrompt({ dispatchId, advisorId, onComplete }: Props) {
  const { toast } = useToast();
  const [usefulness, setUsefulness] = useState(75);
  const [quality, setQuality] = useState(75);
  const [fitness, setFitness] = useState(75);
  const [feedback, setFeedback] = useState("");
  const [lesson, setLesson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await recordReflection({
        dispatchId,
        advisorId,
        ownerAction: "reviewed",
        ownerFeedback: feedback || undefined,
        outcomeQuality: quality / 100,
        usefulnessScore: usefulness / 100,
        recommendationQualityScore: quality / 100,
        executionFitnessScore: fitness / 100,
        lessonLearned: lesson || undefined,
        shouldRepeat: quality >= 60,
      });
      await closeFollowthrough(dispatchId);
      setDone(true);
      toast({ title: "Reflection recorded", description: "Follow-through closed." });
      onComplete?.();
    } catch (e) {
      toast({
        title: "Reflection failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return null;

  return (
    <Card data-testid="boardroom-reflection-prompt">
      <CardHeader>
        <CardTitle className="text-sm">Reflect on this outcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SliderField
          label="Usefulness"
          value={usefulness}
          onChange={setUsefulness}
          testId="reflection-usefulness"
        />
        <SliderField
          label="Recommendation quality"
          value={quality}
          onChange={setQuality}
          testId="reflection-quality"
        />
        <SliderField
          label="Execution fitness"
          value={fitness}
          onChange={setFitness}
          testId="reflection-fitness"
        />
        <div className="space-y-1.5">
          <Label htmlFor="rfl-feedback">Owner feedback (optional)</Label>
          <Textarea
            id="rfl-feedback"
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            data-testid="reflection-feedback"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rfl-lesson">Lesson learned (optional)</Label>
          <Textarea
            id="rfl-lesson"
            rows={2}
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            data-testid="reflection-lesson"
          />
        </div>
        <Button onClick={() => void submit()} disabled={submitting} data-testid="reflection-submit">
          {submitting ? "Saving…" : "Save reflection & close"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SliderField({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground" data-testid={`${testId}-value`}>
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={5}
        onValueChange={(v) => onChange(v[0] ?? 0)}
        data-testid={testId}
      />
    </div>
  );
}
