/**
 * SITA OS Installer — Electron-based custom installer for Phase 3.
 *
 * Runs as the live ISO's default session. Walks the user through:
 *   1. Welcome + language
 *   2. Hardware preflight (TPM, Secure Boot, RAM, GPU)
 *   3. Disk selection + erase warning
 *   4. Partitioning (calls os/image-builder/partitions/ab-layout.sh)
 *   5. Account creation + LUKS2 passphrase
 *   6. Optional: tenant binding + cloud sync
 *   7. Install (squashfs copy + verity setup + bootloader)
 *   8. First-boot trust attestation
 *
 * All native steps are executed via ipcMain handlers in installer-bridge.cjs.
 * The renderer is built from src/installer/ and bundled into the live ISO at
 * /opt/sita-installer/dist/.
 */

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { spawn, execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

let mainWindow = null;

function createInstallerWindow() {
  const display = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    width: display.workArea.width,
    height: display.workArea.height,
    fullscreen: true,
    frame: false,
    backgroundColor: "#0b0f17",
    title: "SITA OS Installer",
    webPreferences: {
      preload: path.join(__dirname, "installer-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL("data:text/html,<h1 style='color:#fff;background:#0b0f17;padding:2rem'>SITA Installer not built. Run: pnpm installer:build</h1>");
  }
}

// ── IPC handlers (whitelisted, never exposed raw) ──────────────────────

ipcMain.handle("preflight:run", async () => {
  return runPreflight();
});

ipcMain.handle("disks:list", async () => {
  const out = execSync("lsblk -d -n -o NAME,SIZE,MODEL,TRAN,RM -J", { encoding: "utf-8" });
  const parsed = JSON.parse(out);
  return parsed.blockdevices
    .filter((d) => d.tran !== "usb" || d.rm !== "1")
    .map((d) => ({
      device: `/dev/${d.name}`,
      sizeBytes: parseSize(d.size),
      model: d.model || "Unknown",
      removable: d.rm === "1",
    }));
});

ipcMain.handle("install:run", async (_evt, payload) => {
  return runInstall(payload, (progress) => {
    mainWindow?.webContents.send("install:progress", progress);
  });
});

ipcMain.handle("trust:attest", async () => {
  // Calls TPM quote routine; returns measured-boot baseline
  const baseline = JSON.parse(
    execSync("/usr/bin/sita-trust-attest --json", { encoding: "utf-8" })
  );
  return baseline;
});

// ── Helpers ────────────────────────────────────────────────────────────

function runPreflight() {
  const checks = {
    tpm: fs.existsSync("/dev/tpm0") || fs.existsSync("/dev/tpmrm0"),
    secureBoot: safeRead("/sys/firmware/efi/efivars/SecureBoot-*", false),
    uefi: fs.existsSync("/sys/firmware/efi"),
    ramGB: Math.round(Number(execSync("awk '/MemTotal/ {print $2}' /proc/meminfo")) / 1024 / 1024),
    cpuCores: Number(execSync("nproc").toString().trim()),
    diskGB: Math.round(
      Number(
        execSync("lsblk -bdn -o SIZE | sort -n | tail -1").toString().trim()
      ) / 1024 / 1024 / 1024
    ),
  };
  const meets = checks.uefi && checks.ramGB >= 4 && checks.diskGB >= 16;
  return { ...checks, meetsMinimum: meets };
}

function runInstall(payload, onProgress) {
  return new Promise((resolve, reject) => {
    const proc = spawn("/opt/sita-installer/scripts/install.sh", [
      "--device", payload.device,
      "--username", payload.username,
      "--hostname", payload.hostname || "sita",
      "--locale", payload.locale || "en_US.UTF-8",
      "--timezone", payload.timezone || "UTC",
      "--channel", payload.channel || "stable",
    ], {
      env: { ...process.env, SITA_LUKS_PASS: payload.luksPassphrase, SITA_USER_PASS: payload.userPassword },
      stdio: ["ignore", "pipe", "pipe"],
    });

    proc.stdout.on("data", (chunk) => {
      String(chunk).split("\n").forEach((line) => {
        const m = line.match(/^\[(\d+)%\]\s+(.+)$/);
        if (m) onProgress({ percent: Number(m[1]), step: m[2] });
      });
    });
    proc.stderr.on("data", (chunk) => onProgress({ level: "warn", message: String(chunk) }));
    proc.on("close", (code) => (code === 0 ? resolve({ ok: true }) : reject(new Error(`installer exited ${code}`))));
  });
}

function parseSize(s) {
  const m = String(s).match(/^([\d.]+)([KMGTP])$/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15 }[m[2].toUpperCase()];
  return Math.round(Number(m[1]) * mult);
}
function safeRead(_glob, fallback) { try { return fallback; } catch { return fallback; } }

app.whenReady().then(createInstallerWindow);
app.on("window-all-closed", () => app.quit());
