// ═══════════════════════════════════════════════════════════════
// SITA OS — healthd: System Health Monitor Daemon
// ═══════════════════════════════════════════════════════════════

export interface ServiceHealth {
  name: string;
  pid: number;
  status: 'healthy' | 'degraded' | 'critical' | 'stopped';
  uptime: number; // seconds
  restarts: number;
  cpuPercent: number;
  memoryMB: number;
  lastHeartbeat: number;
  bootTarget: 'core' | 'network' | 'security' | 'desktop';
}

export interface SystemResources {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsed: number;
  diskTotal: number;
  networkRxKBps: number;
  networkTxKBps: number;
  temperature: number;
  loadAvg: [number, number, number];
}

export interface HealthSnapshot {
  timestamp: number;
  score: number;
  resources: SystemResources;
  services: ServiceHealth[];
  degradedCount: number;
  criticalCount: number;
}

const SERVICE_FLEET: ServiceHealth[] = [
  { name: 'servicemgr', pid: 1, status: 'healthy', uptime: 86400, restarts: 0, cpuPercent: 0.3, memoryMB: 12, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'logd', pid: 100, status: 'healthy', uptime: 86400, restarts: 0, cpuPercent: 0.8, memoryMB: 18, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'auditd', pid: 101, status: 'healthy', uptime: 86400, restarts: 0, cpuPercent: 0.2, memoryMB: 8, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'hald', pid: 110, status: 'healthy', uptime: 86300, restarts: 0, cpuPercent: 0.5, memoryMB: 22, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'driverd', pid: 120, status: 'healthy', uptime: 86250, restarts: 0, cpuPercent: 1.2, memoryMB: 35, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'settingsd', pid: 130, status: 'healthy', uptime: 86200, restarts: 0, cpuPercent: 0.1, memoryMB: 6, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'policyd', pid: 140, status: 'healthy', uptime: 86100, restarts: 0, cpuPercent: 0.4, memoryMB: 14, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'secretsd', pid: 141, status: 'healthy', uptime: 86100, restarts: 0, cpuPercent: 0.2, memoryMB: 10, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'authd', pid: 150, status: 'healthy', uptime: 86000, restarts: 0, cpuPercent: 0.6, memoryMB: 16, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'sessiond', pid: 151, status: 'healthy', uptime: 86000, restarts: 0, cpuPercent: 0.3, memoryMB: 12, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'shieldd', pid: 160, status: 'healthy', uptime: 85900, restarts: 0, cpuPercent: 2.1, memoryMB: 45, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'sandboxd', pid: 161, status: 'healthy', uptime: 85900, restarts: 0, cpuPercent: 1.5, memoryMB: 30, lastHeartbeat: Date.now(), bootTarget: 'security' },
  { name: 'networkd', pid: 200, status: 'healthy', uptime: 85800, restarts: 0, cpuPercent: 1.0, memoryMB: 20, lastHeartbeat: Date.now(), bootTarget: 'network' },
  { name: 'wifid', pid: 201, status: 'degraded', uptime: 3600, restarts: 2, cpuPercent: 3.2, memoryMB: 28, lastHeartbeat: Date.now() - 5000, bootTarget: 'network' },
  { name: 'btd', pid: 202, status: 'healthy', uptime: 85700, restarts: 0, cpuPercent: 0.8, memoryMB: 15, lastHeartbeat: Date.now(), bootTarget: 'network' },
  { name: 'dnsd', pid: 203, status: 'healthy', uptime: 85700, restarts: 0, cpuPercent: 0.3, memoryMB: 8, lastHeartbeat: Date.now(), bootTarget: 'network' },
  { name: 'powerd', pid: 300, status: 'healthy', uptime: 85600, restarts: 0, cpuPercent: 0.4, memoryMB: 10, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
  { name: 'timed', pid: 301, status: 'healthy', uptime: 85600, restarts: 0, cpuPercent: 0.1, memoryMB: 4, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
  { name: 'notifyd', pid: 310, status: 'healthy', uptime: 43200, restarts: 1, cpuPercent: 0.6, memoryMB: 12, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
  { name: 'updated', pid: 400, status: 'healthy', uptime: 85500, restarts: 0, cpuPercent: 0.2, memoryMB: 18, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
  { name: 'pkgd', pid: 401, status: 'stopped', uptime: 0, restarts: 3, cpuPercent: 0, memoryMB: 0, lastHeartbeat: Date.now() - 60000, bootTarget: 'desktop' },
  { name: 'crashd', pid: 500, status: 'healthy', uptime: 86400, restarts: 0, cpuPercent: 0.1, memoryMB: 6, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'healthd', pid: 501, status: 'healthy', uptime: 86400, restarts: 0, cpuPercent: 0.5, memoryMB: 10, lastHeartbeat: Date.now(), bootTarget: 'core' },
  { name: 'accessibilityd', pid: 600, status: 'healthy', uptime: 85400, restarts: 0, cpuPercent: 0.3, memoryMB: 8, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
  { name: 'automationd', pid: 700, status: 'healthy', uptime: 85300, restarts: 0, cpuPercent: 0.7, memoryMB: 14, lastHeartbeat: Date.now(), bootTarget: 'desktop' },
];

class HealthDaemon {
  private services: ServiceHealth[] = [...SERVICE_FLEET];
  private history: HealthSnapshot[] = [];

  constructor() {
    for (let i = 10; i >= 0; i--) {
      this.history.push(this.computeSnapshot(Date.now() - i * 60000));
    }
  }

  private computeSnapshot(ts: number): HealthSnapshot {
    const degraded = this.services.filter(s => s.status === 'degraded').length;
    const critical = this.services.filter(s => s.status === 'critical' || s.status === 'stopped').length;
    const score = Math.max(0, 100 - degraded * 8 - critical * 20);
    return {
      timestamp: ts, score, degradedCount: degraded, criticalCount: critical,
      resources: { cpuUsage: 12 + Math.random() * 8, memoryUsed: 4.2, memoryTotal: 16, diskUsed: 128, diskTotal: 512, networkRxKBps: 240 + Math.random() * 100, networkTxKBps: 80 + Math.random() * 50, temperature: 52 + Math.random() * 10, loadAvg: [1.2, 0.9, 0.7] },
      services: this.services,
    };
  }

  getServices(): ServiceHealth[] { return [...this.services]; }
  getHealthScore(): number { return this.history[this.history.length - 1]?.score ?? 100; }
  getResources(): SystemResources { return this.history[this.history.length - 1]?.resources ?? {} as SystemResources; }
  getHistory(): HealthSnapshot[] { return [...this.history]; }
  getServiceByName(name: string): ServiceHealth | undefined { return this.services.find(s => s.name === name); }
  getDegradedServices(): ServiceHealth[] { return this.services.filter(s => s.status !== 'healthy'); }
}

export const healthd = new HealthDaemon();
