import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, X, Sparkles } from "lucide-react";
import type { SimulationVariable, CustomFormulaNode, CustomScenario } from "@/domains/simulation/monte-carlo-engine";

const DISTRIBUTIONS = ["normal", "uniform", "triangular"] as const;
const OPERATIONS = [
  { value: "add", label: "+" },
  { value: "subtract", label: "−" },
  { value: "multiply", label: "×" },
  { value: "divide", label: "÷" },
] as const;

const DOMAIN_OPTIONS = ["Business", "Finance", "Investment", "Life"] as const;

interface CustomScenarioBuilderProps {
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
  editing?: CustomScenario | null;
}

export function CustomScenarioBuilder({ onSave, onCancel, editing }: CustomScenarioBuilderProps) {
  const [label, setLabel] = useState(editing?.label ?? "");
  const [question, setQuestion] = useState(editing?.question ?? "");
  const [domain, setDomain] = useState<CustomScenario["domain"]>(editing?.domain ?? "Business");
  const [variables, setVariables] = useState<SimulationVariable[]>(
    editing?.variables ?? [
      { id: "var_1", label: "Variable 1", min: 0, max: 100, mean: 50, stdDev: 15, distribution: "normal" },
    ]
  );
  const [formulaNodes, setFormulaNodes] = useState<CustomFormulaNode[]>(
    editing?.formulaNodes ?? [{ type: "add", operands: ["var_1"] }]
  );

  const addVariable = () => {
    const idx = variables.length + 1;
    setVariables([
      ...variables,
      { id: `var_${Date.now()}`, label: `Variable ${idx}`, min: 0, max: 100, mean: 50, stdDev: 15, distribution: "normal" },
    ]);
  };

  const removeVariable = (idx: number) => {
    if (variables.length <= 1) return;
    const removed = variables[idx];
    setVariables(variables.filter((_, i) => i !== idx));
    setFormulaNodes(formulaNodes.map(n => ({
      ...n,
      operands: n.operands.filter(id => id !== removed.id),
    })).filter(n => n.operands.length > 0));
  };

  const updateVar = (idx: number, field: keyof SimulationVariable, value: string | number) => {
    const updated = [...variables];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === "min" || field === "max") {
      const min = Number(updated[idx].min);
      const max = Number(updated[idx].max);
      updated[idx].mean = (min + max) / 2;
      updated[idx].stdDev = (max - min) / 4;
    }
    setVariables(updated);
  };

  const handleSave = () => {
    if (!label.trim() || variables.length === 0) return;
    const ensuredNodes = formulaNodes.length > 0
      ? formulaNodes
      : [{ type: "add" as const, operands: variables.map(v => v.id) }];

    onSave({
      id: editing?.id ?? `custom_${Date.now()}`,
      label: label.trim(),
      question: question.trim() || `What happens with ${label.trim()}?`,
      domain,
      variables,
      formulaNodes: ensuredNodes,
      createdAt: editing?.createdAt ?? Date.now(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-primary/20 bg-card/80 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {editing ? "Edit Scenario" : "Create Custom Scenario"}
          </span>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Name & Question */}
      <div className="space-y-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Scenario name..."
          className="text-sm bg-background/50 border-border/50"
        />
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Decision question... (e.g., 'What if I...')"
          className="text-xs bg-background/50 border-border/50"
        />
      </div>

      {/* Domain */}
      <div className="grid grid-cols-4 gap-1">
        {DOMAIN_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={cn(
              "text-[10px] rounded-lg py-1.5 border transition-all font-medium",
              domain === d
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/20"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Variables */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Variables</label>
        <AnimatePresence>
          {variables.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-border/40 bg-background/30 p-2.5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={v.label}
                  onChange={(e) => updateVar(i, "label", e.target.value)}
                  placeholder="Variable name"
                  className="text-xs h-7 bg-transparent border-border/30 flex-1"
                />
                <select
                  value={v.distribution}
                  onChange={(e) => updateVar(i, "distribution", e.target.value)}
                  className="text-[10px] h-7 rounded-md border border-border/30 bg-transparent text-muted-foreground px-1.5"
                >
                  {DISTRIBUTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {variables.length > 1 && (
                  <button onClick={() => removeVariable(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] text-muted-foreground">Min</label>
                  <Input
                    type="number"
                    value={v.min}
                    onChange={(e) => updateVar(i, "min", Number(e.target.value))}
                    className="text-[10px] h-6 bg-transparent border-border/30"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground">Mean</label>
                  <Input
                    type="number"
                    value={v.mean}
                    onChange={(e) => updateVar(i, "mean", Number(e.target.value))}
                    className="text-[10px] h-6 bg-transparent border-border/30"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground">Max</label>
                  <Input
                    type="number"
                    value={v.max}
                    onChange={(e) => updateVar(i, "max", Number(e.target.value))}
                    className="text-[10px] h-6 bg-transparent border-border/30"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="ghost" size="sm" onClick={addVariable} className="w-full gap-1 text-xs h-7">
          <Plus className="h-3 w-3" /> Add Variable
        </Button>
      </div>

      {/* Formula Builder */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Formula</label>
        <div className="rounded-lg border border-border/40 bg-background/30 p-2.5 space-y-2">
          {formulaNodes.map((node, ni) => (
            <div key={ni} className="flex items-center gap-1.5 flex-wrap">
              {ni > 0 && <span className="text-[10px] text-muted-foreground">then +</span>}
              <select
                value={node.operands[0] || ""}
                onChange={(e) => {
                  const updated = [...formulaNodes];
                  updated[ni] = { ...node, operands: [e.target.value, ...(node.operands.slice(1))] };
                  setFormulaNodes(updated);
                }}
                className="text-[10px] h-6 rounded border border-border/30 bg-transparent text-foreground px-1"
              >
                <option value="">Select...</option>
                {variables.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
              <select
                value={node.type}
                onChange={(e) => {
                  const updated = [...formulaNodes];
                  updated[ni] = { ...node, type: e.target.value as CustomFormulaNode["type"] };
                  setFormulaNodes(updated);
                }}
                className="text-sm h-6 w-8 rounded border border-border/30 bg-transparent text-primary text-center px-0"
              >
                {OPERATIONS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
              </select>
              <select
                value={node.operands[1] || ""}
                onChange={(e) => {
                  const updated = [...formulaNodes];
                  updated[ni] = { ...node, operands: [node.operands[0], e.target.value] };
                  setFormulaNodes(updated);
                }}
                className="text-[10px] h-6 rounded border border-border/30 bg-transparent text-foreground px-1"
              >
                <option value="">Select...</option>
                {variables.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
              {formulaNodes.length > 1 && (
                <button
                  onClick={() => setFormulaNodes(formulaNodes.filter((_, i) => i !== ni))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFormulaNodes([...formulaNodes, { type: "add", operands: [] }])}
            className="text-[10px] h-6 gap-1"
          >
            <Plus className="h-2.5 w-2.5" /> Add step
          </Button>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!label.trim()} className="flex-1 gap-1.5" size="sm">
          <Save className="h-3.5 w-3.5" /> Save Scenario
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
      </div>
    </motion.div>
  );
}
