# ---- build the React client ----
FROM node:22-bookworm-slim AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --no-audit --no-fund
COPY client/ ./
RUN npm run build

# ---- install server dependencies (native modules compile here if no prebuilt binary matches) ----
FROM node:22-bookworm-slim AS server-deps
WORKDIR /app/server
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY server/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- runtime ----
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data CLIENT_DIST=/app/client/dist TRUST_PROXY=1
WORKDIR /app
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=client /app/client/dist ./client/dist
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server/src/index.js"]
