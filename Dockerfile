FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund || npm install --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/index.js"]
