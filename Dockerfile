FROM node:lts AS base
WORKDIR /app

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

# Move the run script to the runtime image
COPY --from=build /app/scripts/run.sh run.sh

# Create the data directory for the database
RUN mkdir -p /data

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
EXPOSE 4321

# Start the application
CMD sh run.sh
