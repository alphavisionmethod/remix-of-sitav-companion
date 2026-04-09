# SITA OS — VMware / Desktop Deployment Guide

## Option 1: Docker Container (Recommended)

The simplest way to run SITA OS on any server or VM.

```bash
# Build the container
docker build -t sita-os .

# Run it
docker run -d -p 80:80 --name sita sita-os

# Access at http://localhost
```

### On VMware

1. Create a VM with Ubuntu Server 22.04 or Alpine Linux
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Copy the project files to the VM
4. Build and run: `docker build -t sita-os . && docker run -d -p 80:80 sita-os`
5. Access SITA OS at `http://<vm-ip>`

### Export as OVA

1. Set up the VM as above
2. In VMware Workstation/Fusion: **File → Export to OVF**
3. This produces a `.ova` file you can import on any VMware host

---

## Option 2: Electron Desktop App

Package SITA OS as a standalone desktop application.

### Prerequisites

- Node.js 18+
- npm or bun

### Build Steps

```bash
# Install dependencies
npm install --save-dev electron @electron/packager

# Build the web app
npx vite build

# Package for Linux
npx @electron/packager . "SITA-OS" \
  --platform=linux --arch=x64 \
  --out=electron-release --overwrite \
  --ignore='node_modules' \
  --ignore='^/src' --ignore='^/public' \
  --ignore='^/electron-release'

# Package for Windows
npx @electron/packager . "SITA-OS" \
  --platform=win32 --arch=x64 \
  --out=electron-release --overwrite \
  --ignore='node_modules' \
  --ignore='^/src' --ignore='^/public' \
  --ignore='^/electron-release'

# Package for macOS
npx @electron/packager . "SITA-OS" \
  --platform=darwin --arch=x64 \
  --out=electron-release --overwrite \
  --ignore='node_modules' \
  --ignore='^/src' --ignore='^/public' \
  --ignore='^/electron-release'
```

### Creating a Bootable VM from Electron Build

1. Package for Linux (above)
2. Create a minimal Ubuntu/Alpine VM
3. Copy the `SITA-OS-linux-x64/` folder to the VM
4. Set up auto-start:
   ```bash
   # /etc/systemd/system/sita.service
   [Unit]
   Description=SITA OS
   After=graphical.target

   [Service]
   Type=simple
   ExecStart=/opt/sita/SITA-OS
   Environment=DISPLAY=:0
   User=sita

   [Install]
   WantedBy=graphical.target
   ```
5. Export the VM as OVA

---

## Option 3: Static Website

Deploy as a standard website (already works via Lovable Publish).

```bash
# Build
npm run build

# The dist/ folder contains the complete static site
# Deploy to any web server, CDN, or hosting service
```

### With Nginx manually

```bash
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

---

## OTA Updates

Once deployed, SITA OS supports automated over-the-air updates:

```bash
# Install the OTA agent
sudo cp scripts/release/iso/sita-ota-agent.sh /opt/sita/
sudo cp scripts/release/iso/sita-ota.service /etc/systemd/system/
sudo cp scripts/release/iso/sita-ota.timer /etc/systemd/system/
sudo systemctl enable --now sita-ota.timer
```

The OTA agent checks for updates every 6 hours, pulls new Docker images, and rolls back on health check failure.

---

## Automated Backups

```bash
# Install the backup service
sudo cp scripts/release/iso/sita-backup.sh /opt/sita/
sudo cp scripts/release/iso/sita-backup.service /etc/systemd/system/
sudo cp scripts/release/iso/sita-backup.timer /etc/systemd/system/
sudo systemctl enable --now sita-backup.timer
```

Backups include database (`pg_dump`), Docker volumes, and configuration files. 30-day retention with automatic cleanup.

To restore: `scripts/restore-backup.sh <backup-file>`

---

## Environment Variables

For live mode with real connectors, set these environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |

These are baked into the build at compile time. For Docker, pass them as build args:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key \
  -t sita-os .
```
