import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Save, Loader2 } from "lucide-react";

interface Props {
  recommendationId: string;
  recommendationTitle: string;
  onSubmit: (scores: ScorePayload) => Promise<void>;
}

export interface ScorePayload {
  recommendation_id: string;
  score_overall: number;
  score_accuracy: number;
  score_usefulness: number;
  score_actionability: number;
  score_evidence_quality: number;
  score_cost_efficiency: number;
  score_launch_honesty_alignment: number;
  review_method: string;
  notes: string;
}

const DIMENSIONS = [
  { key: "score_accuracy", label: "Accuracy", desc: "Correctly reflects reality/evidence?" },
  { key: "score_usefulness", label: "Usefulness", desc: "Genuinely helpful to decision-making?" },
  { key: "score_actionability", label: "Actionability", desc: "Can operator clearly act on it?" },
  { key: "score_evidence_quality", label: "Evidence Quality", desc: "Well-cited and grounded?" },
  { key: "score_cost_efficiency", label: "Cost Efficiency", desc: "Worth the cost incurred?" },
  { key: "score_launch_honesty_alignment", label: "Launch Honesty", desc: "Truthful classification, no exaggeration?" },
] as const;

function getScoreBand(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: "Exceptional", cls: "text-emerald-400" };
  if (score >= 75) return { label: "Strong", cls: "text-blue-400" };
  if (score >= 60) return { label: "Usable", cls: "text-amber-400" };
  if (score >= 40) return { label: "Weak", cls: "text-orange-400" };
  return { label: "Poor", cls: "text-destructive" };
}

export function AIWorkforceScoreForm({ recommendationId, recommendationTitle, onSubmit }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({
    score_accuracy: 75,
    score_usefulness: 75,
    score_actionability: 75,
    score_evidence_quality: 75,
    score_cost_efficiency: 75,
    score_launch_honesty_alignment: 75,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const overall = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length);
  const band = getScoreBand(overall);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        recommendation_id: recommendationId,
        score_overall: overall,
        score_accuracy: scores.score_accuracy ?? 50,
        score_usefulness: scores.score_usefulness ?? 50,
        score_actionability: scores.score_actionability ?? 50,
        score_evidence_quality: scores.score_evidence_quality ?? 50,
        score_cost_efficiency: scores.score_cost_efficiency ?? 50,
        score_launch_honesty_alignment: scores.score_launch_honesty_alignment ?? 50,
        review_method: "human_review",
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Score: {recommendationTitle}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold">{overall}</span>
          <Badge variant="outline" className={band.cls}>{band.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {DIMENSIONS.map(dim => {
          const value = scores[dim.key] || 75;
          const dimBand = getScoreBand(value);
          return (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{dim.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{dim.desc}</span>
                </div>
                <span className={`text-sm font-mono font-medium ${dimBand.cls}`}>{value}</span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => setScores(prev => ({ ...prev, [dim.key]: v }))}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          );
        })}

        <Textarea
          placeholder="Reviewer notes (optional)..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="text-sm"
        />

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Submit Score ({overall} — {band.label})
        </Button>
      </CardContent>
    </Card>
  );
}
