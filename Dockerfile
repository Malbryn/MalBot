# Stage 1
FROM node:19-alpine3.16 as builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY config config
COPY src src

RUN npm ci && npm run build

# Stage 2
FROM node:19-alpine3.16 as runner
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY config config
COPY src src

RUN npm install --production
COPY --from=builder /app/dist/ dist/

ENTRYPOINT ["npm", "run", "start:prod"]
