# Use Node 20 (small image)
ARG REBUILD_TS=1755254250
FROM node:20-alpine

# App folder
WORKDIR /app

# 1) Copy only manifests + tsconfig first (needed if scripts reference it)
COPY package.json package-lock.json ./
COPY tsconfig.json ./  # keep this line; it prevents tsc/prepare from failing

# 2) Install production deps WITHOUT running lifecycle scripts
#    (postinstall/prepare won’t run here)
RUN npm ci --omit=dev --no-audit --no-fund --ignore-scripts

# 3) Copy the source now
COPY src ./src
COPY public ./public
COPY .env.example ./.env.example

# 4) Build TS now (tsconfig.json is present)
RUN npm run build

# 5) Runtime config
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
