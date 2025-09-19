FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
  pnpm install
COPY . .
RUN pnpm dlx prisma generate && \
  pnpm run build

FROM node:22-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/pnpm-lock.yaml ./
COPY --from=build /usr/src/app/prisma ./prisma
RUN npm install -g pnpm && \
  pnpm install --prod --frozen-lockfile
EXPOSE 2412
CMD ["sh", "-c", "pnpm dlx prisma migrate deploy && pnpm dlx prisma generate && node dist/main"]
