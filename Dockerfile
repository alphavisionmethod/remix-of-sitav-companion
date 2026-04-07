# ── SITA OS — Production Container ──
# Multi-stage build: Node build → Nginx serve
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args for Vite env vars (defaults for CI)
ARG VITE_SUPABASE_URL=http://localhost:8000
ARG VITE_SUPABASE_PUBLISHABLE_KEY=dummy-key
ARG VITE_SUPABASE_PROJECT_ID=ci-project
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

COPY package.json bun.lock* package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install
COPY . .
RUN npm run build

# Generate health.json at build time
RUN echo "{\"service\":\"sita-os\",\"version\":\"1.0.0\",\"build_date\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"status\":\"healthy\"}" > dist/health.json

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
