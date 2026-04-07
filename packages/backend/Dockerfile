FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

RUN mkdir -p /app/media

EXPOSE 3001
CMD ["node", "dist/index.js"]
