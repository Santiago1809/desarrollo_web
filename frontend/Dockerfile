FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
EXPOSE 3000
RUN bun run build
CMD ["bun", "run", "start"]