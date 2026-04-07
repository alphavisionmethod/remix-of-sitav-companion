import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";
import fs from "fs";

function healthJsonPlugin() {
  return {
    name: "generate-health-json",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      if (!fs.existsSync(distDir)) return;
      let gitHash = "unknown";
      try { gitHash = execSync("git rev-parse --short HEAD").toString().trim(); } catch {}
      const health = {
        service: "sita-os",
        status: "healthy",
        version: gitHash,
        buildTime: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(distDir, "health.json"), JSON.stringify(health, null, 2));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON_BUILD ? './' : '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), healthJsonPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "@radix-ui/react-dropdown-menu"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));