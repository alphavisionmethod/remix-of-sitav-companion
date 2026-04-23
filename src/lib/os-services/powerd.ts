// ═══════════════════════════════════════════════════════════════
// SITA OS — Power Daemon (powerd)
// Battery health, thermal pressure, charger detection, optimized
// charging, app drain attribution, suspend/resume, power profiles
// ═══════════════════════════════════════════════════════════════

export type ThermalState = "nominal" | "warm" | "hot" | "throttling" | "critical";
export type ChargerType = "none" | "usb_a" | "usb_c_pd" | "wireless" | "thunderbolt";
export type BatteryHealthRating = "excellent" | "good" | "fair" | "poor" | "service";
export type PowerProfile = "saver" | "balanced" | "performance" | "quiet";

export interface BatteryHealth {
  designCapacityMah: number;
  fullChargeCapacityMah: number;
  capacityPercent: number;
  cycleCount: number;
  healthRating: BatteryHealthRating;
  agingTrend: "stable" | "degrading" | "rapid_degradation";
  temperatureC: number;
  temperatureStressEvents: number;
  manufactureDate: string;
}

export interface ChargerInfo {
  type: ChargerType;
  wattage: number;
  isSlowCharger: boolean;
  isUnsupported: boolean;
  label: string;
}

export interface OptimizedCharging {
  enabled: boolean;
  holdAt80: boolean;
  targetPercent: number;
  learnedSchedule: { day: string; unplugHour: number }[];
  predictedUnplugTime: string | null;
  isHolding: boolean;
}

export interface AppDrainEntry {
  appName: string;
  icon: string;
  cpuPercent: number;
  networkMb: number;
  wakeupsPerHour: number;
  backgroundMinutes: number;
  totalDrainPercent: number;
}

export interface SuspendResumeStats {
  totalSuspends: number;
  failedResumes: number;
  avgDrainPerHourSleep: number; // percent
  lastWakeReason: string;
  wakeReasonHistory: { reason: string; at: number }[];
}

export interface ProfileTuning {
  cpuLimit: number; // 0-100%
  gpuLimit: number;
  displayRefreshHz: number;
  backgroundTasksAllowed: boolean;
  thermalFanCurve: "silent" | "balanced" | "performance";
  networkScanFrequencyMs: number;
}

export interface PowerState {
  level: number;
  charging: boolean;
  timeRemainingMin: number | null;
  timeToFullMin: number | null;
  health: BatteryHealth;
  thermal: ThermalState;
  charger: ChargerInfo;
  optimizedCharging: OptimizedCharging;
  appDrain: AppDrainEntry[];
  suspendResume: SuspendResumeStats;
  activeProfile: PowerProfile;
  profileTuning: Record<PowerProfile, ProfileTuning>;
}

const APP_DRAIN: AppDrainEntry[] = [
  { appName: "Chrome", icon: "🌐", cpuPercent: 18, networkMb: 245, wakeupsPerHour: 42, backgroundMinutes: 120, totalDrainPercent: 28 },
  { appName: "Slack", icon: "💬", cpuPercent: 8, networkMb: 85, wakeupsPerHour: 24, backgroundMinutes: 180, totalDrainPercent: 15 },
  { appName: "VS Code", icon: "📝", cpuPercent: 12, networkMb: 30, wakeupsPerHour: 15, backgroundMinutes: 90, totalDrainPercent: 12 },
  { appName: "Spotify", icon: "🎵", cpuPercent: 4, networkMb: 120, wakeupsPerHour: 8, backgroundMinutes: 200, totalDrainPercent: 10 },
  { appName: "Docker", icon: "🐳", cpuPercent: 22, networkMb: 15, wakeupsPerHour: 60, backgroundMinutes: 240, totalDrainPercent: 18 },
  { appName: "Figma", icon: "🎨", cpuPercent: 6, networkMb: 40, wakeupsPerHour: 5, backgroundMinutes: 30, totalDrainPercent: 5 },
];

export class PowerDaemon {
  private state: PowerState;
  private listeners: Array<(s: PowerState) => void> = [];

  constructor() {
    this.state = {
      level: 78,
      charging: true,
      timeRemainingMin: null,
      timeToFullMin: 42,
      health: {
        designCapacityMah: 5000,
        fullChargeCapacityMah: 4650,
        capacityPercent: 93,
        cycleCount: 187,
        healthRating: "good",
        agingTrend: "stable",
        temperatureC: 34,
        temperatureStressEvents: 3,
        manufactureDate: "2024-06-15",
      },
      thermal: "nominal",
      charger: { type: "usb_c_pd", wattage: 65, isSlowCharger: false, isUnsupported: false, label: "USB-C Power Delivery 65W" },
      optimizedCharging: {
        enabled: true,
        holdAt80: true,
        targetPercent: 80,
        learnedSchedule: [
          { day: "weekday", unplugHour: 8 },
          { day: "weekend", unplugHour: 10 },
        ],
        predictedUnplugTime: "08:00 AM",
        isHolding: false,
      },
      appDrain: APP_DRAIN,
      suspendResume: {
        totalSuspends: 342,
        failedResumes: 2,
        avgDrainPerHourSleep: 0.4,
        lastWakeReason: "user_input",
        wakeReasonHistory: [
          { reason: "user_input", at: Date.now() - 3600000 },
          { reason: "scheduled_task", at: Date.now() - 7200000 },
          { reason: "network_activity", at: Date.now() - 14400000 },
        ],
      },
      activeProfile: "balanced",
      profileTuning: {
        saver: { cpuLimit: 50, gpuLimit: 30, displayRefreshHz: 60, backgroundTasksAllowed: false, thermalFanCurve: "silent", networkScanFrequencyMs: 60000 },
        balanced: { cpuLimit: 80, gpuLimit: 70, displayRefreshHz: 120, backgroundTasksAllowed: true, thermalFanCurve: "balanced", networkScanFrequencyMs: 30000 },
        performance: { cpuLimit: 100, gpuLimit: 100, displayRefreshHz: 144, backgroundTasksAllowed: true, thermalFanCurve: "performance", networkScanFrequencyMs: 15000 },
        quiet: { cpuLimit: 60, gpuLimit: 40, displayRefreshHz: 60, backgroundTasksAllowed: false, thermalFanCurve: "silent", networkScanFrequencyMs: 120000 },
      },
    };
  }

  getState(): PowerState { return { ...this.state }; }

  subscribe(fn: (s: PowerState) => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit() { this.listeners.forEach(fn => fn(this.getState())); }

  setProfile(profile: PowerProfile) {
    this.state.activeProfile = profile;
    this.emit();
  }

  setOptimizedCharging(enabled: boolean) {
    this.state.optimizedCharging.enabled = enabled;
    this.emit();
  }

  setHoldAt80(enabled: boolean) {
    this.state.optimizedCharging.holdAt80 = enabled;
    this.state.optimizedCharging.targetPercent = enabled ? 80 : 100;
    this.emit();
  }

  getThermalColor(): string {
    const map: Record<ThermalState, string> = {
      nominal: "hsl(152, 55%, 48%)",
      warm: "hsl(38, 85%, 58%)",
      hot: "hsl(20, 80%, 55%)",
      throttling: "hsl(0, 70%, 55%)",
      critical: "hsl(0, 90%, 45%)",
    };
    return map[this.state.thermal];
  }

  getHealthColor(): string {
    const map: Record<BatteryHealthRating, string> = {
      excellent: "hsl(152, 55%, 48%)",
      good: "hsl(152, 55%, 48%)",
      fair: "hsl(38, 85%, 58%)",
      poor: "hsl(20, 80%, 55%)",
      service: "hsl(0, 70%, 55%)",
    };
    return map[this.state.health.healthRating];
  }
}

let instance: PowerDaemon | null = null;
export function getPowerDaemon(): PowerDaemon {
  if (!instance) instance = new PowerDaemon();
  return instance;
}
