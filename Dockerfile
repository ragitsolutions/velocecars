# Imagen de producción de la web de Veloce Cars (Next.js standalone).
#   docker build -t veloce-cars --build-arg NEXT_PUBLIC_SITE_URL=https://www.velocecars.es .
#   docker run -p 3000:3000 --env-file .env.production veloce-cars
# Más detalles en docs/despliegue.md.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# Sin scripts de ciclo de vida: husky (prepare) no hace falta en la imagen.
RUN npm ci --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Las variables NEXT_PUBLIC_* se fijan al compilar.
ARG NEXT_PUBLIC_SITE_URL=https://www.velocecars.es
ARG NEXT_PUBLIC_SITE_ENV=production
ARG NEXT_PUBLIC_GTM_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SITE_ENV=$NEXT_PUBLIC_SITE_ENV \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# Inventario: se lee en tiempo de ejecución; montar ./data como volumen permite actualizarlo
# sin reconstruir la imagen (los cambios aparecen con la revalidación de 1 h).
COPY --from=build --chown=nextjs:nodejs /app/data ./data
# Caché de imágenes optimizadas e ISR (volumen en docker-compose.yml).
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt > /dev/null || exit 1
CMD ["node", "server.js"]
