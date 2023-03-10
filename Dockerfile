FROM node:latest
ENV NODE_ENV=production

WORKDIR /usr/app
COPY package.json .

RUN npm install --quiet
COPY . .
