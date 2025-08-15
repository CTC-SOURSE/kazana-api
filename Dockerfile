# syntax=docker/dockerfile:1

# Use AWS' public mirror of the Node image to avoid Docker Hub rate/availability issues
FROM public.ecr.aws/docker/library/node:20-alpine AS deps
WORKDIR /app

# Install full deps (incl. dev) to build
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# ---- Build stage ----
FROM deps AS builder
WORKDIR /app
COPY . .
# Build TypeScript to /dist
RUN npm run build

# ---- Runtime stage ----
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Only runtime deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# If your server uses 8080, leave this; otherwise change it
EXPOSE 8080
CMD ["node", "dist/index.js"]
