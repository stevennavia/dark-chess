FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/dist/ ./dist/
COPY server/.env.production ./.env

EXPOSE 2567

CMD ["node", "dist/index.js"]
