#!/bin/sh

set -eu

echo "Applying database migrations..."
./node_modules/.bin/drizzle-kit migrate

echo "Starting OpenPoll..."
exec node ./dist/server/entry.mjs
