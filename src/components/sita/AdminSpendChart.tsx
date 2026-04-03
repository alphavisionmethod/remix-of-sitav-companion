import { motion } from "framer-motion";

interface SpendBar {
  model: string;
  tokens: number;
  count: number;
}

interface AdminSpendChartProps {
  data: Record<string, { count: number; tokens: number }>;
}

export const AdminSpendChart = ({ data }: AdminSpendChartProps) => {
  const bars: SpendBar[] = Object.entries(data)
    .map(([model, stats]) => ({ model: model.split("/").pop() || model, ...stats }))
    .sort((a, b) => b.tokens - a.tokens);

  const maxTokens = Math.max(...bars.map(b => b.tokens), 1);

  if (bars.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No AI usage data yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bars.map((bar, i) => (
        <div key={bar.model} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground truncate max-w-[60%]">{bar.model}</span>
            <span className="text-[10px] text-muted-foreground">{bar.tokens.toLocaleString()} tokens · {bar.count} calls</span>
          </div>
          <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(bar.tokens / maxTokens) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
