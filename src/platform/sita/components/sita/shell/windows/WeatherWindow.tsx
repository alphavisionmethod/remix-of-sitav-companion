// ═══════════════════════════════════════════════════════════════
// SITA OS — Weather App
// Simulated weather with 7-day forecast, hourly breakdown, and ambient UI
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { AppStateWrapper } from "@/platform/sita/components/sita/shell/AppStateWrapper";
import { NovaText, NovaButton, NovaSectionLabel } from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { APP_TYPE, APP_COMPONENTS, SPACE } from "@/platform/design-system/app-window-system";
import { MapPin, Droplets, Wind, Eye, Thermometer, Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

export const WEATHER_MANIFEST = {
  id: "com.nova.weather",
  name: "Weather",
  version: "1.0.0",
  publisher: "SITA OS",
  icon: "🌤️",
  iconBg: "from-sky-400 to-blue-500",
  permissions: [] as const,
  windowDefaults: { width: 420, height: 480 },
  category: "utilities",
  description: "Weather forecast for SITA OS",
  designVersion: "nova-1.0",
};

type Condition = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "stormy" | "snowy";

interface DayForecast {
  day: string;
  condition: Condition;
  high: number;
  low: number;
  precip: number;
}

const conditionIcons: Record<Condition, React.ReactNode> = {
  "sunny": <Sun className="w-5 h-5 text-[hsl(38_85%_55%)]" />,
  "partly-cloudy": <Cloud className="w-5 h-5 text-[hsl(210_15%_65%)]" />,
  "cloudy": <Cloud className="w-5 h-5 text-[hsl(210_10%_55%)]" />,
  "rainy": <CloudRain className="w-5 h-5 text-[hsl(210_60%_55%)]" />,
  "stormy": <CloudLightning className="w-5 h-5 text-[hsl(270_40%_55%)]" />,
  "snowy": <CloudSnow className="w-5 h-5 text-[hsl(200_30%_75%)]" />,
};

const conditionLabels: Record<Condition, string> = {
  "sunny": "Sunny",
  "partly-cloudy": "Partly Cloudy",
  "cloudy": "Cloudy",
  "rainy": "Rainy",
  "stormy": "Thunderstorm",
  "snowy": "Snow",
};

const conditionGradients: Record<Condition, string> = {
  "sunny": "from-[hsl(38_85%_55%/0.1)] to-[hsl(20_80%_50%/0.05)]",
  "partly-cloudy": "from-[hsl(210_50%_60%/0.08)] to-[hsl(38_60%_55%/0.05)]",
  "cloudy": "from-[hsl(210_15%_45%/0.08)] to-[hsl(210_10%_40%/0.04)]",
  "rainy": "from-[hsl(210_60%_50%/0.1)] to-[hsl(220_50%_45%/0.05)]",
  "stormy": "from-[hsl(270_40%_40%/0.1)] to-[hsl(210_50%_35%/0.05)]",
  "snowy": "from-[hsl(200_30%_70%/0.08)] to-[hsl(210_20%_65%/0.04)]",
};

// Deterministic "forecast" seeded from today's date
function generateForecast(): { current: { temp: number; condition: Condition; humidity: number; wind: number; visibility: number; feelsLike: number }; forecast: DayForecast[]; hourly: { hour: string; temp: number; condition: Condition }[] } {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
  const r = (i: number) => Math.abs(Math.sin(seed + i) * 10000) % 1;

  const conditions: Condition[] = ["sunny", "partly-cloudy", "cloudy", "rainy", "stormy", "snowy"];
  const currentCondition = conditions[Math.floor(r(0) * 4)]; // bias toward nice weather
  const currentTemp = Math.round(15 + r(1) * 20);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const forecast: DayForecast[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIdx = (now.getDay() + i) % 7;
    const high = Math.round(currentTemp + r(i + 10) * 8 - 3);
    forecast.push({
      day: i === 0 ? "Today" : days[dayIdx],
      condition: conditions[Math.floor(r(i + 20) * 4)],
      high,
      low: high - Math.round(3 + r(i + 30) * 8),
      precip: Math.round(r(i + 40) * 100),
    });
  }

  const hourly = [];
  for (let h = 0; h < 12; h++) {
    const hour = (now.getHours() + h) % 24;
    hourly.push({
      hour: hour === now.getHours() ? "Now" : `${hour}:00`,
      temp: Math.round(currentTemp + Math.sin(h * 0.5) * 4),
      condition: conditions[Math.floor(r(h + 50) * 4)],
    });
  }

  return {
    current: {
      temp: currentTemp,
      condition: currentCondition,
      humidity: Math.round(30 + r(70) * 50),
      wind: Math.round(5 + r(71) * 25),
      visibility: Math.round(5 + r(72) * 15),
      feelsLike: currentTemp + Math.round(r(73) * 4 - 2),
    },
    forecast,
    hourly,
  };
}

export function WeatherWindow() {
  const [unit, setUnit] = useState<"C" | "F">("C");
  const data = useMemo(() => generateForecast(), []);

  const toUnit = (c: number) => unit === "F" ? Math.round(c * 9 / 5 + 32) : c;

  return (
    <AppStateWrapper
      state="ready"
      accentGradient="from-[hsl(200_70%_55%)] to-[hsl(210_60%_45%)]"
    >
      <div className="flex flex-col gap-4 p-4 min-h-[380px]">
        {/* Current weather hero */}
        <div className={cn("rounded-2xl p-5 bg-gradient-to-br relative overflow-hidden", conditionGradients[data.current.condition])}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                <NovaText variant="label" muted>Current Location</NovaText>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[42px] font-light tracking-tight leading-none text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_90%)]">
                  {toUnit(data.current.temp)}°
                </span>
                <button
                  onClick={() => setUnit(u => u === "C" ? "F" : "C")}
                  className="text-[14px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {unit}
                </button>
              </div>
              <NovaText variant="body">{conditionLabels[data.current.condition]}</NovaText>
              <NovaText variant="label" muted className="mt-1 block">
                Feels like {toUnit(data.current.feelsLike)}°
              </NovaText>
            </div>
            <div className="text-4xl opacity-80 mt-2">
              {conditionIcons[data.current.condition]}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]">
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[hsl(210_60%_55%)]" />
              <NovaText variant="label">{data.current.humidity}%</NovaText>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <NovaText variant="label">{data.current.wind} km/h</NovaText>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
              <NovaText variant="label">{data.current.visibility} km</NovaText>
            </div>
          </div>
        </div>

        {/* Hourly scroll */}
        <div>
          <NovaSectionLabel>Hourly</NovaSectionLabel>
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
            {data.hourly.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl flex-shrink-0 min-w-[48px]",
                  i === 0 ? "bg-[hsl(var(--primary)/0.08)]" : ""
                )}
              >
                <NovaText variant="label" muted className={cn(i === 0 && "!text-[hsl(var(--primary))]")}>
                  {h.hour}
                </NovaText>
                <div className="w-4 h-4 flex items-center justify-center">
                  {conditionIcons[h.condition]}
                </div>
                <NovaText variant="label" className="!font-medium">
                  {toUnit(h.temp)}°
                </NovaText>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div>
          <NovaSectionLabel>7-Day Forecast</NovaSectionLabel>
          <div className="space-y-0.5 mt-1">
            {data.forecast.map((day, i) => {
              const range = Math.max(...data.forecast.map(d => d.high)) - Math.min(...data.forecast.map(d => d.low));
              const minAll = Math.min(...data.forecast.map(d => d.low));
              const barLeft = ((day.low - minAll) / range) * 100;
              const barWidth = ((day.high - day.low) / range) * 100;

              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg",
                    i === 0 && "bg-[hsl(var(--primary)/0.05)]"
                  )}
                >
                  <NovaText variant="label" className={cn("w-10 flex-shrink-0", i === 0 && "!font-semibold")}>
                    {day.day}
                  </NovaText>
                  <div className="w-5 flex items-center justify-center flex-shrink-0">
                    {conditionIcons[day.condition]}
                  </div>
                  <NovaText variant="label" muted className="w-8 text-right flex-shrink-0">
                    {toUnit(day.low)}°
                  </NovaText>
                  <div className="flex-1 h-1 bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)] rounded-full relative mx-1 min-w-[40px]">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-[hsl(210_60%_55%)] to-[hsl(38_70%_50%)]"
                      style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 8)}%` }}
                    />
                  </div>
                  <NovaText variant="label" className="w-8 flex-shrink-0 !font-medium">
                    {toUnit(day.high)}°
                  </NovaText>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppStateWrapper>
  );
}
