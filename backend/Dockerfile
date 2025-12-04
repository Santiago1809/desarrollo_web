# Etapa de build
FROM oven/bun:1 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun pm trust --all
RUN bun run build

# Etapa de producción
FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3001
CMD ["bun", "run", "start:dev"]
