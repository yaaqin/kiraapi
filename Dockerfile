FROM node:24-alpine AS build
WORKDIR /app
# prisma.config.ts requires DATABASE_URL to exist; generating the client never connects.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
# --ignore-scripts skips the postinstall `prisma generate`; the client is already compiled into dist.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 9998
CMD ["node", "dist/main.js"]
