# Stage 1
FROM node:19 as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm ci && npm run build

# Stage 2
FROM node:19 as runner
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm install --omit=dev
COPY --from=builder /app/dist/ dist/

ENTRYPOINT ["npm", "run", "start:prod"]
