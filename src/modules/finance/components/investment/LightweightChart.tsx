import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, Time } from "lightweight-charts";

type ChartType = "candlestick" | "line" | "area";
type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface LightweightChartProps {
  symbol: string;
  basePrice: number;
  changePct: number;
  className?: string;
}

function generateCandlestickData(basePrice: number, changePct: number, days: number): CandlestickData[] {
  const data: CandlestickData[] = [];
  const now = new Date();
  let price = basePrice * (1 - (changePct * days) / 36500);
  const volatility = basePrice * 0.015;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const open = price + (Math.random() - 0.48) * volatility;
    const close = open + (Math.random() - 0.45) * volatility * 1.2;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    price = close;

    const time = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` as Time;
    data.push({ time, open, high, low, close });
  }

  if (data.length > 0) {
    data[data.length - 1] = { ...data[data.length - 1], close: basePrice };
  }
  return data;
}

function generateLineData(basePrice: number, changePct: number, days: number): LineData[] {
  const candles = generateCandlestickData(basePrice, changePct, days);
  return candles.map(c => ({ time: c.time, value: (c as CandlestickData).close }));
}

const RANGE_DAYS: Record<TimeRange, number> = { "1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: 730 };
const RANGES: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "candlestick", label: "Candles" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
];

export default function LightweightChart({ symbol, basePrice, changePct, className }: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | ISeriesApi<"Area"> | null>(null);
  const [range, setRange] = useState<TimeRange>("3M");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [crosshairPrice, setCrosshairPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }


    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { color: "transparent" },
        textColor: "#94a3b8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.1)" },
        horzLines: { color: "rgba(148, 163, 184, 0.1)" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.2)", timeVisible: range === "1D" },
    });

    chartRef.current = chart;

    const days = RANGE_DAYS[range];
    const upColor = "#22c55e";
    const downColor = "#ef4444";
    const primaryColor = "#3b82f6";

    if (chartType === "candlestick") {
      const series = chart.addCandlestickSeries({
        upColor,
        downColor,
        borderUpColor: upColor,
        borderDownColor: downColor,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });
      const data = generateCandlestickData(basePrice, changePct, days);
      series.setData(data);
      seriesRef.current = series;
    } else if (chartType === "line") {
      const series = chart.addLineSeries({
        color: primaryColor,
        lineWidth: 2,
      });
      series.setData(generateLineData(basePrice, changePct, days));
      seriesRef.current = series;
    } else {
      const series = chart.addAreaSeries({
        topColor: "rgba(59, 130, 246, 0.3)",
        bottomColor: "rgba(59, 130, 246, 0.02)",
        lineColor: primaryColor,
        lineWidth: 2,
      });
      series.setData(generateLineData(basePrice, changePct, days));
      seriesRef.current = series;
    }

    chart.subscribeCrosshairMove(param => {
      if (!param.time || !seriesRef.current) {
        setCrosshairPrice(null);
        return;
      }
      const data = param.seriesData.get(seriesRef.current);
      if (data) {
        setCrosshairPrice((data as any).close ?? (data as any).value ?? null);
      }
    });

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        chart.applyOptions({ width: e.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [basePrice, changePct, range, chartType]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {crosshairPrice !== null && (
            <span className="text-sm font-medium text-foreground">
              ${crosshairPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-0.5">
            {CHART_TYPES.map(ct => (
              <button key={ct.value} onClick={() => setChartType(ct.value)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  chartType === ct.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{ct.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-0.5">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div ref={containerRef} className="rounded-xl overflow-hidden" />
    </div>
  );
}
