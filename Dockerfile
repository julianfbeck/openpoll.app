FROM node:lts AS base
WORKDIR /app

# Install Litestream
ENV LITESTREAM_VERSION="0.3.13"
ARG TARGETARCH

RUN case "${TARGETARCH}" in \
  'amd64') \
  ARCH='amd64';; \
  'arm64') \
  ARCH='arm64';; \
  'arm') \
  ARCH='armv7';; \
  *) \
  echo "Unsupported architecture: ${TARGETARCH}"; exit 1 ;; \
  esac && \
  wget https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-v${LITESTREAM_VERSION}-linux-${ARCH}.deb \
  && dpkg -i litestream-v${LITESTREAM_VERSION}-linux-${ARCH}.deb \
  && rm litestream-v${LITESTREAM_VERSION}-linux-${ARCH}.deb

# Install Redis
RUN apt-get update && apt-get install -y redis-server \
  && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY package.json ./

FROM base AS build
# Use pnpm for installing dependencies
RUN pnpm install --frozen-lockfile

COPY . .
# Use pnpm for running scripts
RUN pnpm run build

FROM base AS runtime

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Move the drizzle directory to the runtime image
COPY --from=build /app/drizzle ./drizzle

# Move the run script and litestream config to the runtime image
COPY --from=build /app/scripts/run.sh run.sh
COPY --from=build /app/litestream.yml /etc/litestream.yml

# Create the data directory for the database and for Redis
RUN mkdir -p /data /var/lib/redis

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
EXPOSE 4321
# Expose Redis default port
EXPOSE 6379

# Start both Redis server and your application and optionally Litestream
# CMD service redis-server start && sh run.sh --use-litestream

CMD service redis-server start && sh run.sh
