// ═══════════════════════════════════════════════════════════════
// Nova OS — Calculator Window App
// Scientific + Standard + Programmer + Unit Converter
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { History, Hash, Calculator, ArrowLeftRight } from "lucide-react";

type CalcMode = "standard" | "scientific" | "programmer" | "converter";

const MODES: { id: CalcMode; label: string; icon: React.ElementType }[] = [
  { id: "standard", label: "Standard", icon: Calculator },
  { id: "scientific", label: "Scientific", icon: Hash },
  { id: "programmer", label: "Programmer", icon: Hash },
  { id: "converter", label: "Convert", icon: ArrowLeftRight },
];

function CalcButton({ label, onClick, variant = "num", span = 1 }: {
  label: string; onClick: () => void; variant?: "num" | "op" | "fn" | "eq"; span?: number;
}) {
  const styles = {
    num: "bg-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_24%)] text-[hsl(0_0%_90%)]",
    op: "bg-[hsl(35_80%_50%)] hover:bg-[hsl(35_80%_60%)] text-white font-bold",
    fn: "bg-[hsl(0_0%_25%)] hover:bg-[hsl(0_0%_30%)] text-[hsl(0_0%_70%)]",
    eq: "bg-[hsl(265_55%_55%)] hover:bg-[hsl(265_55%_65%)] text-white font-bold",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={cn(
        "rounded-xl h-12 text-[15px] font-medium transition-colors duration-100",
        styles[variant],
        span === 2 && "col-span-2"
      )}
    >
      {label}
    </motion.button>
  );
}

export function CalculatorWindow() {
  const [mode, setMode] = useState<CalcMode>("standard");
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const inputDigit = useCallback((d: string) => {
    setDisplay(v => fresh ? d : v === "0" ? d : v + d);
    setFresh(false);
  }, [fresh]);

  const inputOp = useCallback((nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const result = calc(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  }, [display, prev, op, fresh]);

  const calc = (a: number, b: number, o: string): number => {
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const equals = useCallback(() => {
    if (prev === null || !op) return;
    const current = parseFloat(display);
    const result = calc(prev, current, op);
    const expr = `${prev} ${op} ${current} = ${result}`;
    setHistory(h => [expr, ...h].slice(0, 20));
    setDisplay(String(result));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, [prev, op, display]);

  const clear = () => { setDisplay("0"); setPrev(null); setOp(null); setFresh(true); };
  const percent = () => setDisplay(String(parseFloat(display) / 100));
  const negate = () => setDisplay(String(-parseFloat(display)));
  const dot = () => { if (!display.includes(".")) { setDisplay(display + "."); setFresh(false); } };

  const scientificFn = (fn: string) => {
    const v = parseFloat(display);
    let r = 0;
    switch (fn) {
      case "sin": r = Math.sin(v * Math.PI / 180); break;
      case "cos": r = Math.cos(v * Math.PI / 180); break;
      case "tan": r = Math.tan(v * Math.PI / 180); break;
      case "√": r = Math.sqrt(v); break;
      case "x²": r = v * v; break;
      case "log": r = Math.log10(v); break;
      case "ln": r = Math.log(v); break;
      case "π": r = Math.PI; break;
      case "e": r = Math.E; break;
      default: r = v;
    }
    setDisplay(String(parseFloat(r.toFixed(10))));
    setFresh(true);
  };

  return (
    <div className="flex h-[420px] bg-[hsl(0_0%_8%)] text-[hsl(0_0%_90%)] rounded-b-xl overflow-hidden">
      {/* History Sidebar */}
      {showHistory && (
        <div className="w-40 border-r border-[hsl(0_0%_15%)] flex flex-col">
          <div className="p-3 border-b border-[hsl(0_0%_15%)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_45%)]">History</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
            {history.length === 0 ? (
              <p className="text-[10px] text-[hsl(0_0%_30%)] text-center mt-4">No history yet</p>
            ) : history.map((h, i) => (
              <div key={i} className="text-[11px] text-[hsl(0_0%_50%)] py-1 px-2 rounded hover:bg-[hsl(0_0%_12%)] cursor-pointer" onClick={() => { setDisplay(h.split("= ")[1]); setFresh(true); }}>
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-[hsl(0_0%_12%)]">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors",
                mode === m.id ? "bg-[hsl(265_55%_55%/0.2)] text-[hsl(265_55%_70%)]" : "text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_60%)]"
              )}
            >
              {m.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setShowHistory(!showHistory)} className={cn("p-1.5 rounded-lg transition-colors", showHistory ? "text-[hsl(265_55%_65%)]" : "text-[hsl(0_0%_35%)] hover:text-[hsl(0_0%_55%)]")}>
            <History className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Display */}
        <div className="px-4 py-3 text-right">
          {prev !== null && op && (
            <p className="text-[11px] text-[hsl(0_0%_40%)] mb-0.5">{prev} {op}</p>
          )}
          <p className="text-3xl font-light tabular-nums tracking-tight truncate">{display}</p>
          {mode === "programmer" && (
            <div className="mt-1 space-y-0.5">
              <p className="text-[9px] text-[hsl(0_0%_35%)] font-mono">HEX: {parseInt(display).toString(16).toUpperCase()}</p>
              <p className="text-[9px] text-[hsl(0_0%_35%)] font-mono">BIN: {(parseInt(display) >>> 0).toString(2)}</p>
              <p className="text-[9px] text-[hsl(0_0%_35%)] font-mono">OCT: {parseInt(display).toString(8)}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex-1 p-2">
          {mode === "scientific" ? (
            <div className="grid grid-cols-5 gap-1.5 h-full">
              {["sin", "cos", "tan", "√", "x²"].map(fn => <CalcButton key={fn} label={fn} onClick={() => scientificFn(fn)} variant="fn" />)}
              {["log", "ln", "π", "e", "("].map(fn => <CalcButton key={fn} label={fn} onClick={() => scientificFn(fn)} variant="fn" />)}
              <CalcButton label="AC" onClick={clear} variant="fn" />
              <CalcButton label="±" onClick={negate} variant="fn" />
              <CalcButton label="%" onClick={percent} variant="fn" />
              <CalcButton label=")" onClick={() => inputDigit(")")} variant="fn" />
              <CalcButton label="÷" onClick={() => inputOp("÷")} variant="op" />
              {["7", "8", "9"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="×" onClick={() => inputOp("×")} variant="op" />
              <CalcButton label="^" onClick={() => inputOp("^")} variant="fn" />
              {["4", "5", "6"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="−" onClick={() => inputOp("−")} variant="op" />
              <CalcButton label="!" onClick={() => scientificFn("!")} variant="fn" />
              {["1", "2", "3"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="+" onClick={() => inputOp("+")} variant="op" />
              <CalcButton label="Rad" onClick={() => scientificFn("rad")} variant="fn" />
              <CalcButton label="0" onClick={() => inputDigit("0")} span={2} />
              <CalcButton label="." onClick={dot} />
              <CalcButton label="=" onClick={equals} variant="eq" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 h-full">
              <CalcButton label="AC" onClick={clear} variant="fn" />
              <CalcButton label="±" onClick={negate} variant="fn" />
              <CalcButton label="%" onClick={percent} variant="fn" />
              <CalcButton label="÷" onClick={() => inputOp("÷")} variant="op" />
              {["7", "8", "9"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="×" onClick={() => inputOp("×")} variant="op" />
              {["4", "5", "6"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="−" onClick={() => inputOp("−")} variant="op" />
              {["1", "2", "3"].map(d => <CalcButton key={d} label={d} onClick={() => inputDigit(d)} />)}
              <CalcButton label="+" onClick={() => inputOp("+")} variant="op" />
              <CalcButton label="0" onClick={() => inputDigit("0")} span={2} />
              <CalcButton label="." onClick={dot} />
              <CalcButton label="=" onClick={equals} variant="eq" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
