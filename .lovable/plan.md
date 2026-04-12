

# Add Disk Activity Chart & Temperature Sensors to System Monitor

## Current State

The System Monitor already has a "disk" section with R/W throughput, storage breakdown, and mounted volumes. It has 7 sidebar sections: CPU, Memory, Processes, Network, GPU, Disk, Services.

## Changes — Single File

**File:** `src/components/sita/shell/windows/SystemMonitorWindow.tsx`

### 1. Enhance Disk Section with IOPS & Latency Charts

Add to the existing disk section (below the R/W throughput chart):

- **IOPS Chart** — A second `NovaCanvasChart` showing simulated read/write IOPS (operations per second) over 60s. Two series: read IOPS (blue) and write IOPS (pink). Simulated values: read ~8000-15000, write ~3000-8000.
- **Latency Card** — Average read latency and write latency displayed as numeric values with small sparklines. Simulated: read ~0.2-0.8ms, write ~0.5-1.5ms. Color-coded: green (<1ms), amber (1-3ms), red (>3ms).
- **Queue Depth Bar** — A single horizontal bar showing current I/O queue depth (simulated 1-32).

New state: `iopsHistory` (read/write IOPS samples), `latencyHistory` (read/write latency samples), updated in the existing `setInterval`.

### 2. Add Temperature Sensors Section

New sidebar entry: `{ id: "thermal", label: "Thermal", icon: <Thermometer /> }` — added to `MonitorSection` type and `SECTIONS` array.

**Thermal section renders:**
- **Header** — "Thermal Sensors" with overall status badge (Normal/Warning/Critical)
- **Sensor Grid** — 8 simulated sensors in a 2-column grid, each as a `NovaCard`:
  - CPU Package: 45-75°C
  - CPU Core 0-3: varies by CPU load
  - GPU Die: correlates with GPU load
  - SSD Controller: 38-52°C
  - Ambient: 28-35°C
  - Each shows: name, current temp, min/max range, colored bar (green <60, amber 60-80, red >80)
- **Temperature History Chart** — `NovaCanvasChart` with 3 series (CPU, GPU, SSD) over 60s
- **Fan Speed Card** — Simulated fan RPM with current speed and target, plus a small bar

New state: `thermalHistory` array of `{ time, cpu, gpu, ssd, ambient }` samples, updated every tick.

### 3. Wire New Data into Existing Interval

Inside the existing `setInterval` callback, add:
- IOPS sample generation (random walk correlated with disk R/W)
- Latency sample generation
- Thermal sample generation (correlate CPU temp with CPU load, GPU temp with GPU load)

### 4. Sidebar Quick Stats

Add a "Thermal" sparkline card in the sidebar quick stats area showing CPU temperature.

### Summary of Changes

| What | Detail |
|------|--------|
| New type union member | `"thermal"` added to `MonitorSection` |
| New sidebar entry | Thermometer icon, "Thermal" label |
| New state vars | `iopsHistory`, `latencyHistory`, `thermalHistory`, `thermalSpark` |
| New render function | `renderThermal()` |
| Enhanced render | `renderDisk()` gets IOPS chart + latency + queue depth |
| Import added | `Thermometer` from lucide-react |

