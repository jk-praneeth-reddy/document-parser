# PDF rendering uses @napi-rs/canvas (prebuilt). If `npm install` fails on Alpine/musl,
# switch to: FROM node:20-bookworm-slim
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8000

CMD ["npm", "start"]
