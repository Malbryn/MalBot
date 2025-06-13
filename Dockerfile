# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
COPY config ./config

RUN npm run build

# Stage 2: Production
FROM node:22 AS runner

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

CMD ["npm", "run", "serve:prod"]
