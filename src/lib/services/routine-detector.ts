// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent-Driven Routine Detection Engine
// Detects behavioral patterns from app co-launches and suggests
// workspace presets like "Start your morning?"
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "sita-routine-data";
const CO_LAUNCH_WINDOW = 5 * 60 * 1000; // 5 min
const MIN_OCCURRENCES = 3;

interface LaunchEvent {
  appId: string;
  timestamp: number;
  hour: number;
}

interface DetectedRoutine {
  apps: string[];
  count: number;
  avgHour: number;
  lastSeen: number;
}

export interface RoutineSuggestion {
  id: string;
  title: string;
  subtitle: string;
  apps: string[];
  confidence: number;
}

class RoutineDetector {
  private launches: LaunchEvent[] = [];
  private routines: DetectedRoutine[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.launches = data.launches ?? [];
        this.routines = data.routines ?? [];
      }
    } catch {
      this.launches = [];
      this.routines = [];
    }
  }

  private save() {
    try {
      // Keep last 500 launches
      const trimmed = this.launches.slice(-500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        launches: trimmed,
        routines: this.routines,
      }));
    } catch {}
  }

  recordLaunch(appId: string) {
    const now = Date.now();
    const hour = new Date().getHours();
    this.launches.push({ appId, timestamp: now, hour });
    this.detectPatterns();
    this.save();
  }

  private detectPatterns() {
    // Group launches into sessions (within CO_LAUNCH_WINDOW)
    const sessions: string[][] = [];
    let currentSession: string[] = [];
    let sessionStart = 0;

    for (const launch of this.launches) {
      if (currentSession.length === 0 || launch.timestamp - sessionStart <= CO_LAUNCH_WINDOW) {
        if (currentSession.length === 0) sessionStart = launch.timestamp;
        if (!currentSession.includes(launch.appId)) {
          currentSession.push(launch.appId);
        }
      } else {
        if (currentSession.length >= 2) sessions.push([...currentSession]);
        currentSession = [launch.appId];
        sessionStart = launch.timestamp;
      }
    }
    if (currentSession.length >= 2) sessions.push(currentSession);

    // Find recurring patterns (sets of 2+ apps that appear together often)
    const patternMap = new Map<string, { apps: string[]; count: number; hours: number[] }>();

    for (const session of sessions) {
      const key = [...session].sort().join("+");
      const existing = patternMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        patternMap.set(key, { apps: [...session].sort(), count: 1, hours: [] });
      }
    }

    this.routines = Array.from(patternMap.values())
      .filter(p => p.count >= MIN_OCCURRENCES)
      .map(p => ({
        apps: p.apps,
        count: p.count,
        avgHour: p.hours.length ? p.hours.reduce((a, b) => a + b, 0) / p.hours.length : 12,
        lastSeen: Date.now(),
      }));
  }

  getSuggestions(): RoutineSuggestion[] {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

    return this.routines
      .map(r => ({
        id: `routine-${r.apps.join("-")}`,
        title: `Start your ${timeOfDay}?`,
        subtitle: `Open ${r.apps.join(", ")}`,
        apps: r.apps,
        confidence: Math.min(r.count / 10, 1),
      }))
      .slice(0, 3);
  }
}

export const routineDetector = new RoutineDetector();
