# syntax=docker/dockerfile:1

############################
# deps
FROM public.ecr.aws/docker/library/node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

############################
# build
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

############################
# runtime
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 8080
CMD ["node", "dist/index.js"]
