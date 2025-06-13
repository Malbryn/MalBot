# Stage 1
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY config ./config

RUN npm ci && npm run build

# Stage 2
FROM node:22 AS runner

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY config ./config

RUN npm install --omit=dev
COPY --from=builder /app/dist/ dist/

CMD ["npm", "run", "start"]
